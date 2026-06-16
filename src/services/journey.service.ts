import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface Journey {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
  type: string;
  icon: string;
  display_order: number;
}

export async function getJourney(): Promise<ApiResult<Journey[]>> {
  return getAll<Journey>('journey', 'display_order');
}

export async function upsertJourneyEntry(entry: Partial<Journey>): Promise<ApiResult<Journey>> {
  return upsert<Journey>('journey', entry);
}

export async function deleteJourneyEntry(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('journey', id);
}
