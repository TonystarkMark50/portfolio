-- Add resume settings columns to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS resume_summary TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS resume_template TEXT DEFAULT 'classic';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS resume_sections JSONB DEFAULT '{"education":true,"internship":true,"projects":true,"skills":true,"certifications":true,"languages":true}'::jsonb;
