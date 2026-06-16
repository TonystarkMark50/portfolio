import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

/**
 * Interface representing a skill category.
 */
export interface Skill {
  id: string;
  category: string;
  skills: string[];
  gradient: string;
  display_order: number;
}

/**
 * Fetches all skill categories from the database.
 * @returns {Promise<ApiResult<Skill[]>>} Array of skill categories or an error.
 */
export async function getSkills(): Promise<ApiResult<Skill[]>> {
  return getAll<Skill>('skills', 'display_order');
}

/**
 * Updates or inserts a skill category in the database.
 * @param {Partial<Skill>} skill - Partial skill category data to update or insert.
 * @returns {Promise<ApiResult<Skill>>} Updated or inserted skill category or an error.
 */
export async function upsertSkill(skill: Partial<Skill>): Promise<ApiResult<Skill>> {
  return upsert<Skill>('skills', skill);
}

/**
 * Deletes a skill category from the database.
 * @param {string} id - The ID of the skill category to delete.
 * @returns {Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }>} Error object or null.
 */
export async function deleteSkill(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('skills', id);
}
