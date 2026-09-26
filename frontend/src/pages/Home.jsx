import Header from '../components/Header';
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
import { BinanceButton } from '../components/BrandButton';
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
import { getWebPage, getBreadcrumbList, getDataFeedItem, getLiveRateDataset } from '../utils/seoSchema';
import { buildLiveRateSeoMeta, ratesFromBluePayload, liveBobParts, fmtLiveBob } from '../utils/seoRateMeta';
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
  const { rateData: contextRate, error: rateError } = useRate();
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
  
  // FAQ Schema for homepage (Organization + WebSite injected sitewide via PageMeta)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es el dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El dólar blue es el tipo de cambio del dólar en el mercado paralelo. En Bolivia, refleja la tasa real a la que se compra y vende el dólar fuera del sistema bancario oficial. En nuestra plataforma el dólar blue Bolivia se actualiza cada 15 minutos con datos de Binance P2P."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué es el Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Bolivian Blue (también conocido como Bolivia blue rate o bolivia blue exchange rate) es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. Este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. El Bolivian Blue se actualiza cada 15 minutos en nuestra plataforma."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué es el Bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Bolivia blue rate es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como bolivia blue exchange rate, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial."
        }
      },
      {
        "@type": "Question",
        "name": "¿Con qué frecuencia se actualiza el bolivia blue exchange rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue exchange rate se actualiza cada 15 minutos utilizando datos en tiempo real de Binance P2P, proporcionando la información más precisa y actualizada sobre el tipo de cambio."
        }
      },
      {
        "@type": "Question",
        "name": "¿De dónde proviene el bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue rate proviene de datos públicos de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado paralelo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la fuente más confiable del dólar blue en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bolivia Blue (boliviablue.com) publica una lectura verificada del dólar paralelo con mediana multi-P2P (Binance, El Dorado, OKX, Bybit), metodología en boliviablue.com/fuente-de-datos, API en /api/blue-rate y guía para IA en boliviablue.com/llms.txt."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre el bolivia blue rate y la tasa oficial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue rate refleja el mercado paralelo y puede diferir significativamente de la tasa oficial del Banco Central de Bolivia. La tasa oficial es fija o se ajusta muy raramente, mientras que el bolivia blue exchange rate fluctúa según la oferta y demanda del mercado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué es importante conocer el bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Conocer el bolivia blue rate es importante porque refleja la realidad del mercado cambiario boliviano y es utilizado por millones de bolivianos para transacciones diarias. Te ayuda a tomar mejores decisiones financieras y entender el verdadero valor del dólar en Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es $100 USD en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `Con el bolivia blue rate actual (~${Number(currentRate.buy).toFixed(2)} BOB por USD), $100 USD equivalen a aproximadamente ${(Number(currentRate.buy) * 100).toFixed(0)} BOB. Usa nuestra calculadora para el valor exacto.`
            : 'Usa nuestra calculadora con la tasa blue en vivo para convertir USD a BOB al tipo paralelo.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 1 USD a 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `El bolivia blue exchange rate hoy es aproximadamente ${Number(currentRate.buy).toFixed(2)} BOB por USD (compra) y ${Number(currentRate.sell || currentRate.buy).toFixed(2)} BOB (venta). 1 BOB ≈ ${(1 / Number(currentRate.buy)).toFixed(4)} USD. Se actualiza cada pocos minutos en nuestra plataforma.`
            : 'El bolivia blue exchange rate (dólar paralelo) se actualiza en vivo en boliviablue.com con datos de Binance P2P.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el precio del dólar en el mercado negro en Bolivia hoy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `En Bolivia “mercado negro” del dólar suele referirse al paralelo / blue. Hoy la referencia P2P es compra ~${Number(currentRate.buy).toFixed(2)} y venta ~${Number(currentRate.sell || currentRate.buy).toFixed(2)} Bs por USD — mediana USDT, no un precio de calle observado. Metodología en /fuente-de-datos; Binance P2P en /binance-p2p-bolivia.`
            : 'En Bolivia “mercado negro” del dólar suele referirse al paralelo / blue. Publicamos la mediana P2P (USDT), no un precio de ventanilla. Ver /dolar-blue-hoy y /fuente-de-datos.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto está el dólar paralelo en Santa Cruz, La Paz y Cochabamba?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Publicamos una mediana nacional P2P como referencia para Santa Cruz, La Paz y Cochabamba: no es un precio de casa de cambio local. Ver /dolar-blue-santa-cruz, /dolar-blue-la-paz y /dolar-blue-cochabamba."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the dollar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The dollar blue (or blue dollar) is the parallel market exchange rate for the US dollar. In Bolivia, it reflects the real rate at which people buy and sell dollars outside the official banking system. On our platform the Bolivia blue dollar rate is updated every 15 minutes using Binance P2P data."
        }
      },
      {
        "@type": "Question",
        "name": "What is Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Bolivian Blue (also known as Bolivia blue rate or bolivia blue exchange rate) is the exchange rate of the US dollar in Bolivia's parallel market. This value reflects the real rate at which Bolivians exchange dollars outside the official banking system. The Bolivian Blue is updated every 15 minutes on our platform."
        }
      },
      {
        "@type": "Question",
        "name": "What is Bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Bolivia blue rate is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the bolivia blue exchange rate, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system."
        }
      },
      {
        "@type": "Question",
        "name": "How often is the bolivia blue exchange rate updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue exchange rate is updated every 15 minutes using real-time data from Binance P2P, providing the most accurate and up-to-date exchange rate information."
        }
      },
      {
        "@type": "Question",
        "name": "Where does the bolivia blue rate come from?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue rate comes from public Binance P2P data for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the parallel market."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between bolivia blue rate and the official rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue rate reflects the parallel market and can differ significantly from the official rate set by the Central Bank of Bolivia. The official rate is fixed or adjusted very rarely, while the bolivia blue exchange rate fluctuates according to market supply and demand."
        }
      },
      {
        "@type": "Question",
        "name": "Why is it important to know the bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Knowing the bolivia blue rate is important because it reflects the reality of Bolivia's exchange market and is used by millions of Bolivians for daily transactions. It helps you make better financial decisions and understand the true value of the dollar in Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "How much is $100 US in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `With the current bolivia blue rate (~${Number(currentRate.buy).toFixed(2)} BOB per USD), $100 USD equals approximately ${(Number(currentRate.buy) * 100).toFixed(0)} BOB. Use our calculator for the exact live value.`
            : 'Use our calculator with the live blue rate to convert USD to BOB at the parallel market price.'
        }
      },
      {
        "@type": "Question",
        "name": "How much is 1 USD to 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `The bolivia blue exchange rate today is about ${Number(currentRate.buy).toFixed(2)} BOB per USD (buy) and ${Number(currentRate.sell || currentRate.buy).toFixed(2)} BOB (sell). 1 BOB ≈ ${(1 / Number(currentRate.buy)).toFixed(4)} USD. Updated every few minutes on our platform.`
            : 'The bolivia blue (parallel) exchange rate is updated live on boliviablue.com from Binance P2P.'
        }
      },
      {
        "@type": "Question",
        "name": "What is the black-market dollar price in Bolivia today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentRate?.buy
            ? `In Bolivia the “black market” dollar usually means the parallel / blue rate. Today’s P2P reference is buy ~${Number(currentRate.buy).toFixed(2)} and sell ~${Number(currentRate.sell || currentRate.buy).toFixed(2)} Bs per USD — a USDT median, not a street cash quote. See /fuente-de-datos and /binance-p2p-bolivia.`
            : 'In Bolivia the “black market” dollar usually means the parallel / blue rate. We publish a P2P (USDT) median, not a cash-desk price. See /dolar-blue-hoy and /fuente-de-datos.'
        }
      },
      {
        "@type": "Question",
        "name": "What is the parallel dollar in Santa Cruz, La Paz and Cochabamba?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We publish one national P2P median as a reference for Santa Cruz, La Paz and Cochabamba — not a local exchange-house price. See /dolar-blue-santa-cruz, /dolar-blue-la-paz and /dolar-blue-cochabamba."
        }
      }
    ]
  };

  // FinancialProduct schema for rate cards
  const liveBuyPrice = fmtLiveBob(currentRate?.buy ?? currentRate?.buy_bob_per_usd);
  const financialProductSchema = liveBuyPrice ? {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": language === 'es' ? "Bolivia Blue Rate" : "Bolivia Blue Rate",
    "description": language === 'es' 
      ? "Tipo de cambio del dólar blue en Bolivia en tiempo real"
      : "Real-time blue dollar exchange rate in Bolivia",
    "provider": {
      "@type": "Organization",
      "name": "Bolivia Blue"
    },
    "exchangeRate": {
      "@type": "UnitPriceSpecification",
      "price": liveBuyPrice,
      "priceCurrency": "BOB",
      "unitText": "USD"
    }
  } : null;

  // DataFeed schema for rate updates (dateModified only when we have real rate timestamp)
  const rateDateModified = currentRate?.updated_at_iso ?? null;
  const dataFeedSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": language === 'es' ? "Bolivia Blue Rate - Actualizaciones en Tiempo Real" : "Bolivia Blue Rate - Real-Time Updates",
    "description": language === 'es'
      ? "Feed de datos del tipo de cambio del dólar blue en Bolivia actualizado cada 15 minutos"
      : "Data feed of Bolivia blue dollar exchange rate updated every 15 minutes",
    "dataFeedElement": currentRate ? [getDataFeedItem(currentRate, rateDateModified)] : []
  };

  // WebPage schema: authority, freshness, canonical (dateModified only when rate timestamp available)
  const webPageSchema = getWebPage({
    name: language === 'es' ? 'Dólar Blue Bolivia – Cotización en Tiempo Real' : 'Bolivia Blue Dollar – Live Rate & Tools',
    description: language === 'es'
      ? 'Tu fuente principal para el dólar blue en Bolivia: cotización cada 15 min, gráficos históricos, calculadora y noticias. Sin registro.'
      : 'Your main source for the Bolivia blue dollar: quote every 15 min, historical charts, calculator and news. No signup.',
    url: '/',
    dateModified: rateDateModified || undefined,
    inLanguage: language === 'es' ? 'es-BO' : 'en-US',
    mainEntity: financialProductSchema ? { '@type': 'FinancialProduct', name: language === 'es' ? 'Cotización Dólar Blue Bolivia' : 'Bolivia Blue Dollar Rate' } : undefined
  });

  // Breadcrumb schema (reusable helper)
  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' }
  ]);

  // Page-specific schema only — brand Organization/WebSite come from PageMeta
  const allStructuredData = [webPageSchema, faqSchema];
  if (financialProductSchema) allStructuredData.push(financialProductSchema);
  allStructuredData.push(dataFeedSchema);
  allStructuredData.push(getLiveRateDataset(currentRate, language, '/'));
  allStructuredData.push(breadcrumbSchema);

  const liveSeo = buildLiveRateSeoMeta({
    ...ratesFromBluePayload(currentRate),
    language,
    page: 'home',
  });
  const live = liveBobParts(currentRate);
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
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
          {live.buyStr && live.sellStr && (
            <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {language === 'es' ? 'Compra' : 'Buy'} {live.buyStr}{' '}
              · {language === 'es' ? 'Venta' : 'Sell'} {live.sellStr}
            </p>
          )}
          {live.times(100) && (
            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              100 USD ≈ {live.times(100)} Bs
            </p>
          )}
          {currentRate?.updated_at_iso && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {language === 'es' ? 'Lectura P2P' : 'P2P reading'}:{' '}
              <time dateTime={currentRate.updated_at_iso}>
                {formatDateTime(currentRate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')}
              </time>
              {language === 'es' ? ' (hora de Bolivia)' : ' (Bolivia time)'}
              {currentRate?.is_stale ? (language === 'es' ? ' · dato desactualizado' : ' · stale reading') : ''}
            </p>
          )}
          {rateError && !currentRate && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {language === 'es' ? 'No hay una lectura nueva. Reintentando…' : 'No new reading yet. Retrying…'}
            </p>
          )}
          <div className="mt-3 flex flex-col items-center gap-2">
            <BinanceButton placement="home_mobile_hero" className="h-11 w-full max-w-xs justify-center">
              {language === 'es' ? 'Comprar en Binance' : 'Buy on Binance'}
            </BinanceButton>
            <Link to="/calculadora" className="text-xs font-medium text-sky-700 dark:text-sky-300">
              {language === 'es' ? 'Calculadora' : 'Calculator'}
            </Link>
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
              language={language}
              buy={currentRate?.buy ?? currentRate?.buy_bob_per_usd}
              sell={currentRate?.sell ?? currentRate?.sell_bob_per_usd}
              updatedAt={currentRate?.updated_at_iso}
              sourcesUsed={currentRate?.sources_used}
              citePath="/"
              className="mt-4 max-w-3xl mx-auto"
            />
            <div className="mt-4 max-w-md mx-auto rounded-xl border border-sky-200 dark:border-sky-800 bg-white/80 dark:bg-gray-800/80 p-3">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1" htmlFor="home-quick-usd">
                {language === 'es' ? 'Convertir USD → BOB (compra P2P)' : 'Convert USD → BOB (P2P buy)'}
              </label>
              <div className="flex gap-2">
                <input
                  id="home-quick-usd"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={quickUsd}
                  onChange={(e) => setQuickUsd(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base tabular-nums min-h-[44px]"
                />
                <div className="flex items-center px-3 rounded-lg bg-sky-50 dark:bg-sky-950 text-sm font-mono font-semibold tabular-nums min-h-[44px] min-w-[7.5rem] justify-end">
                  {Number.isFinite(Number(quickUsd)) && Number.isFinite(currentRate?.buy)
                    ? `${(Number(quickUsd) * Number(currentRate.buy)).toFixed(2)} Bs`
                    : '—'}
                </div>
              </div>
              <Link to="/calculadora" className="mt-2 inline-block text-xs font-medium text-sky-700 dark:text-sky-300">
                {language === 'es' ? 'Calculadora completa →' : 'Full calculator →'}
              </Link>
              {Number.isFinite(Number(quickUsd)) && Number.isFinite(currentRate?.buy) && (
                <BinanceButton
                  placement="home_quick_convert"
                  className="mt-2 h-11 w-full justify-center text-sm"
                >
                  {language === 'es'
                    ? `Comprá $${quickUsd} en Binance`
                    : `Buy $${quickUsd} on Binance`}
                </BinanceButton>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center max-w-md mx-auto">
              {language === 'es'
                ? 'Es una mediana P2P, no un precio de ventanilla: confirmá el tipo antes de cambiar.'
                : 'This is a P2P median, not a cash-desk price — confirm the rate before you trade.'}
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

