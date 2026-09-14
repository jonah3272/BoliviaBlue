-- Colombian peso (COP) blue rates: BOB per 1 COP, derived via USDT P2P (or USDTCOP spot).
ALTER TABLE rates
ADD COLUMN IF NOT EXISTS buy_bob_per_cop DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS sell_bob_per_cop DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS mid_bob_per_cop DOUBLE PRECISION;

COMMENT ON COLUMN rates.buy_bob_per_cop IS 'Blue market buy: Bolivianos per Colombian peso (USDT/BOB ÷ USDT/COP)';
COMMENT ON COLUMN rates.sell_bob_per_cop IS 'Blue market sell: Bolivianos per Colombian peso';
COMMENT ON COLUMN rates.mid_bob_per_cop IS 'Blue market mid: Bolivianos per Colombian peso';
