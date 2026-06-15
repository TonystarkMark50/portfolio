import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Direct notification insert
async function insertNotification(notification: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  console.log('[Notification] Creating:', notification.title);
  const { error } = await supabase.from('notifications').insert({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata || null,
    is_read: false,
  });
  if (error) {
    console.error('[Notification] INSERT ERROR:', error);
    return false;
  }
  console.log('[Notification] Created successfully');
  return true;
}

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

    // Generate ID client-side so we have it for the notification
    const submissionId = crypto.randomUUID();

    // Only insert columns guaranteed to exist (is_read has DEFAULT false)
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        id: submissionId,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        sender_ip,
      });

    if (dbError) throw dbError;

    const notifOk = await insertNotification({
      type: 'contact',
      title: 'New Contact Message',
      message: `${formData.name} contacted you regarding "${formData.subject}"`,
      metadata: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        contact_submission_id: submissionId,
      },
    });

    if (!notifOk) {
      console.warn('[Contact] Notification insert failed (contact saved)');
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    const msg = error instanceof Error ? error.message : 'Failed to submit form';
    return { success: false, error: msg };
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
