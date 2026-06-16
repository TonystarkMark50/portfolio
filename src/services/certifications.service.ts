import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

export interface Certification {
  id: string;
  title: string;
  organization: string;
  platform: string | null;
  issue_date: string | null;
  credential_id: string | null;
  certificate_url: string | null;
  embed_url: string | null;
  description: string | null;
  category: string | null;
  skills: string[];
  status: string;
  display_order: number;
  logo_url: string | null;
}

export async function getCertifications(): Promise<ApiResult<Certification[]>> {
  return getAll<Certification>('certifications', 'display_order');
}

export async function upsertCertification(cert: Partial<Certification>): Promise<ApiResult<Certification>> {
  return upsert<Certification>('certifications', cert);
}

export async function deleteCertification(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('certifications', id);
}
