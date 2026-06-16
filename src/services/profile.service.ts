import { getSingle, upsert } from './helpers';
import type { ApiResult } from './helpers';

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
  return getSingle<Profile>('profile');
}

export async function upsertProfile(profile: Partial<Profile>): Promise<ApiResult<Profile>> {
  return upsert<Profile>('profile', profile);
}
