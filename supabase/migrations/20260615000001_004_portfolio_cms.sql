-- ============================================================
-- PORTFOLIO CMS — Complete Content Management Schema
-- ============================================================

-- 1. PROFILE (single row)
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Jagadeesh T',
  title TEXT NOT NULL DEFAULT 'Biomedical Engineering Student',
  subtitle TEXT,
  location TEXT DEFAULT 'Chennai, Tamil Nadu, India',
  email TEXT DEFAULT 'shakthijagadeesh907@gmail.com',
  linkedin TEXT DEFAULT 'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
  github TEXT DEFAULT 'https://github.com/Jagadeesh-Thulasiraman',
  portfolio_url TEXT,
  profile_photo_url TEXT,
  resume_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select" ON profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profile_all" ON profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. ABOUT
CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'About Me',
  subtitle TEXT,
  paragraphs TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "about_select" ON about FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "about_all" ON about FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  gradient TEXT DEFAULT 'from-primary-500/20 to-accent-500/20',
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select" ON skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "skills_all" ON skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. INTERNSHIPS
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  department TEXT,
  role TEXT NOT NULL,
  duration TEXT,
  location TEXT,
  type TEXT DEFAULT 'On-Site',
  description TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  learnings TEXT[] DEFAULT '{}',
  impact TEXT[] DEFAULT '{}',
  certificate_url TEXT,
  completed BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "internships_select" ON internships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "internships_all" ON internships FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  field TEXT,
  institution TEXT NOT NULL,
  period TEXT,
  location TEXT,
  gpa TEXT,
  status TEXT,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "education_select" ON education FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "education_all" ON education FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. CERTIFICATIONS (replaces the existing certifications table if present)
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  platform TEXT,
  issue_date TEXT,
  credential_id TEXT,
  certificate_url TEXT,
  embed_url TEXT,
  description TEXT,
  category TEXT,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'completed',
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select" ON certifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "certifications_all" ON certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. JOURNEY / TIMELINE
CREATE TABLE IF NOT EXISTS journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  date TEXT,
  type TEXT DEFAULT 'milestone',
  icon TEXT DEFAULT 'Star',
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_select" ON journey FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "journey_all" ON journey FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. CONTACT INFO
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT DEFAULT 'shakthijagadeesh907@gmail.com',
  github TEXT DEFAULT 'https://github.com/Jagadeesh-Thulasiraman',
  linkedin TEXT DEFAULT 'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
  location TEXT DEFAULT 'Chennai, Tamil Nadu, India',
  portfolio_url TEXT,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_info_select" ON contact_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "contact_info_all" ON contact_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT DEFAULT 'Jagadeesh T — Portfolio',
  favicon_url TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  theme TEXT DEFAULT 'light',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_all" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills(display_order);
CREATE INDEX IF NOT EXISTS idx_education_order ON education(display_order);
CREATE INDEX IF NOT EXISTS idx_internships_order ON internships(display_order);
CREATE INDEX IF NOT EXISTS idx_certifications_order ON certifications(display_order);
CREATE INDEX IF NOT EXISTS idx_journey_order ON journey(display_order);
CREATE INDEX IF NOT EXISTS idx_about_order ON about(display_order);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['profile', 'about', 'skills', 'internships', 'education', 'certifications', 'journey', 'contact_info', 'site_settings'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE TRIGGER IF NOT EXISTS update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;
