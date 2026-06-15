-- Add tracking columns to page_views
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor_id TEXT;

-- Add tracking columns to project_views
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS project_title TEXT;
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE project_views ADD COLUMN IF NOT EXISTS city TEXT;

-- Add tracking columns to resume_downloads
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop';
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE resume_downloads ADD COLUMN IF NOT EXISTS city TEXT;

-- Enable realtime for analytics tables
ALTER PUBLICATION supabase_realtime ADD TABLE page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE project_views;
ALTER PUBLICATION supabase_realtime ADD TABLE resume_downloads;

-- Index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON page_views(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_referrer ON page_views(referrer);
CREATE INDEX IF NOT EXISTS idx_project_views_country ON project_views(country);
CREATE INDEX IF NOT EXISTS idx_project_views_device_type ON project_views(device_type);
CREATE INDEX IF NOT EXISTS idx_resume_downloads_country ON resume_downloads(country);
