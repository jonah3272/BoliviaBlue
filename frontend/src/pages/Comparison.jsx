import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate, fetchBlueHistory } from '../utils/api';
import { officialRateModel } from '../utils/officialRate';
import { observationLabel, sourceObservationModel } from '../utils/sourceObservation';
import OfficialRateNote from '../components/OfficialRateNote';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getWebPage, getBreadcrumbList, getFAQPage } from '../utils/seoSchema';
import { trackComparisonPageViewed, trackRelatedLinkClicked } from '../utils/analyticsEvents';

function Comparison() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const comparisonViewedRef = useRef(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [avgSpread, setAvgSpread] = useState(null);

  const trackRel = (destination, link_label) => () =>
    trackRelatedLinkClicked({ language, destination, link_label, page_type: 'comparison' });

  useEffect(() => {
    if (comparisonViewedRef.current) return;
    comparisonViewedRef.current = true;
    trackComparisonPageViewed({ language });
  }, [language]);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data && data.buy && data.sell) {
          setCurrentRate(data);
        }
      } catch (error) {
        console.error('Error loading rate:', error);
      } finally {
        setRateLoading(false);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSpread = async () => {
      try {
        const data = await fetchBlueHistory('1W');
        const points = data?.points || [];
        if (points.length === 0) return;
        let sumBob = 0, sumPct = 0, n = 0;
        points.forEach(p => {
          const blueMid = p.mid != null ? p.mid : (p.buy + p.sell) / 2;
          const offMid = officialRateModel(p).official_mid;
          if (Number.isFinite(blueMid) && Number.isFinite(offMid) && offMid > 0) {
            sumBob += blueMid - offMid;
            sumPct += ((blueMid - offMid) / offMid) * 100;
            n++;
          }
        });
        if (n > 0) setAvgSpread({ bob: sumBob / n, pct: sumPct / n });
      } catch (e) { /* ignore */ }
    };
    loadSpread();
  }, []);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Comparación' : 'Comparison', url: '/comparacion' }
  ];

  const p2p = sourceObservationModel(currentRate);
  const official = officialRateModel(currentRate, language);
  const hasOfficial = official.available;
  const hasP2p = p2p.buy != null && p2p.sell != null;
  const blueMid = hasP2p ? (p2p.buy + p2p.sell) / 2 : null;
  const canCompare = hasP2p && p2p.observedAt && !p2p.stale && official.available && !official.stale;
  const officialMid = official.official_mid;
  const spreadBob = canCompare && Number.isFinite(officialMid) ? blueMid - officialMid : null;
  const spreadPct = (spreadBob != null && officialMid > 0) ? (spreadBob / officialMid) * 100 : null;

  const faqItems = [
    {
      q:
        language === 'es'
          ? '¿Qué es el valor referencial del dólar estadounidense (BCB)?'
          : 'What is the US Dollar reference rate (BCB)?',
      a:
        language === 'es'
          ? 'El BCB publica el tipo de cambio oficial (TCO), una mediana ponderada por monto de compras elegibles de dólares estadounidenses. No es una cotización garantizada de efectivo o tarjeta.'
          : 'The BCB publishes the official exchange rate (TCO), a volume-weighted median of eligible US-dollar purchases. It is not a guaranteed cash or card quote.',
    },
    { q: language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?', a: language === 'es' ? 'El dólar blue es el tipo de cambio del mercado paralelo. En esta página usamos una referencia agregada de precios públicos P2P USDT/BOB para aproximarlo. No es una cotización garantizada de dólares en efectivo.' : 'The blue dollar is the parallel market exchange rate. On this page we approximate it with an aggregated reference from public P2P USDT/BOB prices. It is not a guaranteed cash-dollar quote.' },
    {
      q:
        language === 'es'
          ? '¿Por qué hay diferencia entre el blue y el valor referencial?'
          : 'Why is there a difference between blue and the reference rate?',
      a:
        language === 'es'
          ? 'El BCB calcula su referencia con operaciones elegibles de compra de USD. El mercado P2P muestra ofertas por USDT, con otros participantes, medios de pago y condiciones. Por eso la brecha puede cambiar con el tiempo.'
          : 'The BCB calculates its reference from eligible USD purchases. The P2P market lists offers for USDT, with different participants, payment methods and terms. The gap can therefore change over time.',
    }
  ];
  const webPageSchema = getWebPage({
    name:
      language === 'es'
        ? 'Dólar blue vs valor referencial (BCB) Bolivia | Comparación'
        : 'Blue dollar vs US Dollar reference rate (BCB) Bolivia | Comparison',
    description:
      language === 'es'
        ? 'Comparación dólar blue y valor referencial del dólar estadounidense (BCB) en Bolivia. Diferencia en BOB y %. Qué es cada uno y por qué difieren.'
        : 'Compare blue dollar and the US Dollar reference rate (BCB) in Bolivia. Difference in BOB and %. What each is and why they differ.',
    url: '/comparacion',
    inLanguage: language === 'es' ? 'es-BO' : 'en-US',
  });
  const breadcrumbSchema = getBreadcrumbList(breadcrumbs);
  const faqSchema = getFAQPage(faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })));

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar blue vs valor referencial (BCB) Bolivia | Diferencia y comparación'
          : 'Blue dollar vs US Dollar reference rate (BCB) Bolivia | Difference and comparison'}
        description={language === 'es'
          ? 'Comparación dólar blue y valor referencial del dólar estadounidense (BCB) en Bolivia. Diferencia en BOB y %. Qué es cada uno, por qué difieren y cómo no confundirlos.'
          : 'Compare blue dollar and the US Dollar reference rate (BCB) in Bolivia. Difference in BOB and %. What each is, why they differ, and how not to confuse them.'}
        keywords={language === 'es'
          ? 'dólar blue vs valor referencial BCB, diferencia dólar blue y valor referencial, valor referencial del dólar estadounidense BCB Bolivia, blue dollar vs US dollar reference rate (BCB)'
          : 'blue dollar vs US dollar reference rate (BCB), difference blue and reference rate, US dollar reference rate (BCB) Bolivia'}
        canonical="/comparacion"
        structuredData={[webPageSchema, breadcrumbSchema, faqSchema]}
      />
      
      {/* Header */}
      <Header />

      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {language === 'es'
            ? 'Dólar blue vs valor referencial del dólar estadounidense (BCB)'
            : 'Blue dollar vs US Dollar reference rate (BCB)'}
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          {language === 'es'
            ? 'Comparación entre el dólar blue (mercado paralelo) y el valor referencial del dólar estadounidense (BCB). Brecha en bolivianos y en porcentaje, cuando ambas lecturas permiten compararlas.'
            : 'Comparison between the blue dollar (parallel market) and the US Dollar reference rate (BCB). See the gap in bolivianos and as a percentage when both readings can be compared.'}
        </p>

        {/* Blue vs official – current metrics */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8" aria-labelledby="blue-vs-oficial-heading">
          <h2 id="blue-vs-oficial-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Últimas lecturas: referencia P2P y BCB' : 'Latest observations: P2P and BCB references'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Referencia P2P (compras / vendes USDT)' : 'P2P reference (you buy / sell USDT)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasP2p ? `${p2p.buy.toFixed(2)} / ${p2p.sell.toFixed(2)} BOB/USDT` : '—'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {p2p.observedAt ? (
                  <>
                    {language === 'es' ? 'Lectura P2P: ' : 'P2P observed: '}
                    <time dateTime={p2p.observedAt}>{observationLabel(p2p.observedAt, language)}</time>
                  </>
                ) : rateLoading ? (language === 'es' ? 'Cargando lectura…' : 'Loading observation…') : observationLabel(null, language)}
                {p2p.stale && <span className="block font-medium">{language === 'es' ? 'Lectura desactualizada' : 'Stale observation'}</span>}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {p2p.available && <>{p2p.platforms.map(platform => platform.name).join(', ')}.{' '}</>}
                <Link
                  to={language === 'es' ? '/fuente-de-datos' : '/fuente-de-datos?lang=en'}
                  onClick={trackRel('/fuente-de-datos', 'quote_methodology')}
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  {language === 'es' ? 'Metodología P2P' : 'P2P methodology'}
                </Link>
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {language === 'es' ? 'Tipo de cambio oficial (BCB)' : 'Official exchange rate (BCB)'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasOfficial ? `${officialMid.toFixed(2)} BOB/USD` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><OfficialRateNote rate={official} language={language} /></p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Brecha de referencia' : 'Reference gap'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spreadBob != null ? `${spreadBob >= 0 ? '+' : ''}${spreadBob.toFixed(2)} BOB` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'es' ? 'Punto medio P2P menos TCO' : 'P2P midpoint minus TCO'}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Diferencia (%)' : 'Difference (%)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spreadPct != null ? `${spreadPct >= 0 ? '+' : ''}${spreadPct.toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {language === 'es' ? 'Sobre el valor referencial (BCB)' : 'Over the reference rate (BCB)'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {language === 'es'
              ? 'En P2P, compra = BOB que pagás por 1 USDT; venta = BOB que recibís por 1 USDT, antes de comisiones. La brecha compara el punto medio P2P con el TCO del BCB. Son referencias distintas: no representan el precio de una misma operación en efectivo y la brecha no es un ahorro estimado.'
              : 'For P2P, buy = BOB you pay for 1 USDT; sell = BOB you receive for 1 USDT, before fees. The gap compares the P2P midpoint with the BCB official rate (TCO). These benchmarks do not price the same cash transaction, so the gap is not an estimate of savings.'}
          </p>
          {!rateLoading && !canCompare && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'es' ? 'La brecha se muestra solo cuando ambas referencias están disponibles y no están marcadas como desactualizadas, y la lectura P2P tiene fecha.' : 'The gap is shown only when both references are available and not marked stale, and the P2P observation has a timestamp.'}
            </p>
          )}
          {avgSpread != null && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? `Promedio de las lecturas comparables de los últimos siete días: ${avgSpread.bob.toFixed(2)} BOB (${avgSpread.pct >= 0 ? '+' : ''}${avgSpread.pct.toFixed(1)}%). `
                : `Average of comparable readings over the last seven days: ${avgSpread.bob.toFixed(2)} BOB (${avgSpread.pct >= 0 ? '+' : ''}${avgSpread.pct.toFixed(1)}%). `}
              <Link
                to={language === 'es' ? '/datos-historicos' : '/datos-historicos?lang=en'}
                onClick={trackRel('/datos-historicos', 'view_historical_data')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === 'es' ? 'Ver datos históricos' : 'View historical data'}
              </Link>
            </p>
          )}
        </section>

        {/* What is being compared – short explanation */}
        <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'Qué se compara y por qué importa' : 'What is compared and why it matters'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {language === 'es'
              ? 'El TCO del Banco Central de Bolivia (BCB) refleja operaciones elegibles de compra de dólares. La referencia P2P de esta página toma la mediana de las cotizaciones por plataforma, por separado para compra y venta. Las fuentes disponibles pueden cambiar entre lecturas, incluso quedar una sola. El precio final depende del monto, método de pago, contraparte y comisiones.'
              : 'The Central Bank of Bolivia’s official rate (TCO) reflects eligible US-dollar purchases. Our P2P reference takes the median of per-platform quotes, separately for buy and sell. Available sources can change between readings, and sometimes only one is available. The final price depends on amount, payment method, counterparty and fees.'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es' ? 'Metodología: ' : 'Methodology: '}
            <Link
              to={language === 'es' ? '/fuente-de-datos' : '/fuente-de-datos?lang=en'}
              onClick={trackRel('/fuente-de-datos', 'methodology')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'es' ? 'Fuente de datos' : 'Data source'}
            </Link>
            {language === 'es' ? ', ' : ', '}
            <Link
              to={language === 'es' ? '/que-es-dolar-blue' : '/que-es-dolar-blue?lang=en'}
              onClick={trackRel('/que-es-dolar-blue', 'what_is_blue')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'es' ? 'qué es el dólar blue' : 'what is the blue dollar'}
            </Link>
            .
          </p>
        </section>

        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 sm:p-8" aria-labelledby="compare-other-quotes">
          <h2 id="compare-other-quotes" className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'Cómo comparar con otra cotización' : 'How to compare with another quote'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {language === 'es'
              ? 'Al comparar con otro sitio, como BolivianBlue.net, revisá la hora de la lectura, la moneda (USD en efectivo o USDT), el sentido de la operación y si incluye comisiones. Para decidir cómo pagar, usá tu cotización real de efectivo y la tasa neta de tu tarjeta.'
              : 'When comparing with another site such as BolivianBlue.net, check the observation time, currency (cash USD or USDT), transaction direction, and whether fees are included. To decide how to pay, use your actual cash quote and your card’s net rate.'}
          </p>
          <Link
            to={language === 'es' ? '/efectivo-o-tarjeta-bolivia' : '/efectivo-o-tarjeta-bolivia?lang=en'}
            onClick={trackRel('/efectivo-o-tarjeta-bolivia', 'cash_card_compare')}
            className="text-blue-700 dark:text-blue-300 underline font-medium"
          >
            {language === 'es' ? 'Comparar efectivo y tarjeta' : 'Compare cash and card'}
          </Link>
        </section>

        {/* FAQ – blue vs official */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8" id="faq">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Preguntas frecuentes: blue vs valor referencial' : 'FAQ: blue vs reference rate'}
          </h2>
          <div className="space-y-4">
            {faqItems.map(({ q, a }, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{q}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-8">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
            {language === 'es' ? 'Enlaces relacionados' : 'Related links'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to={language === 'es' ? '/' : '/?lang=en'} onClick={trackRel('/', 'current_rate')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? 'Cotización actual' : 'Current rate'}
            </Link>
            <Link
              to={language === 'es' ? '/dolar-blue-hoy' : '/dolar-blue-hoy?lang=en'}
              onClick={trackRel('/dolar-blue-hoy', 'dolar_blue_hoy')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
            </Link>
            <Link
              to={language === 'es' ? '/datos-historicos' : '/datos-historicos?lang=en'}
              onClick={trackRel('/datos-historicos', 'historical')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Datos históricos' : 'Historical data'}
            </Link>
            <Link
              to={language === 'es' ? '/fuente-de-datos' : '/fuente-de-datos?lang=en'}
              onClick={trackRel('/fuente-de-datos', 'methodology_footer')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Metodología y fuente' : 'Methodology & source'}
            </Link>
            <Link
              to={language === 'es' ? '/que-es-dolar-blue' : '/que-es-dolar-blue?lang=en'}
              onClick={trackRel('/que-es-dolar-blue', 'what_is_blue_footer')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?'}
            </Link>
          </div>
        </section>

        <BinanceBanner />
      </main>

      <Footer />
    </div>
  );
}

export default Comparison;

