import supabase from '../services/supabaseClient'
import logger from '../utils/logger'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'superadmin'
}

export interface AuthResult {
  user: AdminUser | null
  error: string | null
}

export async function getAdminUser(): Promise<AuthResult> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { user: null, error: null }
    }

    const email = session.user.email
    if (!email) {
      return { user: null, error: 'No email on session' }
    }

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    if (!adminEmail) {
      return { user: null, error: 'Admin email not configured' }
    }

    if (email !== adminEmail) {
      return { user: null, error: null }
    }

    return {
      user: {
        id: session.user.id,
        email,
        role: 'admin',
      },
      error: null,
    }
  } catch (error) {
    logger.error('Auth check failed:', error)
    return { user: null, error: 'Authentication check failed' }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { user: null, error: error.message }
    }
    if (!data.user) {
      return { user: null, error: 'Sign in failed' }
    }
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    if (data.user.email !== adminEmail) {
      await supabase.auth.signOut()
      return { user: null, error: 'Unauthorized: not an admin user' }
    }
    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: 'admin',
      },
      error: null,
    }
  } catch (error) {
    logger.error('Sign in failed:', error)
    return { user: null, error: 'Sign in failed' }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error) {
    logger.error('Sign out failed:', error)
    return { error: 'Sign out failed' }
  }
}
