-- Blog Articles Table for Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('es', 'en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML or Markdown content
  content_format TEXT DEFAULT 'html' CHECK (content_format IN ('html', 'markdown')),
  author TEXT NOT NULL DEFAULT 'Bolivia Blue con Paz',
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  read_time INTEGER, -- in minutes
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_language ON blog_articles(language);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(featured);
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at DESC);

-- Enable Row Level Security (RLS) for public read access
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public read access for blog articles"
  ON blog_articles
  FOR SELECT
  USING (true);

-- Policy: Allow public to insert blog articles (for backend automation)
CREATE POLICY "Public can insert blog articles"
  ON blog_articles
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public to update blog articles (for backend automation)
CREATE POLICY "Public can update blog articles"
  ON blog_articles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();

