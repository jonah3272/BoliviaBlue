-- Remove linear-interpolated Railway downtime fill so charts use real DPH history.
-- Run in Supabase Dashboard → SQL Editor (service role / postgres).
-- Safe signature: gap window + millisecond == 350 from backfill-downtime-gap.js
-- NOTE: Postgres EXTRACT(MILLISECONDS) includes full seconds; use epoch mod 1000.

DELETE FROM rates
WHERE t >= '2026-06-30T19:27:00.000Z'
  AND t <  '2026-07-31T13:45:00.000Z'
  AND ((EXTRACT(EPOCH FROM t) * 1000)::bigint % 1000) = 350;

-- Expect ~2950 rows removed. Keep daily + 10m real points inserted by backfill-real-dph-gap.js.

-- Optional: fix early live-resume official (~11.5 exchangerate-api → BCB 12.15)
UPDATE rates
SET official_buy = 12.15,
    official_sell = 12.15,
    official_mid = 12.15
WHERE t >= '2026-07-31T13:45:00.000Z'
  AND t <  '2026-07-31T14:30:00.000Z'
  AND official_buy IS NOT NULL
  AND official_buy < 12;
