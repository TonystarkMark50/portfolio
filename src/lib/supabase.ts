import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Direct notification insert (avoids circular import with api.ts)
function insertNotification(notification: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  supabase.from('notifications').insert({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata || null,
    is_read: false,
  }).then(({ error }) => {
    if (error) console.error('Notification insert error:', error);
  });
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

    const { data: insertedData, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ ...formData, sender_ip })
      .select('id');

    if (dbError) throw dbError;

    let contactSubmissionId: string | undefined;
    if (insertedData && Array.isArray(insertedData) && insertedData.length > 0) {
      contactSubmissionId = (insertedData[0] as Record<string, unknown>).id as string;
    }

    insertNotification({
      type: 'contact',
      title: 'New Contact Message',
      message: `${formData.name} contacted you regarding "${formData.subject}"`,
      metadata: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        contact_submission_id: contactSubmissionId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
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
