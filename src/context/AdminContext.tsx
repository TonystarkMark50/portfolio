import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { OWNER_EMAIL } from '../lib/devMode';

interface AdminContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  canEdit: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (u && u.email !== OWNER_EMAIL) {
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(u);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u && u.email !== OWNER_EMAIL) {
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(u);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (email !== OWNER_EMAIL) {
      return { success: false, error: 'Access denied. Only the portfolio owner can log in.' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          return { success: false, error: 'Invalid credentials' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function canEdit(): boolean {
    return !!user && user.email === OWNER_EMAIL;
  }

  return (
    <AdminContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
