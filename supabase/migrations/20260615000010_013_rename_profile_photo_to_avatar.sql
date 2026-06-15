-- Rename profile_photo_url to avatar_url
ALTER TABLE profile RENAME COLUMN profile_photo_url TO avatar_url;

-- Update any indexes if they reference the old column name
-- (no indexes on this column, so just the rename is needed)
