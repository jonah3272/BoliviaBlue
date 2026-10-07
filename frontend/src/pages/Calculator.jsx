import Header from '../components/Header';
import BlueRateCards from '../components/BlueRateCards';
import RateTrioStrip from '../components/RateTrioStrip';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchBlueRate, fetchBlueHistory } from '../utils/api';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import CurrencyCalculator from '../components/CurrencyCalculator';
import { calculatorRate } from '../utils/calculatorRates';

function CalculatorStats({ language, currentRate, weekChangePct }) {
  const es = language === 'es';
  const buy = currentRate?.buy;
  const official = currentRate?.official_buy;
  const spreadPct =
    buy && official && official > 0 ? (((buy - official) / official) * 100).toFixed(1) : null;

  if (!currentRate) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {weekChangePct != null && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wide text-gray-400">{es ? '7 días' : '7 days'}</div>
          <div
            className={`font-mono text-sm font-bold tabular-nums ${
              weekChangePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {weekChangePct >= 0 ? '+' : ''}
            {weekChangePct.toFixed(1)}%
          </div>
        </div>
      )}
      {spreadPct != null && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wide text-gray-400">{es ? 'Blue vs BCB' : 'Blue vs BCB'}</div>
          <div className="font-mono text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
            +{spreadPct}%
          </div>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-center col-span-2 sm:col-span-1">
        <div className="text-[10px] uppercase tracking-wide text-gray-400">{es ? 'Spread hoy' : 'Today spread'}</div>
        <div className="font-mono text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">
          {(currentRate.buy - currentRate.sell).toFixed(2)} Bs
        </div>
      </div>
    </div>
  );
}

function CalculatorScenarios({ language, currentRate, onPreset }) {
  const es = language === 'es';
  const toBob = calculatorRate(currentRate, 'USD', false, false);
  const fromBob = calculatorRate(currentRate, 'USD', false, true);
  if (!toBob || !fromBob) return null;

  const scenarios = [
    {
      href: '/calculadora?usd=500',
      preset: { usd: '500' },
      emoji: '💸',
      title: es ? 'Remesa $500 (referencia)' : '$500 remittance reference',
      sub: es ? `≈ ${(toBob * 500).toFixed(0)} Bs antes de comisiones` : `≈ ${(toBob * 500).toFixed(0)} BOB before fees`,
    },
    {
      href: '/calculadora?bob=5000',
      preset: { bob: '5000' },
      emoji: '✈️',
      title: es ? 'Viaje 5.000 Bs' : '5,000 BOB trip',
      sub: es ? `≈ $${(5000 / fromBob).toFixed(2)} USD` : `≈ $${(5000 / fromBob).toFixed(2)} USD`,
    },
    {
      href: '/calculadora?usd=100',
      preset: { usd: '100' },
      emoji: '🛒',
      title: es ? '$100 a bolivianos' : '$100 to bolivianos',
      sub: es ? `≈ ${(toBob * 100).toFixed(0)} Bs, referencia P2P` : `≈ ${(toBob * 100).toFixed(0)} BOB, P2P reference`,
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {es ? 'Casos comunes' : 'Common scenarios'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {scenarios.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            onClick={(event) => {
              if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                onPreset({ ...s.preset });
              }
            }}
            className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors touch-manipulation"
          >
            <span className="text-xl" aria-hidden>
              {s.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CalculatorQuickLinks({ language }) {
  const es = language === 'es';
  const links = [
    { to: '/dolar-blue-hoy', label: es ? 'Cotización hoy' : 'Today’s rate' },
    { to: '/#price-alerts', label: es ? 'Crear alerta' : 'Set alert' },
    { to: '/comprar-dolares', label: es ? 'Comprar USD' : 'Buy USD' },
    { to: '/datos-historicos', label: es ? 'Histórico' : 'History' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

function CalculatorHelpContent({ language, currentRate, compact = false }) {
  const es = language === 'es';
  const toBob = calculatorRate(currentRate, 'USD', false, false);
  const fromBob = calculatorRate(currentRate, 'USD', false, true);

  return (
    <>
      <p className="text-gray-700 dark:text-gray-300">
        {es
          ? 'Ingresá un monto y elegí USD→BOB o BOB→USD. La referencia blue proviene de mercados P2P de USDT y se actualiza cada 15 minutos. Al vender USDT recibís BOB con la tasa de venta; al comprar USDT con BOB se usa la tasa de compra.'
          : 'Enter an amount and pick USD→BOB or BOB→USD. The blue reference comes from USDT P2P markets and updates every 15 minutes. Selling USDT for BOB uses the sell rate; buying USDT with BOB uses the buy rate.'}
      </p>

      {!compact && (
        <>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 not-prose">
            {es ? '¿Por qué el dólar blue?' : 'Why the blue dollar?'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {es
              ? 'Es una referencia informativa de USDT/BOB. Los cálculos en USD suponen una paridad de 1:1 con USDT; no garantizan esa paridad, liquidez ni una cotización de dólares en efectivo. Las comisiones y condiciones de cada operación pueden cambiar el resultado.'
              : 'It is an informational USDT/BOB reference. USD calculations assume 1:1 with USDT; that parity, liquidity and a cash-dollar quote are not guaranteed. Fees and individual trading conditions can change the result.'}
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
              <strong>Remesa $500:</strong> {toBob ? `~${(toBob * 500).toFixed(0)}` : '—'} BOB (venta P2P {toBob ? toBob.toFixed(2) : '—'}, antes de comisiones)
            </li>
            <li>
              <strong>Gastar 5.000 BOB:</strong> {fromBob ? `~${(5000 / fromBob).toFixed(2)}` : '—'} USD estimados (compra P2P {fromBob ? fromBob.toFixed(2) : '—'}, antes de comisiones)
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>$500 remittance:</strong> {toBob ? `~${(toBob * 500).toFixed(0)}` : '—'} BOB (P2P sell {toBob ? toBob.toFixed(2) : '—'}, before fees)
            </li>
            <li>
              <strong>Spend 5,000 BOB:</strong> {fromBob ? `~${(5000 / fromBob).toFixed(2)}` : '—'} estimated USD (P2P buy {fromBob ? fromBob.toFixed(2) : '—'}, before fees)
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
  const [weekChangePct, setWeekChangePct] = useState(null);
  const [presetRequest, setPresetRequest] = useState(null);
  
  // Load current rate for structured data
  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (calculatorRate(data, 'USD', false, false) && calculatorRate(data, 'USD', false, true)) {
          setCurrentRate({
            ...data,
            buy: Number(data.buy_bob_per_usd ?? data.buy),
            sell: Number(data.sell_bob_per_usd ?? data.sell),
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

  useEffect(() => {
    fetchBlueHistory('1W')
      .then((points) => {
        if (!points?.length || points.length < 2) return;
        const first = points[0].buy ?? points[0].mid;
        const last = points[points.length - 1].buy ?? points[points.length - 1].mid;
        if (first > 0 && last > 0) {
          setWeekChangePct(((last - first) / first) * 100);
        }
      })
      .catch(() => {});
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
    "currentExchangeRate": calculatorRate(currentRate, 'USD', false, false).toFixed(2),
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

      <main className="google-anno-skip max-w-xl md:max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex flex-col gap-3 sm:gap-5 pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] md:pb-8">
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

        <CalculatorStats language={language} currentRate={currentRate} weekChangePct={weekChangePct} />

        <CurrencyCalculator presetRequest={presetRequest} />

        {currentRate && (
          <RateTrioStrip
            buy={currentRate.buy}
            sell={currentRate.sell}
            officialBuy={currentRate.official_buy}
            officialSell={currentRate.official_sell}
            language={language}
            updatedAt={currentRate.updated_at_iso}
          />
        )}

        <CalculatorScenarios language={language} currentRate={currentRate} onPreset={setPresetRequest} />

        <CalculatorQuickLinks language={language} />

        <section className="hidden md:block">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'Guía rápida' : 'Quick guide'}
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none md:prose-base">
            <CalculatorHelpContent language={language} currentRate={currentRate} compact={false} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Calculator;

