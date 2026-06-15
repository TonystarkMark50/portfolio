-- Admin users table for authentication
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Projects table for admin management
CREATE TABLE admin_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "admin_users_select" ON admin_users FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_users_insert" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "admin_users_update" ON admin_users FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for admin_projects (public read, admin write)
CREATE POLICY "admin_projects_select" ON admin_projects FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_projects_all" ON admin_projects FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for blog_posts (public read published, admin all)
CREATE POLICY "blog_posts_select_published" ON blog_posts FOR SELECT
  TO anon, authenticated USING (published = true);

CREATE POLICY "blog_posts_all" ON blog_posts FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for admin_sessions
CREATE POLICY "admin_sessions_select" ON admin_sessions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_sessions_insert" ON admin_sessions FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "admin_sessions_delete" ON admin_sessions FOR DELETE
  TO authenticated USING (true);

-- Insert sample admin project data
INSERT INTO admin_projects (title, slug, description, long_description, image_url, category, technologies, github_url, demo_url, featured, display_order) VALUES
  ('MedTrack Pro', 'medtrack-pro', 'A comprehensive health monitoring application that helps patients track their medications, appointments, and vital signs with AI-powered insights.', 'Built with a focus on accessibility and ease of use, MedTrack Pro leverages AI to provide personalized health recommendations and early warning alerts.', 'https://images.unsplash.com/photo-1576091160399-7194005c1b0b?w=600&q=80', 'HealthTech', ARRAY['React', 'TypeScript', 'Supabase', 'OpenAI', 'TailwindCSS'], 'https://github.com/methish/medtrack', 'https://medtrack-demo.vercel.app', true, 1),
  ('AI Study Companion', 'ai-study-companion', 'An AI-powered study assistant that generates personalized quizzes, summaries, and study plans based on uploaded course materials.', 'Uses advanced NLP to understand study materials and create adaptive learning experiences.', 'https://images.unsplash.com/photo-1456523676584-9cbe7a2e5e5a?w=600&q=80', 'AI/ML', ARRAY['Next.js', 'Python', 'LangChain', 'Pinecone', 'OpenAI'], 'https://github.com/methish/study-companion', 'https://study-ai.vercel.app', true, 2),
  ('BioSim Lab', 'biosim-lab', 'Interactive biomedical simulations for engineering students to visualize and experiment with physiological systems.', 'A web-based platform bringing complex biomedical concepts to life through interactive 3D simulations.', 'https://images.unsplash.com/photo-1532187863146-3011cc0e9a17?w=600&q=80', 'Web Apps', ARRAY['Three.js', 'React', 'WebGL', 'Node.js', 'MongoDB'], 'https://github.com/methish/biosim', 'https://biosim-lab.vercel.app', false, 3);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, tags, published, published_at, reading_time) VALUES
  ('The Future of AI in Healthcare Diagnostics', 'future-ai-healthcare', 'Exploring how artificial intelligence is revolutionizing medical diagnostics and patient care.', '# The Future of AI in Healthcare Diagnostics\n\nArtificial intelligence is transforming healthcare diagnostics at an unprecedented pace...', 'Methish', ARRAY['AI', 'Healthcare', 'Technology'], true, NOW() - INTERVAL '7 days', 8),
  ('Building Accessible Health Apps: A Developer''s Guide', 'accessible-health-apps', 'Why accessibility matters in healthcare applications and how to implement it effectively.', '# Building Accessible Health Apps\n\nHealthcare applications serve diverse populations...', 'Methish', ARRAY['Accessibility', 'HealthTech', 'UX'], true, NOW() - INTERVAL '14 days', 12);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_admin_projects_updated_at BEFORE UPDATE ON admin_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_admin_projects_slug ON admin_projects(slug);
CREATE INDEX idx_admin_projects_featured ON admin_projects(featured) WHERE featured = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published) WHERE published = true;
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
