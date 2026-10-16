-- Reviewed additive release SQL. Apply before the code release.
-- No historical values, defaults, constraints, permissions or RLS change.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.rates ADD COLUMN IF NOT EXISTS official_observation jsonb;
COMMIT;
