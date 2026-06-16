import { getSingle, upsert } from './helpers';
import type { ApiResult } from './helpers';

export interface ContactInfo {
  id: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
  portfolio_url: string | null;
  phone: string | null;
}

export async function getContactInfo(): Promise<ApiResult<ContactInfo>> {
  return getSingle<ContactInfo>('contact_info');
}

export async function upsertContactInfo(contact: Partial<ContactInfo>): Promise<ApiResult<ContactInfo>> {
  return upsert<ContactInfo>('contact_info', contact);
}
