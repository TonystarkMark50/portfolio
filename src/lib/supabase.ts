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
  }).then(({ data, error }) => {
    if (error) {
      console.error('Notification insert error:', error);
      console.error('Notification data:', notification);
      console.error('Supabase anon key:', supabaseUrl ? 'Present' : 'Missing');
    } else {
      console.log('Notification created:', data);
    }
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

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ ...formData, sender_ip });

    if (dbError) throw dbError;
    console.log('Contact form submitted to DB successfully');

    // Create notification for admin
    console.log('Creating notification...');
    insertNotification({
      type: 'contact',
      title: 'New Contact Message',
      message: `${formData.name} contacted you regarding "${formData.subject}"`,
      metadata: { name: formData.name, email: formData.email, subject: formData.subject },
    });
    console.log('Notification insert initiated');

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
