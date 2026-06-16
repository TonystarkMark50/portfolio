import { getSingle, upsert } from './helpers';
import supabase from './supabaseClient';
import DOMPurify from 'dompurify';
import logger from '../utils/logger';
import type { ApiResult } from './helpers';
import type { PostgrestError } from '@supabase/supabase-js';
import { contactFormSchema } from '../utils/validation';

function validationError(message: string): PostgrestError {
  return { message, details: '', hint: '', code: 'VALIDATION' };
}

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

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

export async function submitContactForm(formData: { name: string; email: string; message: string }): Promise<ApiResult<{ success: boolean }>> {
  const parsed = contactFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: validationError(parsed.error.errors[0].message) };
  }

  const sanitizedData = {
    name: sanitizeInput(formData.name),
    email: sanitizeInput(formData.email),
    message: sanitizeInput(formData.message),
  };

  const result = await supabase.from('contact_submissions').insert(sanitizedData).select().single();

  if (result.error) {
    logger.error('Error submitting contact form:', result.error)
    return { error: result.error as PostgrestError, data: null };
  }

  return { data: { success: true }, error: null };
}


export async function upsertContactInfo(contact: Partial<ContactInfo>): Promise<ApiResult<ContactInfo>> {
  const sanitizedContact = {
    email: sanitizeInput(contact.email ?? ''),
    github: sanitizeInput(contact.github ?? ''),
    linkedin: sanitizeInput(contact.linkedin ?? ''),
    location: sanitizeInput(contact.location ?? ''),
    phone: contact.phone ? sanitizeInput(contact.phone) : null,
  };

  return upsert<ContactInfo>('contact_info', sanitizedContact);
}
