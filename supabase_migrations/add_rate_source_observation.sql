-- Apply BEFORE deploying either writer. No historical rows are backfilled.
-- Nullable addition is compatible with old readers/writers and existing RLS.
BEGIN;
ALTER TABLE public.rates ADD COLUMN IF NOT EXISTS source_observation jsonb;
COMMENT ON COLUMN public.rates.source_observation IS
  'Versioned BOB/USDT platform quotes actually used for this row. NULL means not recorded. observed_at is the collector observation timestamp, not each venue response time.';
COMMIT;
