-- Fix RLS Policies for blog_articles table
-- This allows the backend to INSERT and UPDATE articles

-- Policy: Allow public to insert blog articles (for backend automation)
CREATE POLICY IF NOT EXISTS "Public can insert blog articles"
  ON blog_articles
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public to update blog articles (for backend automation)
CREATE POLICY IF NOT EXISTS "Public can update blog articles"
  ON blog_articles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

