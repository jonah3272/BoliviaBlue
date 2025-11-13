import { useState, useEffect } from 'react';
import { fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function CurrencyCalculator() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useOfficial, setUseOfficial] = useState(false);
  const [convertFromBOB, setConvertFromBOB] = useState(true); // true = BOB->USD, false = USD->BOB
  
  const [bobAmount, setBobAmount] = useState('100');
  const [usdAmount, setUsdAmount] = useState('');
  
  // New features state
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Currency configurations - multipliers will be fetched from API
  const currencies = {
    USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    USDT: { symbol: '₮', name: 'Tether', flag: '💲' },
    USDC: { symbol: 'Ⓢ', name: 'USD Coin', flag: '💵' },
    EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
    ARS: { symbol: '$', name: 'Argentine Peso', flag: '🇦🇷' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' }
  };
  
  // Exchange rate multipliers (1 USD = X of this currency)
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    USDT: 1,
    USDC: 1,
    EUR: 0.92, // 1 USD = 0.92 EUR (approximate)
    ARS: 1000, // 1 USD = 1000 ARS (approximate)
    BRL: 5.0   // 1 USD = 5.0 BRL (approximate)
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

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
  }, [rateData, bobAmount, usdAmount, useOfficial, convertFromBOB, selectedCurrency]);

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
    const baseRateBOBperUSD = useOfficial 
      ? (rateData.official_buy + rateData.official_sell) / 2
      : (rateData.buy_bob_per_usd + rateData.sell_bob_per_usd) / 2;
    
    // Convert BOB per USD to BOB per selected currency
    // For example: if 1 USD = 10 BOB and 1 USD = 0.92 EUR, then 1 EUR = 10/0.92 BOB
    const currencyToUSD = exchangeRates[selectedCurrency];
    return baseRateBOBperUSD / currencyToUSD;
  };
  
  const saveToHistory = (from, to, fromAmount, toAmount, rate) => {
    const calculation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      from,
      to,
      fromAmount,
      toAmount,
      rate,
      rateType: useOfficial ? 'official' : 'blue',
      currency: selectedCurrency
    };
    
    const newHistory = [calculation, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(newHistory));
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
    
    // Save to history if it's a meaningful calculation
    if (bob >= 1) {
      saveToHistory('BOB', selectedCurrency, bob.toFixed(2), usd.toFixed(4), rate.toFixed(4));
    }
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
    
    // Save to history if it's a meaningful calculation
    if (usd >= 0.01) {
      saveToHistory(selectedCurrency, 'BOB', usd.toFixed(4), bob.toFixed(2), rate.toFixed(4));
    }
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
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3 max-w-3xl mx-auto w-full'}`}>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <span className="text-4xl">💱</span>
                {t('currencyCalculator')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'es' 
                  ? 'Convierte entre Bolivianos y monedas extranjeras utilizando tasas de cambio oficiales o no oficiales'
                  : 'Convert between Bolivianos and foreign currencies using official or unofficial exchange rates'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  comparisonMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                {comparisonMode ? '✓' : ''} {language === 'es' ? 'Modo Comparación' : 'Comparison Mode'}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showHistory
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                📊 {language === 'es' ? 'Historial' : 'History'} ({history.length})
              </button>
            </div>

            {/* Currency Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es' ? 'Selecciona Moneda' : 'Select Currency'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(currencies).map(([code, data]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedCurrency(code)}
                    className={`p-3 rounded-xl font-medium transition-all text-center ${
                      selectedCurrency === code
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="text-2xl mb-1">{data.flag}</div>
                    <div className="text-xs font-bold">{code}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator Inputs */}
            <div className="space-y-4 mb-8">
              {/* BOB Input */}
              <div className="transform transition-all hover:scale-102">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bolivianos')} (BOB)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bobAmount}
                    onChange={handleBobChange}
                    className="w-full px-4 py-4 text-2xl font-mono font-bold bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
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
                  className="group bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 p-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
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

              {/* Foreign Currency Input */}
              <div className="transform transition-all hover:scale-102">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currencies[selectedCurrency].name} ({selectedCurrency})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usdAmount}
                    onChange={handleUsdChange}
                    className="w-full px-4 py-4 text-2xl font-mono font-bold bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
                    placeholder="0.0000"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-lg">
                    {currencies[selectedCurrency].symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate Toggle */}
            <div className="flex items-center justify-center mb-8 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md">
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
                  <div className={`block w-14 h-8 rounded-full transition shadow-inner ${useOfficial ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${useOfficial ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('officialRates')}
                </span>
              </label>
            </div>

            {/* Exchange Rate Display */}
            {!isLoading && rateData && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-gray-600">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">
                  {t('exchangeRates')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {useOfficial ? t('official') : t('unofficial')}
                    </div>
                    <div className={`text-xl font-mono font-bold ${useOfficial ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      1 {selectedCurrency} = {(getRate()).toFixed(4)} BOB
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('inverse')}
                    </div>
                    <div className={`text-xl font-mono font-bold ${!useOfficial ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'}`}>
                      1 BOB = {(1 / getRate()).toFixed(6)} {selectedCurrency}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Mode */}
            {comparisonMode && !isLoading && rateData && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-purple-100 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                  {language === 'es' ? '📊 Comparación de Tasas' : '📊 Rate Comparison'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(currencies).map(([code, data]) => {
                    const baseRateBOBperUSD = ((getBuyRate() + getSellRate()) / 2);
                    const currencyToUSD = exchangeRates[code];
                    const rate = baseRateBOBperUSD / currencyToUSD;
                    const amount = parseFloat(bobAmount) || 100;
                    const converted = (amount / rate).toFixed(4);
                    return (
                      <div key={code} className={`p-3 rounded-lg transition-all ${
                        code === selectedCurrency 
                          ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500' 
                          : 'bg-white dark:bg-gray-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{data.flag}</span>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{code}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{data.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                              {data.symbol}{converted}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              1 {code} = {rate.toFixed(4)} BOB
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

        {/* History Panel */}
        {showHistory && (
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-6 border border-green-100 dark:border-gray-700 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'es' ? '📊 Historial' : '📊 History'}
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('calculatorHistory');
                    }}
                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    {language === 'es' ? 'Limpiar' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">
                      {language === 'es' 
                        ? 'Sin historial aún. Realiza un cálculo para empezar.' 
                        : 'No history yet. Make a calculation to get started.'}
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.rateType === 'official' 
                            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {item.rateType === 'official' ? t('official') : t('unofficial')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-mono text-sm">
                        <div className="text-gray-900 dark:text-white font-bold">
                          {item.fromAmount} {item.from}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs my-1">↓</div>
                        <div className="text-green-600 dark:text-green-400 font-bold">
                          {item.toAmount} {item.to}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {language === 'es' ? 'Tasa:' : 'Rate:'} {item.rate}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyCalculator;

