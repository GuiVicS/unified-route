import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Connection, ConnectionFormData } from '@/types/api-bridge';
import { schedulSync } from '@/lib/api-service';

// Interface estendida para armazenar credenciais (apenas localmente)
interface ConnectionWithCredentials extends Connection {
  apiKey?: string;
  secret?: string;
  customAuth?: {
    headerName: string;
    headerValueTemplate: string;
  };
}

interface ConnectionStore {
  connections: ConnectionWithCredentials[];
  isLoading: boolean;
  error: string | null;
  fetchConnections: () => Promise<void>;
  createConnection: (data: ConnectionFormData) => Promise<Connection>;
  updateConnection: (id: string, data: Partial<ConnectionFormData>) => Promise<Connection>;
  deleteConnection: (id: string) => Promise<void>;
  toggleConnection: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connections: [],
      isLoading: false,
      error: null,

      fetchConnections: async () => {
        set({ isLoading: true, error: null });
        // Dados já estão no state via persist
        set({ isLoading: false });
      },

      createConnection: async (data: ConnectionFormData) => {
        const newConnection: ConnectionWithCredentials = {
          id: `conn-${Date.now()}`,
          name: data.name,
          providerType: data.providerType,
          baseUrl: data.baseUrl,
          authScheme: data.authScheme,
          hasCredentials: !!(data.apiKey || data.secret),
          apiKey: data.apiKey,
          secret: data.secret,
          customAuth: data.customAuth,
          extraHeaders: data.extraHeaders,
          allowedHosts: data.allowedHosts,
          allowedPathPrefixes: data.allowedPathPrefixes,
          allowedMethods: data.allowedMethods,
          enabled: data.enabled,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => {
          const connections = [...state.connections, newConnection];
          // Sincronizar com backend
          schedulSync({ connections });
          return { connections };
        });
        
        return newConnection;
      },

      updateConnection: async (id: string, data: Partial<ConnectionFormData>) => {
        let updated: ConnectionWithCredentials | undefined;
        
        set(state => {
          const connections = state.connections.map(conn => {
            if (conn.id === id) {
              updated = {
                ...conn,
                ...data,
                apiKey: data.apiKey || conn.apiKey,
                secret: data.secret || conn.secret,
                customAuth: data.customAuth || conn.customAuth,
                hasCredentials: data.apiKey ? true : conn.hasCredentials,
                updatedAt: new Date().toISOString(),
              };
              return updated;
            }
            return conn;
          });
          // Sincronizar com backend
          schedulSync({ connections });
          return { connections };
        });
        
        if (!updated) throw new Error('Connection not found');
        return updated;
      },

      deleteConnection: async (id: string) => {
        set(state => {
          const connections = state.connections.filter(conn => conn.id !== id);
          // Sincronizar com backend
          schedulSync({ connections });
          return { connections };
        });
      },

      toggleConnection: async (id: string) => {
        set(state => {
          const connections = state.connections.map(conn =>
            conn.id === id ? { ...conn, enabled: !conn.enabled, updatedAt: new Date().toISOString() } : conn
          );
          // Sincronizar com backend
          schedulSync({ connections });
          return { connections };
        });
      },

      testConnection: async (id: string) => {
        const connection = get().connections.find(c => c.id === id);
        if (!connection) {
          return { success: false, latencyMs: 0, error: 'Conexão não encontrada' };
        }

        const startTime = Date.now();
        
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          
          await fetch(connection.baseUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
          });
          
          clearTimeout(timeout);
          const latencyMs = Date.now() - startTime;
          
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
    }),
    {
      name: 'apibridge-connections',
      partialize: (state) => ({
        connections: state.connections,
      }),
    }
  )
);
