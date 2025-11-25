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

function CuantoEstaDolarBolivia() {
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
      ? "¿Cuánto Está el Dólar en Bolivia? Precio Actual 2025 | Actualizado Cada 15 Min"
      : "How Much is the Dollar in Bolivia? Current Price 2025 | Updated Every 15 Min",
    "description": language === 'es'
      ? "¿Cuánto está el dólar en Bolivia? Consulta el precio actual del dólar blue en Bolivia. Cotización en tiempo real actualizada cada 15 minutos. Gráficos históricos y calculadora gratuita."
      : "How much is the dollar in Bolivia? Check the current blue dollar price in Bolivia. Real-time quote updated every 15 minutes. Historical charts and free calculator.",
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
        "name": "¿Cuánto está el dólar en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue en Bolivia está actualmente en aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto vale el dólar en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue vale actualmente aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD. Esto significa que 1 dólar estadounidense equivale a ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} bolivianos en el mercado paralelo.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es $100 USD en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Con el dólar blue actual (${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD), $100 USD equivalen a aproximadamente ${((currentRate?.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB. Con la tasa oficial (~9.00 BOB/USD) serían solo 900 BOB. La diferencia puede ser significativa.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 1 USD a 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue actualmente fluctúa alrededor de ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD. Esto significa que 1 USD equivale a aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB, mientras que 1 BOB equivale a aproximadamente ${(1 / (currentRate?.buy_bob_per_usd || 10.50)).toFixed(4)} USD.`
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How much is the dollar in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar in Bolivia is currently approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "How much is $100 USD in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `With the current blue dollar (${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD), $100 USD equals approximately ${((currentRate?.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB. With the official rate (~9.00 BOB/USD) it would only be 900 BOB. The difference can be significant.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? '¿Cuánto Está el Dólar en Bolivia? Precio Actual 2025 | Actualizado Cada 15 Min'
          : 'How Much is the Dollar in Bolivia? Current Price 2025 | Updated Every 15 Min'}
        description={language === 'es'
          ? '¿Cuánto está el dólar en Bolivia? Consulta el precio actual del dólar blue en Bolivia. Cotización en tiempo real actualizada cada 15 minutos. Gráficos históricos y calculadora gratuita. Gratis y sin registro.'
          : 'How much is the dollar in Bolivia? Check the current blue dollar price in Bolivia. Real-time quote updated every 15 minutes. Historical charts and free calculator. Free and no registration required.'}
        keywords={language === 'es'
          ? "cuánto está el dólar en bolivia, cuánto vale el dólar en bolivia, precio dólar bolivia, cotización dólar bolivia, cuánto es el dólar en bolivia, precio dólar blue bolivia, cuánto cuesta el dólar en bolivia, mejor que bolivianblue.net"
          : "how much is dollar in bolivia, dollar price bolivia, dollar quote bolivia, how much is dollar bolivia, blue dollar price bolivia, dollar cost bolivia"}
        canonical="/cuanto-esta-dolar-bolivia"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: '¿Cuánto Está el Dólar?', path: '/cuanto-esta-dolar-bolivia' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'How Much is the Dollar?', path: '/cuanto-esta-dolar-bolivia' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? '¿Cuánto Está el Dólar en Bolivia?'
            : 'How Much is the Dollar in Bolivia?'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? `Última actualización: ${lastUpdated.toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}`
            : `Last updated: ${lastUpdated.toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}`}
        </p>

        {/* Rate Cards - Prominently Displayed */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Quick Answer Section */}
        <section className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' 
                ? 'Respuesta Rápida'
                : 'Quick Answer'}
            </h2>
            {currentRate && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? 'Compra' : 'Buy'}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentRate.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {language === 'es' ? 'por 1 USD' : 'per 1 USD'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? 'Venta' : 'Sell'}
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentRate.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {language === 'es' ? 'por 1 USD' : 'per 1 USD'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? '$100 USD =' : '$100 USD ='}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {((currentRate.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {language === 'es' ? 'Aproximadamente' : 'Approximately'}
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? 'Cotización del dólar blue actualizada cada 15 minutos con datos en tiempo real de Binance P2P'
                : 'Blue dollar quote updated every 15 minutes with real-time data from Binance P2P'}
            </p>
          </div>
        </section>

        {/* Chart */}
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

        {/* Binance Banner */}
        <section>
          <BinanceBanner />
        </section>

        {/* Main Content */}
        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? 'Precio Actual del Dólar en Bolivia'
                  : 'Current Dollar Price in Bolivia'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es' 
                  ? <>El precio del dólar en Bolivia varía según si hablamos del <strong>dólar oficial</strong> o del <strong>dólar blue</strong> (mercado paralelo). El dólar blue, que es el que mostramos en esta página, refleja el precio real del dólar en el mercado boliviano y se actualiza cada 15 minutos.</>
                  : <>The dollar price in Bolivia varies depending on whether we're talking about the <strong>official dollar</strong> or the <strong>blue dollar</strong> (parallel market). The blue dollar, which is what we show on this page, reflects the real price of the dollar in the Bolivian market and is updated every 15 minutes.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Conversiones Comunes'
                  : 'Common Conversions'}
              </h3>
              {currentRate && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    {language === 'es' ? (
                      <>
                        <li><strong>$1 USD</strong> = {currentRate.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB</li>
                        <li><strong>$10 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 10).toFixed(2)} BOB</li>
                        <li><strong>$50 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 50).toFixed(2)} BOB</li>
                        <li><strong>$100 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB</li>
                        <li><strong>$500 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 500).toFixed(2)} BOB</li>
                        <li><strong>$1000 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 1000).toFixed(2)} BOB</li>
                      </>
                    ) : (
                      <>
                        <li><strong>$1 USD</strong> = {currentRate.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB</li>
                        <li><strong>$10 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 10).toFixed(2)} BOB</li>
                        <li><strong>$50 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 50).toFixed(2)} BOB</li>
                        <li><strong>$100 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB</li>
                        <li><strong>$500 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 500).toFixed(2)} BOB</li>
                        <li><strong>$1000 USD</strong> = {((currentRate.buy_bob_per_usd || 10.50) * 1000).toFixed(2)} BOB</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de Divisas' : '💡 Currency Calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>¿Necesitas convertir otra cantidad? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir cualquier cantidad de dólares a bolivianos o viceversa usando el tipo de cambio actual.</>
                    : <>Need to convert another amount? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert any amount of dollars to bolivianos or vice versa using the current exchange rate.</>}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Páginas Relacionadas' : 'Related Pages'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
              to="/que-es-dolar-blue"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? '¿Qué es el Dólar Blue?' : 'What is Blue Dollar?'}
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

export default CuantoEstaDolarBolivia;


