import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { trackCalculatorUsage, trackCalculatorCurrencySwitch, trackCalculatorSwap } from '../utils/analytics';
import { trackCalculatorUsed } from '../utils/analyticsEvents';
import { calculatorRate, isP2PReferenceCurrency } from '../utils/calculatorRates';
import { FinancialOfferButton } from './FinancialOfferCard';

function CurrencyCalculator({ presetRequest }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [rateData, setRateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [useOfficial, setUseOfficial] = useState(false);
  const [convertFromBOB, setConvertFromBOB] = useState(false); // false = USD->BOB (search intent)
  
  const [bobAmount, setBobAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('100');
  const userTouchedRef = useRef(false);
  const usedTrackedRef = useRef(false);
  const historyIdRef = useRef(0);
  
  // New features state
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
      return Array.isArray(saved) ? saved.filter((item) => item && typeof item === 'object').slice(0, 10) : [];
    } catch {
      return []; // Browser storage is optional.
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();

  const currencies = {
    USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    USDT: { symbol: '₮', name: 'Tether', flag: '💲' },
    USDC: { symbol: 'Ⓢ', name: 'USD Coin', flag: '💵' },
    EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
    COP: { symbol: '$', name: 'Colombian Peso', flag: '🇨🇴' },
    PEN: { symbol: 'S/', name: 'Peruvian Sol', flag: '🇵🇪' },
    ARS: { symbol: '$', name: 'Argentine Peso', flag: '🇦🇷' },
    CLP: { symbol: '$', name: 'Chilean Peso', flag: '🇨🇱' }
  };

  // 1 USD = X of this currency. Live BOB crosses fill EUR/BRL/COP/PEN/ARS/CLP. Never invent ARS=1000.
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    USDT: 1,
    USDC: 1,
    EUR: null,
    BRL: null,
    COP: null,
    PEN: null,
    ARS: null,
    CLP: null
  });

  const applyPreset = useCallback((usd, bob) => {
    if (usd && /^\d+(\.\d+)?$/.test(usd) && Number.isFinite(Number(usd))) {
      setSelectedCurrency('USD');
      setUseOfficial(false);
      setUsdAmount(usd);
      setConvertFromBOB(false);
    } else if (bob && /^\d+(\.\d+)?$/.test(bob) && Number.isFinite(Number(bob))) {
      setSelectedCurrency('USD');
      setUseOfficial(false);
      setBobAmount(bob);
      setConvertFromBOB(true);
    }
  }, []);

  useEffect(() => {
    applyPreset(searchParams.get('usd'), searchParams.get('bob'));
  }, [searchParams, applyPreset]);

  // A deliberate scenario click also applies when its URL is already active.
  // Incidental hash changes must not discard edits to currency, rate or amount.
  useEffect(() => {
    if (presetRequest) applyPreset(presetRequest.usd, presetRequest.bob);
  }, [presetRequest, applyPreset]);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Only the active input drives a calculation; writing the output must not
  // create a second history entry or a feedback loop.
  const inputAmount = convertFromBOB ? bobAmount : usdAmount;
  useEffect(() => {
    if (!rateData) return;
    if (convertFromBOB) calculateUSD();
    else calculateBOB();
  }, [rateData, inputAmount, useOfficial, convertFromBOB, selectedCurrency, exchangeRates]);

  const loadRates = async () => {
    try {
      const data = await fetchBlueRate();
      setRateData(data);
      setLoadError(false);
      const usdBuy = Number(data.buy_bob_per_usd ?? data.buy);
      setExchangeRates((prev) => {
        const next = { ...prev, USD: 1, USDT: 1, USDC: 1 };
        const eur = Number(data.buy_bob_per_eur);
        const brl = Number(data.buy_bob_per_brl);
        const cop = Number(data.buy_bob_per_cop);
        const pen = Number(data.buy_bob_per_pen);
        const ars = Number(data.buy_bob_per_ars);
        const clp = Number(data.buy_bob_per_clp);
        if (usdBuy > 0 && eur > 0) next.EUR = usdBuy / eur;
        if (usdBuy > 0 && brl > 0) next.BRL = usdBuy / brl;
        if (usdBuy > 0 && cop > 0) next.COP = usdBuy / cop;
        if (usdBuy > 0 && pen > 0) next.PEN = usdBuy / pen;
        if (usdBuy > 0 && ars > 0) next.ARS = usdBuy / ars;
        if (usdBuy > 0 && clp > 0) next.CLP = usdBuy / clp;
        return next;
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading rates:', error);
      setLoadError(true);
      setIsLoading(false);
    }
  };

  const getRate = (fromBOB = convertFromBOB) =>
    calculatorRate(rateData, selectedCurrency, useOfficial, fromBOB, exchangeRates);

  const saveToHistory = (from, to, fromAmount, toAmount, rate) => {
    const calculation = {
      id: `${Date.now()}-${++historyIdRef.current}`,
      calculationVersion: 2,
      timestamp: new Date().toISOString(),
      from,
      to,
      fromAmount,
      toAmount,
      rate,
      rateType: useOfficial ? 'official' : 'blue',
      currency: selectedCurrency
    };
    
    setHistory((previous) => {
      const last = previous[0];
      if (last && ['from', 'to', 'fromAmount', 'toAmount', 'rate', 'rateType', 'currency', 'calculationVersion']
        .every((key) => last[key] === calculation[key])) return previous;
      return [calculation, ...previous].slice(0, 10);
    });
  };

  useEffect(() => {
    try { localStorage.setItem('calculatorHistory', JSON.stringify(history)); } catch { /* optional history */ }
  }, [history]);

  const calculateUSD = () => {
    if (!rateData || !bobAmount) {
      setUsdAmount('');
      return;
    }
    
    const bob = parseFloat(bobAmount);
    if (!Number.isFinite(bob) || bob <= 0) {
      setUsdAmount('');
      return;
    }
    
    const rate = getRate();
    const usd = bob / rate;
    if (rate <= 0 || !Number.isFinite(usd)) { setUsdAmount(''); return; }
    setUsdAmount(usd.toFixed(4));
    
    // Save to history if it's a meaningful calculation
    if (bob >= 1) {
      saveToHistory('BOB', selectedCurrency, bob.toFixed(2), usd.toFixed(4), rate.toFixed(4));
      if (userTouchedRef.current && !usedTrackedRef.current) {
        usedTrackedRef.current = true;
        trackCalculatorUsage(bob, 'BOB', selectedCurrency, usd);
        trackCalculatorUsed({
          language,
          from_currency: 'BOB',
          to_currency: selectedCurrency,
          use_official: useOfficial,
        });
      }
    }
  };

  const calculateBOB = () => {
    if (!rateData || !usdAmount) {
      setBobAmount('');
      return;
    }
    
    const usd = parseFloat(usdAmount);
    if (!Number.isFinite(usd) || usd <= 0) {
      setBobAmount('');
      return;
    }
    
    const rate = getRate();
    const bob = usd * rate;
    if (rate <= 0 || !Number.isFinite(bob)) { setBobAmount(''); return; }
    setBobAmount(bob.toFixed(2));
    
    // Save to history if it's a meaningful calculation
    if (usd >= 0.01) {
      saveToHistory(selectedCurrency, 'BOB', usd.toFixed(4), bob.toFixed(2), rate.toFixed(4));
      if (userTouchedRef.current && !usedTrackedRef.current) {
        usedTrackedRef.current = true;
        trackCalculatorUsage(usd, selectedCurrency, 'BOB', bob);
        trackCalculatorUsed({
          language,
          from_currency: selectedCurrency,
          to_currency: 'BOB',
          use_official: useOfficial,
        });
      }
    }
  };

  const handleBobChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      userTouchedRef.current = true;
      setBobAmount(value);
      setConvertFromBOB(true);
    }
  };

  const handleUsdChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      userTouchedRef.current = true;
      setUsdAmount(value);
      setConvertFromBOB(false);
    }
  };

  const handleSwap = () => {
    userTouchedRef.current = true;
    const prevFromCurrency = convertFromBOB ? 'BOB' : selectedCurrency;
    const prevToCurrency = convertFromBOB ? selectedCurrency : 'BOB';
    
    setConvertFromBOB(!convertFromBOB);
    // Keep each amount attached to its currency. The previous output becomes
    // the new input, then the opposite side of the spread is applied.
    
    // Track swap
    trackCalculatorSwap();
    trackCalculatorCurrencySwitch(prevFromCurrency, prevToCurrency);
  };

  const applyUsdPreset = useCallback((amount) => {
    userTouchedRef.current = true;
    setUsdAmount(String(amount));
    setConvertFromBOB(false);
  }, []);

  const applyBobPreset = useCallback((amount) => {
    userTouchedRef.current = true;
    setBobAmount(String(amount));
    setConvertFromBOB(true);
  }, []);

  const copyResult = async () => {
    const fromAmt = convertFromBOB ? bobAmount : usdAmount;
    const toAmt = convertFromBOB ? usdAmount : bobAmount;
    const fromLabel = convertFromBOB ? 'BOB' : selectedCurrency;
    const toLabel = convertFromBOB ? selectedCurrency : 'BOB';
    if (!fromAmt || !toAmt || !validResult) return;
    const referenceNote = p2pReference ? (es ? '; referencia P2P USDT' : '; USDT P2P reference') : '';
    const text = es
      ? `${fromAmt} ${fromLabel} = ${toAmt} ${toLabel} (Bolivia Blue, tasa ${useOfficial ? 'oficial' : 'blue; antes de comisiones'}${referenceNote})`
      : `${fromAmt} ${fromLabel} = ${toAmt} ${toLabel} (Bolivia Blue, ${useOfficial ? 'official rate' : 'blue; before fees'}${referenceNote})`;
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
  const forwardRate = getRate(false);
  const reverseRate = getRate(true);
  const p2pReference = !useOfficial && isP2PReferenceCurrency(selectedCurrency);
  const validResult = !isLoading && rate > 0 && Number.isFinite(Number(bobAmount)) && Number(bobAmount) > 0 && Number.isFinite(Number(usdAmount)) && Number(usdAmount) > 0;
  const rateDecimals = ['COP', 'ARS', 'CLP'].includes(selectedCurrency) ? 4 : selectedCurrency === 'BRL' ? 3 : 2;
  const usdPresets = ['COP', 'ARS', 'CLP'].includes(selectedCurrency)
    ? [10000, 50000, 100000, 500000, 1000000]
    : [20, 50, 100, 500, 1000];
  const bobPresets = [500, 1000, 5000, 10000];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3 w-full'}`}>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Rate type + tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/40">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-0.5 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setUseOfficial(false)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    !useOfficial
                      ? 'bg-sky-500 text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {es ? 'Blue' : 'Blue'}
                </button>
                <button
                  type="button"
                  onClick={() => setUseOfficial(true)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    useOfficial
                      ? 'bg-sky-500 text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {es ? 'Oficial' : 'Official'}
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
              {/* Currency pills — scroll instead of wrapping into a messy grid */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-0.5">
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
                    className={`inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors touch-manipulation ${
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
                  <label htmlFor="calculator-bob" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('bolivianos')} (BOB)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="calculator-bob"
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
                  <label htmlFor="calculator-foreign" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {currencies[selectedCurrency].name} ({selectedCurrency})
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      id="calculator-foreign"
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
                      {convertFromBOB
                        ? `${n.toLocaleString()} Bs`
                        : `${currencies[selectedCurrency].symbol}${n.toLocaleString()}`}
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
                      {isLoading || forwardRate <= 0
                        ? '—'
                        : forwardRate.toFixed(rateDecimals)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                      1 BOB → {selectedCurrency}
                    </div>
                    <div className="font-mono text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300 min-h-[1.5rem]">
                      {isLoading || reverseRate <= 0 ? '—' : (1 / reverseRate).toFixed(4)}
                    </div>
                  </div>
                </div>
                {p2pReference && (
                  <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
                    {es ? 'Referencia P2P USDT, antes de comisiones. BOB → USDT: comprás; USDT → BOB: vendés.' : 'USDT P2P reference, before fees. BOB → USDT: you buy; USDT → BOB: you sell.'}
                    {selectedCurrency !== 'USDT' && (es ? ` ${selectedCurrency} es una estimación a paridad 1:1 con USDT, sin garantía de paridad o liquidez; no es una cotización de efectivo.` : ` ${selectedCurrency} is an estimate at 1:1 with USDT, with no guarantee of parity or liquidity; it is not a cash quote.`)}
                  </p>
                )}
                {!isLoading && rate > 0 && (
                  <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
                    {es ? 'Tasa aplicada' : 'Applied rate'}: {rate.toFixed(rateDecimals)} BOB / {selectedCurrency} · {useOfficial ? t('official') : t('unofficial')}
                  </p>
                )}
                {isLoading ? (
                  <p role="status" className="mt-2 text-center text-xs text-gray-500">{es ? 'Cargando tasas…' : 'Loading rates…'}</p>
                ) : (loadError || rate <= 0) && (
                  <p role="status" className="mt-2 text-center text-xs text-amber-700 dark:text-amber-300">
                    {loadError && rate > 0
                      ? (es ? 'No se pudo actualizar. Se muestra la última referencia cargada.' : 'Could not refresh. Showing the last loaded reference.')
                      : (es ? 'Tasa no disponible. Intentá de nuevo en un momento.' : 'Rate unavailable. Please try again shortly.')}
                  </p>
                )}
              </div>

              {/* Result + copy + one paid CTA */}
              {validResult && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-950/20 px-3 py-3 sm:px-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug break-words">
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
                  {!useOfficial && (
                    <FinancialOfferButton
                      placement="calculator_result"
                      className="h-11 w-full text-sm"
                    >
                      {language === 'es' ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account'}
                    </FinancialOfferButton>
                  )}
                  {!useOfficial && <p className="google-anno-skip text-[11px] text-gray-500 dark:text-gray-400">{es ? 'Enlace de referido; podemos recibir una comisión. USDT es un criptoactivo. Confirmá precio y costos en El Dorado; esta referencia no se transfiere a una orden.' : 'Referral link; we may earn a commission. USDT is a cryptoasset. Confirm price and costs in El Dorado; this reference does not carry into an order.'}</p>}
                </div>
              )}

              {comparisonMode && !isLoading && rateData && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                    {es ? 'Estimaciones con tasa media blue, antes de comisiones' : 'Blue midpoint estimates, before fees'}
                  </p>
                  {Object.entries(currencies).map(([code, data]) => {
                    const usdMid = (Number(rateData.buy_bob_per_usd) + Number(rateData.sell_bob_per_usd)) / 2;
                    const currencyToUSD = Number(exchangeRates[code]);
                    if (!Number.isFinite(usdMid) || usdMid <= 0 || !Number.isFinite(currencyToUSD) || currencyToUSD <= 0) {
                      return (
                        <div key={code} className="flex items-center justify-between px-3 py-2.5 text-sm">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {data.flag} {code}
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-gray-400">—</span>
                        </div>
                      );
                    }
                    const itemRate = usdMid / currencyToUSD;
                    const amount = parseFloat(bobAmount) || 100;
                    const converted = (amount / itemRate).toFixed(code === 'COP' ? 0 : 2);
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
                      try { localStorage.removeItem('calculatorHistory'); } catch { /* optional history */ }
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
                          {item.rateType === 'official' ? t('official') : isP2PReferenceCurrency(item.currency) ? 'P2P USDT' : t('unofficial')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {item.rateType === 'blue' && isP2PReferenceCurrency(item.currency) && item.calculationVersion !== 2 && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mb-1">{es ? 'Cálculo anterior: verificá la dirección de la tasa.' : 'Older calculation: verify the rate direction.'}</p>
                      )}
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

