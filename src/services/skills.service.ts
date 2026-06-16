import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface Skill {
  id: string;
  category: string;
  skills: string[];
  gradient: string;
  display_order: number;
}

export async function getSkills(): Promise<ApiResult<Skill[]>> {
  return getAll<Skill>('skills', 'display_order');
}

export async function upsertSkill(skill: Partial<Skill>): Promise<ApiResult<Skill>> {
  return upsert<Skill>('skills', skill);
}

export async function deleteSkill(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('skills', id);
}
