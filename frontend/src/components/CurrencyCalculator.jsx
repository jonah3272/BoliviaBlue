import { useState, useEffect } from 'react';
import { fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function CurrencyCalculator() {
  const { t, language } = useLanguage();
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useOfficial, setUseOfficial] = useState(false);
  
  const [bobAmount, setBobAmount] = useState('100');
  const [usdAmount, setUsdAmount] = useState('');

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rateData && bobAmount) {
      calculateUSD();
    }
  }, [rateData, bobAmount, useOfficial]);

  const loadRates = async () => {
    try {
      const data = await fetchBlueRate();
      setRateData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading rates:', error);
      setIsLoading(false);
    }
  };

  const calculateUSD = () => {
    if (!rateData || !bobAmount) return;
    
    const bob = parseFloat(bobAmount);
    if (isNaN(bob)) return;
    
    // Use the average of buy and sell rates
    const rate = useOfficial 
      ? (rateData.official_buy + rateData.official_sell) / 2
      : (rateData.buy_bob_per_usd + rateData.sell_bob_per_usd) / 2;
    
    const usd = bob / rate;
    setUsdAmount(usd.toFixed(4));
  };

  const handleBobChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBobAmount(value);
    }
  };

  const handleCurrencyChange = (currency) => {
    // Could expand this to support more currencies
  };

  const getBuyRate = () => useOfficial ? rateData?.official_buy : rateData?.buy_bob_per_usd;
  const getSellRate = () => useOfficial ? rateData?.official_sell : rateData?.sell_bob_per_usd;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Calculadora de Divisas' : 'Currency Calculator'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'es' 
              ? 'Convierte entre Bolivianos y monedas extranjeras utilizando tasas de cambio oficiales o no oficiales'
              : 'Convert between Bolivianos and foreign currencies using official or unofficial exchange rates'}
          </p>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-6 mb-8">
          {/* BOB Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'es' ? 'Cantidad en BOB' : 'Amount in BOB'}
            </label>
            <input
              type="text"
              value={bobAmount}
              onChange={handleBobChange}
              className="w-full px-4 py-4 text-2xl font-mono font-bold bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
              placeholder="100"
            />
          </div>

          {/* Arrow Icon */}
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* USD Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'es' ? 'Cantidad en USD' : 'Amount in USD'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={usdAmount}
                readOnly
                className="w-full px-4 py-4 text-2xl font-mono font-bold bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-blue-900 dark:text-blue-200"
                placeholder="0.0000"
              />
              <select
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent text-gray-700 dark:text-gray-300 font-medium focus:outline-none"
              >
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rate Toggle */}
        <div className="flex items-center justify-center mb-8">
          <label className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'es' ? 'Tasas No Oficiales' : 'Unofficial Rates'}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={useOfficial}
                onChange={(e) => setUseOfficial(e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition ${useOfficial ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${useOfficial ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'es' ? 'Tasas Oficiales' : 'Official Rates'}
            </span>
          </label>
        </div>

        {/* Exchange Rate Display */}
        {!isLoading && rateData && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">
              {language === 'es' ? 'Tipos de Cambio' : 'Exchange Rates'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {useOfficial 
                    ? (language === 'es' ? 'Oficial' : 'Official')
                    : (language === 'es' ? 'No Oficial' : 'Unofficial')}
                </div>
                <div className={`text-2xl font-mono font-bold ${useOfficial ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  1.000 USD = {((getBuyRate() + getSellRate()) / 2).toFixed(4)} BOB
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'es' ? 'Inverso' : 'Inverse'}
                </div>
                <div className={`text-2xl font-mono font-bold ${!useOfficial ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'}`}>
                  1.000 BOB = {(1 / ((getBuyRate() + getSellRate()) / 2)).toFixed(4)} USD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'Cargando tasas...' : 'Loading rates...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyCalculator;

