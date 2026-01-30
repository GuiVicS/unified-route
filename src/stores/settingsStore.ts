import { create } from 'zustand';
import type { SecuritySettings, DashboardStats } from '@/types/api-bridge';

const demoSettings: SecuritySettings = {
  allowedOrigins: ['https://lovable.app', 'https://*.lovable.app', 'https://support.company.com'],
  rateLimitPerMin: 60,
  enableAuditLogs: true,
};

const demoStats: DashboardStats = {
  totalConnections: 3,
  activeConnections: 2,
  totalClients: 3,
  activeClients: 2,
  requestsToday: 1247,
  requestsThisWeek: 8932,
  avgLatencyMs: 187,
  errorRate: 2.3,
};

interface SettingsStore {
  settings: SecuritySettings;
  stats: DashboardStats;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: demoSettings,
  stats: demoStats,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ settings: demoSettings, isLoading: false });
  },

  updateSettings: async (newSettings: Partial<SecuritySettings>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  fetchStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ stats: demoStats });
  },
}));
