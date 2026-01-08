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

function CotizaDolarParalelo() {
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
      ? "Cotiza el Dólar Paralelo en Bolivia - Cotización en Tiempo Real"
      : "Quote the Parallel Dollar in Bolivia - Real-Time Quote",
    "description": language === 'es'
      ? "Cotiza el dólar paralelo en Bolivia con datos actualizados cada 15 minutos. Consulta la cotización del dólar blue, tipo de cambio paralelo y precio actual del dólar en el mercado informal."
      : "Quote the parallel dollar in Bolivia with data updated every 15 minutes. Check the blue dollar quote, parallel exchange rate and current dollar price in the informal market.",
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
        "name": "¿Cómo cotizar el dólar paralelo en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Para cotizar el dólar paralelo en Bolivia, puedes usar nuestra plataforma que actualiza la cotización cada 15 minutos con datos de Binance P2P. El dólar paralelo (también conocido como dólar blue) es el tipo de cambio del mercado informal y puede diferir significativamente del tipo oficial del Banco Central de Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cotizar el dólar paralelo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes cotizar el dólar paralelo en nuestra plataforma boliviablue.com, que proporciona cotizaciones actualizadas cada 15 minutos. También puedes consultar casas de cambio no oficiales, plataformas P2P como Binance, o particulares que operan en el mercado paralelo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la cotización actual del dólar paralelo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `La cotización actual del dólar paralelo en Bolivia es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué cotizar el dólar paralelo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cotizar el dólar paralelo es importante porque refleja el precio real del dólar en el mercado boliviano. A diferencia del tipo de cambio oficial que puede tener restricciones, el dólar paralelo muestra la oferta y demanda real. Muchos bolivianos usan esta cotización para transacciones diarias y decisiones financieras."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How to quote the parallel dollar in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To quote the parallel dollar in Bolivia, you can use our platform which updates the quote every 15 minutes with data from Binance P2P. The parallel dollar (also known as blue dollar) is the exchange rate of the informal market and can differ significantly from the official rate of the Central Bank of Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "Where to quote the parallel dollar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can quote the parallel dollar on our platform boliviablue.com, which provides quotes updated every 15 minutes. You can also check unofficial exchange houses, P2P platforms like Binance, or individuals operating in the parallel market."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Cotiza el Dólar Paralelo en Bolivia - Cotización en Tiempo Real | Actualizado Cada 15 Min'
          : 'Quote the Parallel Dollar in Bolivia - Real-Time Quote | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Cotiza el dólar paralelo en Bolivia con datos actualizados cada 15 minutos. Consulta la cotización del dólar blue, tipo de cambio paralelo, precio actual del dólar en el mercado informal. Gratis y sin registro.'
          : 'Quote the parallel dollar in Bolivia with data updated every 15 minutes. Check the blue dollar quote, parallel exchange rate, current dollar price in the informal market. Free and no registration required.'}
        keywords={language === 'es'
          ? "cotiza el dólar paralelo, cotización dólar paralelo, cotizar dólar paralelo bolivia, cotiza dólar blue, cotización dólar blue bolivia, cotizar dólar blue, dólar paralelo cotización, cotización dólar paralelo hoy, cotizar dólar paralelo actual, precio dólar paralelo, cotización mercado paralelo, dólar blue cotización, cotizar dólar bolivia, cotización dólar bolivia paralelo, mejor que bolivianblue.net"
          : "quote parallel dollar, parallel dollar quote, quote blue dollar bolivia, parallel dollar price, blue dollar quote, quote dollar bolivia, parallel market quote, bolivia parallel dollar"}
        canonical="/cotiza-dolar-paralelo"
        noindex={true} // Temporarily noindex due to templated/query-based content
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Cotiza el Dólar Paralelo', path: '/cotiza-dolar-paralelo' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Quote Parallel Dollar', path: '/cotiza-dolar-paralelo' }
              ]}
        />

        {/* H1 with Target Keyword */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'Cotiza el Dólar Paralelo en Bolivia - Cotización en Tiempo Real'
            : 'Quote the Parallel Dollar in Bolivia - Real-Time Quote'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Consulta la cotización del dólar paralelo (dólar blue) actualizada cada 15 minutos con datos en tiempo real de Binance P2P'
            : 'Check the parallel dollar (blue dollar) quote updated every 15 minutes with real-time data from Binance P2P'}
        </p>

        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
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

        {/* Main Content Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === 'es' 
                ? '¿Cómo Cotizar el Dólar Paralelo en Bolivia?'
                : 'How to Quote the Parallel Dollar in Bolivia?'}
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>Para <strong>cotizar el dólar paralelo</strong> en Bolivia, nuestra plataforma te proporciona la <strong>cotización del dólar paralelo</strong> actualizada cada 15 minutos. El <strong>dólar paralelo</strong> (también conocido como <strong>dólar blue</strong>) es el tipo de cambio que se negocia en el mercado informal de Bolivia, fuera del sistema bancario oficial.</>
                  : <>To <strong>quote the parallel dollar</strong> in Bolivia, our platform provides you with the <strong>parallel dollar quote</strong> updated every 15 minutes. The <strong>parallel dollar</strong> (also known as <strong>blue dollar</strong>) is the exchange rate traded in Bolivia's informal market, outside the official banking system.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por qué Cotizar el Dólar Paralelo?'
                  : 'Why Quote the Parallel Dollar?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li>El <strong>dólar paralelo</strong> refleja el precio real del dólar en el mercado boliviano</li>
                    <li>La <strong>cotización del dólar paralelo</strong> puede diferir significativamente del tipo oficial</li>
                    <li>Muchos bolivianos usan esta <strong>cotización</strong> para transacciones diarias</li>
                    <li>El <strong>dólar blue</strong> es más accesible que el dólar oficial cuando hay restricciones</li>
                  </>
                ) : (
                  <>
                    <li>The <strong>parallel dollar</strong> reflects the real price of the dollar in the Bolivian market</li>
                    <li>The <strong>parallel dollar quote</strong> can differ significantly from the official rate</li>
                    <li>Many Bolivians use this <strong>quote</strong> for daily transactions</li>
                    <li>The <strong>blue dollar</strong> is more accessible than the official dollar when there are restrictions</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cotizar el Dólar Paralelo?'
                  : 'Where to Quote the Parallel Dollar?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Puedes <strong>cotizar el dólar paralelo</strong> en varios lugares:</>
                  : <>You can <strong>quote the parallel dollar</strong> in several places:</>}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Nuestra plataforma</strong> - Cotización actualizada cada 15 minutos con datos de Binance P2P</li>
                    <li><strong>Plataformas P2P</strong> - Como Binance P2P, donde puedes ver ofertas de compra y venta</li>
                    <li><strong>Casas de cambio no oficiales</strong> - Que operan en el mercado paralelo</li>
                    <li><strong>Particulares</strong> - Personas que intercambian dólares fuera del sistema oficial</li>
                  </>
                ) : (
                  <>
                    <li><strong>Our platform</strong> - Quote updated every 15 minutes with Binance P2P data</li>
                    <li><strong>P2P platforms</strong> - Like Binance P2P, where you can see buy and sell offers</li>
                    <li><strong>Unofficial exchange houses</strong> - Operating in the parallel market</li>
                    <li><strong>Individuals</strong> - People exchanging dollars outside the official system</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Cómo Funciona la Cotización del Dólar Paralelo?'
                  : 'How Does the Parallel Dollar Quote Work?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Nuestra plataforma calcula la <strong>cotización del dólar paralelo</strong> utilizando datos en tiempo real de Binance P2P para el par USDT/BOB. Recopilamos ofertas públicas de compra y venta, calculamos la mediana de estas ofertas para obtener una <strong>cotización</strong> representativa del mercado paralelo. Esta metodología nos permite proporcionar una <strong>cotización</strong> precisa que refleja las condiciones reales del mercado.</>
                  : <>Our platform calculates the <strong>parallel dollar quote</strong> using real-time data from Binance P2P for the USDT/BOB pair. We collect public buy and sell offers, calculate the median of these offers to obtain a representative <strong>quote</strong> of the parallel market. This methodology allows us to provide an accurate <strong>quote</strong> that reflects the real market conditions.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan la Cotización del Dólar Paralelo'
                  : 'Factors Affecting the Parallel Dollar Quote'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Varios factores influyen en la cotización del dólar paralelo en Bolivia:'
                  : 'Several factors influence the parallel dollar quote in Bolivia:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Oferta y demanda:</strong> Cuando hay más demanda que oferta, la cotización sube</li>
                    <li><strong>Restricciones cambiarias:</strong> Limitaciones en el acceso al dólar oficial aumentan la demanda en el mercado paralelo</li>
                    <li><strong>Noticias económicas:</strong> Eventos importantes pueden causar fluctuaciones rápidas</li>
                    <li><strong>Políticas gubernamentales:</strong> Decisiones del gobierno y el Banco Central afectan directamente el mercado</li>
                    <li><strong>Inflación:</strong> La inflación puede aumentar la demanda de dólares como protección de valor</li>
                    <li><strong>Confianza económica:</strong> La falta de confianza en la moneda local aumenta la demanda de dólares</li>
                    <li><strong>Factores internacionales:</strong> Condiciones económicas globales y precios de commodities</li>
                  </>
                ) : (
                  <>
                    <li><strong>Supply and demand:</strong> When there is more demand than supply, the quote rises</li>
                    <li><strong>Exchange restrictions:</strong> Limitations in access to the official dollar increase demand in the parallel market</li>
                    <li><strong>Economic news:</strong> Important events can cause rapid fluctuations</li>
                    <li><strong>Government policies:</strong> Government and Central Bank decisions directly affect the market</li>
                    <li><strong>Inflation:</strong> Inflation can increase demand for dollars as a store of value</li>
                    <li><strong>Economic confidence:</strong> Lack of confidence in the local currency increases dollar demand</li>
                    <li><strong>International factors:</strong> Global economic conditions and commodity prices</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Diferencia entre Dólar Paralelo y Dólar Oficial'
                  : 'Difference between Parallel Dollar and Official Dollar'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Es crucial entender las diferencias entre el dólar paralelo y el dólar oficial:'
                  : 'It\'s crucial to understand the differences between the parallel dollar and the official dollar:'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Aspecto' : 'Aspect'}
                      </th>
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Dólar Paralelo' : 'Parallel Dollar'}
                      </th>
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Dólar Oficial' : 'Official Dollar'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2">
                        {language === 'es' ? 'Precio' : 'Price'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Determinado por oferta y demanda' : 'Determined by supply and demand'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Fijo o controlado por BCB' : 'Fixed or controlled by BCB'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2">
                        {language === 'es' ? 'Disponibilidad' : 'Availability'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Mercado paralelo, sin restricciones' : 'Parallel market, no restrictions'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Bancos oficiales, con restricciones' : 'Official banks, with restrictions'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2">
                        {language === 'es' ? 'Actualización' : 'Update Frequency'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Cada 15 minutos' : 'Every 15 minutes'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Muy rara vez' : 'Very rarely'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        {language === 'es' ? 'Accesibilidad' : 'Accessibility'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Alta, sin límites formales' : 'High, no formal limits'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Limitada, con restricciones' : 'Limited, with restrictions'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Usar la Cotización del Dólar Paralelo'
                  : 'How to Use the Parallel Dollar Quote'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'La cotización del dólar paralelo es útil para varios propósitos:'
                  : 'The parallel dollar quote is useful for several purposes:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Planificación financiera:</strong> Usa la cotización para planificar tus transacciones y presupuestos</li>
                    <li><strong>Comparación:</strong> Compara la cotización del dólar paralelo con la oficial para entender la brecha cambiaria</li>
                    <li><strong>Decisiones de cambio:</strong> Decide cuándo es el mejor momento para cambiar dólares</li>
                    <li><strong>Negociación:</strong> Usa la cotización como referencia al negociar con operadores</li>
                    <li><strong>Análisis de tendencias:</strong> Observa las tendencias históricas para anticipar movimientos futuros</li>
                  </>
                ) : (
                  <>
                    <li><strong>Financial planning:</strong> Use the quote to plan your transactions and budgets</li>
                    <li><strong>Comparison:</strong> Compare the parallel dollar quote with the official one to understand the exchange gap</li>
                    <li><strong>Exchange decisions:</strong> Decide when is the best time to exchange dollars</li>
                    <li><strong>Negotiation:</strong> Use the quote as a reference when negotiating with operators</li>
                    <li><strong>Trend analysis:</strong> Observe historical trends to anticipate future movements</li>
                  </>
                )}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? <>La <strong>cotización del dólar paralelo</strong> se actualiza cada 15 minutos. Esta <strong>cotización</strong> es solo informativa y puede variar según la ubicación y el método de pago. Siempre verifica la <strong>cotización</strong> antes de realizar transacciones. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende más sobre nuestra metodología</Link>.</>
                    : <>The <strong>parallel dollar quote</strong> is updated every 15 minutes. This <strong>quote</strong> is for informational purposes only and may vary by location and payment method. Always verify the <strong>quote</strong> before making transactions. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn more about our methodology</Link>.</>}
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
              to="/bolivia-blue-rate-hoy"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Bolivia Blue Rate Hoy' : 'Bolivia Blue Rate Today'}
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

export default CotizaDolarParalelo;



