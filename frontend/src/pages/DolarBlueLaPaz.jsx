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

function DolarBlueLaPaz() {
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

  // Structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "Dólar Blue La Paz - Cotización en Tiempo Real | Actualizado Cada 15 Min"
      : "Blue Dollar La Paz - Real-Time Quote | Updated Every 15 Min",
    "description": language === 'es'
      ? "Dólar blue La Paz actualizado cada 15 minutos. Consulta la cotización del dólar blue en La Paz, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en La Paz."
      : "Blue dollar La Paz updated every 15 minutes. Check the blue dollar quote in La Paz, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in La Paz.",
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
        "name": "¿Cuál es el dólar blue en La Paz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El dólar blue en La Paz es actualmente de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD para compra y ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cambiar dólares en La Paz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En La Paz puedes cambiar dólares en casas de cambio no oficiales ubicadas principalmente en el centro de la ciudad, plataformas P2P como Binance, o particulares que operan en el mercado paralelo. También puedes usar nuestra plataforma para verificar la cotización actual antes de cambiar."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el tipo de cambio en La Paz hoy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El tipo de cambio del dólar blue en La Paz hoy es de aproximadamente ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USD. Esta cotización se actualiza cada 15 minutos y refleja el mercado paralelo en Bolivia.`
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the blue dollar in La Paz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar in La Paz is currently approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "Where to exchange dollars in La Paz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In La Paz you can exchange dollars at unofficial exchange houses located mainly in the city center, P2P platforms like Binance, or individuals operating in the parallel market. You can also use our platform to check the current quote before exchanging."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Dólar Blue La Paz - Cotización en Tiempo Real | Actualizado Cada 15 Min'
          : 'Blue Dollar La Paz - Real-Time Quote | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Dólar blue La Paz actualizado cada 15 minutos. Consulta la cotización del dólar blue en La Paz, Bolivia. Tipo de cambio en tiempo real, gráficos históricos y dónde cambiar dólares en La Paz. Gratis y sin registro.'
          : 'Blue dollar La Paz updated every 15 minutes. Check the blue dollar quote in La Paz, Bolivia. Real-time exchange rate, historical charts and where to exchange dollars in La Paz. Free and no registration required.'}
        keywords={language === 'es'
          ? "dólar blue la paz, dólar blue bolivia la paz, dólar blue hoy bolivia la paz, tipo cambio la paz, cotización dólar blue la paz, precio dólar blue la paz, dónde cambiar dólares la paz, cambio dólares la paz, dólar paralelo la paz, mejor que bolivianblue.net"
          : "blue dollar la paz, blue dollar bolivia la paz, blue dollar today la paz, exchange rate la paz, blue dollar quote la paz, blue dollar price la paz, where to exchange dollars la paz, exchange dollars la paz, parallel dollar la paz"}
        canonical="/dolar-blue-la-paz"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Dólar Blue La Paz', path: '/dolar-blue-la-paz' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Blue Dollar La Paz', path: '/dolar-blue-la-paz' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'Dólar Blue La Paz - Cotización en Tiempo Real'
            : 'Blue Dollar La Paz - Real-Time Quote'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Consulta la cotización del dólar blue en La Paz actualizada cada 15 minutos con datos en tiempo real de Binance P2P'
            : 'Check the blue dollar quote in La Paz updated every 15 minutes with real-time data from Binance P2P'}
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
                ? 'Dólar Blue en La Paz - Información Completa'
                : 'Blue Dollar in La Paz - Complete Information'}
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>El <strong>dólar blue en La Paz</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de la capital boliviana. La cotización del <strong>dólar blue La Paz</strong> se actualiza cada 15 minutos en nuestra plataforma utilizando datos en tiempo real de Binance P2P, proporcionando la información más precisa sobre el <strong>tipo de cambio en La Paz</strong>.</>
                  : <>The <strong>blue dollar in La Paz</strong> is the exchange rate of the US dollar in the parallel market of Bolivia's capital. The <strong>blue dollar La Paz</strong> quote is updated every 15 minutes on our platform using real-time data from Binance P2P, providing the most accurate information about the <strong>exchange rate in La Paz</strong>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cambiar Dólares en La Paz?'
                  : 'Where to Exchange Dollars in La Paz?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>En La Paz puedes cambiar dólares en varios lugares:</>
                  : <>In La Paz you can exchange dollars in several places:</>}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Casas de cambio no oficiales</strong> - Ubicadas principalmente en el centro de La Paz, cerca de la Plaza Murillo y el Mercado de las Brujas</li>
                    <li><strong>Plataformas P2P</strong> - Como Binance P2P, donde puedes ver ofertas de compra y venta en tiempo real</li>
                    <li><strong>Particulares</strong> - Personas que intercambian dólares fuera del sistema oficial</li>
                    <li><strong>Nuestra plataforma</strong> - Consulta la cotización actual antes de cambiar para obtener el mejor precio</li>
                  </>
                ) : (
                  <>
                    <li><strong>Unofficial exchange houses</strong> - Located mainly in downtown La Paz, near Plaza Murillo and the Witches' Market</li>
                    <li><strong>P2P platforms</strong> - Like Binance P2P, where you can see buy and sell offers in real-time</li>
                    <li><strong>Individuals</strong> - People exchanging dollars outside the official system</li>
                    <li><strong>Our platform</strong> - Check the current quote before exchanging to get the best price</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por qué Consultar el Dólar Blue en La Paz?'
                  : 'Why Check the Blue Dollar in La Paz?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>dólar blue La Paz</strong> refleja el precio real del dólar en el mercado boliviano. A diferencia del tipo de cambio oficial que puede tener restricciones, el <strong>dólar blue</strong> muestra la oferta y demanda real. Muchos bolivianos en La Paz usan esta cotización para transacciones diarias y decisiones financieras.</>
                  : <>The <strong>blue dollar La Paz</strong> reflects the real price of the dollar in the Bolivian market. Unlike the official exchange rate which may have restrictions, the <strong>blue dollar</strong> shows real supply and demand. Many Bolivians in La Paz use this quote for daily transactions and financial decisions.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Características del Mercado en La Paz'
                  : 'Market Characteristics in La Paz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'La Paz, como capital administrativa de Bolivia, tiene un mercado cambiario único. La ciudad alberga muchas instituciones financieras, embajadas, y organizaciones internacionales, lo que crea una demanda constante de dólares. El mercado del dólar blue en La Paz tiende a ser más estable que en otras ciudades debido a la mayor liquidez y el volumen de transacciones.'
                  : 'La Paz, as the administrative capital of Bolivia, has a unique exchange market. The city hosts many financial institutions, embassies, and international organizations, which creates constant demand for dollars. The blue dollar market in La Paz tends to be more stable than in other cities due to greater liquidity and transaction volume.'}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Zonas Principales para Cambiar Dólares en La Paz'
                  : 'Main Areas to Exchange Dollars in La Paz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'En La Paz, las principales zonas donde puedes encontrar casas de cambio y operadores del mercado paralelo incluyen:'
                  : 'In La Paz, the main areas where you can find exchange houses and parallel market operators include:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Centro de La Paz:</strong> Alrededor de la Plaza Murillo y las calles adyacentes, donde se concentran muchas casas de cambio no oficiales</li>
                    <li><strong>Zona El Prado:</strong> Una de las principales avenidas comerciales, con varios puntos de intercambio</li>
                    <li><strong>Mercado de las Brujas:</strong> Aunque conocido por otros productos, también hay operadores de cambio en esta zona</li>
                    <li><strong>Zona Sur (Obrajes, Calacoto):</strong> Áreas residenciales y comerciales con menor concentración pero operadores disponibles</li>
                    <li><strong>Plataformas Digitales:</strong> Binance P2P y otras plataformas online, que son cada vez más populares en La Paz</li>
                  </>
                ) : (
                  <>
                    <li><strong>Downtown La Paz:</strong> Around Plaza Murillo and adjacent streets, where many unofficial exchange houses are concentrated</li>
                    <li><strong>El Prado Zone:</strong> One of the main commercial avenues, with several exchange points</li>
                    <li><strong>Witches' Market:</strong> Although known for other products, there are also exchange operators in this area</li>
                    <li><strong>South Zone (Obrajes, Calacoto):</strong> Residential and commercial areas with lower concentration but available operators</li>
                    <li><strong>Digital Platforms:</strong> Binance P2P and other online platforms, which are increasingly popular in La Paz</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Dólar Blue en La Paz'
                  : 'Factors Affecting the Blue Dollar in La Paz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Varios factores influyen en el precio del dólar blue en La Paz:'
                  : 'Several factors influence the blue dollar price in La Paz:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Demanda institucional:</strong> Embajadas, ONGs, y organizaciones internacionales necesitan dólares regularmente</li>
                    <li><strong>Turismo:</strong> La Paz recibe muchos turistas que necesitan cambiar divisas</li>
                    <li><strong>Comercio internacional:</strong> Importadores y exportadores operan desde La Paz</li>
                    <li><strong>Remesas:</strong> Muchas familias en La Paz reciben remesas en dólares</li>
                    <li><strong>Políticas gubernamentales:</strong> Decisiones del gobierno central afectan el mercado en la capital</li>
                    <li><strong>Estacionalidad:</strong> Ciertas épocas del año tienen mayor demanda (por ejemplo, antes de viajes internacionales)</li>
                  </>
                ) : (
                  <>
                    <li><strong>Institutional demand:</strong> Embassies, NGOs, and international organizations regularly need dollars</li>
                    <li><strong>Tourism:</strong> La Paz receives many tourists who need to exchange currencies</li>
                    <li><strong>International trade:</strong> Importers and exporters operate from La Paz</li>
                    <li><strong>Remittances:</strong> Many families in La Paz receive remittances in dollars</li>
                    <li><strong>Government policies:</strong> Central government decisions affect the market in the capital</li>
                    <li><strong>Seasonality:</strong> Certain times of year have higher demand (for example, before international travel)</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Cambiar Dólares en La Paz'
                  : 'Tips for Exchanging Dollars in La Paz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Si planeas cambiar dólares en La Paz, considera estos consejos:'
                  : 'If you plan to exchange dollars in La Paz, consider these tips:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Consulta la cotización actual:</strong> Usa nuestra plataforma para verificar la tasa antes de cambiar</li>
                    <li><strong>Compara precios:</strong> Diferentes operadores pueden ofrecer tasas ligeramente diferentes</li>
                    <li><strong>Verifica la autenticidad:</strong> Asegúrate de que los billetes sean auténticos antes de completar la transacción</li>
                    <li><strong>Considera plataformas digitales:</strong> Binance P2P puede ofrecer mejores tasas y más seguridad</li>
                    <li><strong>Evita cambiar grandes cantidades en un solo lugar:</strong> Distribuye las transacciones si es posible</li>
                    <li><strong>Ten cuidado con ofertas demasiado buenas:</strong> Si una tasa es significativamente mejor que el mercado, puede ser una estafa</li>
                    <li><strong>Usa nuestra calculadora:</strong> Calcula cuánto recibirás antes de cambiar para evitar sorpresas</li>
                  </>
                ) : (
                  <>
                    <li><strong>Check current quote:</strong> Use our platform to verify the rate before exchanging</li>
                    <li><strong>Compare prices:</strong> Different operators may offer slightly different rates</li>
                    <li><strong>Verify authenticity:</strong> Make sure bills are authentic before completing the transaction</li>
                    <li><strong>Consider digital platforms:</strong> Binance P2P may offer better rates and more security</li>
                    <li><strong>Avoid changing large amounts in one place:</strong> Distribute transactions if possible</li>
                    <li><strong>Be careful with offers that are too good:</strong> If a rate is significantly better than the market, it may be a scam</li>
                    <li><strong>Use our calculator:</strong> Calculate how much you will receive before exchanging to avoid surprises</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Historia del Dólar Blue en La Paz'
                  : 'History of the Blue Dollar in La Paz'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'La Paz ha sido históricamente un centro importante para el mercado cambiario en Bolivia. Como sede del gobierno y muchas instituciones financieras, la ciudad ha desarrollado un mercado paralelo robusto. El dólar blue en La Paz ha evolucionado desde transacciones principalmente en persona hasta incluir plataformas digitales modernas como Binance P2P, que han aumentado la transparencia y accesibilidad del mercado.'
                  : 'La Paz has historically been an important center for the exchange market in Bolivia. As the seat of government and many financial institutions, the city has developed a robust parallel market. The blue dollar in La Paz has evolved from primarily in-person transactions to include modern digital platforms like Binance P2P, which have increased market transparency and accessibility.'}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? <>La cotización del <strong>dólar blue en La Paz</strong> se actualiza cada 15 minutos. Esta cotización es solo informativa y puede variar según la ubicación específica y el método de pago. Siempre verifica la cotización antes de realizar transacciones. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir divisas o <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende cómo comprar dólares</Link>.</>
                    : <>The <strong>blue dollar in La Paz</strong> quote is updated every 15 minutes. This quote is for informational purposes only and may vary by specific location and payment method. Always verify the quote before making transactions. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn how to buy dollars</Link>.</>}
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

export default DolarBlueLaPaz;


