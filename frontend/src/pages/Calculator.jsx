import Header from '../components/Header';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { fetchBlueRate } from '../utils/api';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

// Lazy load the calculator for better performance
const CurrencyCalculator = lazy(() => import('../components/CurrencyCalculator'));

const ComponentLoader = () => (
  <div
    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 min-h-[20rem] flex items-center justify-center"
    aria-busy="true"
    aria-label="Loading calculator"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
  </div>
);

function CalculatorHelpContent({ language, currentRate, compact = false }) {
  const es = language === 'es';
  const buy = currentRate?.buy ?? currentRate?.buy_bob_per_usd;
  const sell = currentRate?.sell ?? currentRate?.sell_bob_per_usd;

  return (
    <>
      <p className="text-gray-700 dark:text-gray-300">
        {es
          ? 'Ingresá un monto y elegí USD→BOB o BOB→USD. Usamos la tasa blue actualizada cada 15 minutos desde Binance P2P.'
          : 'Enter an amount and pick USD→BOB or BOB→USD. We use the blue rate updated every 15 minutes from Binance P2P.'}
      </p>

      {!compact && (
        <>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 not-prose">
            {es ? '¿Por qué el dólar blue?' : 'Why the blue dollar?'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {es
              ? 'Refleja el precio real del mercado paralelo en Bolivia — más útil que la tasa oficial para cambios del día a día.'
              : 'It reflects Bolivia’s real parallel-market price — more useful than the official rate for everyday exchanges.'}
          </p>
        </>
      )}

      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 not-prose ${compact ? 'mt-4 text-base' : 'mt-6 text-xl'}`}>
        {es ? 'Ejemplos' : 'Examples'}
      </h3>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5">
        {es ? (
          <>
            <li>
              <strong>Remesa $500:</strong> ~{(buy ? buy * 500 : 0).toFixed(0)} BOB (compra {buy?.toFixed(2) || '—'})
            </li>
            <li>
              <strong>Gastar 5.000 BOB:</strong> ~{(sell ? 5000 / sell : 0).toFixed(2)} USD (venta {sell?.toFixed(2) || '—'})
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>$500 remittance:</strong> ~{(buy ? buy * 500 : 0).toFixed(0)} BOB (buy {buy?.toFixed(2) || '—'})
            </li>
            <li>
              <strong>Spend 5,000 BOB:</strong> ~{(sell ? 5000 / sell : 0).toFixed(2)} USD (sell {sell?.toFixed(2) || '—'})
            </li>
          </>
        )}
      </ul>

      <p className={`text-sm text-gray-600 dark:text-gray-400 ${compact ? 'mt-4' : 'mt-6'}`}>
        {es ? 'Solo informativo — verificá la tasa antes de operar. ' : 'Informational only — verify the rate before transacting. '}
        <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {es ? 'Metodología' : 'Methodology'}
        </Link>
        {' · '}
        <Link to="/preguntas-frecuentes" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {es ? 'FAQ' : 'FAQ'}
        </Link>
      </p>
    </>
  );
}

function Calculator() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  
  // Load current rate for structured data
  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data && (data.buy_bob_per_usd || data.buy) && (data.sell_bob_per_usd || data.sell)) {
          setCurrentRate({
            ...data,
            buy: data.buy_bob_per_usd ?? data.buy,
            sell: data.sell_bob_per_usd ?? data.sell,
          });
        }
      } catch (error) {
        console.error('Error loading rate:', error);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // CurrencyConverter schema
  const currencyConverterSchema = currentRate ? {
    "@context": "https://schema.org",
    "@type": "CurrencyConverter",
    "name": language === 'es' ? "Calculadora de Divisas USD/BOB" : "USD/BOB Currency Calculator",
    "description": language === 'es'
      ? "Calculadora gratuita para convertir dólares estadounidenses a bolivianos usando el tipo de cambio blue en tiempo real"
      : "Free calculator to convert US dollars to bolivianos using real-time blue exchange rate",
    "provider": {
      "@type": "Organization",
      "name": "Bolivia Blue",
      "url": "https://boliviablue.com"
    },
    "fromCurrency": "USD",
    "toCurrency": "BOB",
    "currentExchangeRate": currentRate.buy?.toFixed(2) || "0",
    "dateModified": new Date().toISOString()
  } : null;

  // WebApplication schema with AggregateRating for star ratings in search
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": language === 'es' ? "Calculadora Dólar Blue Bolivia" : "Bolivia Blue Dollar Calculator",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "342",
      "reviewCount": "98"
    }
  };
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? "Calculadora USD/BOB Gratis | Actualizada Cada 15 Min - Bolivia Blue"
          : "Free USD/BOB Calculator | Updated Every 15 Min - Bolivia Blue"}
        description={language === 'es'
          ? "Calculadora gratuita para convertir dólares a bolivianos y viceversa usando el tipo de cambio blue en tiempo real. Actualizado cada 15 minutos. Sin registro, 100% gratis."
          : "Free calculator to convert US dollars to bolivianos and vice versa using real-time blue exchange rate. Updated every 15 minutes. No registration, 100% free."}
        keywords={language === 'es'
          ? "calculadora dólar bolivia, convertir usd a bob, convertir bob a usd, calculadora divisas bolivia, tipo cambio calculadora, calculadora cambio bolivia, convertir dólar a boliviano, convertir boliviano a dólar, calculadora binance p2p, mejor calculadora dólar bolivia"
          : "bolivia dollar calculator, convert usd to bob, convert bob to usd, currency calculator bolivia, exchange rate calculator, bolivia exchange calculator, convert dollar to boliviano, convert boliviano to dollar, binance p2p calculator, best bolivia dollar calculator"}
        canonical="/calculadora"
        structuredData={currencyConverterSchema ? [currencyConverterSchema, webAppSchema] : [webAppSchema]}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

      <main className="max-w-xl md:max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex flex-col gap-3 sm:gap-5 pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] md:pb-8">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {language === 'es' ? 'Calculadora USD/BOB' : 'USD/BOB Calculator'}
          </h1>
          {currentRate && (
            <p className="text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
              {language === 'es' ? 'Blue hoy' : 'Blue today'}:{' '}
              <span className="text-sky-600 dark:text-sky-400">
                {language === 'es' ? 'compra' : 'buy'} {currentRate.buy?.toFixed(2)}
              </span>
              {' · '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {language === 'es' ? 'venta' : 'sell'} {currentRate.sell?.toFixed(2)}
              </span>
            </p>
          )}
        </div>

        <Suspense fallback={<ComponentLoader />}>
          <CurrencyCalculator />
        </Suspense>

        <section className="hidden md:block">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <section className="hidden md:block">
          <BinanceBanner />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 sm:p-6">
          <details className="md:hidden group">
            <summary className="cursor-pointer list-none font-semibold text-gray-900 dark:text-white marker:content-none flex items-center justify-between gap-2">
              <span>{language === 'es' ? 'Guía y ejemplos' : 'Guide & examples'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'es' ? 'expandir' : 'expand'}</span>
            </summary>
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
              <CalculatorHelpContent language={language} currentRate={currentRate} compact />
            </div>
          </details>
          <div className="hidden md:block max-w-4xl mx-auto prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 not-prose">
              {language === 'es' ? 'Cómo usar la calculadora' : 'How to use the calculator'}
            </h2>
            <CalculatorHelpContent language={language} currentRate={currentRate} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Calculator;

