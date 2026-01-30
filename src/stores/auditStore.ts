import { create } from 'zustand';
import type { AuditLog, HttpMethod } from '@/types/api-bridge';
import { useSetupStore } from './setupStore';

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
  error: string | null;
  filters: AuditFilters;
  fetchLogs: () => Promise<void>;
  setFilters: (filters: AuditFilters) => void;
  getFilteredLogs: () => AuditLog[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchLogs: async () => {
    const { isSetupComplete } = useSetupStore.getState();
    if (!isSetupComplete) {
      set({ logs: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // In production: GET /api/audit-logs
      set({ logs: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch logs', isLoading: false });
    }
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
