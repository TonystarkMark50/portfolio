import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

/**
 * Interface representing an educational record.
 */
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

/**
 * Fetches all educational records from the database.
 * @returns {Promise<ApiResult<Education[]>>} Array of educational records or an error.
 */
export async function getEducation(): Promise<ApiResult<Education[]>> {
  return getAll<Education>('education', 'display_order');
}

/**
 * Updates or inserts an educational record in the database.
 * @param {Partial<Education>} edu - Partial educational record data to update or insert.
 * @returns {Promise<ApiResult<Education>>} Updated or inserted educational record or an error.
 */
export async function upsertEducation(edu: Partial<Education>): Promise<ApiResult<Education>> {
  return upsert<Education>('education', edu);
}

/**
 * Deletes an educational record from the database.
 * @param {string} id - The ID of the educational record to delete.
 * @returns {Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }>} Error object or null.
 */
export async function deleteEducation(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('education', id);
}
