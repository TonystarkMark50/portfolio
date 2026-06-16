import { createClient } from '@supabase/supabase-js';
import { contactFormSchema } from '../utils/validation';
import logger from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Contact functions
export async function submitContactForm(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = contactFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    let sender_ip = '';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      sender_ip = data.ip;
    } catch { void sender_ip; }

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        sender_ip,
      });

    if (dbError) throw dbError;
    return { success: true };
  } catch (error) {
    logger.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form. Please try again later.' };
  }
}

export async function getResumeDownloadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('resume_downloads')
    .select('*', { count: 'exact', head: true });

  if (error) {
    logger.error('Error getting resume download count:', error);
    return 0;
  }

  return count || 0;
}
