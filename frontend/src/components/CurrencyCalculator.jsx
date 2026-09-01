import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { trackCalculatorUsage, trackCalculatorCurrencySwitch, trackCalculatorSwap } from '../utils/analytics';
import { trackCalculatorUsed } from '../utils/analyticsEvents';

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
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();

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
    const usd = searchParams.get('usd');
    const bob = searchParams.get('bob');
    if (usd && /^\d+(\.\d+)?$/.test(usd)) {
      setUsdAmount(usd);
      setConvertFromBOB(false);
    } else if (bob && /^\d+(\.\d+)?$/.test(bob)) {
      setBobAmount(bob);
      setConvertFromBOB(true);
    }
  }, [searchParams]);

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
    
    // Use the actual buy/sell rate based on conversion direction
    // When converting FROM BOB to USD, use the SELL rate (you're selling BOB)
    // When converting FROM USD to BOB, use the BUY rate (you're buying BOB)
    let baseRateBOBperUSD;
    
    if (useOfficial) {
      baseRateBOBperUSD = convertFromBOB 
        ? rateData.official_sell  // Selling BOB = use sell rate
        : rateData.official_buy;  // Buying BOB = use buy rate
    } else {
      baseRateBOBperUSD = convertFromBOB
        ? rateData.sell_bob_per_usd  // Selling BOB = use sell rate  
        : rateData.buy_bob_per_usd;  // Buying BOB = use buy rate
    }
    
    // Convert BOB per USD to BOB per selected currency
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
      // Track calculator usage
      trackCalculatorUsage(bob, 'BOB', selectedCurrency, usd);
      trackCalculatorUsed({
        language,
        from_currency: 'BOB',
        to_currency: selectedCurrency,
        use_official: useOfficial,
      });
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
      // Track calculator usage
      trackCalculatorUsage(usd, selectedCurrency, 'BOB', bob);
      trackCalculatorUsed({
        language,
        from_currency: selectedCurrency,
        to_currency: 'BOB',
        use_official: useOfficial,
      });
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
    const prevFromCurrency = convertFromBOB ? 'BOB' : selectedCurrency;
    const prevToCurrency = convertFromBOB ? selectedCurrency : 'BOB';
    
    setConvertFromBOB(!convertFromBOB);
    // Swap the values
    const tempBob = bobAmount;
    setBobAmount(usdAmount);
    setUsdAmount(tempBob);
    
    // Track swap
    trackCalculatorSwap();
    trackCalculatorCurrencySwitch(prevFromCurrency, prevToCurrency);
  };

  const getBuyRate = () => (useOfficial ? rateData?.official_buy : rateData?.buy_bob_per_usd);
  const getSellRate = () => (useOfficial ? rateData?.official_sell : rateData?.sell_bob_per_usd);

  const applyUsdPreset = useCallback((amount) => {
    setUsdAmount(String(amount));
    setConvertFromBOB(false);
  }, []);

  const applyBobPreset = useCallback((amount) => {
    setBobAmount(String(amount));
    setConvertFromBOB(true);
  }, []);

  const copyResult = async () => {
    const fromAmt = convertFromBOB ? bobAmount : usdAmount;
    const toAmt = convertFromBOB ? usdAmount : bobAmount;
    const fromLabel = convertFromBOB ? 'BOB' : selectedCurrency;
    const toLabel = convertFromBOB ? selectedCurrency : 'BOB';
    if (!fromAmt || !toAmt) return;
    const text = es
      ? `${fromAmt} ${fromLabel} = ${toAmt} ${toLabel} (Bolivia Blue, tasa ${useOfficial ? 'oficial' : 'blue'})`
      : `${fromAmt} ${fromLabel} = ${toAmt} ${toLabel} (Bolivia Blue, ${useOfficial ? 'official' : 'blue'} rate)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const es = language === 'es';
  const rate = getRate();
  const usdPresets = [20, 50, 100, 500, 1000];
  const bobPresets = [500, 1000, 5000, 10000];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3 w-full'}`}>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Rate type + tools */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/40">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-0.5 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setUseOfficial(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    !useOfficial
                      ? 'bg-sky-500 text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('unofficialRates')}
                </button>
                <button
                  type="button"
                  onClick={() => setUseOfficial(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    useOfficial
                      ? 'bg-sky-500 text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('officialRates')}
                </button>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    comparisonMode
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {es ? 'Comparar' : 'Compare'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showHistory
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {es ? 'Historial' : 'History'}
                  {history.length > 0 ? ` (${history.length})` : ''}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Currency pills */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(currencies).map(([code, data]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      const prevCurrency = selectedCurrency;
                      setSelectedCurrency(code);
                      if (prevCurrency !== code) {
                        trackCalculatorCurrencySwitch(prevCurrency, code);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors touch-manipulation ${
                      selectedCurrency === code
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span aria-hidden>{data.flag}</span>
                    {code}
                  </button>
                ))}
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('bolivianos')} (BOB)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={bobAmount}
                      onChange={handleBobChange}
                      className="w-full px-4 py-3.5 pr-12 text-2xl font-mono font-bold tabular-nums bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 text-gray-900 dark:text-white"
                      placeholder="100.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      Bs.
                    </span>
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-sm touch-manipulation active:scale-95"
                    aria-label={t('swapCurrencies')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {currencies[selectedCurrency].name} ({selectedCurrency})
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={usdAmount}
                      onChange={handleUsdChange}
                      className="w-full px-4 py-3.5 pr-12 text-2xl font-mono font-bold tabular-nums bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      {currencies[selectedCurrency].symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                  {es ? 'Montos rápidos' : 'Quick amounts'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(convertFromBOB ? bobPresets : usdPresets).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => (convertFromBOB ? applyBobPreset(n) : applyUsdPreset(n))}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold tabular-nums bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-sky-100 hover:text-sky-800 dark:hover:bg-sky-900/40 dark:hover:text-sky-200 transition-colors touch-manipulation"
                    >
                      {convertFromBOB ? `${n.toLocaleString()} Bs` : `$${n}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live rate strip */}
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 px-4 py-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                      1 {selectedCurrency} → BOB
                    </div>
                    <div className="font-mono text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300 min-h-[1.5rem]">
                      {isLoading || !rateData ? '—' : rate.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                      1 BOB → {selectedCurrency}
                    </div>
                    <div className="font-mono text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300 min-h-[1.5rem]">
                      {isLoading || !rateData || rate === 0 ? '—' : (1 / rate).toFixed(4)}
                    </div>
                  </div>
                </div>
                {!isLoading && rateData && (
                  <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
                    {useOfficial ? t('official') : t('unofficial')} · {es ? 'compra' : 'buy'}{' '}
                    {getBuyRate()?.toFixed(2)} · {es ? 'venta' : 'sell'} {getSellRate()?.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Result + copy */}
              {bobAmount && usdAmount && !isLoading && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                    {convertFromBOB ? (
                      <>
                        <span className="font-mono tabular-nums">{bobAmount} Bs</span>
                        {' → '}
                        <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-300">
                          {currencies[selectedCurrency].symbol}{usdAmount} {selectedCurrency}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono tabular-nums">
                          {currencies[selectedCurrency].symbol}{usdAmount} {selectedCurrency}
                        </span>
                        {' → '}
                        <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-300">
                          {bobAmount} Bs
                        </span>
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={copyResult}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 touch-manipulation"
                  >
                    {copied ? (es ? 'Copiado' : 'Copied') : (es ? 'Copiar' : 'Copy')}
                  </button>
                </div>
              )}

              {comparisonMode && !isLoading && rateData && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                    {es ? 'Mismo monto en otras monedas' : 'Same amount in other currencies'}
                  </p>
                  {Object.entries(currencies).map(([code, data]) => {
                    const baseRateBOBperUSD = (getBuyRate() + getSellRate()) / 2;
                    const currencyToUSD = exchangeRates[code];
                    const itemRate = baseRateBOBperUSD / currencyToUSD;
                    const amount = parseFloat(bobAmount) || 100;
                    const converted = (amount / itemRate).toFixed(2);
                    return (
                      <div
                        key={code}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                          code === selectedCurrency ? 'bg-sky-50 dark:bg-sky-950/20' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {data.flag} {code}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-gray-900 dark:text-white">
                          {data.symbol}{converted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {showHistory && (
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {es ? 'Historial' : 'History'}
                </h3>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('calculatorHistory');
                    }}
                    className="text-xs text-red-600 dark:text-red-400 font-medium"
                  >
                    {es ? 'Limpiar' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-80 lg:max-h-[32rem] overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                    {es ? 'Tus conversiones aparecerán aquí.' : 'Your conversions will appear here.'}
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {item.rateType === 'official' ? t('official') : t('unofficial')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.fromAmount} {item.from}
                        </div>
                        <div className="text-gray-400 text-xs">↓</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.toAmount} {item.to}
                        </div>
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

