import { useState, useEffect } from 'react';
import { fetchBlueRate } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';

function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, spread, isOfficial }) {
  const isBuy = type === 'buy';
  const label = isBuy ? 'COMPRAR' : 'VENDER';
  const color = isBuy ? 'blue' : 'pink';
  const borderColor = isOfficial 
    ? (isBuy ? 'border-gray-400' : 'border-gray-500')
    : (isBuy ? 'border-blue-500' : 'border-pink-500');

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-6 shadow-lg animate-pulse`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-6 shadow-lg`}>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</div>
        <div className="text-red-500 text-sm">Error al cargar</div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} p-6 shadow-lg transition-all hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
        <div className="flex gap-2">
          {isStaleData && (
            <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full">
              Desactualizado
            </span>
          )}
          {!isOfficial && spread && (
            <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
              +{spread}%
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-2 animate-on-update">
        <div className="font-mono text-5xl font-bold text-gray-900 dark:text-white">
          {formatRate(rate)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bs. por USD
        </div>
      </div>
      
      {timestamp && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Actualizado: {formatDateTime(timestamp)}
        </div>
      )}
    </div>
  );
}

function RateCards() {
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

  // Calculate spread (difference between blue and official)
  const buySpread = data ? ((data.buy_bob_per_usd - data.official_buy) / data.official_buy * 100).toFixed(1) : 0;
  const sellSpread = data ? ((data.sell_bob_per_usd - data.official_sell) / data.official_sell * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Blue Market Rates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
          Mercado Paralelo (Dólar Blue) - Binance P2P
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <RateCard
            type="buy"
            rate={data?.buy_bob_per_usd}
            timestamp={data?.updated_at_iso}
            isStaleData={isDataStale}
            isLoading={isLoading}
            error={error}
            spread={buySpread}
          />
          <RateCard
            type="sell"
            rate={data?.sell_bob_per_usd}
            timestamp={data?.updated_at_iso}
            isStaleData={isDataStale}
            isLoading={isLoading}
            error={error}
            spread={sellSpread}
          />
        </div>
      </div>

      {/* Official Rates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
          Tipo de Cambio Oficial - Banco Central de Bolivia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

      {/* Spread Indicator */}
      {data && !isLoading && !error && (
        <div className="max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-amber-900 dark:text-amber-200">Diferencia (Spread)</span>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-amber-700 dark:text-amber-300">Compra: </span>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-100">+{buySpread}%</span>
              </div>
              <div>
                <span className="text-amber-700 dark:text-amber-300">Venta: </span>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-100">+{sellSpread}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RateCards;

