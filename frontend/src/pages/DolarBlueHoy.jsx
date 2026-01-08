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

function DolarBlueHoy() {
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
      ? "Dólar Blue Hoy - Cotización Actual del Dólar Blue en Bolivia | Actualizado Cada 15 Min"
      : "Blue Dollar Today - Current Blue Dollar Quote in Bolivia | Updated Every 15 Min",
    "description": language === 'es'
      ? "Dólar blue hoy actualizado cada 15 minutos. Consulta la cotización actual del dólar blue en Bolivia hoy. Precio en tiempo real, gráficos históricos y análisis del mercado paralelo."
      : "Blue dollar today updated every 15 minutes. Check the current blue dollar quote in Bolivia today. Real-time price, historical charts and parallel market analysis.",
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
        "name": "¿Cuál es el dólar blue hoy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue hoy es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el dólar blue hoy en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue hoy en Bolivia es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD. Esta cotización refleja el mercado paralelo y se actualiza cada 15 minutos en nuestra plataforma.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde ver el dólar blue hoy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes ver el dólar blue hoy en nuestra plataforma boliviablue.com, que actualiza la cotización cada 15 minutos con datos en tiempo real de Binance P2P. También puedes consultar otras plataformas, pero nuestra actualización es más frecuente que la mayoría."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the blue dollar today?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar today is approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      }
    ]
  };

  const today = new Date().toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar Blue Hoy - Cotización Actual del Dólar Blue en Bolivia | Actualizado Cada 15 Min'
          : 'Blue Dollar Today - Current Blue Dollar Quote in Bolivia | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Dólar Blue Hoy Bolivia - Cotización Actual Actualizada Cada 15 Min. La información más precisa del mercado paralelo. Consulta el precio ahora. Gratis, sin registro.'
          : 'Blue Dollar Today Bolivia - Current Quote Updated Every 15 Min. The most accurate information on the parallel market. Check the price now. Free, no registration required.'}
        keywords={language === 'es'
          ? "dólar blue hoy, dólar blue hoy bolivia, dólar blue hoy en bolivia, cotización dólar blue hoy, precio dólar blue hoy, dólar blue hoy actual, dólar blue hoy la paz, tipo cambio hoy bolivia, mejor que bolivianblue.net"
          : "blue dollar today, blue dollar today bolivia, blue dollar quote today, blue dollar price today, blue dollar current today, exchange rate today bolivia"}
        canonical="/dolar-blue-hoy"
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
                { label: 'Dólar Blue Hoy', path: '/dolar-blue-hoy' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Blue Dollar Today', path: '/dolar-blue-hoy' }
              ]}
        />

        <div className="text-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {language === 'es' ? 'Hoy es' : 'Today is'} {today}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            {language === 'es' 
              ? 'Dólar Blue Hoy Bolivia - Cotización Actual'
              : 'Blue Dollar Today Bolivia - Current Quote'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {language === 'es'
              ? `Última actualización: ${lastUpdated.toLocaleTimeString(language === 'es' ? 'es-BO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
              : `Last updated: ${lastUpdated.toLocaleTimeString(language === 'es' ? 'es-BO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>

        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Today's Rate Highlight */}
        {currentRate && (
          <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 border-2 border-green-200 dark:border-green-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? 'Cotización del Dólar Blue Hoy'
                  : 'Blue Dollar Quote Today'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'es' ? 'Compra' : 'Buy'}
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {currentRate.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {language === 'es' ? 'por 1 USD' : 'per 1 USD'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'es' ? 'Venta' : 'Sell'}
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {currentRate.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {language === 'es' ? 'por 1 USD' : 'per 1 USD'}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                {language === 'es'
                  ? 'Actualizado cada 15 minutos con datos en tiempo real de Binance P2P'
                  : 'Updated every 15 minutes with real-time data from Binance P2P'}
              </p>
            </div>
          </section>
        )}

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
                  ? 'Dólar Blue Hoy - Información Actualizada'
                  : 'Blue Dollar Today - Updated Information'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es' 
                  ? <>El <strong>dólar blue hoy</strong> refleja el precio actual del dólar estadounidense en el mercado paralelo de Bolivia. Esta cotización se actualiza cada 15 minutos utilizando datos en tiempo real de Binance P2P, proporcionándote la información más precisa sobre el <strong>dólar blue hoy en Bolivia</strong>. Consulta el <strong>dólar blue hoy</strong> para conocer la cotización actualizada y tomar mejores decisiones financieras. El <strong>dólar blue hoy</strong> puede variar durante el día, por lo que es importante verificar la cotización antes de realizar transacciones.</>
                  : <>The <strong>blue dollar today</strong> reflects the current price of the US dollar in Bolivia's parallel market. This quote is updated every 15 minutes using real-time data from Binance P2P, providing you with the most accurate information about the <strong>blue dollar today in Bolivia</strong>. Check the <strong>blue dollar today</strong> to know the updated quote and make better financial decisions. The <strong>blue dollar today</strong> can vary during the day, so it's important to verify the quote before making transactions.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por qué Consultar el Dólar Blue Hoy?'
                  : 'Why Check the Blue Dollar Today?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li>El <strong>dólar blue hoy</strong> puede variar significativamente durante el día</li>
                    <li>Es importante conocer la cotización actual antes de realizar transacciones</li>
                    <li>La diferencia con el dólar oficial puede ser del 10-20% o más</li>
                    <li>Muchos bolivianos usan esta cotización para decisiones financieras diarias</li>
                  </>
                ) : (
                  <>
                    <li>The <strong>blue dollar today</strong> can vary significantly during the day</li>
                    <li>It's important to know the current quote before making transactions</li>
                    <li>The difference with the official dollar can be 10-20% or more</li>
                    <li>Many Bolivians use this quote for daily financial decisions</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Dólar Blue Hoy'
                  : 'Factors Affecting the Blue Dollar Today'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El dólar blue hoy puede variar debido a varios factores que influyen en el mercado cambiario boliviano:'
                  : 'The blue dollar today can vary due to several factors that influence the Bolivian exchange market:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Oferta y demanda:</strong> Cuando hay más demanda de dólares que oferta, el precio sube</li>
                    <li><strong>Noticias económicas:</strong> Eventos importantes pueden causar fluctuaciones rápidas en el dólar blue hoy</li>
                    <li><strong>Políticas gubernamentales:</strong> Decisiones del gobierno y el Banco Central afectan el mercado</li>
                    <li><strong>Condiciones internacionales:</strong> Factores globales como precios de commodities o políticas de otros países</li>
                    <li><strong>Estacionalidad:</strong> Ciertas épocas del año tienen mayor demanda de dólares</li>
                    <li><strong>Volatilidad del mercado:</strong> El dólar blue hoy puede cambiar varias veces durante el día</li>
                  </>
                ) : (
                  <>
                    <li><strong>Supply and demand:</strong> When there is more dollar demand than supply, the price rises</li>
                    <li><strong>Economic news:</strong> Important events can cause rapid fluctuations in the blue dollar today</li>
                    <li><strong>Government policies:</strong> Government and Central Bank decisions affect the market</li>
                    <li><strong>International conditions:</strong> Global factors such as commodity prices or policies from other countries</li>
                    <li><strong>Seasonality:</strong> Certain times of year have higher dollar demand</li>
                    <li><strong>Market volatility:</strong> The blue dollar today can change several times during the day</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Usar el Dólar Blue Hoy para Tomar Decisiones'
                  : 'How to Use Blue Dollar Today to Make Decisions'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El dólar blue hoy es una herramienta valiosa para tomar decisiones financieras informadas:'
                  : 'The blue dollar today is a valuable tool for making informed financial decisions:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Monitorea regularmente:</strong> Revisa el dólar blue hoy varias veces al día si planeas hacer transacciones</li>
                    <li><strong>Compara con tendencias:</strong> Usa nuestros gráficos históricos para ver si el dólar blue hoy está subiendo o bajando</li>
                    <li><strong>Configura alertas:</strong> Usa nuestro sistema de alertas para ser notificado cuando el dólar blue hoy alcance un precio objetivo</li>
                    <li><strong>Considera el momento:</strong> El dólar blue hoy puede variar durante el día, especialmente en días de alta volatilidad</li>
                    <li><strong>Usa la calculadora:</strong> Calcula cuánto recibirás o pagarás antes de realizar transacciones</li>
                  </>
                ) : (
                  <>
                    <li><strong>Monitor regularly:</strong> Check the blue dollar today several times a day if you plan to make transactions</li>
                    <li><strong>Compare with trends:</strong> Use our historical charts to see if the blue dollar today is rising or falling</li>
                    <li><strong>Set up alerts:</strong> Use our alert system to be notified when the blue dollar today reaches a target price</li>
                    <li><strong>Consider timing:</strong> The blue dollar today can vary during the day, especially on high volatility days</li>
                    <li><strong>Use the calculator:</strong> Calculate how much you will receive or pay before making transactions</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Diferencia entre Dólar Blue Hoy y Dólar Oficial'
                  : 'Difference between Blue Dollar Today and Official Dollar'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Es importante entender la diferencia entre el dólar blue hoy y el dólar oficial:'
                  : 'It\'s important to understand the difference between the blue dollar today and the official dollar:'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Característica' : 'Characteristic'}
                      </th>
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Dólar Blue Hoy' : 'Blue Dollar Today'}
                      </th>
                      <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">
                        {language === 'es' ? 'Dólar Oficial' : 'Official Dollar'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
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
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2">
                        {language === 'es' ? 'Disponibilidad' : 'Availability'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Mercado paralelo' : 'Parallel market'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Bancos oficiales' : 'Official banks'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        {language === 'es' ? 'Precio' : 'Price'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Generalmente más alto' : 'Generally higher'}
                      </td>
                      <td className="py-2">
                        {language === 'es' ? 'Fijo o controlado' : 'Fixed or controlled'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? <>La cotización del <strong>dólar blue hoy</strong> se actualiza cada 15 minutos. Esta cotización es solo informativa y puede variar según la ubicación y el método de pago. Siempre verifica la cotización antes de realizar transacciones. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende cómo comprar dólares</Link>.</>
                    : <>The <strong>blue dollar today</strong> quote is updated every 15 minutes. This quote is for informational purposes only and may vary by location and payment method. Always verify the quote before making transactions. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn how to buy dollars</Link>.</>}
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
              to="/cuanto-esta-dolar-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? '¿Cuánto Está el Dólar?' : 'How Much is the Dollar?'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Precio actual' : 'Current price'}
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

export default DolarBlueHoy;


