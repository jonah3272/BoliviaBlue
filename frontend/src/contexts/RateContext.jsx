import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchBlueRate } from '../utils/api';
import { isStale } from '../utils/formatters';
import logger from '../utils/logger';

const RateContext = createContext(null);

export function useRate() {
  const context = useContext(RateContext);
  if (!context) {
    throw new Error('useRate must be used within RateProvider');
  }
  return context;
}

export function useOptionalRate() {
  return useContext(RateContext);
}

export function RateProvider({ children }) {
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const lastValidRef = useRef(null);

  const loadRate = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBlueRate();

      const standardized = {
        buy: data.buy_bob_per_usd,
        sell: data.sell_bob_per_usd,
        mid: data.mid_bob_per_usd,
        officialBuy: data.official_buy,
        officialSell: data.official_sell,
        officialMid:
          data.official_mid ??
          (Number.isFinite(data.official_buy) && Number.isFinite(data.official_sell)
            ? (data.official_buy + data.official_sell) / 2
            : data.official_buy),
        buy_bob_per_usd: data.buy_bob_per_usd,
        sell_bob_per_usd: data.sell_bob_per_usd,
        mid_bob_per_usd: data.mid_bob_per_usd,
        official_buy: data.official_buy,
        official_sell: data.official_sell,
        official_mid:
          data.official_mid ??
          (Number.isFinite(data.official_buy) && Number.isFinite(data.official_sell)
            ? (data.official_buy + data.official_sell) / 2
            : data.official_buy),
        buy_bob_per_eur: data.buy_bob_per_eur,
        sell_bob_per_eur: data.sell_bob_per_eur,
        buy_bob_per_cop: data.buy_bob_per_cop,
        sell_bob_per_cop: data.sell_bob_per_cop,
        buy_bob_per_pen: data.buy_bob_per_pen,
        sell_bob_per_pen: data.sell_bob_per_pen,
        buy_bob_per_ars: data.buy_bob_per_ars,
        sell_bob_per_ars: data.sell_bob_per_ars,
        buy_bob_per_clp: data.buy_bob_per_clp,
        sell_bob_per_clp: data.sell_bob_per_clp,
        source: data.source,
        quoteKind: data.quote_kind || 'usdt_p2p_median',
        updatedAt: data.updated_at_iso,
        updated_at_iso: data.updated_at_iso,
        generatedAt: data.generated_at_iso || null,
        generated_at_iso: data.generated_at_iso || null,
        is_stale: Boolean(data.is_stale) || isStale(data.updated_at_iso),
        buyChange24h: data.buy_change_24h,
        sellChange24h: data.sell_change_24h,
        buy_change_24h: data.buy_change_24h,
        sell_change_24h: data.sell_change_24h,
        sources_used: data.sources_used,
        eur_derivation: data.eur_derivation || null,
        eur_updated_at_iso: data.eur_updated_at_iso || null,
        cop_derivation: data.cop_derivation || null,
        cop_updated_at_iso: data.cop_updated_at_iso || null,
        pen_derivation: data.pen_derivation || null,
        pen_updated_at_iso: data.pen_updated_at_iso || null,
        ars_derivation: data.ars_derivation || null,
        ars_updated_at_iso: data.ars_updated_at_iso || null,
        clp_derivation: data.clp_derivation || null,
        clp_updated_at_iso: data.clp_updated_at_iso || null,
      };

      lastValidRef.current = standardized;
      setRateData(standardized);
      setFetchedAt(new Date());
      setIsLoading(false);
    } catch (err) {
      logger.error('Error loading rate:', err);
      setError(err.message);
      if (lastValidRef.current) {
        setRateData({ ...lastValidRef.current, is_stale: true });
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRate]);

  const observedAt = rateData?.updated_at_iso || null;

  const value = {
    rateData,
    isLoading,
    error,
    lastUpdate: observedAt ? new Date(observedAt) : null,
    fetchedAt,
    refetch: loadRate,
  };

  return (
    <RateContext.Provider value={value}>
      {children}
    </RateContext.Provider>
  );
}

export default RateContext;
