import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));

function BoliviaBlueRate() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
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
    const interval = setInterval(loadRate, 15 * 60 * 1000); // Update every 15 minutes
    return () => clearInterval(interval);
  }, []);

  // Structured data for this page
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "Bolivia Blue Rate - Tipo de Cambio Dólar Blue en Tiempo Real"
      : "Bolivia Blue Rate - Real-Time Blue Dollar Exchange Rate",
    "description": language === 'es'
      ? "Guía completa sobre el Bolivia blue rate y bolivia blue exchange rate. Información actualizada cada 15 minutos, gráficos históricos y análisis del mercado paralelo en Bolivia."
      : "Complete guide about Bolivia blue rate and bolivia blue exchange rate. Information updated every 15 minutes, historical charts and analysis of Bolivia's parallel market.",
    "author": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz",
      "logo": {
        "@type": "ImageObject",
        "url": "https://boliviablue.com/favicon.svg"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Bolivia Blue Rate - Tipo de Cambio Dólar Blue en Tiempo Real | Guía Completa'
          : 'Bolivia Blue Rate - Real-Time Blue Dollar Exchange Rate | Complete Guide'}
        description={language === 'es'
          ? 'Guía completa sobre el Bolivia blue rate y bolivia blue exchange rate. Información actualizada cada 15 minutos, gráficos históricos, análisis del mercado paralelo y todo lo que necesitas saber sobre el tipo de cambio en Bolivia.'
          : 'Complete guide about Bolivia blue rate and bolivia blue exchange rate. Information updated every 15 minutes, historical charts, parallel market analysis and everything you need to know about exchange rates in Bolivia.'}
        keywords={language === 'es'
          ? "bolivia blue rate, bolivia blue exchange rate, dólar blue bolivia, tipo de cambio bolivia, mercado paralelo bolivia, cotización dólar bolivia, precio dólar bolivia, tasa cambio bolivia"
          : "bolivia blue rate, bolivia blue exchange rate, blue dollar bolivia, exchange rate bolivia, parallel market bolivia, bolivia dollar rate, bolivia dollar price, bolivia exchange rate"}
        canonical="/bolivia-blue-rate"
        structuredData={articleSchema}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t('title')}
                </div>
                <p className="hidden md:block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </Link>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                {language === 'es' ? 'Inicio' : 'Home'}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-600">/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              {language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'}
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'es' 
            ? 'Bolivia Blue Rate - Guía Completa'
            : 'Bolivia Blue Rate - Complete Guide'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {language === 'es'
            ? 'Todo lo que necesitas saber sobre el bolivia blue exchange rate y el mercado paralelo en Bolivia'
            : 'Everything you need to know about the bolivia blue exchange rate and parallel market in Bolivia'}
        </p>

        {/* Current Rate Cards */}
        <section className="mb-12">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Binance Banner */}
        <section className="mb-12">
          <BinanceBanner />
        </section>

        {/* Main Content */}
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? '¿Qué es el Bolivia Blue Rate?' : 'What is Bolivia Blue Rate?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? 'El <strong>Bolivia blue rate</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como <strong>bolivia blue exchange rate</strong>, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. A diferencia de la tasa oficial establecida por el Banco Central de Bolivia, el <strong>bolivia blue rate</strong> fluctúa según la oferta y demanda del mercado.'
                : 'The <strong>Bolivia blue rate</strong> is the exchange rate of the US dollar in Bolivia\'s parallel market. Also known as the <strong>bolivia blue exchange rate</strong>, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. Unlike the official rate set by the Central Bank of Bolivia, the <strong>Bolivia blue rate</strong> fluctuates according to market supply and demand.'}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Cómo se Calcula el Bolivia Blue Exchange Rate?' : 'How is Bolivia Blue Exchange Rate Calculated?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? 'Nuestra plataforma calcula el <strong>bolivia blue rate</strong> utilizando datos en tiempo real de Binance P2P para el par USDT/BOB. Procesamos las ofertas públicas de compra y venta, calculando la mediana de estas ofertas para obtener una estimación representativa del <strong>bolivia blue exchange rate</strong>. Este método nos permite proporcionar una tasa precisa que refleja las condiciones reales del mercado paralelo. <Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende más sobre nuestra metodología</Link>.'
                : 'Our platform calculates the <strong>Bolivia blue rate</strong> using real-time data from Binance P2P for the USDT/BOB pair. We process public buy and sell offers, calculating the median of these offers to obtain a representative estimate of the <strong>Bolivia blue exchange rate</strong>. This method allows us to provide an accurate rate that reflects the real conditions of the parallel market. <Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn more about our methodology</Link>.'}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Por qué es Importante el Bolivia Blue Rate?' : 'Why is Bolivia Blue Rate Important?'}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
              {language === 'es' ? (
                <>
                  <li>El <strong>bolivia blue rate</strong> refleja la realidad del mercado cambiario boliviano, no solo la tasa oficial</li>
                  <li>Millones de bolivianos utilizan el <strong>bolivia blue exchange rate</strong> para transacciones diarias</li>
                  <li>Conocer el <strong>bolivia blue rate</strong> te ayuda a tomar mejores decisiones financieras</li>
                  <li>El <strong>bolivia blue exchange rate</strong> puede diferir significativamente de la tasa oficial, a veces en un 10-20%</li>
                  <li>Para importadores, exportadores y personas que reciben remesas, el <strong>bolivia blue rate</strong> es crucial</li>
                </>
              ) : (
                <>
                  <li>The <strong>Bolivia blue rate</strong> reflects the reality of Bolivia\'s exchange market, not just the official rate</li>
                  <li>Millions of Bolivians use the <strong>Bolivia blue exchange rate</strong> for daily transactions</li>
                  <li>Knowing the <strong>Bolivia blue rate</strong> helps you make better financial decisions</li>
                  <li>The <strong>Bolivia blue exchange rate</strong> can differ significantly from the official rate, sometimes by 10-20%</li>
                  <li>For importers, exporters, and people receiving remittances, the <strong>Bolivia blue rate</strong> is crucial</li>
                </>
              )}
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Diferencia entre Bolivia Blue Rate y Tasa Oficial' : 'Difference between Bolivia Blue Rate and Official Rate'}
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'La tasa oficial del Banco Central de Bolivia es fija o se ajusta muy raramente. Por el contrario, el <strong>bolivia blue rate</strong> fluctúa constantemente según las condiciones del mercado. El <strong>bolivia blue exchange rate</strong> generalmente es más alto que la tasa oficial, reflejando la escasez de dólares en el mercado formal.'
                  : 'The official rate from the Central Bank of Bolivia is fixed or adjusted very rarely. In contrast, the <strong>Bolivia blue rate</strong> fluctuates constantly according to market conditions. The <strong>Bolivia blue exchange rate</strong> is generally higher than the official rate, reflecting the scarcity of dollars in the formal market.'}
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Con qué Frecuencia se Actualiza el Bolivia Blue Exchange Rate?' : 'How Often is Bolivia Blue Exchange Rate Updated?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? 'Nuestra plataforma actualiza el <strong>bolivia blue rate</strong> cada 15 minutos utilizando datos en tiempo real de Binance P2P. Esto garantiza que siempre tengas acceso a la información más precisa y actualizada sobre el <strong>bolivia blue exchange rate</strong>.'
                : 'Our platform updates the <strong>Bolivia blue rate</strong> every 15 minutes using real-time data from Binance P2P. This ensures you always have access to the most accurate and up-to-date information about the <strong>Bolivia blue exchange rate</strong>.'}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Gráfico Histórico del Bolivia Blue Rate' : 'Historical Chart of Bolivia Blue Rate'}
            </h2>
            <div className="mb-6">
              <Suspense fallback={
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 animate-pulse">
                  <div className="h-64"></div>
                </div>
              }>
                <BlueChart showOfficial={showOfficial} />
              </Suspense>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Recursos Adicionales' : 'Additional Resources'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/calculator"
                className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Calculadora de Divisas' : 'Currency Calculator'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Calcula conversiones usando el bolivia blue rate' : 'Calculate conversions using the bolivia blue rate'}
                </p>
              </Link>
              <Link
                to="/blog"
                className="block p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Blog y Guías' : 'Blog and Guides'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Aprende más sobre el mercado cambiario' : 'Learn more about the exchange market'}
                </p>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default BoliviaBlueRate;

