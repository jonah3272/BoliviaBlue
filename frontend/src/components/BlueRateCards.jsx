import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchBlueRate } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';

const RateCard = memo(function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, dailyChange, isOfficial }) {
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

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-4 shadow-lg animate-pulse`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-4 shadow-lg`}>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</div>
        <div className="text-red-500 text-xs">{t('error')}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-4 shadow-lg transition-all hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</div>
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
      
      <div className="mb-1 animate-on-update">
        <div className="font-mono text-4xl font-bold text-gray-900 dark:text-white">
          {formatRate(rate)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t('perUSD')}
        </div>
      </div>
      
      {timestamp && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('updated')}: {formatDateTime(timestamp)}
        </div>
      )}
    </div>
  );
});

function BlueRateCards() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfficial, setShowOfficial] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchBlueRate();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error loading rate:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    
    return () => clearInterval(interval);
  }, [loadData]);

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
    "rateType": showOfficial ? "Official" : "Blue Market (Parallel)",
    "exchangeRateSpread": (data.sell_bob_per_usd - data.buy_bob_per_usd).toFixed(4)
  } : null, [data, showOfficial]);

  return (
    <div className="space-y-6">
      {exchangeRateSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(exchangeRateSchema)}
          </script>
        </Helmet>
      )}
      
      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setShowOfficial(false)}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            !showOfficial
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('blueMarketTitle')}
        </button>
        <button
          onClick={() => setShowOfficial(true)}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            showOfficial
              ? 'bg-gray-600 dark:bg-gray-500 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('officialRateTitle')}
        </button>
      </div>

      {/* Rate Cards - Show based on toggle */}
      {!showOfficial ? (
        // Blue Market Rates
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <RateCard
              type="buy"
              rate={data?.buy_bob_per_usd}
              timestamp={data?.updated_at_iso}
              isStaleData={isDataStale}
              isLoading={isLoading}
              error={error}
              dailyChange={buyChange}
            />
            <RateCard
              type="sell"
              rate={data?.sell_bob_per_usd}
              timestamp={data?.updated_at_iso}
              isStaleData={isDataStale}
              isLoading={isLoading}
              error={error}
              dailyChange={sellChange}
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
            />
            <RateCard
              type="sell"
              rate={data?.official_sell}
              timestamp={data?.updated_at_iso}
              isStaleData={false}
              isLoading={isLoading}
              error={error}
              isOfficial={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueRateCards;
