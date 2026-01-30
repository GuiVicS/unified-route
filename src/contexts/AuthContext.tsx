import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types/api-bridge';
import { useSetupStore } from '@/stores/setupStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { config, isSetupComplete } = useSetupStore();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('apibridge_user');
    if (storedUser && isSetupComplete) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [isSetupComplete]);

  const login = useCallback(async (email: string, password: string) => {
    // In production, this would be an API call to the backend
    // For now, validate against the configured admin credentials
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const adminEmail = config.admin?.email;
    const adminPassword = config.admin?.password;
    
    if (email === adminEmail && password === adminPassword) {
      const newUser: User = {
        id: 'admin-001',
        email: email,
        role: 'admin',
      };
      setUser(newUser);
      localStorage.setItem('apibridge_user', JSON.stringify(newUser));
    } else {
      throw new Error('Invalid credentials');
    }
  }, [config.admin]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('apibridge_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
