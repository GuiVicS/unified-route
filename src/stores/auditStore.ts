import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog, HttpMethod } from '@/types/api-bridge';

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
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      logs: [],
      isLoading: false,
      error: null,
      filters: {},

      fetchLogs: async () => {
        set({ isLoading: true, error: null });
        // Dados já estão no state via persist
        set({ isLoading: false });
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

      addLog: (logData) => {
        const newLog: AuditLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          ...logData,
        };
        
        set(state => ({
          logs: [newLog, ...state.logs].slice(0, 1000),
        }));
      },

      clearLogs: () => {
        set({ logs: [] });
      },
    }),
    {
      name: 'apibridge-audit',
      partialize: (state) => ({
        logs: state.logs.slice(0, 100),
      }),
    }
  )
);
