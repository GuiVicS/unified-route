import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface AdminConfig {
  email: string;
  password: string;
}

export interface SecurityConfig {
  masterKey: string;
  jwtSecret: string;
  sessionSecret: string;
}

export interface ServerConfig {
  baseUrl: string;
  port: number;
  corsOrigins: string[];
  rateLimitPerMin: number;
  upstreamTimeoutMs: number;
  deployType?: 'docker-full' | 'docker-external-db';
}

export interface SetupConfig {
  database: DatabaseConfig;
  admin: AdminConfig;
  security: SecurityConfig;
  server: ServerConfig;
  completedAt?: string;
}

interface SetupStore {
  isSetupComplete: boolean;
  currentStep: number;
  config: Partial<SetupConfig>;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionError?: string;
  migrationStatus: 'idle' | 'running' | 'success' | 'error';
  migrationError?: string;
  
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateConfig: <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => void;
  testDatabaseConnection: () => Promise<boolean>;
  runMigrations: () => Promise<boolean>;
  completeSetup: () => void;
  resetSetup: () => void;
}

const generateSecureKey = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

export const useSetupStore = create<SetupStore>()(
  persist(
    (set, get) => ({
      isSetupComplete: false,
      currentStep: 0,
      config: {
        database: {
          host: 'localhost',
          port: 5432,
          database: 'apibridge',
          username: 'postgres',
          password: '',
          ssl: false,
        },
        server: {
          baseUrl: '',
          port: 3000,
          corsOrigins: [],
          rateLimitPerMin: 60,
          upstreamTimeoutMs: 15000,
        },
        security: {
          masterKey: generateSecureKey(32),
          jwtSecret: generateSecureKey(64),
          sessionSecret: generateSecureKey(32),
        },
      },
      connectionStatus: 'idle',
      migrationStatus: 'idle',

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
      
      prevStep: () => set(state => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      updateConfig: (key, value) => set(state => ({
        config: { ...state.config, [key]: value }
      })),

      testDatabaseConnection: async () => {
        set({ connectionStatus: 'testing', connectionError: undefined });
        
        // Simulate connection test - in real backend this would actually connect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { config } = get();
        if (!config.database?.host || !config.database?.password) {
          set({ connectionStatus: 'error', connectionError: 'Host and password are required' });
          return false;
        }
        
        // Simulate success/failure based on valid-looking config
        const success = config.database.host.length > 0 && config.database.password.length >= 4;
        
        if (success) {
          set({ connectionStatus: 'success' });
          return true;
        } else {
          set({ connectionStatus: 'error', connectionError: 'Could not connect to database. Check credentials.' });
          return false;
        }
      },

      runMigrations: async () => {
        set({ migrationStatus: 'running', migrationError: undefined });
        
        // Simulate migration
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        set({ migrationStatus: 'success' });
        return true;
      },

      completeSetup: () => set(state => ({
        isSetupComplete: true,
        config: {
          ...state.config,
          completedAt: new Date().toISOString(),
        }
      })),

      resetSetup: () => set({
        isSetupComplete: false,
        currentStep: 0,
        config: {},
        connectionStatus: 'idle',
        migrationStatus: 'idle',
      }),
    }),
    {
      name: 'apibridge-setup',
      partialize: (state) => ({
        isSetupComplete: state.isSetupComplete,
        config: state.isSetupComplete ? state.config : {},
      }),
    }
  )
);
