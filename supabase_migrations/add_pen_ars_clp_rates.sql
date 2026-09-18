-- Neighbor-fiat blue rates: BOB per 1 PEN / ARS / CLP, derived via USDT P2P (spot fallback).
ALTER TABLE rates
ADD COLUMN IF NOT EXISTS buy_bob_per_pen DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS sell_bob_per_pen DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS mid_bob_per_pen DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS buy_bob_per_ars DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS sell_bob_per_ars DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS mid_bob_per_ars DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS buy_bob_per_clp DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS sell_bob_per_clp DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS mid_bob_per_clp DOUBLE PRECISION;

COMMENT ON COLUMN rates.buy_bob_per_pen IS 'Blue market buy: Bolivianos per Peruvian sol (USDT/BOB ÷ USDT/PEN)';
COMMENT ON COLUMN rates.buy_bob_per_ars IS 'Blue market buy: Bolivianos per Argentine peso (USDT/BOB ÷ USDT/ARS)';
COMMENT ON COLUMN rates.buy_bob_per_clp IS 'Blue market buy: Bolivianos per Chilean peso (USDT/BOB ÷ USDT/CLP)';
