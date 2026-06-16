import supabase from './supabaseClient';
import logger from '../utils/logger';
import type { ApiResult } from './helpers';
import type { PostgrestError } from '@supabase/supabase-js';
import { profileSchema } from '../utils/validation';

function validationError(message: string): PostgrestError {
  return { message, details: '', hint: '', code: 'VALIDATION' };
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio_url: string | null;
  avatar_url: string | null;
  resume_url: string | null;
}

export async function getProfile(): Promise<ApiResult<Profile>> {
  try {
   const result = await supabase.from('profile').select().single();
   if (result.error) {
     logger.error('Error fetching profile:', result.error)
     return { error: result.error, data: null };
   }
    return { data: result.data, error: null };
  } catch (error) {
    logger.error('Error fetching profile:', error)
    return { error: error as PostgrestError, data: null };
  }
}

export async function upsertProfile(profile: Partial<Profile>): Promise<ApiResult<Profile>> {
  const parsed = profileSchema.safeParse(profile);
  if (!parsed.success) {
    return { data: null, error: validationError(parsed.error.errors[0].message) };
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    return { data: null, error: validationError('Authentication required') };
  }

  try {
    const result = await supabase.from('profile').upsert({
      ...profile,
      user_id: session.user.id,
    }).select().single();
    return { data: result.data, error: result.error };
  } catch (error) {
    logger.error('Error updating profile:', error)
    return { error: error as PostgrestError, data: null };
  }
}
