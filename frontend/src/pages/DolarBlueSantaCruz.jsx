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

function DolarBlueSantaCruz() {
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
      ? "Dólar Blue Santa Cruz - Cotización en Tiempo Real | Actualizado Cada 15 Min"
      : "Blue Dollar Santa Cruz - Real-Time Quote | Updated Every 15 Min",
    "description": language === 'es'
      ? "Dólar blue Santa Cruz actualizado cada 15 minutos. Consulta la cotización del dólar blue en Santa Cruz, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en Santa Cruz."
      : "Blue dollar Santa Cruz updated every 15 minutes. Check the blue dollar quote in Santa Cruz, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in Santa Cruz.",
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
        "name": "¿Cuál es el dólar blue en Santa Cruz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue en Santa Cruz es actualmente de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cambiar dólares en Santa Cruz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En Santa Cruz puedes cambiar dólares en casas de cambio no oficiales ubicadas principalmente en el centro de la ciudad, plataformas P2P como Binance, o particulares que operan en el mercado paralelo. También puedes usar nuestra plataforma para verificar la cotización actual antes de cambiar."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the blue dollar in Santa Cruz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar in Santa Cruz is currently approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar Blue Santa Cruz - Cotización en Tiempo Real | Actualizado Cada 15 Min'
          : 'Blue Dollar Santa Cruz - Real-Time Quote | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Dólar blue Santa Cruz actualizado cada 15 minutos. Consulta la cotización del dólar blue en Santa Cruz, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en Santa Cruz. Gratis y sin registro.'
          : 'Blue dollar Santa Cruz updated every 15 minutes. Check the blue dollar quote in Santa Cruz, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in Santa Cruz. Free and no registration required.'}
        keywords={language === 'es'
          ? "dólar blue santa cruz, dólar blue bolivia santa cruz, tipo cambio santa cruz, cotización dólar blue santa cruz, precio dólar blue santa cruz, dónde cambiar dólares santa cruz, cambio dólares santa cruz, dólar paralelo santa cruz"
          : "blue dollar santa cruz, blue dollar bolivia santa cruz, exchange rate santa cruz, blue dollar quote santa cruz, blue dollar price santa cruz, where to exchange dollars santa cruz, exchange dollars santa cruz, parallel dollar santa cruz"}
        canonical="/dolar-blue-santa-cruz"
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
                { label: 'Dólar Blue Santa Cruz', path: '/dolar-blue-santa-cruz' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Blue Dollar Santa Cruz', path: '/dolar-blue-santa-cruz' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'Dólar Blue Santa Cruz - Cotización en Tiempo Real'
            : 'Blue Dollar Santa Cruz - Real-Time Quote'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Referencia del paralelo para Santa Cruz (comercio, agro y Equipetrol): misma mediana nacional Binance P2P, con zonas locales donde la gente cambia dólares.'
            : 'Parallel-market reference for Santa Cruz (trade, agribusiness, Equipetrol): the same national Binance P2P median, plus local areas where people exchange dollars.'}
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
                ? 'Dólar Blue en Santa Cruz - Información Completa'
                : 'Blue Dollar in Santa Cruz - Complete Information'}
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>En <strong>Santa Cruz de la Sierra</strong> el blue acompaña importadores, agroindustria y remesas alrededor de Plaza 24 de Septiembre, Monseñor Rivero y Equipetrol. Usamos la mediana nacional Binance P2P como referencia para comparar casas de cambio y P2P locales. Herramientas: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">dólar blue hoy</Link>, <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculadora</Link>, <Link to="/cuanto-esta-dolar-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline">¿cuánto está el dólar?</Link>.</>
                  : <>In <strong>Santa Cruz de la Sierra</strong>, blue rates matter for importers, agribusiness, and remittances around Plaza 24 de Septiembre, Monseñor Rivero, and Equipetrol. We use the national Binance P2P median as a benchmark before local exchange houses or P2P. Tools: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">blue dollar today</Link>, <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculator</Link>, <Link to="/cuanto-esta-dolar-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline">how much is the dollar?</Link>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cambiar Dólares en Santa Cruz?'
                  : 'Where to Exchange Dollars in Santa Cruz?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Casas de cambio no oficiales</strong> - Ubicadas principalmente en el centro de Santa Cruz, cerca de la Plaza 24 de Septiembre</li>
                    <li><strong>Plataformas P2P</strong> - Como Binance P2P, donde puedes ver ofertas de compra y venta en tiempo real</li>
                    <li><strong>Particulares</strong> - Personas que intercambian dólares fuera del sistema oficial</li>
                    <li><strong>Nuestra plataforma</strong> - Consulta la cotización actual antes de cambiar para obtener el mejor precio</li>
                  </>
                ) : (
                  <>
                    <li><strong>Unofficial exchange houses</strong> - Located mainly in downtown Santa Cruz, near Plaza 24 de Septiembre</li>
                    <li><strong>P2P platforms</strong> - Like Binance P2P, where you can see buy and sell offers in real-time</li>
                    <li><strong>Individuals</strong> - People exchanging dollars outside the official system</li>
                    <li><strong>Our platform</strong> - Check the current quote before exchanging to get the best price</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Características del Mercado en Santa Cruz'
                  : 'Market Characteristics in Santa Cruz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Santa Cruz de la Sierra, como el centro económico más importante de Bolivia, tiene un mercado cambiario muy activo. La ciudad es conocida por su economía dinámica, comercio internacional, y agricultura, lo que crea una demanda constante y significativa de dólares. El mercado del dólar blue en Santa Cruz suele tener mayor volumen de transacciones que otras ciudades, lo que puede resultar en tasas ligeramente diferentes.'
                  : 'Santa Cruz de la Sierra, as Bolivia\'s most important economic center, has a very active exchange market. The city is known for its dynamic economy, international trade, and agriculture, which creates constant and significant demand for dollars. The blue dollar market in Santa Cruz usually has higher transaction volume than other cities, which can result in slightly different rates.'}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Zonas Principales para Cambiar Dólares en Santa Cruz'
                  : 'Main Areas to Exchange Dollars in Santa Cruz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'En Santa Cruz, las principales zonas donde puedes encontrar casas de cambio y operadores del mercado paralelo incluyen:'
                  : 'In Santa Cruz, the main areas where you can find exchange houses and parallel market operators include:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Centro de Santa Cruz:</strong> Alrededor de la Plaza 24 de Septiembre y el mercado central, donde se concentran muchas casas de cambio</li>
                    <li><strong>Avenida Monseñor Rivero:</strong> Una de las principales avenidas comerciales con varios puntos de intercambio</li>
                    <li><strong>Zona Equipetrol:</strong> Área comercial y residencial con operadores de cambio disponibles</li>
                    <li><strong>Mercado Los Pozos:</strong> Zona comercial con actividad cambiaria</li>
                    <li><strong>Plataformas Digitales:</strong> Binance P2P y otras plataformas online son muy populares en Santa Cruz debido a la alta actividad comercial</li>
                  </>
                ) : (
                  <>
                    <li><strong>Downtown Santa Cruz:</strong> Around Plaza 24 de Septiembre and the central market, where many exchange houses are concentrated</li>
                    <li><strong>Monseñor Rivero Avenue:</strong> One of the main commercial avenues with several exchange points</li>
                    <li><strong>Equipetrol Zone:</strong> Commercial and residential area with available exchange operators</li>
                    <li><strong>Los Pozos Market:</strong> Commercial area with exchange activity</li>
                    <li><strong>Digital Platforms:</strong> Binance P2P and other online platforms are very popular in Santa Cruz due to high commercial activity</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Dólar Blue en Santa Cruz'
                  : 'Factors Affecting the Blue Dollar in Santa Cruz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Varios factores influyen en el precio del dólar blue en Santa Cruz:'
                  : 'Several factors influence the blue dollar price in Santa Cruz:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Comercio internacional:</strong> Santa Cruz es el principal puerto seco de Bolivia, con mucho comercio de importación y exportación</li>
                    <li><strong>Agricultura y agroindustria:</strong> Muchas empresas agrícolas necesitan dólares para insumos y exportaciones</li>
                    <li><strong>Crecimiento económico:</strong> La ciudad tiene una de las economías de más rápido crecimiento en Bolivia</li>
                    <li><strong>Inversión extranjera:</strong> Santa Cruz atrae inversión extranjera que requiere dólares</li>
                    <li><strong>Remesas:</strong> Muchas familias en Santa Cruz reciben remesas en dólares</li>
                    <li><strong>Estacionalidad agrícola:</strong> Ciertas épocas del año tienen mayor demanda debido a ciclos agrícolas</li>
                  </>
                ) : (
                  <>
                    <li><strong>International trade:</strong> Santa Cruz is Bolivia\'s main dry port, with much import and export trade</li>
                    <li><strong>Agriculture and agribusiness:</strong> Many agricultural companies need dollars for inputs and exports</li>
                    <li><strong>Economic growth:</strong> The city has one of the fastest growing economies in Bolivia</li>
                    <li><strong>Foreign investment:</strong> Santa Cruz attracts foreign investment that requires dollars</li>
                    <li><strong>Remittances:</strong> Many families in Santa Cruz receive remittances in dollars</li>
                    <li><strong>Agricultural seasonality:</strong> Certain times of year have higher demand due to agricultural cycles</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Cambiar Dólares en Santa Cruz'
                  : 'Tips for Exchanging Dollars in Santa Cruz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Si planeas cambiar dólares en Santa Cruz, considera estos consejos:'
                  : 'If you plan to exchange dollars in Santa Cruz, consider these tips:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Consulta la cotización actual:</strong> Usa nuestra plataforma para verificar la tasa antes de cambiar</li>
                    <li><strong>Compara precios:</strong> El mercado en Santa Cruz es competitivo, así que compara varias opciones</li>
                    <li><strong>Considera el volumen:</strong> Si cambias grandes cantidades, puedes negociar mejores tasas</li>
                    <li><strong>Usa plataformas digitales:</strong> Binance P2P es muy popular en Santa Cruz y puede ofrecer mejores tasas</li>
                    <li><strong>Ten cuidado con estafas:</strong> Verifica la autenticidad de los billetes y la reputación del operador</li>
                    <li><strong>Evita cambiar en la calle:</strong> Prefiere lugares establecidos o plataformas digitales verificadas</li>
                    <li><strong>Usa nuestra calculadora:</strong> Calcula cuánto recibirás antes de cambiar</li>
                  </>
                ) : (
                  <>
                    <li><strong>Check current quote:</strong> Use our platform to verify the rate before exchanging</li>
                    <li><strong>Compare prices:</strong> The market in Santa Cruz is competitive, so compare several options</li>
                    <li><strong>Consider volume:</strong> If you exchange large amounts, you can negotiate better rates</li>
                    <li><strong>Use digital platforms:</strong> Binance P2P is very popular in Santa Cruz and may offer better rates</li>
                    <li><strong>Be careful with scams:</strong> Verify the authenticity of bills and the operator\'s reputation</li>
                    <li><strong>Avoid exchanging on the street:</strong> Prefer established places or verified digital platforms</li>
                    <li><strong>Use our calculator:</strong> Calculate how much you will receive before exchanging</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Historia del Dólar Blue en Santa Cruz'
                  : 'History of the Blue Dollar in Santa Cruz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Santa Cruz ha sido históricamente el motor económico de Bolivia, y su mercado cambiario refleja esta importancia. La ciudad ha desarrollado un mercado paralelo robusto debido a su alta actividad comercial y necesidad constante de dólares para el comercio internacional. En los últimos años, plataformas digitales como Binance P2P han ganado mucha popularidad en Santa Cruz, transformando cómo los cruceños acceden al mercado del dólar blue.'
                  : 'Santa Cruz has historically been Bolivia\'s economic engine, and its exchange market reflects this importance. The city has developed a robust parallel market due to its high commercial activity and constant need for dollars for international trade. In recent years, digital platforms like Binance P2P have gained much popularity in Santa Cruz, transforming how Cruceños access the blue dollar market.'}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? <>La cotización del <strong>dólar blue en Santa Cruz</strong> se actualiza cada 15 minutos. Esta cotización es solo informativa y puede variar según la ubicación específica y el método de pago. Siempre verifica la cotización antes de realizar transacciones. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende cómo comprar dólares</Link>.</>
                    : <>The <strong>blue dollar in Santa Cruz</strong> quote is updated every 15 minutes. This quote is for informational purposes only and may vary by specific location and payment method. Always verify the quote before making transactions. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn how to buy dollars</Link>.</>}
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

export default DolarBlueSantaCruz;


