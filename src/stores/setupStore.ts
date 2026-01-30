import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export interface SetupConfig {
  admin: AdminConfig;
  security: SecurityConfig;
  server: ServerConfig;
  completedAt?: string;
}

interface SetupStore {
  isSetupComplete: boolean;
  currentStep: number;
  config: Partial<SetupConfig>;
  
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateConfig: <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => void;
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
    (set) => ({
      isSetupComplete: false,
      currentStep: 0,
      config: {
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

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
      
      prevStep: () => set(state => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      updateConfig: (key, value) => set(state => ({
        config: { ...state.config, [key]: value }
      })),

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
        config: {
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
