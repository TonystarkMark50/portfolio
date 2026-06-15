-- Project Views Table
CREATE TABLE project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Create index for faster queries
CREATE INDEX idx_project_views_project_id ON project_views(project_id);
CREATE INDEX idx_project_views_viewed_at ON project_views(viewed_at DESC);

-- Contact Submissions Table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  replied_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Testimonials Table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  image_url TEXT,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_testimonials_featured ON testimonials(featured) WHERE featured = TRUE;
CREATE INDEX idx_testimonials_approved ON testimonials(approved) WHERE approved = TRUE;

-- Page Views Table for analytics
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  user_ip TEXT,
  referrer TEXT
);

CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);

-- Resume Downloads Table
CREATE TABLE resume_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Enable Row Level Security
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_views (public can insert, anyone can read for display)
CREATE POLICY "insert_project_views" ON project_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_project_views" ON project_views FOR SELECT
  TO anon, authenticated USING (true);

-- RLS Policies for contact_submissions (public can insert)
CREATE POLICY "insert_contact_submissions" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_own_contact_submissions" ON contact_submissions FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for testimonials (public can read approved, authenticated can manage)
CREATE POLICY "select_approved_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (approved = true OR featured = true);

CREATE POLICY "manage_testimonials" ON testimonials FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for page_views (public can insert)
CREATE POLICY "insert_page_views" ON page_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_page_views" ON page_views FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for resume_downloads (public can insert)
CREATE POLICY "insert_resume_downloads" ON resume_downloads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_resume_downloads" ON resume_downloads FOR SELECT
  TO authenticated USING (true);

-- Insert sample testimonials
INSERT INTO testimonials (name, role, company, quote, rating, featured, approved, display_order) VALUES
  ('Dr. Priya Sharma', 'Professor of Biomedical Engineering', 'Engineering Institute', 'Methish demonstrates exceptional ability to bridge the gap between healthcare challenges and technological solutions. His approach to problem-solving is truly innovative.', 5, true, true, 1),
  ('Rahul Venkatesh', 'Healthcare Technology Lead', 'MedTech Innovations', 'Working with Methish on a healthcare project showed me his dedication to creating user-centric solutions. His vibe coding approach delivers results fast.', 5, true, true, 2),
  ('Aisha Patel', 'Medical Device Researcher', 'BioInstruments Lab', 'Methish''s unique combination of biomedical knowledge and development skills makes him stand out. He understands both the clinical and technical sides.', 5, true, true, 3);
