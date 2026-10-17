import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { getWebPage, getBreadcrumbList, getOrganizationSchema, getWebSiteSchema } from '../utils/seoSchema';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import PrimaryRateLink from '../components/PrimaryRateLink';
import AiCitationBlock from '../components/AiCitationBlock';
import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy';
import { bolivianBlueGuide } from '../data/bolivianBlueGuide';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BolivianBlue() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        setCurrentRate(data);
      } catch (err) {
        console.error('Error loading rate:', err);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const liveSeo = buildLiveRateSeoMeta({
    ...normalizeDollarRatePayload(currentRate), language, page: 'bolivian-blue',
  });
  const guide = bolivianBlueGuide(language);
  const rateDateModified = liveSeo.observedAt ?? undefined;
  const webPageSchema = getWebPage({
    name: liveSeo.title, description: liveSeo.answer, url: '/bolivian-blue',
    dateModified: rateDateModified, inLanguage: language === 'es' ? 'es-BO' : 'en-US',
  });
  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: 'Bolivian Blue', url: '/bolivian-blue' },
  ]);
  // Keep schema claims identical to the visible answer, including missing/stale readings.
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: language === 'es' ? '¿Qué es el Bolivian Blue?' : 'What is Bolivian Blue?',
      acceptedAnswer: { '@type': 'Answer', text: liveSeo.answer },
    }],
  };
  const brandSchemas = [getOrganizationSchema(language), getWebSiteSchema(language)]
    .map(({ description: _unverifiedDescription, ...schema }) => schema);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        includeBrandSchema={false}
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es'
          ? "bolivian blue, bolivian blue rate, bolivian blue bolivia, dólar blue bolivia, tipo de cambio bolivia, mercado paralelo bolivia, cotización dólar bolivia, precio dólar bolivia"
          : "bolivian blue, bolivian blue rate, bolivian blue bolivia, blue dollar bolivia, exchange rate bolivia, parallel market bolivia, bolivia dollar rate, bolivia dollar price"}
        canonical="/bolivian-blue"
        structuredData={[...brandSchemas, webPageSchema, breadcrumbSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={[
          { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
          { name: language === 'es' ? 'Bolivian Blue' : 'Bolivian Blue', url: '/bolivian-blue' }
        ]} />

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? 'Bolivian Blue – Tipo de Cambio Dólar Blue Bolivia'
              : 'Bolivian Blue – Bolivia Blue Dollar Exchange Rate'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{liveSeo.observation}</p>
        </div>

        <AiCitationBlock
          language={language}
          answerOverride={liveSeo.answer}
          summaryLabel={language === 'es' ? 'Referencia P2P · Bolivia Blue' : 'P2P reference · Bolivia Blue'}
          buy={currentRate?.buy_bob_per_usd}
          sell={currentRate?.sell_bob_per_usd}
          updatedAt={currentRate?.updated_at_iso}
          sourcesUsed={currentRate?.sources_used}
          citePath="/bolivian-blue"
          className="mb-6"
        />

        {/* Current Rate Cards */}
        <section className="mb-12">
          <PrimaryRateLink className="mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {language === 'es'
              ? 'Las tarjetas consultan sus propios datos y pueden mostrar una lectura distinta del resumen anterior. Conservá la hora y la unidad de cada lectura; una hora ausente no confirma que el dato sea reciente.'
              : 'The cards fetch their own data and may show a different observation from the summary above. Keep each reading’s time and unit; a missing time does not confirm freshness.'}
          </p>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} showCrossSourceBadge={false} includeExchangeSchema={false} />
        </section>

        {/* Binance Banner */}
        <section className="mb-12">
          <BinanceBanner />
        </section>

        {/* Main Content */}
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? '¿Qué es el Bolivian Blue?' : 'What is Bolivian Blue?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{liveSeo.answer}</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{guide.heading}</h2>
            {guide.items.map(([question, answer]) => (
              <section key={question} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{question}</h3>
                <p className="text-gray-700 dark:text-gray-300">{answer}</p>
              </section>
            ))}
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 hover:underline">{language === 'es' ? 'Metodología y límites' : 'Methodology and limits'}</Link>
              {' · '}
              <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline">{language === 'es' ? 'Sobre Bolivia Blue' : 'About Bolivia Blue'}</Link>
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? 'Gráfico histórico del Bolivian Blue' : 'Historical chart of Bolivian Blue'}
            </h2>
            <div className="mb-6">
              <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />}>
                <BlueChart showOfficial={showOfficial} />
              </Suspense>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'También te puede interesar' : 'You may also be interested in'}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/calculadora"
                className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Calculadora de Divisas' : 'Currency Calculator'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Convierte USD/BOB con la tasa actual' : 'Convert USD/BOB with the current rate'}
                </p>
              </Link>
              <Link
                to="/dolar-blue-hoy"
                className="block p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Cotización actual del día' : 'Today\'s current quote'}
                </p>
              </Link>
              <Link
                to="/datos-historicos"
                className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Datos históricos' : 'Historical data'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Archivo de cotizaciones pasadas' : 'Archive of past quotes'}
                </p>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default BolivianBlue;
