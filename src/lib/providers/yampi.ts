// Yampi Provider Configuration
// Based on official Yampi API documentation: https://docs.yampi.com.br

export interface YampiCredentials {
  userToken: string;
  userSecretKey: string;
  merchantAlias: string;
}

export interface YampiConfig {
  name: string;
  baseUrl: string;
  credentials: YampiCredentials;
  enabled: boolean;
}

// Yampi API uses api.dooki.com.br as base URL
export const YAMPI_API_BASE = 'https://api.dooki.com.br/v2';

// Available Yampi API endpoints
export const YAMPI_ENDPOINTS = {
  // Auth
  AUTH_ME: '/auth/me',
  
  // Catalog
  PRODUCTS: '/{alias}/catalog/products',
  PRODUCT_BY_ID: '/{alias}/catalog/products/{id}',
  PRODUCT_SKUS: '/{alias}/catalog/products/{id}/skus',
  BRANDS: '/{alias}/catalog/brands',
  CATEGORIES: '/{alias}/catalog/categories',
  
  // Orders
  ORDERS: '/{alias}/orders',
  ORDER_BY_ID: '/{alias}/orders/{id}',
  ORDER_BY_NUMBER: '/{alias}/orders/number/{number}',
  ORDER_STATUS: '/{alias}/orders/{id}/status',
  ORDER_TRANSACTIONS: '/{alias}/orders/{id}/transactions',
  
  // Customers
  CUSTOMERS: '/{alias}/customers',
  CUSTOMER_BY_ID: '/{alias}/customers/{id}',
  CUSTOMER_ADDRESSES: '/{alias}/customers/{id}/addresses',
  CUSTOMER_ORDERS: '/{alias}/customers/{id}/orders',
  
  // Checkout
  CARTS: '/{alias}/checkout/carts',
  CART_BY_ID: '/{alias}/checkout/carts/{id}',
  
  // Shipping
  SHIPPING_CALCULATE: '/{alias}/shipping/calculate',
  
  // Coupons
  COUPONS: '/{alias}/coupons',
  COUPON_BY_CODE: '/{alias}/coupons/code/{code}',
} as const;

// Required headers for Yampi API
export function buildYampiHeaders(credentials: Pick<YampiCredentials, 'userToken' | 'userSecretKey'>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Token': credentials.userToken,
    'User-Secret-Key': credentials.userSecretKey,
  };
}

// Build full URL for Yampi endpoint
export function buildYampiUrl(endpoint: string, merchantAlias: string, params?: Record<string, string>): string {
  let url = `${YAMPI_API_BASE}${endpoint.replace('{alias}', merchantAlias)}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  return url;
}

// Validate Yampi credentials format
export function validateYampiCredentials(credentials: Partial<YampiCredentials>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!credentials.userToken?.trim()) {
    errors.push('User Token é obrigatório');
  }
  
  if (!credentials.userSecretKey?.trim()) {
    errors.push('User Secret Key é obrigatório');
  }
  
  if (!credentials.merchantAlias?.trim()) {
    errors.push('Alias da loja é obrigatório');
  } else if (!/^[a-z0-9-]+$/.test(credentials.merchantAlias)) {
    errors.push('Alias da loja deve conter apenas letras minúsculas, números e hífens');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Test Yampi connection by calling /auth/me
export async function testYampiConnection(credentials: YampiCredentials): Promise<{
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    merchants: Array<{
      id: number;
      alias: string;
      name: string;
      domain: string;
      active: boolean;
    }>;
  };
  error?: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${YAMPI_API_BASE}/auth/me`, {
      method: 'POST',
      headers: buildYampiHeaders(credentials),
    });
    
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Erro HTTP ${response.status}`,
        latencyMs,
      };
    }
    
    const data = await response.json();
    
    // Validate that the merchant alias exists in user's merchants
    const merchants = data.data?.merchants?.data || [];
    const merchantExists = merchants.some((m: { alias: string }) => m.alias === credentials.merchantAlias);
    
    if (!merchantExists && merchants.length > 0) {
      return {
        success: false,
        error: `Alias "${credentials.merchantAlias}" não encontrado. Lojas disponíveis: ${merchants.map((m: { alias: string }) => m.alias).join(', ')}`,
        latencyMs,
      };
    }
    
    return {
      success: true,
      user: {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        merchants: merchants.map((m: { id: number; alias: string; name: string; domain: string; active: boolean }) => ({
          id: m.id,
          alias: m.alias,
          name: m.name,
          domain: m.domain,
          active: m.active,
        })),
      },
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return { success: false, error: 'Timeout na conexão', latencyMs };
      }
      return { success: false, error: error.message, latencyMs };
    }
    
    return { success: false, error: 'Erro desconhecido', latencyMs };
  }
}

// Yampi pagination helper
export interface YampiPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: {
    previous: string;
    next: string;
  };
}

export interface YampiResponse<T> {
  data: T;
  meta?: {
    pagination?: YampiPagination;
  };
}

// Common query parameters for Yampi list endpoints
export interface YampiListParams {
  page?: number;
  limit?: number;
  include?: string[];
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function buildYampiQueryParams(params: YampiListParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.include?.length) searchParams.set('include', params.include.join(','));
  if (params.search) searchParams.set('q', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  
  return searchParams;
}

// Yampi-specific date format
export function formatYampiDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function parseYampiDate(yampiDate: { date: string; timezone: string }): Date {
  return new Date(yampiDate.date);
}

// Order status mapping (common Yampi order statuses)
export const YAMPI_ORDER_STATUS = {
  PENDING: 1,
  AWAITING_PAYMENT: 2,
  PAID: 3,
  INVOICED: 4,
  SHIPPED: 5,
  DELIVERED: 6,
  CANCELLED: 7,
  REFUNDED: 8,
} as const;

export const YAMPI_ORDER_STATUS_LABELS: Record<number, string> = {
  1: 'Pendente',
  2: 'Aguardando Pagamento',
  3: 'Pago',
  4: 'Faturado',
  5: 'Enviado',
  6: 'Entregue',
  7: 'Cancelado',
  8: 'Reembolsado',
};

// Default recommended path prefixes for Yampi
export const YAMPI_RECOMMENDED_PATHS = [
  '/auth',
  '/catalog',
  '/orders',
  '/customers',
  '/checkout',
  '/shipping',
  '/coupons',
];

// Default allowed methods for Yampi
export const YAMPI_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
