-- Create og-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('og-images', 'og-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Admin can manage og-images
CREATE POLICY "og_images_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'og-images' AND auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com')
  WITH CHECK (bucket_id = 'og-images' AND auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');

-- Public can view og images
CREATE POLICY "og_images_public_select" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'og-images');
