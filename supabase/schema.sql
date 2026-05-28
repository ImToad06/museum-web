-- MAMB Database Schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor

-- ============================================
-- TABLE: styles
-- ============================================
CREATE TABLE styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- TABLE: authors
-- ============================================
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- TABLE: artworks
-- ============================================
CREATE TABLE artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE RESTRICT,
  original_image_url TEXT NOT NULL,
  stylized_image_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES (for filter performance)
-- ============================================
CREATE INDEX idx_artworks_style_id ON artworks(style_id);
CREATE INDEX idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX idx_artworks_is_featured ON artworks(is_featured) WHERE is_featured = true;
CREATE INDEX idx_artworks_deleted_at ON artworks(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Styles: public read
CREATE POLICY "styles_select_public" ON styles
  FOR SELECT USING (true);

-- Authors: public read
CREATE POLICY "authors_select_public" ON authors
  FOR SELECT USING (true);

-- Authors: anyone can insert (for anonymous uploads)
CREATE POLICY "authors_insert_public" ON authors
  FOR INSERT WITH CHECK (true);

-- Artworks: public read (only non-deleted)
CREATE POLICY "artworks_select_public" ON artworks
  FOR SELECT USING (deleted_at IS NULL);

-- Artworks: anyone can insert (validated via Server Actions + Zod)
CREATE POLICY "artworks_insert_public" ON artworks
  FOR INSERT WITH CHECK (true);

-- Artworks: no public update/delete (admin only via service_role)

-- ============================================
-- SEED: Default styles
-- ============================================
INSERT INTO styles (name, slug, description) VALUES
  ('Expresionismo Barranquillero', 'expresionismo-barranquillero', 'Colores vibrantes y formas emotivas inspiradas en la costa Caribe'),
  ('Abstracto Moderno', 'abstracto-moderno', 'Composiciones no representativas con formas geométricas y orgánicas'),
  ('Cubismo Digital', 'cubismo-digital', 'Descomposición geométrica de formas en múltiples perspectivas'),
  ('Pop Art Tropical', 'pop-art-tropical', 'Estilo pop con colores tropicales y cultura caribeña');
