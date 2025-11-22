import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link, useLocation } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BoliviaBlueRate() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const location = useLocation();
  const isHoyPage = location.pathname === '/bolivia-blue-rate-hoy';
  const isActualPage = location.pathname === '/bolivia-blue-rate-actual';
  const isTipoCambioPage = location.pathname === '/tipo-cambio-blue-bolivia';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
        title={isHoyPage 
          ? (language === 'es'
            ? 'Bolivia Blue Rate Hoy - Tipo de Cambio Actual | Actualizado Cada 15 Min'
            : 'Bolivia Blue Rate Today - Current Exchange Rate | Updated Every 15 Min')
          : isActualPage
          ? (language === 'es'
            ? 'Bolivia Blue Rate Actual - Cotización en Tiempo Real | Actualizado Cada 15 Min'
            : 'Bolivia Blue Rate Current - Real-Time Quote | Updated Every 15 Min')
          : isTipoCambioPage
          ? (language === 'es'
            ? 'Tipo de Cambio Blue Bolivia - Cotización en Tiempo Real | Actualizado Cada 15 Min'
            : 'Blue Exchange Rate Bolivia - Real-Time Quote | Updated Every 15 Min')
          : (language === 'es'
            ? 'Bolivia Blue Rate - Tipo de Cambio Dólar Blue en Tiempo Real | Guía Completa'
            : 'Bolivia Blue Rate - Real-Time Blue Dollar Exchange Rate | Complete Guide')}
        description={isHoyPage
          ? (language === 'es'
            ? 'Bolivia blue rate hoy actualizado cada 15 minutos. Consulta el tipo de cambio del dólar blue en Bolivia en tiempo real. Cotización actual, gráficos y análisis. Gratis y sin registro.'
            : 'Bolivia blue rate today updated every 15 minutes. Check the real-time blue dollar exchange rate in Bolivia. Current quote, charts and analysis. Free and no registration required.')
          : isActualPage
          ? (language === 'es'
            ? 'Bolivia blue rate actual actualizado cada 15 minutos. Consulta la cotización actual del dólar blue en Bolivia en tiempo real. Mejor que bolivianblue.net - Actualizaciones más frecuentes.'
            : 'Bolivia blue rate current updated every 15 minutes. Check the current blue dollar quote in Bolivia in real-time. Better than bolivianblue.net - More frequent updates.')
          : isTipoCambioPage
          ? (language === 'es'
            ? 'Tipo de cambio blue Bolivia actualizado cada 15 minutos. Consulta la cotización del dólar blue en Bolivia en tiempo real. Datos de Binance P2P, gráficos históricos y análisis del mercado paralelo.'
            : 'Blue exchange rate Bolivia updated every 15 minutes. Check the blue dollar quote in Bolivia in real-time. Binance P2P data, historical charts and parallel market analysis.')
          : (language === 'es'
            ? 'Guía completa sobre el Bolivia blue rate y bolivia blue exchange rate. Información actualizada cada 15 minutos, gráficos históricos, análisis del mercado paralelo y todo lo que necesitas saber sobre el tipo de cambio en Bolivia.'
            : 'Complete guide about Bolivia blue rate and bolivia blue exchange rate. Information updated every 15 minutes, historical charts, parallel market analysis and everything you need to know about exchange rates in Bolivia.')}
        keywords={isHoyPage
          ? (language === 'es'
            ? "bolivia blue rate hoy, bolivia blue rate actual, tipo de cambio hoy bolivia, dólar blue hoy, cotización dólar hoy bolivia, precio dólar hoy"
            : "bolivia blue rate today, bolivia blue rate current, exchange rate today bolivia, blue dollar today, dollar quote today bolivia, dollar price today")
          : isActualPage
          ? (language === 'es'
            ? "bolivia blue rate actual, bolivia blue rate hoy, tipo de cambio actual bolivia, dólar blue actual, cotización actual dólar bolivia, precio actual dólar bolivia, mejor que bolivianblue.net"
            : "bolivia blue rate current, bolivia blue rate today, current exchange rate bolivia, current blue dollar, current dollar quote bolivia, current dollar price bolivia, better than bolivianblue.net")
          : isTipoCambioPage
          ? (language === 'es'
            ? "tipo de cambio blue bolivia, tipo cambio blue bolivia, dólar blue bolivia, cotización dólar blue bolivia, precio dólar blue bolivia, tasa cambio blue bolivia, mercado paralelo bolivia"
            : "blue exchange rate bolivia, blue dollar bolivia, blue dollar quote bolivia, blue dollar price bolivia, parallel market bolivia, bolivia blue rate")
          : (language === 'es'
            ? "bolivia blue rate, bolivia blue exchange rate, dólar blue bolivia, tipo de cambio bolivia, mercado paralelo bolivia, cotización dólar bolivia, precio dólar bolivia, tasa cambio bolivia"
            : "bolivia blue rate, bolivia blue exchange rate, blue dollar bolivia, exchange rate bolivia, parallel market bolivia, bolivia dollar rate, bolivia dollar price, bolivia exchange rate")}
        canonical="/bolivia-blue-rate"
        structuredData={articleSchema}
      />

      {/* Header */}
      <Header />

      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={[
          { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
          { name: isHoyPage 
            ? (language === 'es' ? 'Bolivia Blue Rate Hoy' : 'Bolivia Blue Rate Today')
            : isActualPage
            ? (language === 'es' ? 'Bolivia Blue Rate Actual' : 'Bolivia Blue Rate Current')
            : isTipoCambioPage
            ? (language === 'es' ? 'Tipo de Cambio Blue Bolivia' : 'Blue Exchange Rate Bolivia')
            : (language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'),
            url: isHoyPage ? '/bolivia-blue-rate-hoy' : isActualPage ? '/bolivia-blue-rate-actual' : isTipoCambioPage ? '/tipo-cambio-blue-bolivia' : '/bolivia-blue-rate' }
        ]} />

        {/* Page Title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {isHoyPage
              ? (language === 'es' 
                ? 'Bolivia Blue Rate Hoy'
                : 'Bolivia Blue Rate Today')
              : isActualPage
              ? (language === 'es'
                ? 'Bolivia Blue Rate Actual'
                : 'Bolivia Blue Rate Current')
              : isTipoCambioPage
              ? (language === 'es'
                ? 'Tipo de Cambio Blue Bolivia'
                : 'Blue Exchange Rate Bolivia')
              : (language === 'es' 
                ? 'Bolivia Blue Rate - Guía Completa'
                : 'Bolivia Blue Rate - Complete Guide')}
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'es' ? 'Última actualización:' : 'Last updated:'} {lastUpdated.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {isHoyPage
            ? (language === 'es'
              ? 'Consulta el tipo de cambio del dólar blue en Bolivia actualizado cada 15 minutos'
              : 'Check the blue dollar exchange rate in Bolivia updated every 15 minutes')
            : isActualPage
            ? (language === 'es'
              ? 'Consulta la cotización actual del dólar blue en Bolivia. Actualizado cada 15 minutos con datos en tiempo real de Binance P2P.'
              : 'Check the current blue dollar quote in Bolivia. Updated every 15 minutes with real-time data from Binance P2P.')
            : isTipoCambioPage
            ? (language === 'es'
              ? 'Consulta el tipo de cambio blue en Bolivia actualizado cada 15 minutos. Cotización en tiempo real del dólar blue, gráficos históricos y análisis del mercado paralelo.'
              : 'Check the blue exchange rate in Bolivia updated every 15 minutes. Real-time blue dollar quote, historical charts and parallel market analysis.')
            : (language === 'es'
              ? 'Todo lo que necesitas saber sobre el bolivia blue exchange rate y el mercado paralelo en Bolivia'
              : 'Everything you need to know about the bolivia blue exchange rate and parallel market in Bolivia')}
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
            <div className="grid md:grid-cols-3 gap-4">
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
              <Link
                to="/comparison"
                className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Comparación' : 'Comparison'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Compara boliviablue.com con otros sitios' : 'Compare boliviablue.com with other sites'}
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

