'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/services/auth.service';
import { socketClient } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // ✅ ADD THIS (for Google / OAuth login)
  setAuthFromOAuth: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_ME_BOOTSTRAP_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      reject(
        Object.assign(new Error(`${label} timed out after ${ms}ms`), { status: 0 })
      );
    }, ms);
    promise.then(
      (v) => {
        window.clearTimeout(id);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(id);
        reject(e);
      }
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing auth...', {
        pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });
      try {
        const isAuth = authService.isAuthenticated();
        console.log('🔐 Has token:', isAuth);

        // Check if we're returning from an OAuth callback (Gmail, Meta, etc.)
        // In this case, preserve the user session even if getCurrentUser fails
        const isOAuthCallback = typeof window !== 'undefined' && 
          (window.location.search.includes('success=true') || 
           window.location.search.includes('error=') ||
           window.location.search.includes('platform='));

        if (isAuth) {
          const storedUser = authService.getStoredUser();
          console.log('🔐 Stored user:', storedUser ? 'Found' : 'Not found');
          if (!storedUser) {
            console.warn(
              '🔐 Access token exists but `user` is missing from localStorage — profile must load from /auth/me. If the app spins forever, /auth/me or token refresh is hanging or failing.'
            );
          }

          if (storedUser) {
            setUser(storedUser);
            console.log('🔐 User restored from storage');
          }

          try {
            console.log('🔐 Fetching fresh user data...');
            const currentUser = await withTimeout(
              authService.getCurrentUser(),
              AUTH_ME_BOOTSTRAP_MS,
              'GET /auth/me (bootstrap)'
            );

            if (currentUser && currentUser.id) {
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
              console.log('🔐 Fresh user data fetched and stored successfully');
            } else {
              console.warn('⚠️ API returned invalid user data, keeping stored user');
            }
          } catch (error: unknown) {
            console.error('❌ Failed to fetch current user:', error);
            const status = typeof error === 'object' && error !== null && 'status' in error
              ? (error as { status?: number }).status
              : undefined;
            const message = error instanceof Error ? error.message : '';

            const shouldPreserveOAuthSession = isOAuthCallback && !!storedUser;
            const isUnauthorized =
              status === 401 ||
              message.includes('401') ||
              /unauthoriz/i.test(message);

            if (shouldPreserveOAuthSession) {
              console.log('🔐 OAuth callback detected - preserving cached user after /auth/me error');
            } else if (isUnauthorized) {
              console.log('🔐 Session invalid (401) — clearing local auth');
              authService.clearLocalSession();
              setUser(null);
            } else if (!storedUser) {
              console.log(
                '🔐 No cached user and /auth/me failed — clearing token-only / broken session',
                { status, message: message.slice(0, 160) }
              );
              authService.clearLocalSession();
              setUser(null);
            } else {
              console.warn(
                '🔐 Kept cached user after /auth/me failure (network, timeout, or server error)',
                { status }
              );
            }
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user (email/password)
   */
  const login = useCallback(
    async (email: string, password: string, captchaToken: string): Promise<User> => {
      try {
        setLoading(true);
        const user = await authService.login({ email, password, captchaToken });
        setUser(user);
        return user;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * ✅ ADD THIS FUNCTION
   * Used after Google / OAuth login
   * Updates context immediately (no refresh needed)
   */
  const setAuthFromOAuth = useCallback((user: User) => {
    console.log('🔐 Setting auth from OAuth');
    setUser(user);
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      socketClient.disconnect();
      await authService.logout();
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,

      // ✅ expose new method
      setAuthFromOAuth,
    }),
    [user, loading, login, logout, refreshUser, setAuthFromOAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
