import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface Education {
  id: string;
  degree: string;
  field: string | null;
  institution: string;
  period: string | null;
  location: string | null;
  gpa: string | null;
  status: string | null;
  current: boolean;
  description: string | null;
  display_order: number;
}

export async function getEducation(): Promise<ApiResult<Education[]>> {
  return getAll<Education>('education', 'display_order');
}

export async function upsertEducation(edu: Partial<Education>): Promise<ApiResult<Education>> {
  return upsert<Education>('education', edu);
}

export async function deleteEducation(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('education', id);
}
