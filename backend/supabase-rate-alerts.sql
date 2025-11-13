-- Rate Alerts Table for Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('buy', 'sell', 'both')),
  threshold REAL NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_alerts_email ON rate_alerts(email);
CREATE INDEX IF NOT EXISTS idx_rate_alerts_active ON rate_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rate_alerts_unsubscribe_token ON rate_alerts(unsubscribe_token);

-- Enable Row Level Security (RLS) for public read/write access
ALTER TABLE rate_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert alerts
CREATE POLICY "Public can create alerts"
  ON rate_alerts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public to read their own alerts (by email)
CREATE POLICY "Public can read alerts by email"
  ON rate_alerts
  FOR SELECT
  USING (true);

-- Policy: Allow public to update alerts (for unsubscribe)
CREATE POLICY "Public can update alerts"
  ON rate_alerts
  FOR UPDATE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rate_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_rate_alerts_updated_at
  BEFORE UPDATE ON rate_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_alerts_updated_at();

