'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// -----------------------------------------------------------
// 1. Define Context Shape
// -----------------------------------------------------------

interface AuthContextType {
  isAuth: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

// -----------------------------------------------------------
// 2. Create Context
// -----------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage Key
const AUTH_KEY = 'capdimw_admin_auth';

// -----------------------------------------------------------
// 3. Provider Component
// -----------------------------------------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted state from localStorage (client-only)
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      setIsAuth(storedAuth === 'true');
    } catch (error) {
      console.error('🔒 AuthProvider: Failed to read from localStorage', error);
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use useCallback to avoid recreating functions on each render
  const login = useCallback(() => {
    try {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuth(true);
    } catch (error) {
      console.error('🔒 AuthProvider: Failed to write to localStorage', error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setIsAuth(false);
    } catch (error) {
      console.error('🔒 AuthProvider: Failed to remove from localStorage', error);
    }
  }, []);

  // Optional UX: While loading, delay rendering children (prevents flicker)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        <div className="animate-pulse text-sm">Loading authentication...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuth, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------------------------------------
// 4. Hook for consuming auth context
// -----------------------------------------------------------

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
