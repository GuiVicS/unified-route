import { create } from 'zustand';
import type { AuditLog, HttpMethod } from '@/types/api-bridge';

const generateDemoLogs = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const connections = [
    { id: 'conn-001', name: 'OpenAI Production' },
    { id: 'conn-002', name: 'Dooki Saoko' },
  ];
  const clients = [
    { id: 'client-001', name: 'Lovable Frontend' },
    { id: 'client-002', name: 'Support Panel' },
  ];
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH'];
  const paths = ['/chat/completions', '/orders', '/customers', '/products', '/embeddings'];
  const statuses = [200, 200, 200, 200, 200, 201, 204, 400, 401, 500];

  for (let i = 0; i < 50; i++) {
    const conn = connections[Math.floor(Math.random() * connections.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      connectionId: conn.id,
      connectionName: conn.name,
      clientId: client.id,
      clientName: client.name,
      method,
      host: conn.id === 'conn-001' ? 'api.openai.com' : 'api.dooki.com.br',
      path,
      status,
      latencyMs: Math.floor(50 + Math.random() * 500),
      responseSize: Math.floor(100 + Math.random() * 10000),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

interface AuditFilters {
  connectionId?: string;
  clientId?: string;
  method?: HttpMethod;
  status?: number;
  startDate?: string;
  endDate?: string;
}

interface AuditStore {
  logs: AuditLog[];
  isLoading: boolean;
  filters: AuditFilters;
  fetchLogs: () => Promise<void>;
  setFilters: (filters: AuditFilters) => void;
  getFilteredLogs: () => AuditLog[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  isLoading: false,
  filters: {},

  fetchLogs: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ logs: generateDemoLogs(), isLoading: false });
  },

  setFilters: (filters: AuditFilters) => {
    set({ filters });
  },

  getFilteredLogs: () => {
    const { logs, filters } = get();
    return logs.filter(log => {
      if (filters.connectionId && log.connectionId !== filters.connectionId) return false;
      if (filters.clientId && log.clientId !== filters.clientId) return false;
      if (filters.method && log.method !== filters.method) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  },
}));
