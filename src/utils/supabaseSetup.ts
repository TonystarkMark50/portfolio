/**
 * Supabase RLS Setup Guide
 *
 * ⚠️ IMPORTANT: Do NOT run database setup from the browser.
 * Database migrations (RLS policies, table creation, etc.) must be run
 * via the Supabase CLI or Supabase Dashboard for security.
 *
 * Run these SQL commands in your Supabase Dashboard SQL Editor:
 *
 * ── 1. Enable RLS on all tables ──────────────────────────
 *
 * ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.journey ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.resume_downloads ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
 *
 * ── 2. Profile policies ─────────────────────────────────
 *
 * CREATE POLICY "Users can view their own profile"
 *   ON public.profile FOR SELECT
 *   USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can insert their own profile"
 *   ON public.profile FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can update their own profile"
 *   ON public.profile FOR UPDATE
 *   USING (auth.uid() = user_id);
 *
 * ── 3. Content tables: public read, owner write ─────────
 *
 * -- Anyone can read portfolio content
 * CREATE POLICY "Public can view about"
 *   ON public.about FOR SELECT
 *   TO anon, authenticated
 *   USING (true);
 *
 * CREATE POLICY "Owner can manage about"
 *   ON public.about FOR ALL
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * -- Repeat for: skills, internships, education, certifications, journey, projects
 *
 * ── 4. Contact submissions: insert for anon, read for owner ──
 *
 * CREATE POLICY "Anyone can submit contact form"
 *   ON public.contact_submissions FOR INSERT
 *   TO anon, authenticated
 *   WITH CHECK (true);
 *
 * CREATE POLICY "Owner can read contact submissions"
 *   ON public.contact_submissions FOR SELECT
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * CREATE POLICY "Owner can manage contact submissions"
 *   ON public.contact_submissions FOR UPDATE
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * ── 5. Notifications: owner only ────────────────────────
 *
 * CREATE POLICY "Owner can manage notifications"
 *   ON public.notifications FOR ALL
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * ── 6. Site settings: owner only ────────────────────────
 *
 * CREATE POLICY "Owner can manage site settings"
 *   ON public.site_settings FOR ALL
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * ── 7. Resume downloads: public insert, owner read ──────
 *
 * CREATE POLICY "Anyone can download resume"
 *   ON public.resume_downloads FOR INSERT
 *   TO anon, authenticated
 *   WITH CHECK (true);
 *
 * CREATE POLICY "Owner can view download stats"
 *   ON public.resume_downloads FOR SELECT
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 *
 * ── 8. Page views: public insert, owner read ────────────
 *
 * CREATE POLICY "Anyone can record page view"
 *   ON public.page_views FOR INSERT
 *   TO anon, authenticated
 *   WITH CHECK (true);
 *
 * CREATE POLICY "Owner can view analytics"
 *   ON public.page_views FOR SELECT
 *   USING (auth.email() = (SELECT email FROM public.profile LIMIT 1));
 */

export {}
