import { supabase } from '../lib/supabase';

export async function logAuditAction(action: string, email?: string): Promise<void> {
  try {
    if (!email) {
      const { data: { user } } = await supabase.auth.getUser();
      email = user?.email || 'unknown';
    }
    await supabase.from('admin_audit_log').insert({
      action,
      email,
      role: 'admin',
    });
  } catch {
    // silently fail — audit logging should never block the user
  }
}
