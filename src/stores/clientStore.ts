import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, ClientFormData, ClientWithToken } from '@/types/api-bridge';
import { schedulSync } from '@/lib/api-service';

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'ab_';
  const array = new Uint8Array(40);
  crypto.getRandomValues(array);
  for (let i = 0; i < 40; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};

// Interface estendida para armazenar o token
interface ClientWithStoredToken extends Client {
  token?: string;
}

interface ClientStore {
  clients: ClientWithStoredToken[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (data: ClientFormData) => Promise<ClientWithToken>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  toggleClient: (id: string) => Promise<void>;
  regenerateToken: (id: string) => Promise<string>;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],
      isLoading: false,
      error: null,

      fetchClients: async () => {
        set({ isLoading: true, error: null });
        // Dados já estão no state via persist
        set({ isLoading: false });
      },

      createClient: async (data: ClientFormData) => {
        const token = generateToken();
        const newClient: ClientWithStoredToken = {
          id: `client-${Date.now()}`,
          name: data.name,
          allowedOrigins: data.allowedOrigins,
          allowedConnectionIds: data.allowedConnectionIds,
          enabled: data.enabled,
          createdAt: new Date().toISOString(),
          token, // Armazenar o token para sincronização
        };
        
        set(state => {
          const clients = [...state.clients, newClient];
          // Sincronizar com backend (incluindo o token)
          schedulSync({ clients });
          return { clients };
        });
        
        // Retornar com token visível
        return { ...newClient, token } as ClientWithToken;
      },

      updateClient: async (id: string, data: Partial<ClientFormData>) => {
        let updated: ClientWithStoredToken | undefined;
        
        set(state => {
          const clients = state.clients.map(client => {
            if (client.id === id) {
              updated = { ...client, ...data };
              return updated;
            }
            return client;
          });
          // Sincronizar com backend
          schedulSync({ clients });
          return { clients };
        });
        
        if (!updated) throw new Error('Client not found');
        return updated;
      },

      deleteClient: async (id: string) => {
        set(state => {
          const clients = state.clients.filter(client => client.id !== id);
          // Sincronizar com backend
          schedulSync({ clients });
          return { clients };
        });
      },

      toggleClient: async (id: string) => {
        set(state => {
          const clients = state.clients.map(client =>
            client.id === id ? { ...client, enabled: !client.enabled } : client
          );
          // Sincronizar com backend
          schedulSync({ clients });
          return { clients };
        });
      },

      regenerateToken: async (id: string) => {
        const newToken = generateToken();
        set(state => {
          const clients = state.clients.map(client =>
            client.id === id ? { ...client, token: newToken } : client
          );
          // Sincronizar com backend (incluindo novo token)
          schedulSync({ clients });
          return { clients };
        });
        return newToken;
      },
    }),
    {
      name: 'apibridge-clients',
      partialize: (state) => ({
        clients: state.clients,
      }),
    }
  )
);
