import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface ProjectView {
  id: string;
  project_id: string;
  viewed_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image_url: string | null;
  quote: string;
  rating: number;
  featured: boolean;
  display_order: number;
}

// Analytics functions
export async function trackProjectView(projectId: string) {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();

    await supabase.from('project_views').insert({
      project_id: projectId,
      user_ip: ip,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch (error) {
    console.error('Error tracking project view:', error);
  }
}

export async function getProjectViews(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from('project_views')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if (error) {
    console.error('Error getting project views:', error);
    return 0;
  }

  return count || 0;
}

export async function getTopProjects(limit: number = 6): Promise<{ project_id: string; views: number }[]> {
  const { data, error } = await supabase
    .from('project_views')
    .select('project_id')
    .order('viewed_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  data.forEach(item => {
    counts[item.project_id] = (counts[item.project_id] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([project_id, views]) => ({ project_id, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

// Contact functions
export async function submitContactForm(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert to database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert(formData);

    if (dbError) throw dbError;

    // Send notification via Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    await fetch(`${supabaseUrl}/functions/v1/contact-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
  }
}

// Testimonials functions
export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error getting testimonials:', error);
    return [];
  }

  return data || [];
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
