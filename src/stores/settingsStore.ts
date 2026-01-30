import { create } from 'zustand';
import type { SecuritySettings, DashboardStats } from '@/types/api-bridge';
import { useSetupStore } from './setupStore';

const defaultSettings: SecuritySettings = {
  allowedOrigins: [],
  rateLimitPerMin: 60,
  enableAuditLogs: true,
};

const defaultStats: DashboardStats = {
  totalConnections: 0,
  activeConnections: 0,
  totalClients: 0,
  activeClients: 0,
  requestsToday: 0,
  requestsThisWeek: 0,
  avgLatencyMs: 0,
  errorRate: 0,
};

interface SettingsStore {
  settings: SecuritySettings;
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  stats: defaultStats,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    const { isSetupComplete, config } = useSetupStore.getState();
    if (!isSetupComplete) {
      set({ settings: defaultSettings, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // In production: GET /api/settings
      // Use config from setup if available
      set({ 
        settings: {
          allowedOrigins: config.server?.corsOrigins || [],
          rateLimitPerMin: config.server?.rateLimitPerMin || 60,
          enableAuditLogs: true,
        },
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch settings', isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<SecuritySettings>) => {
    // In production: PUT /api/settings
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  fetchStats: async () => {
    const { isSetupComplete } = useSetupStore.getState();
    if (!isSetupComplete) {
      set({ stats: defaultStats });
      return;
    }

    // In production: GET /api/stats
    set({ stats: defaultStats });
  },
}));
