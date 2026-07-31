-- US card network FX rates (Visa / Mastercard / Amex) for USD/BOB
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS card_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  t TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rate_date DATE NOT NULL,
  visa_bob_per_usd REAL,
  mastercard_bob_per_usd REAL,
  amex_bob_per_usd REAL,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT card_rates_rate_date_unique UNIQUE (rate_date)
);

CREATE INDEX IF NOT EXISTS idx_card_rates_t ON card_rates (t DESC);
CREATE INDEX IF NOT EXISTS idx_card_rates_rate_date ON card_rates (rate_date DESC);

ALTER TABLE card_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read card_rates" ON card_rates;
CREATE POLICY "Public can read card_rates"
  ON card_rates
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert card_rates" ON card_rates;
CREATE POLICY "Public can insert card_rates"
  ON card_rates
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update card_rates" ON card_rates;
CREATE POLICY "Public can update card_rates"
  ON card_rates
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
