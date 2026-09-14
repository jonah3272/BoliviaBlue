-- Allow filling official_* only on rows that still have a null BCB rate.
-- Inserts already carry a live scrape; this lets persist catch gaps without
-- overwriting a stored official.

CREATE POLICY "Allow update to fill null official rates"
  ON public.rates
  FOR UPDATE
  USING (official_buy IS NULL)
  WITH CHECK (
    official_buy IS NOT NULL
    AND official_buy >= 1 AND official_buy <= 100
    AND official_sell IS NOT NULL
    AND official_sell >= 1 AND official_sell <= 100
  );
