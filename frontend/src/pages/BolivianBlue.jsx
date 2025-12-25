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
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BolivianBlue() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        setCurrentRate(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading rate:', err);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Structured data for this page
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "Bolivian Blue - Tipo de Cambio Dólar Blue Bolivia | Actualizado Cada 15 Min"
      : "Bolivian Blue - Blue Dollar Exchange Rate Bolivia | Updated Every 15 Min",
    "description": language === 'es'
      ? "Bolivian Blue - Tipo de Cambio Dólar Blue en Tiempo Real. Actualizado cada 15 minutos. Gráficos históricos, calculadora gratuita y noticias. La información más precisa del mercado paralelo boliviano."
      : "Bolivian Blue - Real-Time Blue Dollar Exchange Rate. Updated every 15 minutes. Historical charts, free calculator and news. The most accurate information on the Bolivian parallel market.",
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
    "datePublished": "2025-01-20",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es el Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El Bolivian Blue es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. Actualmente, el Bolivian Blue es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde puedo ver el Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes ver el Bolivian Blue en nuestra plataforma boliviablue.com, que actualiza la cotización cada 15 minutos con datos en tiempo real de Binance P2P. También puedes consultar otras plataformas, pero nuestra actualización es más frecuente que la mayoría."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo se calcula el Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Bolivian Blue se calcula utilizando datos en tiempo real de Binance P2P para el par USDT/BOB. Procesamos las ofertas públicas de compra y venta, calculando la mediana de estas ofertas para obtener una estimación representativa del tipo de cambio del mercado paralelo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre el Bolivian Blue y la tasa oficial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Bolivian Blue refleja el mercado paralelo y puede diferir significativamente de la tasa oficial del Banco Central de Bolivia. La tasa oficial es fija o se ajusta muy raramente, mientras que el Bolivian Blue fluctúa según la oferta y demanda del mercado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué es importante conocer el Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Conocer el Bolivian Blue es importante porque refleja la realidad del mercado cambiario boliviano y es utilizado por millones de bolivianos para transacciones diarias. Te ayuda a tomar mejores decisiones financieras y entender el verdadero valor del dólar en Bolivia."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Bolivian Blue is the exchange rate of the US dollar in Bolivia's parallel market. Currently, the Bolivian Blue is approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "Where can I see the Bolivian Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can see the Bolivian Blue on our platform boliviablue.com, which updates the quote every 15 minutes with real-time data from Binance P2P. You can also check other platforms, but our update frequency is higher than most."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Bolivian Blue - Tipo de Cambio Dólar Blue Bolivia | Actualizado Cada 15 Min'
          : 'Bolivian Blue - Blue Dollar Exchange Rate Bolivia | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Bolivian Blue - Tipo de Cambio Dólar Blue en Tiempo Real. Actualizado cada 15 minutos. Gráficos históricos, calculadora gratuita y noticias. La información más precisa del mercado paralelo boliviano. Consulta ahora.'
          : 'Bolivian Blue - Real-Time Blue Dollar Exchange Rate. Updated every 15 minutes. Historical charts, free calculator and news. The most accurate information on the Bolivian parallel market. Check now.'}
        keywords={language === 'es'
          ? "bolivian blue, bolivian blue rate, bolivian blue exchange rate, dólar blue bolivia, tipo de cambio bolivia, mercado paralelo bolivia, cotización dólar bolivia, precio dólar bolivia, mejor que bolivianblue.net"
          : "bolivian blue, bolivian blue rate, bolivian blue exchange rate, blue dollar bolivia, exchange rate bolivia, parallel market bolivia, bolivia dollar rate, bolivia dollar price, better than bolivianblue.net"}
        canonical="/bolivian-blue"
        structuredData={[articleSchema, faqSchema]}
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
              ? 'Bolivian Blue - Tipo de Cambio Dólar Blue Bolivia'
              : 'Bolivian Blue - Blue Dollar Exchange Rate Bolivia'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === 'es'
              ? `Última actualización: ${lastUpdated.toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : `Last updated: ${lastUpdated.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>

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
              {language === 'es' ? '¿Qué es el Bolivian Blue?' : 'What is Bolivian Blue?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? <>El <strong>Bolivian Blue</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como <strong>bolivian blue rate</strong> o <strong>bolivian blue exchange rate</strong>, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. A diferencia de la tasa oficial establecida por el Banco Central de Bolivia, el <strong>Bolivian Blue</strong> fluctúa constantemente según la oferta y demanda del mercado.</>
                : <>The <strong>Bolivian Blue</strong> is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the <strong>bolivian blue rate</strong> or <strong>bolivian blue exchange rate</strong>, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. Unlike the official rate set by the Central Bank of Bolivia, the <strong>Bolivian Blue</strong> fluctuates constantly according to market supply and demand.</>}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Cómo se Calcula el Bolivian Blue?' : 'How is Bolivian Blue Calculated?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? <>Nuestra plataforma calcula el <strong>Bolivian Blue</strong> utilizando datos en tiempo real de Binance P2P para el par USDT/BOB. Procesamos las ofertas públicas de compra y venta, calculando la mediana de estas ofertas para obtener una estimación representativa del <strong>bolivian blue rate</strong>. Este método nos permite proporcionar una tasa precisa que refleja las condiciones reales del mercado paralelo. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende más sobre nuestra metodología</Link>.</>
                : <>Our platform calculates the <strong>Bolivian Blue</strong> using real-time data from Binance P2P for the USDT/BOB pair. We process public buy and sell offers, calculating the median of these offers to obtain a representative estimate of the <strong>bolivian blue rate</strong>. This method allows us to provide an accurate rate that reflects the real conditions of the parallel market. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn more about our methodology</Link>.</>}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Por qué es Importante el Bolivian Blue?' : 'Why is Bolivian Blue Important?'}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
              {language === 'es' ? (
                <>
                  <li>El <strong>Bolivian Blue</strong> refleja la realidad del mercado cambiario boliviano, no solo la tasa oficial</li>
                  <li>Millones de bolivianos utilizan el <strong>bolivian blue rate</strong> para transacciones diarias</li>
                  <li>Conocer el <strong>Bolivian Blue</strong> te ayuda a tomar mejores decisiones financieras</li>
                  <li>El <strong>bolivian blue exchange rate</strong> puede diferir significativamente de la tasa oficial, a veces en un 10-20%</li>
                  <li>Para importadores, exportadores y personas que reciben remesas, el <strong>Bolivian Blue</strong> es crucial</li>
                </>
              ) : (
                <>
                  <li>The <strong>Bolivian Blue</strong> reflects the reality of Bolivia's exchange market, not just the official rate</li>
                  <li>Millions of Bolivians use the <strong>bolivian blue rate</strong> for daily transactions</li>
                  <li>Knowing the <strong>Bolivian Blue</strong> helps you make better financial decisions</li>
                  <li>The <strong>bolivian blue exchange rate</strong> can differ significantly from the official rate, sometimes by 10-20%</li>
                  <li>For importers, exporters, and people receiving remittances, the <strong>Bolivian Blue</strong> is crucial</li>
                </>
              )}
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Diferencia entre Bolivian Blue y Tasa Oficial' : 'Difference between Bolivian Blue and Official Rate'}
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'La tasa oficial del Banco Central de Bolivia es fija o se ajusta muy raramente. Por el contrario, el <strong>Bolivian Blue</strong> fluctúa constantemente según las condiciones del mercado. El <strong>bolivian blue rate</strong> generalmente es más alto que la tasa oficial, reflejando la escasez de dólares en el mercado formal.'
                  : 'The official rate from the Central Bank of Bolivia is fixed or adjusted very rarely. In contrast, the <strong>Bolivian Blue</strong> fluctuates constantly according to market conditions. The <strong>bolivian blue rate</strong> is generally higher than the official rate, reflecting the scarcity of dollars in the formal market.'}
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? '¿Con qué Frecuencia se Actualiza el Bolivian Blue?' : 'How Often is Bolivian Blue Updated?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? <>Nuestra plataforma actualiza el <strong>Bolivian Blue</strong> cada 15 minutos utilizando datos en tiempo real de Binance P2P. Esto garantiza que siempre tengas acceso a la información más precisa y actualizada sobre el <strong>bolivian blue rate</strong>. Esta frecuencia de actualización es superior a la mayoría de otras plataformas, como bolivianblue.net, que actualizan con menor frecuencia.</>
                : <>Our platform updates the <strong>Bolivian Blue</strong> every 15 minutes using real-time data from Binance P2P. This ensures you always have access to the most accurate and up-to-date information about the <strong>bolivian blue rate</strong>. This update frequency is higher than most other platforms, such as bolivianblue.net, which update less frequently.</>}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Gráfico Histórico del Bolivian Blue' : 'Historical Chart of Bolivian Blue'}
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

            {/* FAQ Section */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Preguntas Frecuentes sobre el Bolivian Blue' : 'Frequently Asked Questions about Bolivian Blue'}
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '¿Qué es el Bolivian Blue?' : 'What is Bolivian Blue?'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? `El Bolivian Blue es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. Actualmente, el Bolivian Blue es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta.`
                    : `Bolivian Blue is the exchange rate of the US dollar in Bolivia's parallel market. Currently, the Bolivian Blue is approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling.`}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '¿Dónde puedo ver el Bolivian Blue?' : 'Where can I see the Bolivian Blue?'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? 'Puedes ver el Bolivian Blue en nuestra plataforma boliviablue.com, que actualiza la cotización cada 15 minutos con datos en tiempo real de Binance P2P. También puedes consultar otras plataformas, pero nuestra actualización es más frecuente que la mayoría.'
                    : 'You can see the Bolivian Blue on our platform boliviablue.com, which updates the quote every 15 minutes with real-time data from Binance P2P. You can also check other platforms, but our update frequency is higher than most.'}
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              {language === 'es' ? 'Recursos Adicionales' : 'Additional Resources'}
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
                  {language === 'es' ? 'Calcula conversiones usando el Bolivian Blue' : 'Calculate conversions using the Bolivian Blue'}
                </p>
              </Link>
              <Link
                to="/dolar-blue-hoy"
                className="block p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Dólar Blue Hoy' : 'Blue Dollar Today'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Consulta la cotización actual' : 'Check the current quote'}
                </p>
              </Link>
              <Link
                to="/bolivia-blue-rate"
                className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Guía completa' : 'Complete guide'}
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












