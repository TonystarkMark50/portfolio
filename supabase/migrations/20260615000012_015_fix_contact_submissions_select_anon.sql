-- Fix: Allow anonymous SELECT on contact_submissions so .select('id') works after INSERT
-- Otherwise insertedData.id is null for anonymous submissions (mobile, tablet, etc.)

DROP POLICY IF EXISTS "select_own_contact_submissions" ON contact_submissions;

CREATE POLICY "select_contact_submissions_all" ON contact_submissions FOR SELECT
  TO anon, authenticated USING (true);
