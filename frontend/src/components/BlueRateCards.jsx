import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { fetchBlueRate, fetchCardRates } from '../utils/api';
import { formatRate, formatDateTime, isStale } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { trackRateCardView, trackOfficialRateToggle, trackRateUpdate } from '../utils/analytics';
import {
  US_CARD_ISSUERS,
  getIssuerById,
  networkBobPerUsd,
  effectiveBobPerUsd,
  networkLabel
} from '../data/usCardIssuers';

const RateCard = memo(function RateCard({ type, rate, timestamp, isStaleData, isLoading, error, dailyChange, isOfficial, currency, language, showTimestampInCards = true }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const isBuy = type === 'buy';
  const label = isBuy ? t('buy') : t('sell');
  const borderColor = isOfficial 
    ? (isBuy ? 'border-gray-400' : 'border-gray-500')
    : (isBuy ? 'border-blue-500' : 'border-pink-500');
  
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
      <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${borderColor} p-3 sm:p-4 shadow-md sm:shadow-lg min-h-[140px] sm:min-h-[160px]`}>
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
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${borderColor} p-3 sm:p-5 shadow-md sm:shadow-lg transition-shadow duration-200`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ 
        y: -4,
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
        <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
          {formatRate(rate, currency)}
        </div>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
          {language === 'es' ? `Bs. por ${currency}` : `Bs. per ${currency}`}
        </div>
      </motion.div>
      
      {showTimestampInCards && timestamp && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {t('updated')}: {formatDateTime(timestamp)}
        </div>
      )}
    </motion.div>
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
  const [issuerId, setIssuerId] = useState('bcb-bank');
  
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

  const issuer = useMemo(() => getIssuerById(issuerId), [issuerId]);
  const officialBob = data?.official_buy ?? data?.official_mid ?? null;
  const networkRate = useMemo(
    () => networkBobPerUsd(cardRates, issuer.network, officialBob),
    [cardRates, issuer.network, officialBob]
  );
  const effectiveRate = useMemo(
    () => effectiveBobPerUsd(networkRate, issuer.feePct),
    [networkRate, issuer.feePct]
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
      : t('officialRateDescription');

  return (
    <div className="space-y-6">
      {exchangeRateSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(exchangeRateSchema)}
          </script>
        </Helmet>
      )}
      
      <div className="flex items-center justify-center mb-6">
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

      <p className="mt-3 text-center text-xs leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        {description}
      </p>

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

          <div className="flex flex-wrap justify-center gap-2" role="listbox" aria-label={t('cardRateSelectIssuer')}>
            {US_CARD_ISSUERS.map((item) => {
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
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 p-4 sm:p-6 shadow-md sm:shadow-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            key={`${issuerId}-${effectiveRate}`}
          >
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-2">
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
                <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                  {formatRate(effectiveRate, 'USD')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  {language === 'es' ? 'Bs. por USD' : 'Bs. per USD'}
                </div>
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>
                    {t('cardRateNetworkLine')}: {networkLabel(issuer.network)}{' '}
                    {networkRate != null ? formatRate(networkRate, 'USD') : '—'}
                    {' · '}
                    {t('cardRateFee')}: {(issuer.feePct * 100).toFixed(issuer.feePct ? 1 : 0)}%
                  </div>
                  <div>{language === 'es' ? issuer.blurbEs : issuer.blurbEn}</div>
                  {issuer.network !== 'bcb' && cardRates?.source && !String(cardRates.source).includes('mid-market') && cardRates.source !== 'none' && (
                    <div className="text-emerald-700 dark:text-emerald-300">{t('cardRateNetworkNote')}</div>
                  )}
                  {vsBluePct != null && (
                    <div>
                      {t('cardRateVsBlue')}:{' '}
                      <span className={vsBluePct >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {vsBluePct >= 0 ? '+' : ''}
                        {vsBluePct.toFixed(2)}%{' '}
                        ({vsBluePct >= 0 ? t('cardRateBetter') : t('cardRateWorse')})
                      </span>
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
