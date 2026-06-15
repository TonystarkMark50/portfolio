-- Allow anonymous INSERT on notifications (for contact form, resume downloads)
-- The public website needs to create notifications without authentication
CREATE POLICY "notifications_anon_insert" ON notifications
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous DELETE on contact_submissions (existing behavior for clear all)
-- Already handled by the existing contact_submissions RLS policies
