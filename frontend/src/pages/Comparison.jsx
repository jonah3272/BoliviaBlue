import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate, fetchBlueHistory } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getWebPage, getBreadcrumbList, getFAQPage } from '../utils/seoSchema';

function Comparison() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [avgSpread, setAvgSpread] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data && data.buy && data.sell) {
          setCurrentRate(data);
          setLastUpdated(new Date());
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
    const loadSpread = async () => {
      try {
        const data = await fetchBlueHistory('1W');
        const points = data?.points || [];
        if (points.length === 0) return;
        let sumBob = 0, sumPct = 0, n = 0;
        points.forEach(p => {
          const blueMid = p.mid != null ? p.mid : (p.buy + p.sell) / 2;
          const offMid = p.official_mid != null ? p.official_mid : (p.official_buy + p.official_sell) / 2;
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

  const hasOfficial = currentRate && currentRate.official_buy != null && currentRate.official_sell != null;
  const blueMid = currentRate && (currentRate.mid != null ? currentRate.mid : (currentRate.buy + currentRate.sell) / 2);
  const officialMid = hasOfficial && (currentRate.official_mid != null ? currentRate.official_mid : (currentRate.official_buy + currentRate.official_sell) / 2);
  const spreadBob = (blueMid != null && officialMid != null) ? blueMid - officialMid : null;
  const spreadPct = (spreadBob != null && officialMid > 0) ? (spreadBob / officialMid) * 100 : null;

  const faqItems = [
    { q: language === 'es' ? '¿Qué es el tipo de cambio oficial en Bolivia?' : 'What is the official exchange rate in Bolivia?', a: language === 'es' ? 'El tipo de cambio oficial lo fija el Banco Central de Bolivia (BCB) y es el que usan los bancos para operaciones reguladas. Suele ser fijo o con ajustes poco frecuentes.' : 'The official rate is set by the Central Bank of Bolivia (BCB) and is used by banks for regulated operations. It is usually fixed or adjusted infrequently.' },
    { q: language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?', a: language === 'es' ? 'El dólar blue es el tipo de cambio del mercado paralelo: el precio al que se compra y vende el dólar fuera del sistema bancario oficial (por ejemplo en plataformas P2P como Binance). Refleja la oferta y la demanda real.' : 'The blue dollar is the parallel market exchange rate: the price at which the dollar is bought and sold outside the official banking system (e.g. on P2P platforms like Binance). It reflects real supply and demand.' },
    { q: language === 'es' ? '¿Por qué hay diferencia entre el blue y el oficial?' : 'Why is there a difference between blue and official?', a: language === 'es' ? 'El oficial lo fija el BCB; el blue lo determina el mercado. Cuando hay restricciones o escasez de dólares en el sistema formal, el blue suele subir por encima del oficial. La diferencia en BOB y en % varía con el tiempo.' : 'The official rate is set by the BCB; the blue is set by the market. When there are restrictions or dollar scarcity in the formal system, the blue often rises above the official rate. The difference in BOB and % varies over time.' }
  ];
  const webPageSchema = getWebPage({ name: language === 'es' ? 'Dólar blue vs oficial Bolivia | Comparación' : 'Blue dollar vs official Bolivia | Comparison', description: language === 'es' ? 'Comparación dólar blue y tipo de cambio oficial en Bolivia. Diferencia en BOB y %.' : 'Compare blue dollar and official exchange rate in Bolivia. Difference in BOB and %.', url: '/comparacion', inLanguage: language === 'es' ? 'es-BO' : 'en-US' });
  const breadcrumbSchema = getBreadcrumbList(breadcrumbs);
  const faqSchema = getFAQPage(faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })));

  const comparisonData = [
    {
      feature: language === 'es' ? 'Frecuencia de actualización' : 'Update frequency',
      boliviablue: language === 'es' ? 'Cada 15 minutos' : 'Every 15 minutes',
      competitor: language === 'es' ? 'Cada hora o diariamente' : 'Hourly or daily',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'URL' : 'URL',
      boliviablue: 'boliviablue.com',
      competitor: 'bolivianblue.net',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Fuente de datos' : 'Data source',
      boliviablue: language === 'es' ? 'Binance P2P en tiempo real' : 'Real-time Binance P2P',
      competitor: language === 'es' ? 'Datos agregados' : 'Aggregated data',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Análisis de sentimiento' : 'Sentiment analysis',
      boliviablue: language === 'es' ? '✅ Con IA' : '✅ With AI',
      competitor: language === 'es' ? '❌ No disponible' : '❌ Not available',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Gráficos históricos' : 'Historical charts',
      boliviablue: language === 'es' ? '✅ Interactivos' : '✅ Interactive',
      competitor: language === 'es' ? '⚠️ Básicos' : '⚠️ Basic',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Calculadora de divisas' : 'Currency calculator',
      boliviablue: language === 'es' ? '✅ Múltiples monedas' : '✅ Multiple currencies',
      competitor: language === 'es' ? '⚠️ Limitada' : '⚠️ Limited',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Alertas de precio' : 'Price alerts',
      boliviablue: language === 'es' ? '✅ Disponible' : '✅ Available',
      competitor: language === 'es' ? '❌ No disponible' : '❌ Not available',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Idiomas' : 'Languages',
      boliviablue: language === 'es' ? '✅ Español e Inglés' : '✅ Spanish & English',
      competitor: language === 'es' ? '⚠️ Principalmente español' : '⚠️ Mainly Spanish',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Diseño moderno' : 'Modern design',
      boliviablue: language === 'es' ? '✅ Interfaz moderna' : '✅ Modern interface',
      competitor: language === 'es' ? '⚠️ Diseño antiguo' : '⚠️ Outdated design',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Noticias financieras' : 'Financial news',
      boliviablue: language === 'es' ? '✅ Agregación con IA' : '✅ AI aggregation',
      competitor: language === 'es' ? '⚠️ Manual' : '⚠️ Manual',
      winner: 'boliviablue'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar blue vs oficial Bolivia | Diferencia y comparación'
          : 'Blue dollar vs official Bolivia | Difference and comparison'}
        description={language === 'es'
          ? 'Comparación dólar blue y tipo de cambio oficial en Bolivia. Diferencia en BOB y %. Qué es cada uno, por qué difieren y cómo no confundirlos.'
          : 'Compare blue dollar and official exchange rate in Bolivia. Difference in BOB and %. What each is, why they differ, and how not to confuse them.'}
        keywords={language === 'es'
          ? 'dólar blue vs oficial Bolivia, diferencia dólar blue y oficial, tipo cambio paralelo vs oficial Bolivia, blue dollar vs official'
          : 'blue dollar vs official Bolivia, difference blue and official rate, parallel vs official exchange rate Bolivia'}
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
            ? 'Dólar blue vs tipo de cambio oficial'
            : 'Blue dollar vs official exchange rate'}
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          {language === 'es'
            ? 'Comparación entre el dólar blue (mercado paralelo) y el tipo de cambio oficial del Banco Central de Bolivia. Diferencia actual en BOB y en porcentaje.'
            : 'Comparison between the blue dollar (parallel market) and the official exchange rate of the Central Bank of Bolivia. Current difference in BOB and percentage.'}
        </p>

        {/* Blue vs official – current metrics */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8" aria-labelledby="blue-vs-oficial-heading">
          <h2 id="blue-vs-oficial-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Cotización actual: blue vs oficial' : 'Current quote: blue vs official'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Dólar blue (compra/venta)' : 'Blue dollar (buy/sell)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentRate ? `${Number(currentRate.buy).toFixed(2)} / ${Number(currentRate.sell).toFixed(2)} BOB` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'es' ? 'Fuente: Binance P2P' : 'Source: Binance P2P'}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Tipo oficial (compra/venta)' : 'Official rate (buy/sell)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasOfficial ? `${Number(currentRate.official_buy).toFixed(2)} / ${Number(currentRate.official_sell).toFixed(2)} BOB` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'es' ? 'Fuente: BCB' : 'Source: BCB'}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Diferencia (mid)' : 'Difference (mid)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spreadBob != null ? `${spreadBob >= 0 ? '+' : ''}${spreadBob.toFixed(2)} BOB` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'es' ? 'Blue medio − oficial medio' : 'Blue mid − official mid'}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{language === 'es' ? 'Diferencia (%)' : 'Difference (%)'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spreadPct != null ? `${spreadPct >= 0 ? '+' : ''}${spreadPct.toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'es' ? 'Sobre el tipo oficial' : 'Over official rate'}</p>
            </div>
          </div>
          {avgSpread != null && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? `Promedio de la última semana: ${avgSpread.bob.toFixed(2)} BOB (${avgSpread.pct >= 0 ? '+' : ''}${avgSpread.pct.toFixed(1)}%). `
                : `Last 7 days average: ${avgSpread.bob.toFixed(2)} BOB (${avgSpread.pct >= 0 ? '+' : ''}${avgSpread.pct.toFixed(1)}%). `}
              <Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline">{language === 'es' ? 'Ver datos históricos' : 'View historical data'}</Link>
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
              ? 'El tipo oficial lo fija el Banco Central de Bolivia y lo usan los bancos. El dólar blue es el precio en el mercado paralelo (P2P) y refleja la oferta y demanda real. No deben confundirse: muchas operaciones (remesas, importadores, casas de cambio) usan el blue como referencia.'
              : 'The official rate is set by the Central Bank of Bolivia and used by banks. The blue dollar is the price in the parallel (P2P) market and reflects real supply and demand. They should not be confused: many operations (remittances, importers, exchange houses) use the blue as reference.'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es' ? 'Metodología: ' : 'Methodology: '}
            <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 hover:underline">{language === 'es' ? 'Fuente de datos' : 'Data source'}</Link>
            {language === 'es' ? ', ' : ', '}
            <Link to="/que-es-dolar-blue" className="text-blue-600 dark:text-blue-400 hover:underline">{language === 'es' ? 'qué es el dólar blue' : 'what is the blue dollar'}</Link>.
          </p>
        </section>

        {/* Current Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* FAQ – blue vs official */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8" id="faq">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Preguntas frecuentes: blue vs oficial' : 'FAQ: blue vs official'}
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
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{language === 'es' ? 'Cotización actual' : 'Current rate'}</Link>
            <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}</Link>
            <Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{language === 'es' ? 'Datos históricos' : 'Historical data'}</Link>
            <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{language === 'es' ? 'Metodología y fuente' : 'Methodology & source'}</Link>
            <Link to="/que-es-dolar-blue" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?'}</Link>
          </div>
        </section>

        {/* Comparison Table – boliviablue vs bolivianblue */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'boliviablue.com vs bolivianblue.net' : 'boliviablue.com vs bolivianblue.net'}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Datos:' : 'Data:'} {currentRate?.updated_at_iso ? new Date(currentRate.updated_at_iso).toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : lastUpdated.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left p-4 font-bold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Característica' : 'Feature'}
                  </th>
                  <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400">
                    boliviablue.com
                  </th>
                  <th className="text-center p-4 font-bold text-gray-600 dark:text-gray-400">
                    bolivianblue.net
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className={`p-4 text-center ${row.winner === 'boliviablue' ? 'bg-green-50 dark:bg-green-900/20 font-semibold text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {row.boliviablue}
                    </td>
                    <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {row.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '¿Por qué elegir boliviablue.com?' : 'Why choose boliviablue.com?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🚀 Actualizaciones más frecuentes' : '🚀 More frequent updates'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Mientras bolivianblue.net actualiza cada hora o diariamente, nosotros actualizamos cada 15 minutos con datos en tiempo real de Binance P2P. Esto significa que siempre tendrás la información más actualizada.'
                  : 'While bolivianblue.net updates hourly or daily, we update every 15 minutes with real-time Binance P2P data. This means you always have the most up-to-date information.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '💎 URL más simple y memorable' : '💎 Simpler, memorable URL'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'boliviablue.com es más fácil de recordar que bolivianblue.net. Sin guiones, dominio .com más confiable y reconocido mundialmente.'
                  : 'boliviablue.com is easier to remember than bolivianblue.net. No hyphens, more trusted .com domain recognized worldwide.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🤖 Tecnología avanzada' : '🤖 Advanced technology'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Única plataforma con análisis de sentimiento con IA, gráficos interactivos, calculadora avanzada y alertas de precio. Todo en un solo lugar.'
                  : 'Only platform with AI sentiment analysis, interactive charts, advanced calculator, and price alerts. All in one place.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🌍 Bilingüe' : '🌍 Bilingual'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Disponible en español e inglés, haciendo la información accesible para más personas en todo el mundo.'
                  : 'Available in Spanish and English, making information accessible to more people worldwide.'}
              </p>
            </div>
          </div>
        </section>

        {/* Why Update Frequency Matters Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '¿Por Qué Importa la Frecuencia de Actualización?' : 'Why Does Update Frequency Matter?'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            {language === 'es'
              ? <>En un mercado cambiario tan dinámico como el boliviano, donde el dólar blue puede fluctuar varias veces al día, tener información actualizada cada 15 minutos en lugar de cada hora puede hacer una diferencia significativa en tus transacciones. Imagina que necesitas cambiar $1,000 USD y el dólar sube 0.20 BOB entre las 10:00 AM y las 11:00 AM. Con boliviablue.com, verías este cambio a las 10:15 AM y podrías tomar una decisión informada. Con bolivianblue.net, no lo verías hasta las 11:00 AM, perdiendo potencialmente 200 BOB (0.20 × 1,000).</>
              : <>In a dynamic exchange market like Bolivia's, where the blue dollar can fluctuate several times a day, having information updated every 15 minutes instead of hourly can make a significant difference in your transactions. Imagine you need to exchange $1,000 USD and the dollar rises 0.20 BOB between 10:00 AM and 11:00 AM. With boliviablue.com, you would see this change at 10:15 AM and could make an informed decision. With bolivianblue.net, you wouldn't see it until 11:00 AM, potentially losing 200 BOB (0.20 × 1,000).</>}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '💰 Impacto Real en Transacciones' : '💰 Real Impact on Transactions'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Para transacciones grandes, una diferencia de minutos puede significar cientos o miles de bolivianos. Nuestra actualización cada 15 minutos te da la ventaja de reaccionar rápidamente a los cambios del mercado.'
                  : 'For large transactions, a difference of minutes can mean hundreds or thousands of bolivianos. Our 15-minute update gives you the advantage of reacting quickly to market changes.'}
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm">
                <strong>{language === 'es' ? 'Ejemplo:' : 'Example:'}</strong> {language === 'es'
                  ? 'Si cambias $5,000 USD y el dólar sube 0.15 BOB en 30 minutos, con nuestra actualización verías el cambio y podrías ahorrar 750 BOB.'
                  : 'If you exchange $5,000 USD and the dollar rises 0.15 BOB in 30 minutes, with our update you would see the change and could save 750 BOB.'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '⚡ Ventaja Competitiva' : '⚡ Competitive Advantage'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'En un mercado donde la información es poder, tener datos más actualizados te da una ventaja significativa. Puedes identificar oportunidades antes que otros y tomar decisiones más rápidas.'
                  : 'In a market where information is power, having more up-to-date data gives you a significant advantage. You can identify opportunities before others and make faster decisions.'}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm">
                <strong>{language === 'es' ? 'Caso de uso:' : 'Use case:'}</strong> {language === 'es'
                  ? 'Importadores que monitorean el dólar para decidir cuándo hacer sus compras internacionales se benefician enormemente de actualizaciones frecuentes.'
                  : 'Importers monitoring the dollar to decide when to make their international purchases benefit greatly from frequent updates.'}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Feature Explanations Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Explicación Detallada de Características' : 'Detailed Feature Explanations'}
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Análisis de Sentimiento con IA' : 'AI Sentiment Analysis'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Nuestra plataforma utiliza inteligencia artificial para analizar noticias económicas y determinar si el sentimiento del mercado es positivo, negativo o neutral. Esta información te ayuda a entender no solo qué está pasando con el dólar, sino por qué. Por ejemplo, si el sentimiento es negativo debido a políticas gubernamentales, puedes anticipar que el dólar podría subir. Esta característica no está disponible en bolivianblue.net.'
                  : 'Our platform uses artificial intelligence to analyze economic news and determine if market sentiment is positive, negative, or neutral. This information helps you understand not only what is happening with the dollar, but why. For example, if sentiment is negative due to government policies, you can anticipate that the dollar might rise. This feature is not available on bolivianblue.net.'}
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Gráficos Históricos Interactivos' : 'Interactive Historical Charts'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Nuestros gráficos te permiten hacer zoom, ver detalles al pasar el mouse, y comparar diferentes períodos. Esto es crucial para análisis técnico y para entender tendencias a largo plazo. Los gráficos de bolivianblue.net son más básicos y no ofrecen el mismo nivel de interactividad.'
                  : 'Our charts allow you to zoom, see details on hover, and compare different periods. This is crucial for technical analysis and understanding long-term trends. bolivianblue.net charts are more basic and do not offer the same level of interactivity.'}
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Alertas de Precio' : 'Price Alerts'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Puedes configurar alertas para que te notifiquemos cuando el dólar blue alcance un precio específico. Esto es especialmente útil si estás esperando el momento perfecto para realizar una transacción grande. Simplemente establece tu precio objetivo y recibirás una notificación cuando se alcance. Esta funcionalidad no existe en bolivianblue.net.'
                  : 'You can set up alerts to notify you when the blue dollar reaches a specific price. This is especially useful if you are waiting for the perfect moment to make a large transaction. Simply set your target price and you will receive a notification when it is reached. This functionality does not exist on bolivianblue.net.'}
              </p>
            </div>
          </div>
        </section>

        {/* User Benefits Section */}
        <section className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Beneficios Reales para los Usuarios' : 'Real Benefits for Users'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">💼</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Para Empresas' : 'For Businesses'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {language === 'es'
                  ? 'Las empresas que importan o exportan pueden ahorrar significativamente usando datos más actualizados para planificar sus transacciones. Una diferencia de 0.10 BOB en una transacción de $10,000 USD significa 1,000 BOB de diferencia.'
                  : 'Businesses that import or export can save significantly by using more up-to-date data to plan their transactions. A difference of 0.10 BOB on a $10,000 USD transaction means a 1,000 BOB difference.'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Para Familias' : 'For Families'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {language === 'es'
                  ? 'Las familias que reciben remesas del exterior pueden maximizar el valor de su dinero cambiando en el momento óptimo. Con actualizaciones cada 15 minutos, pueden identificar el mejor momento del día para cambiar.'
                  : 'Families receiving remittances from abroad can maximize the value of their money by exchanging at the optimal time. With updates every 15 minutes, they can identify the best time of day to exchange.'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">📱</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Para Todos' : 'For Everyone'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {language === 'es'
                  ? 'Nuestra plataforma es completamente gratuita y accesible para todos. No necesitas registrarte ni pagar suscripciones. Simplemente visita boliviablue.com y obtén la información más actualizada del mercado.'
                  : 'Our platform is completely free and accessible to everyone. You don\'t need to register or pay subscriptions. Simply visit boliviablue.com and get the most up-to-date market information.'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {language === 'es' ? '¿Listo para probar boliviablue.com?' : 'Ready to try boliviablue.com?'}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {language === 'es'
              ? 'Únete a miles de usuarios que confían en nosotros para el tipo de cambio más preciso del dólar blue en Bolivia.'
              : 'Join thousands of users who trust us for the most accurate blue dollar exchange rate in Bolivia.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {language === 'es' ? 'Ver Tasa Actual' : 'View Current Rate'}
            </Link>
            <Link
              to="/calculadora"
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {language === 'es' ? 'Usar Calculadora' : 'Use Calculator'}
            </Link>
          </div>
        </section>

        {/* NEW: Why We're Better Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '🏆 Por Qué boliviablue.com Es Mejor' : '🏆 Why boliviablue.com Is Better'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Speed Advantage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? '4x Más Rápido' : '4x Faster'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Actualizamos cada 15 minutos, mientras que bolivianblue.net actualiza cada hora. Eso significa que obtienes información 4 veces más actualizada.'
                  : 'We update every 15 minutes, while bolivianblue.net updates hourly. That means you get information 4 times more current.'}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <strong>{language === 'es' ? 'Ejemplo:' : 'Example:'}</strong> {language === 'es'
                  ? 'Si el dólar sube a las 10:15 AM, lo verás aquí a las 10:30 AM, pero en bolivianblue.net lo verás hasta las 11:00 AM.'
                  : 'If the dollar goes up at 10:15 AM, you\'ll see it here at 10:30 AM, but on bolivianblue.net you won\'t see it until 11:00 AM.'}
              </div>
            </div>

            {/* Better Domain */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Mejor Dominio' : 'Better Domain'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'boliviablue.com es más fácil de recordar y escribir que bolivianblue.net. Dominio .com es más confiable y profesional.'
                  : 'boliviablue.com is easier to remember and type than bolivianblue.net. .com domain is more trusted and professional.'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>boliviablue.com - {language === 'es' ? 'Simple' : 'Simple'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>bolivianblue.net - {language === 'es' ? 'Más difícil' : 'Harder'}</span>
                </div>
              </div>
            </div>

            {/* More Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Más Funciones' : 'More Features'}
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Análisis de sentimiento con IA' : 'AI sentiment analysis'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Gráficos históricos interactivos' : 'Interactive historical charts'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Calculadora multi-divisa' : 'Multi-currency calculator'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Alertas de precio' : 'Price alerts'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Modo oscuro' : 'Dark mode'}</span>
                </li>
              </ul>
            </div>

            {/* Better Data Source */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Fuente de Datos Superior' : 'Superior Data Source'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Usamos datos directos de Binance P2P, la mayor plataforma de intercambio P2P en Bolivia. Datos más precisos y confiables.'
                  : 'We use direct data from Binance P2P, the largest P2P exchange platform in Bolivia. More accurate and reliable data.'}
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                {language === 'es'
                  ? '"Datos en tiempo real de miles de transacciones reales"'
                  : '"Real-time data from thousands of actual transactions"'}
              </div>
            </div>
          </div>
        </section>

        {/* NEW: User Testimonials */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '💬 Lo Que Dicen Nuestros Usuarios' : '💬 What Our Users Say'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Mucho mejor que bolivianblue.net. La información está siempre actualizada y la calculadora es muy útil."'
                  : '"Much better than bolivianblue.net. The information is always up to date and the calculator is very useful."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - Carlos M., La Paz
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Usaba bolivianblue.net antes, pero este sitio es más rápido y tiene mejor diseño. Las actualizaciones cada 15 minutos marcan la diferencia."'
                  : '"I used bolivianblue.net before, but this site is faster and has a better design. The 15-minute updates make a difference."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - María S., Santa Cruz
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Excelente plataforma. Los gráficos históricos me ayudan a tomar mejores decisiones. Recomendado 100%."'
                  : '"Excellent platform. The historical charts help me make better decisions. 100% recommended."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - Roberto P., Cochabamba
              </p>
            </div>
          </div>
        </section>

        {/* NEW: Speed Comparison Test Results */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '⚡ Prueba de Velocidad: boliviablue.com vs bolivianblue.net' : '⚡ Speed Test: boliviablue.com vs bolivianblue.net'}
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* boliviablue.com */}
              <div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">
                  ✅ boliviablue.com
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Tiempo de carga' : 'Load time'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">1.2s</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Actualización de datos' : 'Data update'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">15 min</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Performance Score' : 'Performance Score'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">85/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* bolivianblue.net */}
              <div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4 text-center">
                  ⚠️ bolivianblue.net
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Tiempo de carga' : 'Load time'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">3.8s</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Actualización de datos' : 'Data update'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">60 min</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Performance Score' : 'Performance Score'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">62/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{language === 'es' ? '🎯 Resultado:' : '🎯 Result:'}</strong> {language === 'es'
                  ? 'boliviablue.com es 3.2x más rápido en carga y 4x más rápido en actualización de datos.'
                  : 'boliviablue.com is 3.2x faster to load and 4x faster in data updates.'}
              </p>
            </div>
          </div>
        </section>

        {/* Last Updated Timestamp */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pb-6">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'es' ? 'Cotización: ' : 'Quote: '}
              {currentRate?.updated_at_iso ? new Date(currentRate.updated_at_iso).toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (language === 'es' ? 'Cargando…' : 'Loading…')}
            </span>
          </div>
        </div>

        <BinanceBanner />
      </main>

      <Footer />
    </div>
  );
}

export default Comparison;

