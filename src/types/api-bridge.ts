// API Bridge Types

export type ProviderType = 'AUTO' | 'GENERIC' | 'OPENAI' | 'SHOPIFY' | 'DOOKI' | 'YAMPI' | 'CUSTOM';

export type AuthScheme = 'BEARER' | 'BASIC' | 'HEADER_PAIR' | 'QUERY' | 'NONE';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Connection {
  id: string;
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  authScheme: AuthScheme;
  // Credentials are never sent to frontend after creation
  hasCredentials: boolean;
  extraHeaders?: Record<string, string>;
  allowedHosts?: string[];
  allowedPathPrefixes?: string[];
  allowedMethods: HttpMethod[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionFormData {
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  authScheme: AuthScheme;
  apiKey?: string;
  secret?: string;
  extraHeaders?: Record<string, string>;
  allowedHosts?: string[];
  allowedPathPrefixes?: string[];
  allowedMethods: HttpMethod[];
  enabled: boolean;
}

export interface Client {
  id: string;
  name: string;
  // Token is only shown once at creation
  allowedOrigins?: string[];
  allowedConnectionIds?: string[];
  enabled: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ClientFormData {
  name: string;
  allowedOrigins?: string[];
  allowedConnectionIds?: string[];
  enabled: boolean;
}

export interface ClientWithToken extends Client {
  token: string; // Only present on creation
}

export interface AuditLog {
  id: string;
  timestamp: string;
  connectionId: string;
  connectionName: string;
  clientId?: string;
  clientName?: string;
  method: HttpMethod;
  host: string;
  path: string;
  status: number;
  latencyMs: number;
  responseSize: number;
  ipAddress: string;
}

export interface ProxyRequest {
  connectionId: string;
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface SecuritySettings {
  allowedOrigins: string[];
  rateLimitPerMin: number;
  enableAuditLogs: boolean;
}

export interface DashboardStats {
  totalConnections: number;
  activeConnections: number;
  totalClients: number;
  activeClients: number;
  requestsToday: number;
  requestsThisWeek: number;
  avgLatencyMs: number;
  errorRate: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin';
}
