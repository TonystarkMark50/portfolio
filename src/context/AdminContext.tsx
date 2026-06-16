import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { OWNER_EMAIL } from '../config/app';
import logger from '../utils/logger';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  configError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  canEdit: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCKOUT_MS = 5 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

let loginAttempts: { count: number; firstAttemptAt: number } = { count: 0, firstAttemptAt: 0 };

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        clearSessionTimer();
        return false;
      }
      if (session.user.email !== OWNER_EMAIL) {
        await supabase.auth.signOut();
        setUser(null);
        clearSessionTimer();
        return false;
      }
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        await supabase.auth.signOut();
        setUser(null);
        clearSessionTimer();
        return false;
      }
      return true;
    } catch {
      setUser(null);
      clearSessionTimer();
      return false;
    }
  }, [clearSessionTimer]);

  useEffect(() => {
    if (!OWNER_EMAIL) {
      setConfigError('Admin email not configured. Set VITE_ADMIN_EMAIL (or VITE_OWNER_EMAIL) environment variable.');
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        return;
      }
      if (!session?.user) {
        setUser(null);
        clearSessionTimer();
        setIsLoading(false);
        return;
      }
      if (session.user.email !== OWNER_EMAIL) {
        supabase.auth.signOut().catch(() => {});
        setUser(null);
        clearSessionTimer();
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
        });
        if (!sessionTimerRef.current) {
          sessionTimerRef.current = setInterval(() => { validateSession(); }, SESSION_CHECK_INTERVAL_MS);
        }
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (session.user.email !== OWNER_EMAIL) {
        supabase.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        if (session.expires_at && Date.now() / 1000 > session.expires_at) {
          supabase.auth.signOut().catch(() => {});
          setUser(null);
          setIsLoading(false);
          return;
        }
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
        });
        sessionTimerRef.current = setInterval(() => { validateSession(); }, SESSION_CHECK_INTERVAL_MS);
      }
      setIsLoading(false);
    }).catch((err) => {
      logger.error('Session check failed:', err);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearSessionTimer();
    };
  }, [validateSession, clearSessionTimer]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!OWNER_EMAIL) {
      return { success: false, error: 'Admin panel is not configured. Set VITE_ADMIN_EMAIL environment variable.' };
    }
    if (email !== OWNER_EMAIL) {
      return { success: false, error: 'Access denied. Only the portfolio owner can log in.' };
    }

    const now = Date.now();
    if (loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      const elapsed = now - loginAttempts.firstAttemptAt;
      if (elapsed < LOGIN_LOCKOUT_MS) {
        const remaining = Math.ceil((LOGIN_LOCKOUT_MS - elapsed) / 60000);
        return { success: false, error: `Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.` };
      }
      loginAttempts = { count: 0, firstAttemptAt: 0 };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        loginAttempts = {
          count: loginAttempts.count + 1,
          firstAttemptAt: loginAttempts.firstAttemptAt || now,
        };
        logger.warn('Failed login attempt');
        return { success: false, error: 'Invalid credentials' };
      }
      loginAttempts = { count: 0, firstAttemptAt: 0 };
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    clearSessionTimer();
    await supabase.auth.signOut();
    setUser(null);
  }, [clearSessionTimer]);

  const canEdit = useCallback((): boolean => {
    return !!user && !!OWNER_EMAIL && user.email === OWNER_EMAIL;
  }, [user]);

  return (
    <AdminContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!OWNER_EMAIL,
        configError,
        login,
        logout,
        canEdit,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
