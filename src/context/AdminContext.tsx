import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import supabase from '../services/supabaseClient';
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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!OWNER_EMAIL) {
      setConfigError('Admin email not configured. Set VITE_ADMIN_EMAIL (or VITE_OWNER_EMAIL) environment variable.');
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        return;
      }
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (session.user.email !== OWNER_EMAIL) {
        supabase.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
        });
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (session.user.email !== OWNER_EMAIL) {
        supabase.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        const expiresAt = session.expires_at;
        if (expiresAt && Date.now() / 1000 > expiresAt) {
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
      }
      setIsLoading(false);
    }).catch((err) => {
      logger.error('Session check failed:', err);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!OWNER_EMAIL) {
      return { success: false, error: 'Admin panel is not configured. Set VITE_ADMIN_EMAIL environment variable.' };
    }
    if (email !== OWNER_EMAIL) {
      return { success: false, error: 'Access denied. Only the portfolio owner can log in.' };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message === 'Invalid login credentials' ? 'Invalid credentials' : error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

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

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
