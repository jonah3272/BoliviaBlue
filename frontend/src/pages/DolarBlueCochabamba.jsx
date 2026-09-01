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
      "name": "Bolivia Blue"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bolivia Blue",
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
          ? "dólar blue cochabamba, dólar blue bolivia cochabamba, tipo cambio cochabamba, cotización dólar blue cochabamba, precio dólar blue cochabamba, dónde cambiar dólares cochabamba, cambio dólares cochabamba, dólar paralelo cochabamba"
          : "blue dollar cochabamba, blue dollar bolivia cochabamba, exchange rate cochabamba, blue dollar quote cochabamba, blue dollar price cochabamba, where to exchange dollars cochabamba, exchange dollars cochabamba, parallel dollar cochabamba"}
        canonical="/dolar-blue-cochabamba"
        noindex={false}
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
            ? 'Referencia del paralelo para Cochabamba (La Cancha, Heroínas, Queru Queru): mediana nacional Binance P2P más contexto del valle para comparar antes de cambiar.'
            : 'Parallel-market reference for Cochabamba (La Cancha, Heroínas, Queru Queru): national Binance P2P median plus valley context to compare before you exchange.'}
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
                  ? <>En <strong>Cochabamba</strong> el paralelo responde a comercio de La Cancha, manufactura del valle y remesas familiares cerca de Plaza 14 de Septiembre y Av. Heroínas. La cifra aquí es la mediana nacional Binance P2P—compárala con tu casa de cambio o P2P local. Herramientas: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">dólar blue hoy</Link>, <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculadora</Link>, <Link to="/cotiza-dolar-paralelo" className="text-blue-600 dark:text-blue-400 hover:underline">cómo cotizar</Link>.</>
                  : <>In <strong>Cochabamba</strong>, parallel demand follows La Cancha trade, valley manufacturing, and family remittances near Plaza 14 de Septiembre and Av. Heroínas. The figure here is the national Binance P2P median—compare it with your local exchange house or P2P. Tools: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">blue dollar today</Link>, <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculator</Link>, <Link to="/cotiza-dolar-paralelo" className="text-blue-600 dark:text-blue-400 hover:underline">how to quote</Link>.</>}
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

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Características del Mercado en Cochabamba'
                  : 'Market Characteristics in Cochabamba'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Cochabamba, conocida como la "Ciudad de la Eterna Primavera", tiene un mercado cambiario activo aunque más pequeño que La Paz o Santa Cruz. La ciudad es un importante centro comercial y agrícola, con una economía diversificada que incluye manufactura, servicios, y agricultura. El mercado del dólar blue en Cochabamba es más localizado y puede tener variaciones menores comparado con las ciudades más grandes.'
                  : 'Cochabamba, known as the "City of Eternal Spring", has an active exchange market although smaller than La Paz or Santa Cruz. The city is an important commercial and agricultural center, with a diversified economy that includes manufacturing, services, and agriculture. The blue dollar market in Cochabamba is more localized and may have minor variations compared to larger cities.'}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Zonas Principales para Cambiar Dólares en Cochabamba'
                  : 'Main Areas to Exchange Dollars in Cochabamba'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'En Cochabamba, las principales zonas donde puedes encontrar casas de cambio y operadores del mercado paralelo incluyen:'
                  : 'In Cochabamba, the main areas where you can find exchange houses and parallel market operators include:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Centro de Cochabamba:</strong> Alrededor de la Plaza 14 de Septiembre y el mercado central, donde se concentran casas de cambio</li>
                    <li><strong>Avenida Heroínas:</strong> Una de las principales avenidas comerciales con varios puntos de intercambio</li>
                    <li><strong>Zona Queru Queru:</strong> Área comercial con actividad cambiaria</li>
                    <li><strong>Mercado La Cancha:</strong> El mercado más grande de Sudamérica, con algunos operadores de cambio</li>
                    <li><strong>Plataformas Digitales:</strong> Binance P2P y otras plataformas online están ganando popularidad en Cochabamba</li>
                  </>
                ) : (
                  <>
                    <li><strong>Downtown Cochabamba:</strong> Around Plaza 14 de Septiembre and the central market, where exchange houses are concentrated</li>
                    <li><strong>Heroínas Avenue:</strong> One of the main commercial avenues with several exchange points</li>
                    <li><strong>Queru Queru Zone:</strong> Commercial area with exchange activity</li>
                    <li><strong>La Cancha Market:</strong> The largest market in South America, with some exchange operators</li>
                    <li><strong>Digital Platforms:</strong> Binance P2P and other online platforms are gaining popularity in Cochabamba</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Dólar Blue en Cochabamba'
                  : 'Factors Affecting the Blue Dollar in Cochabamba'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Varios factores influyen en el precio del dólar blue en Cochabamba:'
                  : 'Several factors influence the blue dollar price in Cochabamba:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Comercio local:</strong> Cochabamba es un importante centro de distribución y comercio regional</li>
                    <li><strong>Agricultura:</strong> La región produce muchos productos agrícolas que se exportan, requiriendo dólares</li>
                    <li><strong>Manufactura:</strong> Industrias locales que necesitan insumos importados</li>
                    <li><strong>Turismo:</strong> Cochabamba atrae turistas que necesitan cambiar divisas</li>
                    <li><strong>Remesas:</strong> Muchas familias cochabambinas reciben remesas en dólares</li>
                    <li><strong>Estacionalidad:</strong> Ciertas épocas del año tienen mayor demanda debido a ciclos agrícolas y comerciales</li>
                  </>
                ) : (
                  <>
                    <li><strong>Local trade:</strong> Cochabamba is an important distribution and regional trade center</li>
                    <li><strong>Agriculture:</strong> The region produces many agricultural products that are exported, requiring dollars</li>
                    <li><strong>Manufacturing:</strong> Local industries that need imported inputs</li>
                    <li><strong>Tourism:</strong> Cochabamba attracts tourists who need to exchange currencies</li>
                    <li><strong>Remittances:</strong> Many Cochabamba families receive remittances in dollars</li>
                    <li><strong>Seasonality:</strong> Certain times of year have higher demand due to agricultural and commercial cycles</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Cambiar Dólares en Cochabamba'
                  : 'Tips for Exchanging Dollars in Cochabamba'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Si planeas cambiar dólares en Cochabamba, considera estos consejos:'
                  : 'If you plan to exchange dollars in Cochabamba, consider these tips:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Consulta la cotización actual:</strong> Usa nuestra plataforma para verificar la tasa antes de cambiar</li>
                    <li><strong>Compara precios:</strong> Visita varios operadores para encontrar la mejor tasa</li>
                    <li><strong>Considera plataformas digitales:</strong> Binance P2P está creciendo en popularidad en Cochabamba</li>
                    <li><strong>Verifica la autenticidad:</strong> Asegúrate de que los billetes sean auténticos</li>
                    <li><strong>Ten cuidado con estafas:</strong> Evita operadores que ofrecen tasas demasiado buenas para ser verdad</li>
                    <li><strong>Usa lugares establecidos:</strong> Prefiere casas de cambio conocidas o plataformas digitales verificadas</li>
                    <li><strong>Usa nuestra calculadora:</strong> Calcula cuánto recibirás antes de cambiar</li>
                  </>
                ) : (
                  <>
                    <li><strong>Check current quote:</strong> Use our platform to verify the rate before exchanging</li>
                    <li><strong>Compare prices:</strong> Visit several operators to find the best rate</li>
                    <li><strong>Consider digital platforms:</strong> Binance P2P is growing in popularity in Cochabamba</li>
                    <li><strong>Verify authenticity:</strong> Make sure bills are authentic</li>
                    <li><strong>Be careful with scams:</strong> Avoid operators offering rates that are too good to be true</li>
                    <li><strong>Use established places:</strong> Prefer known exchange houses or verified digital platforms</li>
                    <li><strong>Use our calculator:</strong> Calculate how much you will receive before exchanging</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Historia del Dólar Blue en Cochabamba'
                  : 'History of the Blue Dollar in Cochabamba'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Cochabamba ha desarrollado un mercado cambiario estable aunque más pequeño que las otras grandes ciudades. La ciudad combina características de centro comercial regional con actividad agrícola, creando una demanda constante pero más moderada de dólares. En los últimos años, el mercado ha evolucionado hacia plataformas digitales, aunque las casas de cambio tradicionales siguen siendo importantes en el centro de la ciudad.'
                  : 'Cochabamba has developed a stable exchange market although smaller than other major cities. The city combines characteristics of a regional commercial center with agricultural activity, creating constant but more moderate demand for dollars. In recent years, the market has evolved toward digital platforms, although traditional exchange houses remain important in the city center.'}
              </p>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/dolar-blue-hoy"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Dólar Blue Hoy' : 'Blue Dollar Today'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización del día' : 'Today’s quote'}
              </div>
            </Link>
            <Link
              to="/dolar-paralelo-bolivia-en-vivo"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Paralelo EN VIVO' : 'Parallel LIVE'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Monitor continuo' : 'Continuous monitor'}
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


