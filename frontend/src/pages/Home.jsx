import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy.js';
import Header from '../components/Header';
import SourceObservationPanel from '../components/SourceObservationPanel';
import { rateReadingGuide } from '../data/rateReadingGuide';
import MobileHeroRates from '../components/MobileHeroRates';
import MobileMoneyActions from '../components/MobileMoneyActions';
import Footer from '../components/Footer';
import BlueRateCards from '../components/BlueRateCards';
import RateBinanceCta from '../components/RateBinanceCta';
import RateTrioStrip from '../components/RateTrioStrip';
import TravelersGuideTeaser from '../components/TravelersGuideTeaser';
import AiCitationBlock from '../components/AiCitationBlock';
import { PRIMARY_RATE_URL } from '../config/seo';
import NewsletterSignup from '../components/NewsletterSignup';
import SocialShare from '../components/SocialShare';
import LazyErrorBoundary from '../components/LazyErrorBoundary';
import { FinancialOfferButton } from '../components/FinancialOfferCard';
import { lazy, Suspense, useState, useEffect, useMemo } from 'react';

// Lazy load heavy components for better performance
const BlueChart = lazy(() => import('../components/BlueChart'));
const NewsTabs = lazy(() => import('../components/NewsTabs'));
const SentimentNewsCard = lazy(() => import('../components/SentimentNewsCard'));
const RateAlertForm = lazy(() => import('../components/RateAlertForm'));

import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { articlesEs, articlesEn } from '../data/blogArticles';
import { formatDateTime } from '../utils/formatters';
import { useRate } from '../contexts/RateContext';
import { getWebPage, getBreadcrumbList, getOrganizationSchema, getWebSiteSchema } from '../utils/seoSchema';
import { buildLiveRateSeoMeta, liveBobParts } from '../utils/seoRateMeta';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import AdSenseAutoAds from '../components/AdSenseAutoAds';

// Loading fallback component for lazy-loaded components
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
  </div>
);

function Home() {
  // Signal to AdSense that this page has sufficient content
  // This prevents ads from loading on loading screens
  useAdsenseReady();
  
  // Enable Auto Ads for automatic optimization
  // Auto Ads will place ads in optimal locations automatically
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const { rateData: contextRate, error: rateError, isLoading: rateLoading } = useRate();
  const [currentRate, setCurrentRate] = useState(null);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);
  const [quickUsd, setQuickUsd] = useState('100');

  const midRate = useMemo(() => {
    const buy = currentRate?.buy ?? currentRate?.buy_bob_per_usd;
    const sell = currentRate?.sell ?? currentRate?.sell_bob_per_usd;
    if (Number.isFinite(buy) && Number.isFinite(sell)) return (buy + sell) / 2;
    if (Number.isFinite(buy)) return buy;
    return null;
  }, [currentRate]);

  useEffect(() => {
    if (contextRate?.buy && contextRate?.sell) {
      setCurrentRate(contextRate);
    }
  }, [contextRate]);
  
  const liveSeo = buildLiveRateSeoMeta({
    ...normalizeDollarRatePayload(currentRate),
    language,
    page: 'home',
  });

  // This one answer is also rendered visibly. Legacy FAQ claims remain out of schema pending review.
  const brandSchemas = [getOrganizationSchema(language), getWebSiteSchema(language)]
    .map(({ description: _unverifiedDescription, ...schema }) => schema);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: language === 'es' ? '¿A cuánto está el dólar en Bolivia?' : 'How much is the dollar in Bolivia?',
      acceptedAnswer: { '@type': 'Answer', text: liveSeo.answer },
    }],
  };

  const rateDateModified = liveSeo.observedAt;

  // WebPage schema: authority, freshness, canonical (dateModified only when rate timestamp available)
  const webPageSchema = getWebPage({
    name: liveSeo.title,
    description: liveSeo.description,
    url: '/',
    dateModified: rateDateModified || undefined,
    inLanguage: language === 'es' ? 'es-BO' : 'en-US',
  });

  // Breadcrumb schema (reusable helper)
  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' }
  ]);

  // Page-specific schema only — brand Organization/WebSite come from PageMeta
  const allStructuredData = [...brandSchemas, webPageSchema, breadcrumbSchema, faqSchema];

  const live = liveBobParts(currentRate);
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        includeBrandSchema={false}
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es'
          ? "bolivia blue, dólar blue hoy, dolar paralelo bolivia, binance p2p bolivia, cuanto esta el dolar en bolivia hoy, dolar blue bolivia, precio del dolar en bolivia hoy, cotizacion dolar bolivia hoy, bolivia blue rate, tipo de cambio bolivia, usdt bob"
          : "blue dollar today bolivia, parallel dollar bolivia, binance p2p bolivia, how much is the dollar in bolivia today, bolivia blue rate, exchange rate bolivia, usdt bob"}
        canonical="/"
        structuredData={allStructuredData}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />
      
      {/* Enable Auto Ads for automatic ad placement */}
      <AdSenseAutoAds />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8 md:py-10 space-y-6 sm:space-y-8 md:space-y-10 pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Mobile: compact title + rate + $100 on the first screen */}
        <div className="md:hidden text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {language === 'es' ? 'Bolivia Blue' : 'Bolivian Blue'}
          </h1>
          <MobileHeroRates
            live={live}
            rate={currentRate}
            loading={rateLoading || Boolean(contextRate?.buy && contextRate?.sell && !currentRate)}
            error={rateError}
            language={language}
          />
          <div className="mt-3 flex flex-col items-center gap-2">
            <FinancialOfferButton placement="home_mobile_hero" className="h-11 w-full max-w-xs justify-center">
              {language === 'es' ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account'}
            </FinancialOfferButton>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{language === 'es' ? 'Podemos recibir una comisión' : 'We may earn a commission'}</p>
            <MobileMoneyActions language={language} />
          </div>
        </div>

        {/* Hero — desktop only */}
        <div className="hidden md:block relative text-center mb-1 overflow-hidden rounded-3xl border border-sky-200/60 dark:border-sky-800/40 px-4 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 50% -20%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(245,197,24,0.12), transparent 50%)',
            }}
          />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {language === 'es' ? 'Actualizado cada 15 min' : 'Updated every 15 min'}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {language === 'es' ? 'Bolivia Blue' : 'Bolivian Blue'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              {language === 'es'
                ? 'Mediana de varias plataformas P2P. Sin registro.'
                : 'Median across P2P platforms. No signup.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to={PRIMARY_RATE_URL}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-bold text-white shadow-md shadow-sky-500/25 transition hover:bg-sky-400"
              >
                {language === 'es' ? 'Cotización completa de hoy' : 'Full quote for today'}
              </Link>
              <Link
                to="/comprar-dolares"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 px-5 text-sm font-semibold text-gray-800 dark:text-gray-100 backdrop-blur transition hover:bg-white dark:hover:bg-gray-800"
              >
                {language === 'es' ? 'Cómo comprar dólares' : 'How to buy dollars'}
              </Link>
              <a
                href="#price-alerts"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 px-5 text-sm font-semibold text-gray-800 dark:text-gray-100 backdrop-blur transition hover:bg-white dark:hover:bg-gray-800"
              >
                {language === 'es' ? 'Crear alerta' : 'Set a price alert'}
              </a>
            </div>
          </div>
        </div>

        {/* Rates + buy CTA — first composition */}
        <div className="relative rounded-2xl px-1 py-4 sm:px-4 sm:py-6 -mx-1 sm:mx-0 bg-gradient-to-b from-sky-50/90 via-transparent to-transparent dark:from-sky-950/40 dark:via-transparent">
          <section>
            {currentRate?.updated_at_iso && (
              <p className="hidden md:flex text-sm text-gray-500 dark:text-gray-400 mb-3 text-center items-center justify-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                {language === 'es' ? 'Actualizado' : 'Updated'}:{' '}
                {formatDateTime(currentRate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')}
              </p>
            )}
            <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} showTimestampInCards={false} showCrossSourceBadge={false} />
            <div className="mt-4 max-w-5xl mx-auto">
              <RateTrioStrip
                buy={currentRate?.buy ?? currentRate?.buy_bob_per_usd}
                sell={currentRate?.sell ?? currentRate?.sell_bob_per_usd}
                officialBuy={currentRate?.official_buy ?? currentRate?.officialBuy}
                officialSell={currentRate?.official_sell ?? currentRate?.officialSell}
                language={language}
                updatedAt={currentRate?.updated_at_iso}
              />
            </div>
            <div className="mt-4 max-w-3xl mx-auto">
              <RateBinanceCta placement="home_after_rates" midRate={midRate} />
            </div>
            <AiCitationBlock
              answerOverride={liveSeo.answer}
              summaryLabel={language === 'es' ? 'Referencia P2P · Bolivia Blue' : 'P2P reference · Bolivia Blue'}
              language={language}
              buy={currentRate?.buy ?? currentRate?.buy_bob_per_usd}
              sell={currentRate?.sell ?? currentRate?.sell_bob_per_usd}
              updatedAt={currentRate?.updated_at_iso}
              sourcesUsed={currentRate?.sources_used}
              citePath="/"
              className="mt-4 max-w-3xl mx-auto"
            />
            <div className="google-anno-skip mt-4 w-full min-w-0 max-w-md mx-auto rounded-xl border border-sky-200 dark:border-sky-800 bg-white/80 dark:bg-gray-800/80 p-3">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1" htmlFor="home-quick-usd">
                {language === 'es' ? 'Convertir USD → BOB (venta P2P)' : 'Convert USD → BOB (P2P sell)'}
              </label>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <input
                  id="home-quick-usd"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={quickUsd}
                  onChange={(e) => setQuickUsd(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base tabular-nums min-h-[44px]"
                />
                <div className="flex min-w-0 items-center px-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sm font-mono font-semibold tabular-nums min-h-[44px] break-all justify-end">
                  {Number.isFinite(Number(quickUsd)) && Number.isFinite(Number(currentRate?.sell))
                    ? `${(Number(quickUsd) * Number(currentRate.sell)).toFixed(2)} Bs`
                    : '—'}
                </div>
              </div>
              <Link to="/calculadora" className="mt-2 inline-block text-xs font-medium text-sky-700 dark:text-sky-300">
                {language === 'es' ? 'Calculadora completa →' : 'Full calculator →'}
              </Link>
              {Number.isFinite(Number(quickUsd)) && Number.isFinite(Number(currentRate?.sell)) && (
                <FinancialOfferButton
                  placement="home_quick_convert"
                  className="mt-2 h-11 w-full justify-center text-sm"
                >
                  {language === 'es' ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account'}
                </FinancialOfferButton>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto">
              {language === 'es'
                ? 'Referencia P2P, no una orden. USDT es un criptoactivo, no efectivo USD. Confirmá precio, costos y requisitos en El Dorado. Enlace de referido; podemos recibir una comisión.'
                : 'P2P reference, not an order. USDT is a cryptoasset, not USD cash. Confirm price, costs and requirements in El Dorado. Referral link; we may earn a commission.'}
            </p>
            <p className="mt-3 text-center flex flex-wrap justify-center gap-2">
              <Link
                to="/euro-a-boliviano"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300"
              >
                {language === 'es' ? 'Ver euro blue (EUR a BOB) →' : 'See euro blue (EUR to BOB) →'}
              </Link>
              <Link
                to="/peso-a-boliviano"
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-500/20 dark:text-purple-300"
              >
                {language === 'es' ? 'Ver peso colombiano (COP a BOB) →' : 'See Colombian peso (COP to BOB) →'}
              </Link>
              <Link
                to="/sol-a-boliviano"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              >
                {language === 'es' ? 'Sol peruano (PEN a BOB) →' : 'Peruvian sol (PEN to BOB) →'}
              </Link>
              <Link
                to="/peso-argentino-a-boliviano"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-500/20 dark:text-sky-300"
              >
                {language === 'es' ? 'Peso argentino (ARS a BOB) →' : 'Argentine peso (ARS to BOB) →'}
              </Link>
              <Link
                to="/peso-chileno-a-boliviano"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-500/20 dark:text-rose-300"
              >
                {language === 'es' ? 'Peso chileno (CLP a BOB) →' : 'Chilean peso (CLP to BOB) →'}
              </Link>
            </p>
            <nav
              className="mt-3 flex flex-wrap justify-center gap-2 text-xs sm:text-sm"
              aria-label={language === 'es' ? 'Cotización por ciudad' : 'Rate by city'}
            >
              <Link
                to="/dolar-blue-santa-cruz"
                className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                Santa Cruz
              </Link>
              <Link
                to="/dolar-blue-la-paz"
                className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                La Paz
              </Link>
              <Link
                to="/dolar-blue-cochabamba"
                className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                Cochabamba
              </Link>
            </nav>
            <TravelersGuideTeaser language={language} />
          </section>

          <section id="price-alerts" className="mt-5 sm:mt-6">
            <LazyErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <RateAlertForm />
              </Suspense>
            </LazyErrorBoundary>
            <div className="mt-4 max-w-2xl mx-auto">
              <NewsletterSignup source="homepage" compact />
            </div>
          </section>
        </div>

        <SourceObservationPanel rate={currentRate} language={language} loading={rateLoading} error={rateError} />

        <section className="max-w-3xl mx-auto space-y-4 text-gray-700 dark:text-gray-200" data-rate-reading-guide>
          <h2 className="text-2xl font-bold">{rateReadingGuide(language).heading}</h2>
          {rateReadingGuide(language).items.map(([question, answer]) => <div key={question}><h3 className="font-semibold">{question}</h3><p className="text-sm">{answer}</p></div>)}
        </section>

        {/* Chart */}
        <section>
          <LazyErrorBoundary>
            <Suspense fallback={
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                {/* Match actual chart height: h-[240px] sm:h-[320px] md:h-[420px] */}
                <div className="h-[240px] sm:h-[320px] md:h-[420px] bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            }>
              <BlueChart showOfficial={showOfficial} />
            </Suspense>
          </LazyErrorBoundary>
        </section>

        {/* Combined Sentiment + News Card — after chart on mobile */}
        <section>
          <LazyErrorBoundary>
            <Suspense fallback={<ComponentLoader />}>
              <SentimentNewsCard />
            </Suspense>
          </LazyErrorBoundary>
        </section>


        {/* News & Twitter Tabs - Collapsible on Mobile */}
        <section>
          <div className="md:hidden">
            <button
              onClick={() => setIsNewsExpanded(!isNewsExpanded)}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-2"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'es' ? 'Noticias y Twitter' : 'News & Twitter'}
              </h2>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isNewsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className={`${isNewsExpanded ? 'block' : 'hidden'} md:block`}>
            <LazyErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <NewsTabs />
              </Suspense>
            </LazyErrorBoundary>
          </div>
        </section>

        {/* Featured Blog Articles - Collapsible on Mobile */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
          <div className="md:hidden mb-3">
            <button
              onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {language === 'es' ? 'Guías y Recursos' : 'Guides & Resources'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'es' 
                    ? 'Aprende todo sobre el dólar blue, USDT y finanzas en Bolivia'
                    : 'Learn everything about the blue dollar, USDT and finance in Bolivia'}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 ml-2 ${isArticlesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className={`${isArticlesExpanded ? 'block' : 'hidden'} md:block`}>
            <div className="hidden md:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Guías y Recursos' : 'Guides & Resources'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'es' 
                    ? 'Aprende todo sobre el dólar blue, USDT y finanzas en Bolivia'
                    : 'Learn everything about the blue dollar, USDT and finance in Bolivia'}
                </p>
              </div>
              <Link
                to="/blog"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                {language === 'es' ? 'Ver Todos' : 'View All'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {(language === 'es' ? articlesEs : articlesEn)
              .filter(a => a.featured)
              .slice(0, 2)
              .map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug || article.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3 pt-3">
                    <span className="text-gray-500 dark:text-gray-400">{article.author}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline flex items-center gap-1">
                      {language === 'es' ? 'Leer' : 'Read'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
          </div>

            <Link
              to="/blog"
              className="sm:hidden mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              {language === 'es' ? 'Ver Todos los Artículos' : 'View All Articles'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>


        {/* Social Share Section */}
        <SocialShare
          title={language === 'es' ? '🔴 Bolivia Blue Rate EN VIVO - Actualizado Cada 15 Min' : '🔴 Bolivia Blue Rate LIVE - Updated Every 15 Min'}
          description={language === 'es' ? "Dólar Blue Bolivia actualizado cada 15 minutos." : "Blue Dollar Bolivia updated every 15 minutes."}
        />

        {/* Link magnets for media / partners */}
        <section className="mt-10 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Para medios y sitios web' : 'For media and websites'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {language === 'es'
              ? 'Usá nuestro widget gratis, citá los datos o descargá el CSV. Cada mención con enlace ayuda a que Bolivia Blue sea la referencia #1.'
              : 'Use our free widget, cite the data, or download CSV. Every linked mention helps Bolivia Blue become the #1 reference.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/widget"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Widget
            </Link>
            <Link
              to="/prensa"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-semibold"
            >
              {language === 'es' ? 'Kit de prensa' : 'Press kit'}
            </Link>
            <Link
              to="/datos-historicos"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-semibold"
            >
              CSV / JSON
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Home;

