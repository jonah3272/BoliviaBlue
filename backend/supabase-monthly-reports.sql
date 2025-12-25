-- Monthly Market Reports Table for Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  slug TEXT NOT NULL, -- e.g., 'reporte-mensual-dolar-blue-bolivia-enero-2025'
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content
  average_buy_rate NUMERIC(10, 4),
  average_sell_rate NUMERIC(10, 4),
  highest_buy_rate NUMERIC(10, 4),
  highest_sell_rate NUMERIC(10, 4),
  lowest_buy_rate NUMERIC(10, 4),
  lowest_sell_rate NUMERIC(10, 4),
  volatility NUMERIC(10, 4), -- Standard deviation or similar
  key_events TEXT[], -- Array of key events that month
  trend_analysis TEXT,
  predictions TEXT,
  chart_data JSONB, -- Store chart data points
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year, language)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_reports_month_year ON monthly_reports(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_language ON monthly_reports(language);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_slug ON monthly_reports(slug);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_published_at ON monthly_reports(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public read access for monthly reports"
  ON monthly_reports
  FOR SELECT
  USING (true);

-- Policy: Allow backend to insert/update reports
CREATE POLICY "Backend can manage monthly reports"
  ON monthly_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monthly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_reports_updated_at();


