import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { fetchBlueRate, fetchCardRates } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import CrossSourceBadge from './CrossSourceBadge';
import { trackRateCardView, trackOfficialRateToggle, trackRateUpdate } from '../utils/analytics';
import {
  effectiveBobPerUsd
} from '../data/usCardIssuers';

/** Only fee % matters while Visa/MC/Amex share the same Wise proxy rate. */
const CARD_FEE_OPTIONS = [
  { id: '0', feePct: 0, labelEs: '0% FX', labelEn: '0% FX' },
  { id: '2.7', feePct: 0.027, labelEs: '2.7% FX', labelEn: '2.7% FX' },
  { id: '3', feePct: 0.03, labelEs: '3% FX', labelEn: '3% FX' }
];

function sharedCardBobPerUsd(cardRates) {
  if (!cardRates) return null;
  const rate =
    cardRates.visa_bob_per_usd ??
    cardRates.mastercard_bob_per_usd ??
    cardRates.amex_bob_per_usd ??
    null;
  return Number.isFinite(rate) ? rate : null;
}

const RateCard = memo(function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, dailyChange, isOfficial, currency, language, showTimestampInCards = true }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const isBuy = type === 'buy';
  const label = isBuy ? t('buy') : t('sell');
  const accent = isOfficial
    ? (isBuy ? 'border-l-gray-400' : 'border-l-gray-500')
    : (isBuy ? 'border-l-blue-500' : 'border-l-rose-500');
  const labelColor = isOfficial
    ? 'text-gray-600 dark:text-gray-400'
    : (isBuy ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400');

  const changeValue = dailyChange ? parseFloat(dailyChange) : null;
  const changeColor = changeValue > 0 ? 'text-green-600' : changeValue < 0 ? 'text-red-600' : 'text-gray-500';
  const changeIcon = changeValue > 0 ? '↑' : changeValue < 0 ? '↓' : '';

  useEffect(() => {
    if (rate && !isLoading && !error) {
      trackRateCardView(type, rate, currency, isOfficial);
    }
  }, [rate, type, currency, isOfficial, isLoading, error]);

  if (isLoading) {
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700 border-l-4 ${accent} p-4 sm:p-6 min-h-[168px] sm:min-h-[196px]`}>
        <div className="flex items-center justify-between mb-2 min-h-[1.25rem]">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-12" />
        </div>
        <div className="skeleton h-12 sm:h-14 w-36 mb-2" />
        <div className="skeleton h-3 w-24 mt-2" />
        <div className="skeleton h-3 w-40 mt-3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700 border-l-4 ${accent} p-4 sm:p-6 min-h-[168px] sm:min-h-[196px]`}>
        <div className={`text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}>{label}</div>
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
    <div
      className={`bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/70 dark:border-gray-700/80 border-l-4 ${accent} p-4 sm:p-6 transition-colors min-h-[168px] sm:min-h-[196px]`}
      role="region"
      aria-label={`${label} rate: ${formatRate(rate, currency)} bolivianos per ${currency}`}
    >
      <div className="flex items-center justify-between mb-2 min-h-[1.25rem]">
        <div className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>{label}</div>
        <div className="flex gap-1.5 min-h-[1.25rem]">
          {isStaleData && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded">
              {t('stale')}
            </span>
          )}
          {!isOfficial && changeValue !== null && (
            <span className={`text-xs font-medium tabular-nums ${changeColor}`}>
              {changeIcon}{Math.abs(changeValue).toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div className="mb-1">
        <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-none tracking-tight tabular-nums min-h-[3rem] sm:min-h-[3.75rem] md:min-h-[4.5rem]">
          {formatRate(rate, currency)}
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium min-h-[1.25rem]">
          {language === 'es' ? `Bs. por ${currency}` : `Bs. per ${currency}`}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 min-h-[1rem]">
        {showTimestampInCards && timestamp
          ? `${t('updated')}: ${formatDateTime(timestamp)}`
          : '\u00a0'}
      </div>
    </div>
  );
});

function BlueRateCards({ showOfficial = false, setShowOfficial, showTimestampInCards = true }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const { currency } = useCurrency();
  const [data, setData] = useState(null);
  const [cardRates, setCardRates] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issuerId, setIssuerId] = useState('0');
  
  const [internalShowOfficial, setInternalShowOfficial] = useState(false);
  const effectiveShowOfficial = setShowOfficial !== undefined ? showOfficial : internalShowOfficial;
  const effectiveSetShowOfficial = setShowOfficial !== undefined ? setShowOfficial : setInternalShowOfficial;

  // rateMode: blue | official | card — card keeps chart on blue (showOfficial false)
  const [rateMode, setRateMode] = useState(effectiveShowOfficial ? 'official' : 'blue');

  useEffect(() => {
    if (effectiveShowOfficial && rateMode !== 'official') {
      setRateMode('official');
    } else if (!effectiveShowOfficial && rateMode === 'official') {
      setRateMode('blue');
    }
  }, [effectiveShowOfficial]); // eslint-disable-line react-hooks/exhaustive-deps

  const setMode = useCallback((mode) => {
    setRateMode(mode);
    if (mode === 'official') {
      effectiveSetShowOfficial(true);
      trackOfficialRateToggle(true);
    } else {
      effectiveSetShowOfficial(false);
      if (mode === 'blue') trackOfficialRateToggle(false);
    }
  }, [effectiveSetShowOfficial]);

  useEffect(() => {
    const onMode = (e) => {
      const mode = e?.detail;
      if (mode === 'blue' || mode === 'official' || mode === 'card') setMode(mode);
    };
    window.addEventListener('bolivia-blue:set-rate-mode', onMode);
    return () => window.removeEventListener('bolivia-blue:set-rate-mode', onMode);
  }, [setMode]);

  const abortControllerRef = React.useRef(null);
  const currentCurrencyRef = React.useRef(currency);

  const loadData = useCallback(async (targetCurrency) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    currentCurrencyRef.current = targetCurrency;

    setIsLoading(true);
    setError(null);

    try {
      const [result, cards] = await Promise.all([
        fetchBlueRate(targetCurrency),
        fetchCardRates().catch((err) => {
          console.warn('Card rates fetch failed:', err.message);
          setCardError(err.message);
          return null;
        })
      ]);
      
      if (!abortController.signal.aborted && currentCurrencyRef.current === targetCurrency) {
        setData(result);
        setError(null);
        if (cards) {
          setCardRates(cards);
          setCardError(null);
        }
        
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
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      if (currentCurrencyRef.current === targetCurrency) {
        console.error('Error loading rate:', err);
        setError(err.message || t('error'));
      }
    } finally {
      if (!abortController.signal.aborted && currentCurrencyRef.current === targetCurrency) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData(currency);
    }, 100);
    
    const interval = setInterval(() => {
      loadData(currency);
    }, 60000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currency, loadData]);

  const isDataStale = useMemo(() => 
    data?.updated_at_iso ? (isStale(data.updated_at_iso) || data.is_stale) : false,
    [data?.updated_at_iso, data?.is_stale]
  );

  const buyChange = data?.buy_change_24h;
  const sellChange = data?.sell_change_24h;

  const feeOption = useMemo(
    () => CARD_FEE_OPTIONS.find((o) => o.id === issuerId) || CARD_FEE_OPTIONS[0],
    [issuerId]
  );
  const networkRate = useMemo(() => sharedCardBobPerUsd(cardRates), [cardRates]);
  const effectiveRate = useMemo(
    () => effectiveBobPerUsd(networkRate, feeOption.feePct),
    [networkRate, feeOption.feePct]
  );
  const blueMid = useMemo(() => {
    const buy = data?.buy ?? data?.buy_bob_per_usd;
    const sell = data?.sell ?? data?.sell_bob_per_usd;
    if (!Number.isFinite(buy) || !Number.isFinite(sell)) return null;
    return (buy + sell) / 2;
  }, [data]);
  const vsBluePct = useMemo(() => {
    if (!effectiveRate || !blueMid || blueMid <= 0) return null;
    return ((effectiveRate - blueMid) / blueMid) * 100;
  }, [effectiveRate, blueMid]);

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
    "rateType": rateMode === 'official' ? "Official" : rateMode === 'card' ? "US Card Network" : "Blue Market (Parallel)",
    "exchangeRateSpread": (data.sell_bob_per_usd - data.buy_bob_per_usd).toFixed(4)
  } : null, [data, rateMode]);

  const modeBtn = (mode, active, label, aria) => (
    <button
      key={mode}
      type="button"
      onClick={() => setMode(mode)}
      className={`px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 min-w-[96px] sm:min-w-[140px] touch-manipulation ${
        active
          ? mode === 'blue'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md border-2 border-blue-200 dark:border-blue-600'
            : mode === 'card'
              ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-md border-2 border-emerald-200 dark:border-emerald-700'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md border-2 border-gray-300 dark:border-gray-600'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
      aria-label={aria}
      aria-pressed={active}
    >
      {label}
    </button>
  );

  const description =
    rateMode === 'card'
      ? t('cardRateDescription')
      : rateMode === 'official'
        ? t('officialRateDescription')
        : t('blueMarketTitle');

  return (
    <div className="space-y-6">
      {exchangeRateSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(exchangeRateSchema)}
          </script>
        </Helmet>
      )}
      
      <div className="flex items-center justify-center mb-6 min-h-[3.25rem]" data-rate-mode-tabs>
        <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 shadow-inner border border-gray-200 dark:border-gray-700">
          {modeBtn(
            'blue',
            rateMode === 'blue',
            t('blueMarketShort'),
            language === 'es' ? 'Mostrar tipo de cambio del mercado paralelo' : 'Show parallel market exchange rate'
          )}
          {modeBtn(
            'official',
            rateMode === 'official',
            t('officialRateShort'),
            language === 'es' ? 'Mostrar tipo de cambio oficial' : 'Show official exchange rate'
          )}
          {modeBtn(
            'card',
            rateMode === 'card',
            t('cardRateShort'),
            language === 'es' ? 'Mostrar tasa de tarjeta US' : 'Show US card exchange rate'
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto min-h-[2.5rem]">
        {description}
      </p>
      {rateMode === 'blue' && (
        <CrossSourceBadge
          sourcesUsed={data?.sources_used}
          className="mt-2"
        />
      )}

      {rateMode === 'blue' && (
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
              showTimestampInCards={showTimestampInCards}
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
              showTimestampInCards={showTimestampInCards}
            />
          </div>
        </div>
      )}

      {rateMode === 'official' && (
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
              showTimestampInCards={showTimestampInCards}
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
              showTimestampInCards={showTimestampInCards}
            />
          </div>
        </div>
      )}

      {rateMode === 'card' && (
        <div className="max-w-4xl mx-auto space-y-4">
          {currency !== 'USD' && (
            <p className="text-center text-xs text-amber-700 dark:text-amber-300">
              {language === 'es'
                ? 'Las tasas de tarjeta US se muestran en BOB por USD.'
                : 'US card rates are shown as BOB per USD.'}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2" role="listbox" aria-label={t('cardRateSelectFee')}>
            {CARD_FEE_OPTIONS.map((item) => {
              const active = item.id === issuerId;
              const label = language === 'es' ? item.labelEs : item.labelEn;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setIssuerId(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium touch-manipulation transition-colors border ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 rounded-xl border border-emerald-300/70 dark:border-emerald-800 p-4 sm:p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            key={`${issuerId}-${effectiveRate}`}
          >
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2">
              {t('cardRateEffective')}
            </div>

            {isLoading ? (
              <div className="skeleton h-14 w-40 mb-2" />
            ) : effectiveRate == null ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {cardError || t('cardRateUnavailable')}
              </div>
            ) : (
              <>
                <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-none tracking-tight tabular-nums">
                  {formatRate(effectiveRate, 'USD')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  {language === 'es' ? 'Bs. por USD' : 'Bs. per USD'}
                </div>
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>
                    {t('cardRateBase')}: {networkRate != null ? formatRate(networkRate, 'USD') : '—'}
                    {' · '}
                    {t('cardRateFee')}: {(feeOption.feePct * 100).toFixed(feeOption.feePct ? 1 : 0)}%
                  </div>
                  {String(cardRates?.source || '').includes('wise') && (
                    <div className="text-amber-700 dark:text-amber-300">{t('cardRateEstimateNote')}</div>
                  )}
                  {cardRates?.source &&
                    !String(cardRates.source).includes('wise') &&
                    !String(cardRates.source).includes('mid-market') &&
                    cardRates.source !== 'none' && (
                    <div className="text-emerald-700 dark:text-emerald-300">{t('cardRateNetworkNote')}</div>
                  )}
                  {vsBluePct != null && (
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {t('cardRateVsBlue')}:{' '}
                      <span className={vsBluePct >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {vsBluePct >= 0 ? '+' : ''}
                        {vsBluePct.toFixed(2)}%{' '}
                        ({vsBluePct >= 0 ? t('cardRateBetter') : t('cardRateWorse')})
                      </span>
                      <div className="mt-1 text-xs font-normal text-gray-600 dark:text-gray-400">
                        {vsBluePct >= 0.3
                          ? (language === 'es'
                            ? 'Señal: pagar con tarjeta suele rendir más Bs por USD que cambiar cash al paralelo.'
                            : 'Signal: paying by card often yields more Bs per USD than cash at the parallel rate.')
                          : vsBluePct <= -0.3
                            ? (language === 'es'
                              ? 'Señal: el cash blue está más “rico” que la tarjeta hoy.'
                              : 'Signal: cash blue is richer than card today.')
                            : (language === 'es'
                              ? 'Brecha chica — mira comisión FX y comodidad.'
                              : 'Small gap — check FX fee and convenience.')}
                      </div>
                    </div>
                  )}
                  {showTimestampInCards && cardRates?.t && (
                    <div>
                      {t('updated')}: {formatDateTime(cardRates.t)}
                      {cardRates.source ? ` · ${cardRates.source}` : ''}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default BlueRateCards;
