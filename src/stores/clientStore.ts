import { create } from 'zustand';
import type { Client, ClientFormData, ClientWithToken } from '@/types/api-bridge';

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'ab_';
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

const demoClients: Client[] = [
  {
    id: 'client-001',
    name: 'Lovable Frontend',
    allowedOrigins: ['https://lovable.app', 'https://*.lovable.app'],
    allowedConnectionIds: ['conn-001', 'conn-002'],
    enabled: true,
    createdAt: '2024-01-12T09:00:00Z',
    lastUsedAt: '2024-01-25T18:32:00Z',
  },
  {
    id: 'client-002',
    name: 'Support Panel',
    allowedOrigins: ['https://support.company.com'],
    enabled: true,
    createdAt: '2024-01-14T11:20:00Z',
    lastUsedAt: '2024-01-24T14:15:00Z',
  },
  {
    id: 'client-003',
    name: 'Mobile App Backend',
    enabled: false,
    createdAt: '2024-01-08T16:45:00Z',
  },
];

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
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

  fetchClients: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ clients: demoClients, isLoading: false });
  },

  createClient: async (data: ClientFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
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
    await new Promise(resolve => setTimeout(resolve, 400));
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
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      clients: state.clients.filter(client => client.id !== id),
    }));
  },

  toggleClient: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      clients: state.clients.map(client =>
        client.id === id ? { ...client, enabled: !client.enabled } : client
      ),
    }));
  },

  regenerateToken: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateToken();
  },
}));
