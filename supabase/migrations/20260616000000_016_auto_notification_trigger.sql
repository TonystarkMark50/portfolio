-- Auto-create notifications when contact_submissions or resume_downloads are inserted
-- This runs server-side via trigger, bypassing client RLS restrictions

-- 0. Ensure missing columns exist on resume_downloads (may not have been added yet)
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS city TEXT;

-- 1. Trigger for contact_submissions
CREATE OR REPLACE FUNCTION handle_new_contact_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, metadata, is_read)
  VALUES (
    'contact',
    'New Contact Message',
    NEW.name || ' sent a message',
    jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'contact_submission_id', NEW.id
    ),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contact_submission_insert ON contact_submissions;
CREATE TRIGGER on_contact_submission_insert
  AFTER INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_contact_notification();

-- 2. Trigger for resume_downloads
CREATE OR REPLACE FUNCTION handle_new_resume_download_notification()
RETURNS TRIGGER AS $$
DECLARE
  geo_country TEXT := COALESCE(NEW.country, 'Unknown');
  geo_city TEXT := COALESCE(NEW.city, 'Unknown');
  device TEXT := COALESCE(NEW.device_type, 'Unknown');
BEGIN
  INSERT INTO notifications (type, title, message, metadata, is_read)
  VALUES (
    'download',
    'Resume Downloaded',
    'A visitor from ' || geo_city || ', ' || geo_country || ' downloaded your resume',
    jsonb_build_object(
      'country', geo_country,
      'city', geo_city,
      'device_type', device,
      'resume_download_id', NEW.id
    ),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_resume_download_insert ON resume_downloads;
CREATE TRIGGER on_resume_download_insert
  AFTER INSERT ON resume_downloads
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_resume_download_notification();

-- 3. Seed: generate notifications for existing contact_submissions that lack one
INSERT INTO notifications (type, title, message, metadata, is_read)
SELECT
  'contact',
  'New Contact Message',
  cs.name || ' sent a message',
  jsonb_build_object(
    'name', cs.name,
    'email', cs.email,
    'subject', cs.subject,
    'contact_submission_id', cs.id
  ),
  COALESCE(cs.is_read, false)
FROM contact_submissions cs
WHERE cs.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.metadata->>'contact_submission_id' = cs.id::text
  )
  AND (cs.status IS NULL OR cs.status != 'archived');

-- 4. Seed: generate notifications for existing resume_downloads that lack one
INSERT INTO notifications (type, title, message, metadata, is_read)
SELECT
  'download',
  'Resume Downloaded',
  'A visitor from ' || COALESCE(rd.city, 'Unknown') || ', ' || COALESCE(rd.country, 'Unknown') || ' downloaded your resume',
  jsonb_build_object(
    'country', rd.country,
    'city', rd.city,
    'device_type', rd.device_type,
    'resume_download_id', rd.id
  ),
  false
FROM resume_downloads rd
WHERE rd.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.metadata->>'resume_download_id' = rd.id::text
  );

-- 5. Ensure notifications table is in realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'notifications'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END;
$$;
