import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { fetchBlueRate } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { trackRateCardView, trackOfficialRateToggle, trackRateUpdate } from '../utils/analytics';

const RateCard = memo(function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, dailyChange, isOfficial, currency, language }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const isBuy = type === 'buy';
  const label = isBuy ? t('buy') : t('sell');
  const borderColor = isOfficial 
    ? (isBuy ? 'border-gray-400' : 'border-gray-500')
    : (isBuy ? 'border-blue-500' : 'border-pink-500');
  
  // Parse daily change
  const changeValue = dailyChange ? parseFloat(dailyChange) : null;
  const changeColor = changeValue > 0 ? 'text-green-600' : changeValue < 0 ? 'text-red-600' : 'text-gray-500';
  const changeIcon = changeValue > 0 ? '↑' : changeValue < 0 ? '↓' : '';

  // Track rate card view when rate is displayed
  useEffect(() => {
    if (rate && !isLoading && !error) {
      trackRateCardView(type, rate, currency, isOfficial);
    }
  }, [rate, type, currency, isOfficial, isLoading, error]);

  if (isLoading) {
    // Reserve exact space to match final card dimensions (prevents layout shift)
    return (
      <div className={`backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 ${borderColor} p-4 shadow-lg min-h-[180px]`}>
        <div className="skeleton h-4 w-20 mb-2"></div>
        <div className="skeleton h-12 w-28 mb-1"></div>
        <div className="skeleton h-3 w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${borderColor} p-4 shadow-lg`}>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</div>
        <div className="text-red-500 text-xs">{error}</div>
        {currency === 'BRL' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {language === 'es' ? 'BRL puede no estar disponible en Binance P2P en este momento.' : 'BRL may not be available on Binance P2P at this time.'}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 ${borderColor} p-4 shadow-2xl transition-all duration-300 ${
        isBuy 
          ? 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30' 
          : 'hover:shadow-pink-500/20 dark:hover:shadow-pink-500/30'
      }`}
      style={{
        boxShadow: isBuy 
          ? '0 10px 40px -10px rgba(59, 130, 246, 0.3)' 
          : '0 10px 40px -10px rgba(236, 72, 153, 0.3)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        y: -8,
        boxShadow: isBuy
          ? "0 25px 50px -12px rgba(59, 130, 246, 0.4)"
          : "0 25px 50px -12px rgba(236, 72, 153, 0.4)",
        transition: { duration: 0.2 }
      }}
      role="region"
      aria-label={`${label} rate: ${formatRate(rate, currency)} bolivianos per ${currency}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{label}</div>
        <div className="flex gap-1.5">
          {isStaleData && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full">
              {t('stale')}
            </span>
          )}
          {!isOfficial && changeValue !== null && (
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${changeColor}`}>
              {changeIcon}{Math.abs(changeValue).toFixed(2)}% {t('change24h')}
            </span>
          )}
        </div>
      </div>
      
      <motion.div 
        className="mb-1"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
        key={rate}
      >
        <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white leading-none">
          {formatRate(rate, currency)}
        </div>
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 font-semibold">
          {language === 'es' ? `Bs. por ${currency}` : `Bs. per ${currency}`}
        </div>
      </motion.div>
      
      {timestamp && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {t('updated')}: {formatDateTime(timestamp)}
        </div>
      )}
    </motion.div>
  );
});

function BlueRateCards({ showOfficial = false, setShowOfficial }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const { currency } = useCurrency();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fallback to internal state if props not provided (for backward compatibility)
  const [internalShowOfficial, setInternalShowOfficial] = useState(false);
  const effectiveShowOfficial = setShowOfficial !== undefined ? showOfficial : internalShowOfficial;
  const effectiveSetShowOfficial = setShowOfficial !== undefined ? setShowOfficial : setInternalShowOfficial;

  // Use ref to track the current request and prevent race conditions
  const abortControllerRef = React.useRef(null);
  const currentCurrencyRef = React.useRef(currency);

  const loadData = useCallback(async (targetCurrency) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    currentCurrencyRef.current = targetCurrency;

    // Reset loading state when currency changes
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchBlueRate(targetCurrency);
      
      // Only update state if this is still the current request
      if (!abortController.signal.aborted && currentCurrencyRef.current === targetCurrency) {
        setData(result);
        setError(null);
        
        // Track rate update
        if (result?.buy_bob_per_usd && result?.sell_bob_per_usd) {
          trackRateUpdate(
            result.buy_bob_per_usd,
            result.sell_bob_per_usd,
            targetCurrency,
            'api'
          );
        }
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      // Only set error if this is still the current request
      if (currentCurrencyRef.current === targetCurrency) {
        console.error('Error loading rate:', err);
        setError(err.message || t('error'));
      }
    } finally {
      // Only update loading state if this is still the current request
      if (!abortController.signal.aborted && currentCurrencyRef.current === targetCurrency) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    // Debounce rapid currency changes
    const timeoutId = setTimeout(() => {
      loadData(currency);
    }, 100); // 100ms debounce
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadData(currency);
    }, 60000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currency, loadData]);

  const isDataStale = useMemo(() => 
    data?.updated_at_iso ? (isStale(data.updated_at_iso) || data.is_stale) : false,
    [data?.updated_at_iso, data?.is_stale]
  );

  // Use daily change from API
  const buyChange = data?.buy_change_24h;
  const sellChange = data?.sell_change_24h;

  // Generate ExchangeRate structured data
  const exchangeRateSchema = useMemo(() => data && data.buy_bob_per_usd && data.sell_bob_per_usd ? {
    "@context": "https://schema.org",
    "@type": "ExchangeRateSpecification",
    "currency": "BOB",
    "exchangeCurrency": "USD",
    "currentExchangeRate": {
      "@type": "UnitPriceSpecification",
      "price": ((data.buy_bob_per_usd + data.sell_bob_per_usd) / 2).toFixed(4),
      "priceCurrency": "BOB",
      "unitCode": "USD"
    },
    "validFrom": data.updated_at_iso,
    "rateType": effectiveShowOfficial ? "Official" : "Blue Market (Parallel)",
    "exchangeRateSpread": (data.sell_bob_per_usd - data.buy_bob_per_usd).toFixed(4)
  } : null, [data, effectiveShowOfficial]);

  return (
    <div className="space-y-6">
      {exchangeRateSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(exchangeRateSchema)}
          </script>
        </Helmet>
      )}
      
      {/* Toggle Switch - Segmented Control Style */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 shadow-inner border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              effectiveSetShowOfficial(false);
              trackOfficialRateToggle(false);
            }}
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-200 min-w-[200px] ${
              !effectiveShowOfficial
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md border-2 border-blue-200 dark:border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('blueMarketTitle')}
          </button>
          <button
            onClick={() => {
              effectiveSetShowOfficial(true);
              trackOfficialRateToggle(true);
            }}
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-200 min-w-[200px] ${
              effectiveShowOfficial
                ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md border-2 border-gray-300 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('officialRateTitle')}
          </button>
        </div>
      </div>

      {/* Rate Cards - Show based on toggle */}
      {!effectiveShowOfficial ? (
        // Blue Market Rates
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <RateCard
              type="buy"
              rate={data?.buy || (currency === 'USD' ? data?.buy_bob_per_usd : currency === 'BRL' ? data?.buy_bob_per_brl : data?.buy_bob_per_eur)}
              timestamp={data?.updated_at_iso}
              isStaleData={isDataStale}
              isLoading={isLoading}
              error={error}
              dailyChange={buyChange}
              currency={currency}
              language={language}
            />
            <RateCard
              type="sell"
              rate={data?.sell || (currency === 'USD' ? data?.sell_bob_per_usd : currency === 'BRL' ? data?.sell_bob_per_brl : data?.sell_bob_per_eur)}
              timestamp={data?.updated_at_iso}
              isStaleData={isDataStale}
              isLoading={isLoading}
              error={error}
              dailyChange={sellChange}
              currency={currency}
              language={language}
            />
          </div>
        </div>
      ) : (
        // Official Rates
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <RateCard
              type="buy"
              rate={data?.official_buy}
              timestamp={data?.updated_at_iso}
              isStaleData={false}
              isLoading={isLoading}
              error={error}
              isOfficial={true}
              currency={currency}
              language={language}
            />
            <RateCard
              type="sell"
              rate={data?.official_sell}
              timestamp={data?.updated_at_iso}
              isStaleData={false}
              isLoading={isLoading}
              error={error}
              isOfficial={true}
              currency={currency}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueRateCards;
