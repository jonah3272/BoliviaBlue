import { useState, useEffect } from 'react';
import { fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function CurrencyCalculator() {
  const { t, language } = useLanguage();
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useOfficial, setUseOfficial] = useState(false);
  const [convertFromBOB, setConvertFromBOB] = useState(true); // true = BOB->USD, false = USD->BOB
  
  const [bobAmount, setBobAmount] = useState('100');
  const [usdAmount, setUsdAmount] = useState('');

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rateData) {
      if (convertFromBOB && bobAmount) {
        calculateUSD();
      } else if (!convertFromBOB && usdAmount) {
        calculateBOB();
      }
    }
  }, [rateData, bobAmount, usdAmount, useOfficial, convertFromBOB]);

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

  const getRate = () => {
    if (!rateData) return 0;
    return useOfficial 
      ? (rateData.official_buy + rateData.official_sell) / 2
      : (rateData.buy_bob_per_usd + rateData.sell_bob_per_usd) / 2;
  };

  const calculateUSD = () => {
    if (!rateData || !bobAmount) {
      setUsdAmount('');
      return;
    }
    
    const bob = parseFloat(bobAmount);
    if (isNaN(bob) || bob === 0) {
      setUsdAmount('');
      return;
    }
    
    const rate = getRate();
    const usd = bob / rate;
    setUsdAmount(usd.toFixed(4));
  };

  const calculateBOB = () => {
    if (!rateData || !usdAmount) {
      setBobAmount('');
      return;
    }
    
    const usd = parseFloat(usdAmount);
    if (isNaN(usd) || usd === 0) {
      setBobAmount('');
      return;
    }
    
    const rate = getRate();
    const bob = usd * rate;
    setBobAmount(bob.toFixed(2));
  };

  const handleBobChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBobAmount(value);
      setConvertFromBOB(true);
    }
  };

  const handleUsdChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setUsdAmount(value);
      setConvertFromBOB(false);
    }
  };

  const handleSwap = () => {
    setConvertFromBOB(!convertFromBOB);
    // Swap the values
    const tempBob = bobAmount;
    setBobAmount(usdAmount);
    setUsdAmount(tempBob);
  };

  const getBuyRate = () => useOfficial ? rateData?.official_buy : rateData?.buy_bob_per_usd;
  const getSellRate = () => useOfficial ? rateData?.official_sell : rateData?.sell_bob_per_usd;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('currencyCalculator')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'es' 
              ? 'Convierte entre Bolivianos y monedas extranjeras utilizando tasas de cambio oficiales o no oficiales'
              : 'Convert between Bolivianos and foreign currencies using official or unofficial exchange rates'}
          </p>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-4 mb-8">
          {/* BOB Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('bolivianos')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={bobAmount}
                onChange={handleBobChange}
                className="w-full px-4 py-4 text-2xl font-mono font-bold bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                placeholder="100.00"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-lg">
                Bs.
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="group bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('swapCurrencies')}
            >
              <svg 
                className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:rotate-180 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* USD Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('dollars')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={usdAmount}
                onChange={handleUsdChange}
                className="w-full px-4 py-4 text-2xl font-mono font-bold bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                placeholder="0.0000"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-lg">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Rate Toggle */}
        <div className="flex items-center justify-center mb-8">
          <label className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('unofficialRates')}
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
              {t('officialRates')}
            </span>
          </label>
        </div>

        {/* Exchange Rate Display */}
        {!isLoading && rateData && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">
              {t('exchangeRates')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {useOfficial 
                    ? t('official')
                    : t('unofficial')}
                </div>
                <div className={`text-2xl font-mono font-bold ${useOfficial ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  1.000 USD = {((getBuyRate() + getSellRate()) / 2).toFixed(4)} BOB
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('inverse')}
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
              {t('loadingRates')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyCalculator;

