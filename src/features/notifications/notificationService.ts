import { supabase } from '../../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationResult<T> {
  data: T | null;
  error: string | null;
}

function toResult<T>(data: T | null, error: unknown): NotificationResult<T> {
  return {
    data,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}

export async function fetchNotifications(): Promise<NotificationResult<AppNotification[]>> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  return toResult(data as AppNotification[] | null, error);
}

export async function fetchUnreadCount(): Promise<NotificationResult<number>> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  return toResult(count ?? 0, error);
}

export async function markAsRead(id: string): Promise<NotificationResult<null>> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  return toResult(null, error);
}

export async function markAllAsRead(): Promise<NotificationResult<null>> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  return toResult(null, error);
}

export async function deleteNotification(id: string): Promise<NotificationResult<null>> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  return toResult(null, error);
}

export async function deleteAllNotifications(): Promise<NotificationResult<null>> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  return toResult(null, error);
}

type RealtimeCallback = (notification: AppNotification) => void;

export function subscribeToNotifications(callback: RealtimeCallback) {
  const subscription = supabase
    .channel('notifications-channel')
    .on<AppNotification>(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      (payload: RealtimePostgresChangesPayload<AppNotification>) => {
        const record = payload.new as AppNotification | null;
        if (record) callback(record);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
