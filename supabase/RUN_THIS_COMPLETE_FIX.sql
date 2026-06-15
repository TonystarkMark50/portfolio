-- ============================================
-- COMPLETE NOTIFICATION + ANALYTICS + RLS FIX
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- 1. Notifications table (safe to re-run)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_all" ON notifications;
DROP POLICY IF EXISTS "notifications_anon_insert" ON notifications;

CREATE POLICY "notifications_all" ON notifications
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');

CREATE POLICY "notifications_anon_insert" ON notifications
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 2. Ensure all analytics columns exist in page_views
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor_id TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 3. Ensure all analytics columns exist in project_views
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS project_title TEXT;
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 4. Ensure is_read column exists on contact_submissions
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS sender_ip TEXT;

-- 5. Fix contact_submissions SELECT policy (allow anon for .select('id') after INSERT)
DROP POLICY IF EXISTS "select_own_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "select_contact_submissions_all" ON contact_submissions;

CREATE POLICY "select_contact_submissions_all" ON contact_submissions FOR SELECT
  TO anon, authenticated USING (true);

-- 6. Fix page_views SELECT policy (allow admin analytics)
DROP POLICY IF EXISTS "select_page_views" ON page_views;

CREATE POLICY "select_page_views" ON page_views FOR SELECT
  TO anon, authenticated USING (true);

-- 7. Fix project_views SELECT policy
DROP POLICY IF EXISTS "select_project_views" ON project_views;

CREATE POLICY "select_project_views" ON project_views FOR SELECT
  TO anon, authenticated USING (true);

-- 8. Ensure realtime is enabled for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS contact_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS project_views;
