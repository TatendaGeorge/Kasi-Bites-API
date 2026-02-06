import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token');
  });
  const [isLoading, setIsLoading] = useState(true);
  const justLoggedIn = useRef(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Skip verification if we just logged in (login already validated)
      if (justLoggedIn.current) {
        justLoggedIn.current = false;
        setIsLoading(false);
        return;
      }

      if (token && user) {
        // We have cached credentials, verify they're still valid
        try {
          const response = await authApi.getUser();
          const userData = response.user;
          if (!userData.is_admin) {
            throw new Error('Not an admin');
          }
          setUser(userData);
          localStorage.setItem('admin_user', JSON.stringify(userData));
        } catch {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setToken(null);
          setUser(null);
        }
      } else if (token && !user) {
        // Token but no user - clear invalid state
        localStorage.removeItem('admin_token');
        setToken(null);
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []); // Only run on mount, not on token change

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (!response.user.is_admin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    justLoggedIn.current = true;
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('admin_user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
