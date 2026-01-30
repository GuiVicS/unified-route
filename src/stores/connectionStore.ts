import { create } from 'zustand';
import type { Connection, ConnectionFormData } from '@/types/api-bridge';
import { useSetupStore } from './setupStore';

interface ConnectionStore {
  connections: Connection[];
  isLoading: boolean;
  error: string | null;
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
  error: null,

  fetchConnections: async () => {
    const { isSetupComplete } = useSetupStore.getState();
    if (!isSetupComplete) {
      set({ connections: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/connections');
      // const data = await response.json();
      
      // For now, return empty - data comes from real backend
      set({ connections: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch connections', isLoading: false });
    }
  },

  createConnection: async (data: ConnectionFormData) => {
    // In production: POST /api/connections
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
    set(state => ({
      connections: state.connections.filter(conn => conn.id !== id),
    }));
  },

  toggleConnection: async (id: string) => {
    set(state => ({
      connections: state.connections.map(conn =>
        conn.id === id ? { ...conn, enabled: !conn.enabled, updatedAt: new Date().toISOString() } : conn
      ),
    }));
  },

  testConnection: async (id: string) => {
    const connection = get().connections.find(c => c.id === id);
    if (!connection) {
      return { success: false, latencyMs: 0, error: 'Conexão não encontrada' };
    }

    const startTime = Date.now();
    
    try {
      // Tenta fazer uma requisição real para a URL base
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(connection.baseUrl, {
        method: 'HEAD',
        mode: 'no-cors', // Permite testar URLs externas sem CORS
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      const latencyMs = Date.now() - startTime;
      
      // Em modo no-cors, não temos acesso ao status, mas se não deu erro, passou
      return { success: true, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, latencyMs, error: 'Timeout (10s)' };
        }
        return { success: false, latencyMs, error: error.message };
      }
      
      return { success: false, latencyMs, error: 'Falha na conexão' };
    }
  },
}));
