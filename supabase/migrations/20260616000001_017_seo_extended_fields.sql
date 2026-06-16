-- Add missing SEO columns to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_title text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_description text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_image_url text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_image_alt text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS author text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS canonical_url text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS keywords text DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS robots text DEFAULT 'index, follow';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#2563EB';
