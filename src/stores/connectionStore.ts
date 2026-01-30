import { create } from 'zustand';
import type { Connection, ConnectionFormData } from '@/types/api-bridge';

// Demo data
const demoConnections: Connection[] = [
  {
    id: 'conn-001',
    name: 'OpenAI Production',
    providerType: 'OPENAI',
    baseUrl: 'https://api.openai.com/v1',
    authScheme: 'BEARER',
    hasCredentials: true,
    allowedHosts: ['api.openai.com'],
    allowedPathPrefixes: ['/chat', '/completions', '/embeddings'],
    allowedMethods: ['GET', 'POST'],
    enabled: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
  },
  {
    id: 'conn-002',
    name: 'Dooki Saoko',
    providerType: 'DOOKI',
    baseUrl: 'https://api.dooki.com.br/v2/saoko',
    authScheme: 'HEADER_PAIR',
    hasCredentials: true,
    allowedHosts: ['api.dooki.com.br'],
    allowedPathPrefixes: ['/orders', '/customers', '/products'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH'],
    enabled: true,
    createdAt: '2024-01-10T08:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'conn-003',
    name: 'Internal CRM API',
    providerType: 'GENERIC',
    baseUrl: 'https://crm.internal.company.com/api',
    authScheme: 'BEARER',
    hasCredentials: true,
    allowedMethods: ['GET', 'POST', 'PUT'],
    enabled: false,
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-05T12:00:00Z',
  },
];

interface ConnectionStore {
  connections: Connection[];
  isLoading: boolean;
  fetchConnections: () => Promise<void>;
  createConnection: (data: ConnectionFormData) => Promise<Connection>;
  updateConnection: (id: string, data: Partial<ConnectionFormData>) => Promise<Connection>;
  deleteConnection: (id: string) => Promise<void>;
  toggleConnection: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  isLoading: false,

  fetchConnections: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ connections: demoConnections, isLoading: false });
  },

  createConnection: async (data: ConnectionFormData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      name: data.name,
      providerType: data.providerType,
      baseUrl: data.baseUrl,
      authScheme: data.authScheme,
      hasCredentials: !!(data.apiKey || data.secret),
      extraHeaders: data.extraHeaders,
      allowedHosts: data.allowedHosts,
      allowedPathPrefixes: data.allowedPathPrefixes,
      allowedMethods: data.allowedMethods,
      enabled: data.enabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({ connections: [...state.connections, newConnection] }));
    return newConnection;
  },

  updateConnection: async (id: string, data: Partial<ConnectionFormData>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    let updated: Connection | undefined;
    set(state => ({
      connections: state.connections.map(conn => {
        if (conn.id === id) {
          updated = {
            ...conn,
            ...data,
            hasCredentials: data.apiKey ? true : conn.hasCredentials,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return conn;
      }),
    }));
    if (!updated) throw new Error('Connection not found');
    return updated;
  },

  deleteConnection: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      connections: state.connections.filter(conn => conn.id !== id),
    }));
  },

  toggleConnection: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      connections: state.connections.map(conn =>
        conn.id === id ? { ...conn, enabled: !conn.enabled, updatedAt: new Date().toISOString() } : conn
      ),
    }));
  },

  testConnection: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const success = Math.random() > 0.2;
    return {
      success,
      latencyMs: Math.floor(100 + Math.random() * 400),
      error: success ? undefined : 'Connection timeout',
    };
  },
}));
