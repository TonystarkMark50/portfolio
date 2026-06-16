import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export type ApiResult<T> = { data: T | null; error: PostgrestError | null };

export async function getSingle<T>(table: string): Promise<ApiResult<T>> {
  const { data, error } = await supabase.from(table).select('*').limit(1).maybeSingle();
  return { data: data as T | null, error };
}

export async function getAll<T>(table: string, order?: string): Promise<ApiResult<T[]>> {
  let query = supabase.from(table).select('*');
  if (order) query = query.order(order, { ascending: true });
  const { data, error } = await query;
  return { data: data as T[] | null, error };
}

export async function upsert<T>(table: string, record: Partial<T>): Promise<ApiResult<T>> {
  const { data, error } = await supabase.from(table).upsert(record).select().maybeSingle();
  return { data: data as T | null, error };
}

export async function remove(table: string, id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
}
