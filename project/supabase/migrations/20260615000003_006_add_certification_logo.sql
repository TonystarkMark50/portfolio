-- Add logo_url column to certifications table for issuer logo uploads
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for certification logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('certification-logos', 'certification-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on certification logos
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'certification-logos');

-- Allow authenticated users (admin) to upload/delete
CREATE POLICY "logos_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'certification-logos')
  WITH CHECK (bucket_id = 'certification-logos');
