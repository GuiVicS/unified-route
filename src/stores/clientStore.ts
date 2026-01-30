import { create } from 'zustand';
import type { Client, ClientFormData, ClientWithToken } from '@/types/api-bridge';
import { useSetupStore } from './setupStore';

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'ab_';
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (data: ClientFormData) => Promise<ClientWithToken>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  toggleClient: (id: string) => Promise<void>;
  regenerateToken: (id: string) => Promise<string>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async () => {
    const { isSetupComplete } = useSetupStore.getState();
    if (!isSetupComplete) {
      set({ clients: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // In production: GET /api/clients
      set({ clients: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch clients', isLoading: false });
    }
  },

  createClient: async (data: ClientFormData) => {
    const token = generateToken();
    const newClient: ClientWithToken = {
      id: `client-${Date.now()}`,
      name: data.name,
      allowedOrigins: data.allowedOrigins,
      allowedConnectionIds: data.allowedConnectionIds,
      enabled: data.enabled,
      createdAt: new Date().toISOString(),
      token,
    };
    
    set(state => ({ 
      clients: [...state.clients, { ...newClient, token: undefined } as Client] 
    }));
    
    return newClient;
  },

  updateClient: async (id: string, data: Partial<ClientFormData>) => {
    let updated: Client | undefined;
    
    set(state => ({
      clients: state.clients.map(client => {
        if (client.id === id) {
          updated = { ...client, ...data };
          return updated;
        }
        return client;
      }),
    }));
    
    if (!updated) throw new Error('Client not found');
    return updated;
  },

  deleteClient: async (id: string) => {
    set(state => ({
      clients: state.clients.filter(client => client.id !== id),
    }));
  },

  toggleClient: async (id: string) => {
    set(state => ({
      clients: state.clients.map(client =>
        client.id === id ? { ...client, enabled: !client.enabled } : client
      ),
    }));
  },

  regenerateToken: async (id: string) => {
    return generateToken();
  },
}));
