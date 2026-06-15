-- Create unified projects table (replaces admin_projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Academic',
  status TEXT DEFAULT 'Completed',
  completed_date TEXT,
  description TEXT,
  highlights TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  report_url TEXT,
  image_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS: public read-only, admin full access
CREATE POLICY "projects_select" ON projects FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "projects_all" ON projects FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects (display_order);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured) WHERE featured = TRUE;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
