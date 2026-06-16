import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface Internship {
  id: string;
  organization: string;
  department: string | null;
  role: string;
  duration: string | null;
  location: string | null;
  type: string;
  description: string[];
  responsibilities: string[];
  learnings: string[];
  impact: string[];
  certificate_url: string | null;
  completed: boolean;
  display_order: number;
}

export async function getInternships(): Promise<ApiResult<Internship[]>> {
  return getAll<Internship>('internships', 'display_order');
}

export async function upsertInternship(internship: Partial<Internship>): Promise<ApiResult<Internship>> {
  return upsert<Internship>('internships', internship);
}

export async function deleteInternship(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('internships', id);
}
