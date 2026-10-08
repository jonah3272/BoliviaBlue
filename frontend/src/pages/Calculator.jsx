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
import { getCalculatorPage } from '../data/calculatorPage';

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

function CalculatorPresets({ page, onPreset }) {
  return (
    <section aria-labelledby="calculator-presets-heading" className="space-y-2">
      <h2 id="calculator-presets-heading" className="text-sm font-semibold text-gray-900 dark:text-white">
        {page.presetsHeading}
      </h2>
      <nav className="flex flex-wrap gap-2" aria-label={page.presetsHeading}>
        {page.presets.map(({ href, label, preset }) => (
          <Link
            key={href}
            to={href}
            onClick={(event) => {
              if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                onPreset({ ...preset });
              }
            }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-sky-700 dark:text-sky-300 hover:border-sky-400 transition-colors touch-manipulation"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-gray-600 dark:text-gray-400">{page.presetsNote}</p>
    </section>
  );
}

function CalculatorQuickLinks({ language }) {
  const es = language === 'es';
  const links = [
    { to: '/dolar-blue-hoy', label: es ? 'Cotización hoy' : 'Today’s rate' },
    { to: '/#price-alerts', label: es ? 'Crear alerta' : 'Set alert' },
    { to: '/comprar-dolares', label: es ? 'Guía para comprar o vender USDT' : 'Guide to buying or selling USDT' },
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

function CalculatorHelpContent({ page }) {
  return (
    <>
      {page.sections.map(({ id, title, paragraphs }) => (
        <section key={id} id={id}>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-6 mb-3 not-prose">{title}</h3>
          {paragraphs.map((paragraph) => <p key={paragraph} className="text-gray-700 dark:text-gray-300">{paragraph}</p>)}
        </section>
      ))}
      <p className="mt-6 text-sm">
        <Link to={page.methodology.href} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {page.methodology.label}
        </Link>
      </p>
    </>
  );
}

function Calculator() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const page = getCalculatorPage(language);
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [weekChangePct, setWeekChangePct] = useState(null);
  const [presetRequest, setPresetRequest] = useState(null);
  
  // Load current rates for the visible comparison cards
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

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={page.title}
        description={page.description}
        canonical="/calculadora"
        structuredData={[page.webAppSchema]}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

      <main className="google-anno-skip max-w-xl md:max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex flex-col gap-3 sm:gap-5 pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] md:pb-8">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {page.heading}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{page.introduction}</p>
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

        <CalculatorPresets page={page} onPreset={setPresetRequest} />

        <CalculatorQuickLinks language={language} />

        <section className="hidden md:block">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {page.helpHeading}
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none md:prose-base">
            <CalculatorHelpContent page={page} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Calculator;

