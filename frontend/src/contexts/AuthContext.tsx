/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AuthContextType, User, LoginCredentials, SignupCredentials } from '@/types/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const refreshTokenFunc = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const { data, error } = await api.refresh.post(undefined, {
        headers: {
          Authorization: `Bearer ${refreshTokenValue}`,
        },
      });

      if (error) {
        throw new Error((error.value as { message?: string })?.message || 'Token refresh failed');
      }

      if (data && data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          const { data, error } = await api.me.get({
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (data && 'id' in data && 'username' in data && 'email' in data) {
            setUser(data as unknown as User);
          } else if (error?.status === 401) {
            // Try to refresh the token
            try {
              await refreshTokenFunc();
              // Retry with new token
              const retryResponse = await api.me.get({
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
              });
              if (retryResponse.data && 'id' in retryResponse.data && 'username' in retryResponse.data && 'email' in retryResponse.data) {
                setUser(retryResponse.data as unknown as User);
              }
            } catch {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [refreshTokenFunc]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { data, error } = await api.login.post(credentials);

      if (error) {
        throw new Error((error.value as { message?: string })?.message || 'Login failed');
      }

      if (data && data.accessToken && data.refreshToken && data.user) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user as unknown as User);
        toast.success(`Welcome back, ${data.user.username}!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setLoading(true);
    try {
      const { data, error } = await api.signup.post(credentials);

      if (error) {
        throw new Error((error.value as { message?: string })?.message || 'Signup failed');
      }

      if (data && data.accessToken && data.refreshToken && data.user) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user as unknown as User);
        toast.success(`Welcome, ${data.user.username}! Account created successfully.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken: refreshTokenFunc,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}