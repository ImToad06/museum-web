-- Storage bucket policies for MAMB
-- Run this in the Supabase SQL Editor after creating the buckets in the dashboard

-- ============================================
-- BUCKET: artworks-originals
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks-originals',
  'artworks-originals',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "originals_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks-originals');

CREATE POLICY "originals_insert_public" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks-originals'
    AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
  );

-- ============================================
-- BUCKET: artworks-stylized
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks-stylized',
  'artworks-stylized',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "stylized_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks-stylized');

CREATE POLICY "stylized_insert_public" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks-stylized'
    AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
  );
