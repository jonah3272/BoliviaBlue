import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchBlueRate } from '../utils/api';
import logger from '../utils/logger';

const RateContext = createContext(null);

export function useRate() {
  const context = useContext(RateContext);
  if (!context) {
    throw new Error('useRate must be used within RateProvider');
  }
  return context;
}

export function RateProvider({ children }) {
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadRate = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBlueRate();
      
      // Standardized structure with both formats for backward compatibility
      const standardized = {
        // New standardized format
        buy: data.buy_bob_per_usd,
        sell: data.sell_bob_per_usd,
        mid: data.mid_bob_per_usd,
        officialBuy: data.official_buy,
        officialSell: data.official_sell,
        officialMid: data.official_mid,
        
        // Old format (keep for backward compatibility during migration)
        buy_bob_per_usd: data.buy_bob_per_usd,
        sell_bob_per_usd: data.sell_bob_per_usd,
        mid_bob_per_usd: data.mid_bob_per_usd,
        official_buy: data.official_buy,
        official_sell: data.official_sell,
        official_mid: data.official_mid,
        
        // Metadata
        source: data.source,
        updatedAt: data.updated_at_iso,
        updated_at_iso: data.updated_at_iso,
        buyChange24h: data.buy_change_24h,
        sellChange24h: data.sell_change_24h,
        buy_change_24h: data.buy_change_24h,
        sell_change_24h: data.sell_change_24h
      };
      
      setRateData(standardized);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err) {
      logger.error('Error loading rate:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Load on mount and set up auto-refresh
  useEffect(() => {
    loadRate();
    
    // Refresh every 15 minutes
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadRate]);

  const value = {
    rateData,
    isLoading,
    error,
    lastUpdate,
    refetch: loadRate
  };

  return (
    <RateContext.Provider value={value}>
      {children}
    </RateContext.Provider>
  );
}

export default RateContext;

