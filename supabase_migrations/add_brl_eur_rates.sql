-- Add BRL and EUR rate columns to rates table
-- This migration adds support for Brazilian Real and Euro blue rates

ALTER TABLE rates 
ADD COLUMN IF NOT EXISTS buy_bob_per_brl DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS sell_bob_per_brl DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS mid_bob_per_brl DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS buy_bob_per_eur DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS sell_bob_per_eur DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS mid_bob_per_eur DECIMAL(10,4);

-- Add comment to document the columns
COMMENT ON COLUMN rates.buy_bob_per_brl IS 'Blue market buy rate: Bolivianos per Brazilian Real';
COMMENT ON COLUMN rates.sell_bob_per_brl IS 'Blue market sell rate: Bolivianos per Brazilian Real';
COMMENT ON COLUMN rates.mid_bob_per_brl IS 'Blue market mid rate: Bolivianos per Brazilian Real';
COMMENT ON COLUMN rates.buy_bob_per_eur IS 'Blue market buy rate: Bolivianos per Euro';
COMMENT ON COLUMN rates.sell_bob_per_eur IS 'Blue market sell rate: Bolivianos per Euro';
COMMENT ON COLUMN rates.mid_bob_per_eur IS 'Blue market mid rate: Bolivianos per Euro';

