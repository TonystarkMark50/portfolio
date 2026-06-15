-- ============================================
-- NOTIFICATIONS TABLE SETUP
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist (clean slate)
DROP POLICY IF EXISTS "notifications_all" ON notifications;
DROP POLICY IF EXISTS "notifications_anon_insert" ON notifications;

-- 4. Admin can do everything (authenticated + owner email)
CREATE POLICY "notifications_all" ON notifications
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');

-- 5. Anonymous users can INSERT (for contact form + resume downloads from public website)
CREATE POLICY "notifications_anon_insert" ON notifications
  FOR INSERT TO anon
  WITH CHECK (true);

-- 6. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 7. Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
