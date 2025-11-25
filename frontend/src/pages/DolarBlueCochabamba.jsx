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

function DolarBlueCochabamba() {
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "Dólar Blue Cochabamba - Cotización en Tiempo Real | Actualizado Cada 15 Min"
      : "Blue Dollar Cochabamba - Real-Time Quote | Updated Every 15 Min",
    "description": language === 'es'
      ? "Dólar blue Cochabamba actualizado cada 15 minutos. Consulta la cotización del dólar blue en Cochabamba, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en Cochabamba."
      : "Blue dollar Cochabamba updated every 15 minutes. Check the blue dollar quote in Cochabamba, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in Cochabamba.",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Cuál es el dólar blue en Cochabamba?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue en Cochabamba es actualmente de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cambiar dólares en Cochabamba?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En Cochabamba puedes cambiar dólares en casas de cambio no oficiales ubicadas principalmente en el centro de la ciudad, plataformas P2P como Binance, o particulares que operan en el mercado paralelo. También puedes usar nuestra plataforma para verificar la cotización actual antes de cambiar."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the blue dollar in Cochabamba?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar in Cochabamba is currently approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar Blue Cochabamba - Cotización en Tiempo Real | Actualizado Cada 15 Min'
          : 'Blue Dollar Cochabamba - Real-Time Quote | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Dólar blue Cochabamba actualizado cada 15 minutos. Consulta la cotización del dólar blue en Cochabamba, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en Cochabamba. Gratis y sin registro.'
          : 'Blue dollar Cochabamba updated every 15 minutes. Check the blue dollar quote in Cochabamba, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in Cochabamba. Free and no registration required.'}
        keywords={language === 'es'
          ? "dólar blue cochabamba, dólar blue bolivia cochabamba, tipo cambio cochabamba, cotización dólar blue cochabamba, precio dólar blue cochabamba, dónde cambiar dólares cochabamba, cambio dólares cochabamba, dólar paralelo cochabamba, mejor que bolivianblue.net"
          : "blue dollar cochabamba, blue dollar bolivia cochabamba, exchange rate cochabamba, blue dollar quote cochabamba, blue dollar price cochabamba, where to exchange dollars cochabamba, exchange dollars cochabamba, parallel dollar cochabamba"}
        canonical="/dolar-blue-cochabamba"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Dólar Blue Cochabamba', path: '/dolar-blue-cochabamba' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Blue Dollar Cochabamba', path: '/dolar-blue-cochabamba' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'Dólar Blue Cochabamba - Cotización en Tiempo Real'
            : 'Blue Dollar Cochabamba - Real-Time Quote'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Consulta la cotización del dólar blue en Cochabamba actualizada cada 15 minutos con datos en tiempo real de Binance P2P'
            : 'Check the blue dollar quote in Cochabamba updated every 15 minutes with real-time data from Binance P2P'}
        </p>

        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <section>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          }>
            <BlueChart showOfficial={showOfficial} />
          </Suspense>
        </section>

        <section>
          <BinanceBanner />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === 'es' 
                ? 'Dólar Blue en Cochabamba - Información Completa'
                : 'Blue Dollar in Cochabamba - Complete Information'}
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>El <strong>dólar blue en Cochabamba</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de la tercera ciudad más grande de Bolivia. La cotización del <strong>dólar blue Cochabamba</strong> se actualiza cada 15 minutos en nuestra plataforma utilizando datos en tiempo real de Binance P2P, proporcionando la información más precisa sobre el <strong>tipo de cambio en Cochabamba</strong>.</>
                  : <>The <strong>blue dollar in Cochabamba</strong> is the exchange rate of the US dollar in the parallel market of Bolivia's third largest city. The <strong>blue dollar Cochabamba</strong> quote is updated every 15 minutes on our platform using real-time data from Binance P2P, providing the most accurate information about the <strong>exchange rate in Cochabamba</strong>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cambiar Dólares en Cochabamba?'
                  : 'Where to Exchange Dollars in Cochabamba?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Casas de cambio no oficiales</strong> - Ubicadas principalmente en el centro de Cochabamba, cerca de la Plaza 14 de Septiembre</li>
                    <li><strong>Plataformas P2P</strong> - Como Binance P2P, donde puedes ver ofertas de compra y venta en tiempo real</li>
                    <li><strong>Particulares</strong> - Personas que intercambian dólares fuera del sistema oficial</li>
                    <li><strong>Nuestra plataforma</strong> - Consulta la cotización actual antes de cambiar para obtener el mejor precio</li>
                  </>
                ) : (
                  <>
                    <li><strong>Unofficial exchange houses</strong> - Located mainly in downtown Cochabamba, near Plaza 14 de Septiembre</li>
                    <li><strong>P2P platforms</strong> - Like Binance P2P, where you can see buy and sell offers in real-time</li>
                    <li><strong>Individuals</strong> - People exchanging dollars outside the official system</li>
                    <li><strong>Our platform</strong> - Check the current quote before exchanging to get the best price</li>
                  </>
                )}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? <>La cotización del <strong>dólar blue en Cochabamba</strong> se actualiza cada 15 minutos. Esta cotización es solo informativa y puede variar según la ubicación específica y el método de pago. Siempre verifica la cotización antes de realizar transacciones. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende cómo comprar dólares</Link>.</>
                    : <>The <strong>blue dollar in Cochabamba</strong> quote is updated every 15 minutes. This quote is for informational purposes only and may vary by specific location and payment method. Always verify the quote before making transactions. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn how to buy dollars</Link>.</>}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Páginas Relacionadas' : 'Related Pages'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/dolar-blue-hoy"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Dólar Blue Hoy' : 'Blue Dollar Today'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización actual' : 'Current quote'}
              </div>
            </Link>
            <Link
              to="/calculadora"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Calculadora' : 'Calculator'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Convierte divisas' : 'Convert currencies'}
              </div>
            </Link>
            <Link
              to="/comprar-dolares"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Comprar Dólares' : 'Buy Dollars'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Guía completa' : 'Complete guide'}
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default DolarBlueCochabamba;


