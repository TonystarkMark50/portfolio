-- Add is_read boolean column to contact_submissions
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Migrate existing data: mark as read if status is not 'new'
UPDATE contact_submissions SET is_read = TRUE WHERE status != 'new';

-- Index for efficient unread queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_read ON contact_submissions(is_read);
