'use client';

import { createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';

interface AuthContextType {
  authClient: typeof authClient;
}

const AuthContext = createContext<AuthContextType>({
  authClient,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ authClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
