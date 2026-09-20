import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useRate } from '../contexts/RateContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import CurrencyRateSnapshot, { CurrencyConversionList } from '../components/CurrencyRateSnapshot';
import { fetchBlueHistory } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import { formatRate, formatCopThousand } from '../utils/formatters';
import NewsletterSignup from '../components/NewsletterSignup';
import { NEIGHBOR_FIAT_LIST } from '../config/neighborFiats';

function derivationCopy(derivation, language, spotSymbol) {
  const lastValid = derivation === 'usdt-cross-last-valid';
  const spot = typeof derivation === 'string' && derivation.startsWith('spot-');
  if (language === 'es') {
    if (lastValid) {
      return 'Se muestra la última lectura válida (vía USDT). El horario es el de esa lectura, no el de ahora.';
    }
    if (spot) {
      return `Se deriva como USDT/BOB (P2P) ÷ ${spotSymbol} (mercado spot). No hay un libro de ventanilla para este par.`;
    }
    return 'Se deriva como USDT/BOB (P2P) ÷ USDT de esta moneda (P2P). No es una cotización de efectivo observada directamente.';
  }
  if (lastValid) {
    return 'Last valid reading (via USDT). The timestamp is that observation, not “now”.';
  }
  if (spot) {
    return `Derived as USDT/BOB (P2P) ÷ ${spotSymbol} (spot). There is no cash-desk book for this pair.`;
  }
  return 'Derived as USDT/BOB (P2P) ÷ this fiat per USDT (P2P). Not a directly observed cash quote.';
}

export default function NeighborFiatPage({ config }) {
  useAdsenseReady();

  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const { rateData: currentRate, isLoading: isRateLoading, error: rateCtxError } = useRate();
  const rateError = rateCtxError;
  const [convertAmt, setConvertAmt] = useState(config.defaultConvert);
  const [weekHistory, setWeekHistory] = useState(null);

  const observedIso = currentRate?.[config.updatedField] || currentRate?.updated_at_iso || null;
  const lastUpdated = observedIso && !Number.isNaN(Date.parse(observedIso)) ? new Date(observedIso) : null;

  useEffect(() => {
    setConvertAmt(config.defaultConvert);
    setWeekHistory(null);
    let cancelled = false;
    fetchBlueHistory('1W', config.code)
      .then((hist) => {
        if (cancelled || !hist?.points?.length) return;
        const vals = hist.points.map((p) => Number(p.buy)).filter((n) => Number.isFinite(n) && n > 0);
        if (vals.length < 2) return;
        setWeekHistory({
          min: Math.min(...vals),
          max: Math.max(...vals),
          first: vals[0],
          last: vals[vals.length - 1],
          n: vals.length,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config.code, config.defaultConvert]);

  const buy = Number(currentRate?.[config.buyField]);
  const sell = Number(currentRate?.[config.sellField]);
  const hasBuy = Number.isFinite(buy) && buy > 0;
  const hasSell = Number.isFinite(sell) && sell > 0;
  const decimals = config.thousandScale ? 4 : 2;
  const buyStr = hasBuy ? formatRate(buy, config.code) : null;
  const sellStr = hasSell ? formatRate(sell, config.code) : null;
  const thousandBuy = hasBuy && config.thousandScale ? formatCopThousand(buy) : null;
  const thousandSell = hasSell && config.thousandScale ? formatCopThousand(sell) : null;

  const liveSeo = buildLiveRateSeoMeta({
    buy: config.thousandScale ? (hasBuy ? buy * 1000 : null) : (hasBuy ? buy : null),
    sell: config.thousandScale ? (hasSell ? sell * 1000 : null) : (hasSell ? sell : null),
    updatedAt: observedIso,
    language,
    page: config.seoPage,
  });

  const derivation = currentRate?.[config.derivationField] || 'p2p-usdt';
  const derivationText = derivationCopy(derivation, language, config.spotSymbol);
  const inputId = `${config.code.toLowerCase()}-quick`;
  const otherNeighbors = NEIGHBOR_FIAT_LIST.filter((f) => f.code !== config.code);

  const faqAnswers = buyStr
    ? (language === 'es'
      ? [
          {
            '@type': 'Question',
            name: config.faqUnitEs,
            acceptedAnswer: {
              '@type': 'Answer',
              text: config.thousandScale
                ? `1.000 ${config.code} equivalen a aproximadamente ${thousandBuy} BOB según nuestra referencia paralela (derivada vía USDT). Un ${config.code} vale unos ${buyStr} BOB. No es el tipo oficial ni una cotización de ventanilla.`
                : `100 ${config.code} equivalen a aproximadamente ${(buy * 100).toFixed(2)} BOB según nuestra referencia paralela (derivada vía USDT). Un ${config.code} vale unos ${buyStr} BOB. No es el tipo oficial ni una cotización de ventanilla.`,
            },
          },
          {
            '@type': 'Question',
            name: config.faqCashEs,
            acceptedAnswer: { '@type': 'Answer', text: config.faqCashAnswerEs },
          },
        ]
      : [
          {
            '@type': 'Question',
            name: config.faqUnitEn,
            acceptedAnswer: {
              '@type': 'Answer',
              text: config.thousandScale
                ? `1,000 ${config.code} is about ${thousandBuy} BOB on our parallel reference (derived via USDT). One unit is about ${buyStr} BOB. Not the official rate and not a cash-desk quote.`
                : `100 ${config.code} is about ${(buy * 100).toFixed(2)} BOB on our parallel reference (derived via USDT). One unit is about ${buyStr} BOB. Not the official rate and not a cash-desk quote.`,
            },
          },
          {
            '@type': 'Question',
            name: config.faqCashEn,
            acceptedAnswer: { '@type': 'Answer', text: config.faqCashAnswerEn },
          },
        ])
    : [];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: liveSeo.title,
    description: liveSeo.description,
    author: { '@type': 'Organization', name: 'Bolivia Blue' },
    publisher: {
      '@type': 'Organization',
      name: 'Bolivia Blue',
      logo: { '@type': 'ImageObject', url: 'https://boliviablue.com/favicon.svg' },
    },
    datePublished: '2026-09-18',
    dateModified: (observedIso || '').slice(0, 10) || undefined,
  };

  const faqSchema = faqAnswers.length
    ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqAnswers }
    : null;

  const cards = [
    {
      topLabel: `1 ${config.code} =`,
      valueDisplay: buyStr,
      bottomLabel: language === 'es' ? 'Compra' : 'Buy',
      tone: 'buy',
    },
    {
      topLabel: `1 ${config.code} =`,
      valueDisplay: sellStr,
      bottomLabel: language === 'es' ? 'Venta' : 'Sell',
      tone: 'sell',
    },
  ];
  if (config.thousandScale) {
    cards.push({
      topLabel: `1.000 ${config.code} =`,
      valueDisplay: thousandBuy,
      bottomLabel: language === 'es' ? 'Escala legible' : 'Readable scale',
      tone: 'tertiary',
    });
  }

  const weekText = weekHistory
    ? (language === 'es'
      ? `En la última semana (lecturas ${config.code} disponibles): mínimo Bs ${weekHistory.min.toFixed(decimals)}, máximo Bs ${weekHistory.max.toFixed(decimals)} por unidad${
          config.thousandScale
            ? ` (1.000 ${config.code} ≈ ${(weekHistory.min * 1000).toFixed(2)}–${(weekHistory.max * 1000).toFixed(2)} Bs)`
            : ''
        }.`
      : `Over the last week (available ${config.code} readings): low Bs ${weekHistory.min.toFixed(decimals)}, high Bs ${weekHistory.max.toFixed(decimals)} per unit${
          config.thousandScale
            ? ` (1,000 ${config.code} ≈ ${(weekHistory.min * 1000).toFixed(2)}–${(weekHistory.max * 1000).toFixed(2)} Bs)`
            : ''
        }.`)
    : null;

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es' ? config.keywordsEs : config.keywordsEn}
        canonical={config.path}
        structuredData={[articleSchema, faqSchema].filter(Boolean)}
      />

      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es'
            ? [
                { label: 'Inicio', path: '/' },
                { label: config.crumbEs, path: config.path },
              ]
            : [
                { label: 'Home', path: '/' },
                { label: config.crumbEn, path: config.path },
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' ? config.h1Es : config.h1En}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 min-h-[1.75rem]">
          {lastUpdated
            ? (language === 'es'
              ? <>Lectura: <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString('es-BO', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' })}</time> (hora de Bolivia)</>
              : <>Reading: <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString('en-US', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' })}</time> (Bolivia time)</>)
            : '\u00a0'}
        </p>
        {currentRate?.is_stale && (
          <p className="text-center text-sm text-amber-700 dark:text-amber-300 mb-2">
            {language === 'es'
              ? 'Mostramos la última lectura válida; la fuente no respondió ahora.'
              : 'Showing the last valid reading; the upstream source did not respond just now.'}
          </p>
        )}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-3">
          {derivationText}{' '}
          <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {language === 'es' ? 'Metodología' : 'Methodology'}
          </Link>
        </p>
        <div className="max-w-md mx-auto mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-3">
          <label htmlFor={inputId} className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            {language === 'es' ? config.convertLabelEs : config.convertLabelEn}
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              type="number"
              min="0"
              inputMode="decimal"
              value={convertAmt}
              onChange={(e) => setConvertAmt(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base tabular-nums min-h-[44px]"
            />
            <div className="flex items-center px-3 rounded-lg bg-gray-50 dark:bg-gray-950 text-sm font-mono font-semibold tabular-nums min-h-[44px] min-w-[7.5rem] justify-end">
              {Number.isFinite(Number(convertAmt)) && hasBuy
                ? `${(Number(convertAmt) * buy).toFixed(2)} Bs`
                : '—'}
            </div>
          </div>
        </div>
        <p className="text-center mb-4 sm:mb-6">
          <Link
            to="/dolar-blue-hoy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-500/20 dark:text-sky-300 dark:hover:bg-sky-500/20 transition-colors"
          >
            {language === 'es' ? 'Ver cotización del dólar blue hoy →' : 'See today’s blue dollar rate →'}
          </Link>
        </p>

        <CurrencyRateSnapshot
          language={language}
          accent={config.accent}
          title={language === 'es' ? config.snapshotTitleEs : config.snapshotTitleEn}
          cards={cards}
          isLoading={isRateLoading}
          errorMessage={rateError
            ? (language === 'es' ? 'No se pudo cargar la cotización. Reintentando…' : 'Could not load the quote. Retrying…')
            : null}
          footnote={language === 'es'
            ? (config.thousandScale
              ? `1.000 ${config.code} ≈ ${thousandBuy || '—'} Bs. P2P, no el banco.`
              : 'Mediana P2P vía USDT. No es el banco.')
            : (config.thousandScale
              ? `1,000 ${config.code} ≈ ${thousandBuy || '—'} Bs. P2P, not the bank.`
              : 'P2P median via USDT. Not the bank.')}
        />

        <section className="min-h-[12rem] sm:min-h-[11rem]">
          <BinanceBanner />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? config.sectionTitleEs : config.sectionTitleEn}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' ? config.introEs(buyStr, thousandBuy) : config.introEn(buyStr, thousandBuy)}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es' ? config.usefulEs : config.usefulEn}{' '}
                {language === 'es'
                  ? <>Para convertir otra cantidad usa la <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculadora</Link> (moneda {config.code}).</>
                  : <>Convert another amount in the <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculator</Link> ({config.code}).</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? `Conversiones comunes: ${config.crumbEs.toLowerCase()}`
                  : `Common conversions: ${config.crumbEn.toLowerCase()}`}
              </h3>
              <CurrencyConversionList
                fromCode={config.code}
                rate={hasBuy ? buy : null}
                amounts={config.convertAmounts}
                isLoading={isRateLoading}
              />
              {weekText && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{weekText}</p>
              )}

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' ? `¿Cómo se calcula ${config.code}/BOB?` : `How is ${config.code}/BOB calculated?`}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' ? config.howEs : config.howEn}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? `${config.code}, dólar blue y tipo oficial`
                  : `${config.code}, the blue dollar, and the official rate`}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es' ? config.vsBlueEs : config.vsBlueEn}{' '}
                {language === 'es'
                  ? <>El paralelo se mueve con el <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">dólar blue</Link>. También: <Link to="/euro-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">euro a boliviano</Link> y <Link to="/peso-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">peso colombiano</Link>.</>
                  : <>The parallel market moves with the <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">blue dollar</Link>. Also: <Link to="/euro-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">euro to boliviano</Link> and <Link to="/peso-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Colombian peso</Link>.</>}
              </p>

              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 sm:p-6 mt-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de divisas' : '💡 Currency calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>¿Otra cantidad? <Link to="/calculadora" className="text-blue-700 dark:text-blue-300 hover:underline font-medium">Usa la calculadora</Link> con moneda {config.code}.</>
                    : <>Need another amount? <Link to="/calculadora" className="text-blue-700 dark:text-blue-300 hover:underline font-medium">Use the calculator</Link> with {config.code} selected.</>}
                </p>
              </div>
            </div>
          </div>
        </section>

        <NewsletterSignup source={config.path.replace(/^\//, '')} compact />

        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Páginas relacionadas' : 'Related pages'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/calculadora" className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white mb-1">{language === 'es' ? 'Calculadora' : 'Calculator'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'es' ? `Convierte ${config.code} a BOB` : `Convert ${config.code} to BOB`}</div>
            </Link>
            <Link to="/euro-a-boliviano" className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white mb-1">{language === 'es' ? 'Euro a boliviano' : 'Euro to boliviano'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">EUR/BOB</div>
            </Link>
            <Link to="/peso-a-boliviano" className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white mb-1">{language === 'es' ? 'Peso colombiano' : 'Colombian peso'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">COP/BOB</div>
            </Link>
            {otherNeighbors.map((f) => (
              <Link key={f.code} to={f.path} className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="font-medium text-gray-900 dark:text-white mb-1">{language === 'es' ? f.crumbEs : f.crumbEn}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{f.code}/BOB</div>
              </Link>
            ))}
            <Link to="/cuanto-esta-dolar-bolivia" className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white mb-1">{language === 'es' ? 'Dólar en Bolivia' : 'Dollar in Bolivia'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">USD/BOB</div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
