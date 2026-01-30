/**
 * API Service - Comunicação com o backend
 * Gerencia sincronização de dados e chamadas de proxy
 */

const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Faz uma requisição para a API do backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Interface para dados de sincronização
 */
export interface SyncData {
  connections?: Array<{
    id: string;
    name: string;
    providerType: string;
    baseUrl: string;
    authScheme: string;
    apiKey?: string;
    secret?: string;
    customAuth?: {
      headerName: string;
      headerValueTemplate: string;
    };
    extraHeaders?: Record<string, string>;
    allowedHosts?: string[];
    allowedPathPrefixes?: string[];
    allowedMethods: string[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  clients?: Array<{
    id: string;
    name: string;
    token?: string;
    allowedOrigins?: string[];
    allowedConnectionIds?: string[];
    enabled: boolean;
    createdAt: string;
    lastUsedAt?: string;
  }>;
  settings?: {
    corsOrigins?: string[];
    rateLimitPerMin?: number;
    upstreamTimeoutMs?: number;
  };
}

/**
 * Sincroniza dados do frontend para o backend
 */
export async function syncToBackend(data: SyncData): Promise<{ success: boolean; timestamp: string }> {
  return apiRequest('/api/sync', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Obtém dados do backend
 */
export async function syncFromBackend(): Promise<SyncData & { timestamp: string }> {
  return apiRequest('/api/sync', {
    method: 'GET',
  });
}

/**
 * Interface para requisição de proxy
 */
export interface ProxyRequest {
  connectionId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * Interface para resposta de proxy
 */
export interface ProxyResponse<T = unknown> {
  data: T;
  meta: {
    status: number;
    latencyMs: number;
  };
}

/**
 * Executa uma requisição via proxy
 */
export async function executeProxyRequest<T = unknown>(
  request: ProxyRequest,
  clientToken: string
): Promise<ProxyResponse<T>> {
  return apiRequest('/api/proxy', {
    method: 'POST',
    headers: {
      'X-Client-Token': clientToken,
    },
    body: JSON.stringify(request),
  });
}

/**
 * Interface para log de auditoria
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  connectionId: string;
  connectionName: string;
  clientId?: string;
  clientName?: string;
  method: string;
  host: string;
  path: string;
  status: number;
  latencyMs: number;
  responseSize: number;
  ipAddress: string;
  error?: string;
}

/**
 * Obtém logs de auditoria do backend
 */
export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0
): Promise<{ logs: AuditLog[]; limit: number; offset: number }> {
  return apiRequest(`/api/logs?limit=${limit}&offset=${offset}`, {
    method: 'GET',
  });
}

/**
 * Verifica se o backend está disponível
 */
export async function checkBackendHealth(): Promise<{ status: string; timestamp: string }> {
  return apiRequest('/health', {
    method: 'GET',
  });
}

/**
 * Hook de sincronização automática
 * Deve ser chamado após qualquer alteração nos stores
 */
let syncTimeout: NodeJS.Timeout | null = null;
let pendingSync: SyncData = {};

export function schedulSync(data: Partial<SyncData>): void {
  // Acumula dados para sincronizar
  pendingSync = { ...pendingSync, ...data };
  
  // Debounce de 500ms para evitar muitas requisições
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(async () => {
    try {
      await syncToBackend(pendingSync);
      pendingSync = {};
    } catch (error) {
      console.warn('Falha ao sincronizar com backend:', error);
      // Os dados continuarão no localStorage como fallback
    }
  }, 500);
}
