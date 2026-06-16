import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

type ApiResult<T> = { data: T | null; error: PostgrestError | null };

export async function createNotification(notification: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<ApiResult<Notification>> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata || null,
      is_read: false,
    })
    .select()
    .maybeSingle();
  return { data: data as Notification | null, error };
}

export async function getNotifications(limit = 50): Promise<ApiResult<Notification[]>> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data as Notification[] | null, error };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  return error ? 0 : (count || 0);
}

export async function markNotificationRead(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  return { error };
}

export async function markAllNotificationsRead(): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  return { error };
}

export async function deleteNotificationById(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  return { error };
}

export async function deleteAllNotifications(): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  return { error };
}

export async function syncMissingNotifications(): Promise<number> {
  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('id, name, email, subject, is_read, created_at')
    .order('created_at', { ascending: false });

  if (!submissions) return 0;

  const { data: existing } = await supabase
    .from('notifications')
    .select('metadata')
    .eq('type', 'contact');

  const existingIds = new Set<string>();
  if (existing) {
    for (const n of existing) {
      const meta = n.metadata as Record<string, unknown> | null;
      if (meta?.contact_submission_id) {
        existingIds.add(meta.contact_submission_id as string);
      }
    }
  }

  let synced = 0;
  for (const sub of submissions) {
    if (!existingIds.has(sub.id)) {
      const { error } = await supabase.from('notifications').insert({
        type: 'contact',
        title: 'New Contact Message',
        message: `${sub.name} sent a message`,
        metadata: {
          name: sub.name,
          email: sub.email,
          subject: sub.subject,
          contact_submission_id: sub.id,
        },
        is_read: sub.is_read || false,
      });
      if (!error) synced++;
    }
  }
  return synced;
}
