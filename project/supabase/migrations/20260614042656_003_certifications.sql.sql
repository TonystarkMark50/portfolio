CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issuer_logo TEXT,
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  credential_id TEXT,
  credential_url TEXT,
  skills TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certifications_order ON certifications(display_order);
CREATE INDEX idx_certifications_verified ON certifications(verified) WHERE verified = TRUE;

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select" ON certifications FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "certifications_all" ON certifications FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- No seed data — only real certifications added via Admin Panel
