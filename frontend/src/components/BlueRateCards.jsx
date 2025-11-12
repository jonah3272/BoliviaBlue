import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchBlueRate } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';

function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, dailyChange, isOfficial }) {
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
}

function BlueRateCards() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const isDataStale = data?.updated_at_iso ? 
    (isStale(data.updated_at_iso) || data.is_stale) : false;

  // Use daily change from API
  const buyChange = data?.buy_change_24h;
  const sellChange = data?.sell_change_24h;

  // Generate ExchangeRate structured data
  const exchangeRateSchema = data && data.buy_bob_per_usd && data.sell_bob_per_usd ? {
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
    "rateType": "Blue Market (Parallel)",
    "exchangeRateSpread": (data.sell_bob_per_usd - data.buy_bob_per_usd).toFixed(4)
  } : null;

  return (
    <div className="space-y-6">
      {exchangeRateSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(exchangeRateSchema)}
          </script>
        </Helmet>
      )}
      {/* Blue Market Rates */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
          {t('blueMarketTitle')}
        </h3>
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

      {/* Official Rates - Horizontal Scroll */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
          {t('officialRateTitle')}
        </h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max md:min-w-0 md:justify-center md:grid md:grid-cols-2 md:max-w-4xl md:mx-auto">
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
      </div>
    </div>
  );
}

export default BlueRateCards;

