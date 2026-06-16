import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface About {
  id: string;
  title: string;
  subtitle: string | null;
  paragraphs: string[];
  display_order: number;
}

export async function getAbout(): Promise<ApiResult<About[]>> {
  return getAll<About>('about', 'display_order');
}

export async function upsertAbout(about: Partial<About>): Promise<ApiResult<About>> {
  return upsert<About>('about', about);
}

export async function deleteAbout(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('about', id);
}
