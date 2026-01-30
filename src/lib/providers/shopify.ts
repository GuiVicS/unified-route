// Shopify Provider Configuration
// Based on official Shopify API documentation

export interface ShopifyCredentials {
  storeName: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyConfig {
  name: string;
  baseUrl: string;
  credentials: ShopifyCredentials;
  enabled: boolean;
}

// Shopify API base URL pattern
export const SHOPIFY_API_BASE = 'https://{store}.myshopify.com/admin/api';

// Default API version
export const SHOPIFY_DEFAULT_API_VERSION = '2024-01';

// Available Shopify API endpoints
export const SHOPIFY_ENDPOINTS = {
  // Products
  PRODUCTS: '/products.json',
  PRODUCT_BY_ID: '/products/{id}.json',
  PRODUCT_VARIANTS: '/products/{id}/variants.json',
  PRODUCT_IMAGES: '/products/{id}/images.json',
  PRODUCT_COUNT: '/products/count.json',
  
  // Orders
  ORDERS: '/orders.json',
  ORDER_BY_ID: '/orders/{id}.json',
  ORDER_COUNT: '/orders/count.json',
  ORDER_TRANSACTIONS: '/orders/{id}/transactions.json',
  ORDER_FULFILLMENTS: '/orders/{id}/fulfillments.json',
  
  // Customers
  CUSTOMERS: '/customers.json',
  CUSTOMER_BY_ID: '/customers/{id}.json',
  CUSTOMER_ORDERS: '/customers/{id}/orders.json',
  CUSTOMER_SEARCH: '/customers/search.json',
  
  // Inventory
  INVENTORY_ITEMS: '/inventory_items.json',
  INVENTORY_LEVELS: '/inventory_levels.json',
  LOCATIONS: '/locations.json',
  
  // Collections
  COLLECTIONS: '/custom_collections.json',
  SMART_COLLECTIONS: '/smart_collections.json',
  
  // Shop Info
  SHOP: '/shop.json',
  
  // Discounts
  PRICE_RULES: '/price_rules.json',
  DISCOUNT_CODES: '/price_rules/{id}/discount_codes.json',
  
  // Shipping
  SHIPPING_ZONES: '/shipping_zones.json',
  CARRIER_SERVICES: '/carrier_services.json',
} as const;

// Required headers for Shopify API
export function buildShopifyHeaders(accessToken: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  };
}

// Build full URL for Shopify endpoint
export function buildShopifyUrl(
  storeName: string, 
  endpoint: string, 
  apiVersion: string = SHOPIFY_DEFAULT_API_VERSION,
  params?: Record<string, string>
): string {
  let baseUrl = `https://${storeName}.myshopify.com/admin/api/${apiVersion}${endpoint}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      baseUrl = baseUrl.replace(`{${key}}`, value);
    });
  }
  
  return baseUrl;
}

// Validate Shopify credentials format
export function validateShopifyCredentials(credentials: Partial<ShopifyCredentials>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!credentials.storeName?.trim()) {
    errors.push('Nome da loja é obrigatório');
  } else {
    // Store name should be alphanumeric with hyphens only
    const cleanStoreName = credentials.storeName.replace('.myshopify.com', '').trim();
    if (!/^[a-z0-9-]+$/i.test(cleanStoreName)) {
      errors.push('Nome da loja deve conter apenas letras, números e hífens');
    }
  }
  
  if (!credentials.accessToken?.trim()) {
    errors.push('Access Token é obrigatório');
  } else if (!credentials.accessToken.startsWith('shpat_') && !credentials.accessToken.startsWith('shpca_')) {
    errors.push('Access Token deve começar com "shpat_" ou "shpca_"');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Clean store name (remove .myshopify.com if present)
export function cleanStoreName(storeName: string): string {
  return storeName
    .toLowerCase()
    .replace('.myshopify.com', '')
    .replace('https://', '')
    .replace('http://', '')
    .trim();
}

// Test Shopify connection by calling /shop.json
export async function testShopifyConnection(credentials: ShopifyCredentials): Promise<{
  success: boolean;
  shop?: {
    id: number;
    name: string;
    email: string;
    domain: string;
    currency: string;
    plan_name: string;
  };
  error?: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  const cleanedStoreName = cleanStoreName(credentials.storeName);
  
  try {
    const url = buildShopifyUrl(cleanedStoreName, SHOPIFY_ENDPOINTS.SHOP, credentials.apiVersion);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: buildShopifyHeaders(credentials.accessToken),
    });
    
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'Access Token inválido ou expirado';
      } else if (response.status === 403) {
        errorMessage = 'Sem permissão para acessar esta loja';
      } else if (response.status === 404) {
        errorMessage = 'Loja não encontrada. Verifique o nome da loja.';
      }
      
      return {
        success: false,
        error: errorMessage,
        latencyMs,
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      shop: {
        id: data.shop.id,
        name: data.shop.name,
        email: data.shop.email,
        domain: data.shop.domain,
        currency: data.shop.currency,
        plan_name: data.shop.plan_name,
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

// Default recommended path prefixes for Shopify
export const SHOPIFY_RECOMMENDED_PATHS = [
  '/admin/api',
];

// Default allowed methods for Shopify
export const SHOPIFY_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

// Shopify API versions
export const SHOPIFY_API_VERSIONS = [
  '2024-01',
  '2024-04',
  '2024-07',
  '2024-10',
  '2023-10',
  '2023-07',
] as const;
