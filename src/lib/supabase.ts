import { createClient } from '@supabase/supabase-js';

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
  try {
    let sender_ip = '';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      sender_ip = data.ip;
    } catch { void sender_ip; }

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ ...formData, sender_ip });

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
  }
}

// Resume tracking
export async function trackResumeDownload(): Promise<void> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();

    await supabase.from('resume_downloads').insert({
      user_ip: ip,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch (error) {
    console.error('Error tracking resume download:', error);
  }
}

export async function getResumeDownloadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('resume_downloads')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting resume download count:', error);
    return 0;
  }

  return count || 0;
}
