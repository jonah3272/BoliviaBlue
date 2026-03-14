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
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function QueEsDolarBlue() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
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
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "¿Qué es el Dólar Blue? Guía 2025 – En Bolivia y Latinoamérica | Bolivia Blue"
      : "What Is the Dollar Blue? Guide 2025 – Bolivia & Latin America | Bolivia Blue",
    "description": language === 'es'
      ? "¿Qué es el dólar blue? Guía completa sobre el dólar blue en Bolivia. Explicación del mercado paralelo, cómo funciona, diferencia con el dólar oficial y por qué es importante. Actualizado cada 15 minutos."
      : "What is the blue dollar? Complete guide about the blue dollar in Bolivia. Explanation of the parallel market, how it works, difference with official dollar and why it is important. Updated every 15 minutes.",
    "author": { "@type": "Organization", "name": "Bolivia Blue con Paz" },
    "publisher": { "@type": "Organization", "name": "Bolivia Blue con Paz", "logo": { "@type": "ImageObject", "url": "https://boliviablue.com/favicon.svg" } },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  const webPageSchema = getWebPage({
    name: language === 'es' ? '¿Qué es el Dólar Blue?' : 'What is the Blue Dollar?',
    description: language === 'es' ? 'Guía completa sobre el dólar blue en Bolivia: qué es, cómo funciona y por qué es importante.' : 'Complete guide about the blue dollar in Bolivia: what it is, how it works and why it is important.',
    url: '/que-es-dolar-blue',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: language === 'es' ? 'es-BO' : 'en-US'
  });

  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? '¿Qué es el Dólar Blue?' : 'What is the Blue Dollar?', url: '/que-es-dolar-blue' }
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es el dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El dólar blue es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como dólar paralelo, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. A diferencia de la tasa oficial del Banco Central de Bolivia, el dólar blue fluctúa constantemente según la oferta y demanda del mercado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona el dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El dólar blue funciona a través del mercado paralelo, donde las personas intercambian dólares fuera del sistema bancario oficial. La cotización se determina por la oferta y demanda real del mercado. Nuestra plataforma calcula el dólar blue utilizando datos en tiempo real de Binance P2P para el par USDT/BOB, calculando la mediana de las ofertas de compra y venta."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre dólar blue y dólar oficial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La diferencia principal es que el dólar oficial es establecido por el Banco Central de Bolivia y es fijo o se ajusta muy raramente, mientras que el dólar blue fluctúa constantemente según las condiciones del mercado. El dólar blue generalmente es más alto que la tasa oficial, reflejando la escasez de dólares en el mercado formal. La diferencia puede ser del 10-20% o más."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué existe el dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El dólar blue existe porque hay restricciones en el acceso al dólar oficial en Bolivia. Cuando hay limitaciones para obtener dólares a través del sistema bancario oficial, las personas recurren al mercado paralelo, donde el precio se determina por la oferta y demanda real. Esto crea el mercado del dólar blue."
        }
      },
      {
        "@type": "Question",
        "name": "¿Es legal el dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El dólar blue opera en el mercado paralelo, fuera del sistema bancario oficial. Aunque no es ilegal intercambiar divisas entre particulares, las transacciones del dólar blue no están reguladas por el Banco Central de Bolivia. Es importante tener precaución y verificar la cotización antes de realizar transacciones."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué se llama dólar blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El término dólar blue tiene origen en Argentina: se asociaba con operaciones en \"negro\" (black market) y la palabra \"blue\" (azul en inglés) se usaba como eufemismo. Con el tiempo se extendió en Latinoamérica para referirse al tipo de cambio paralelo. En Bolivia se usa igual: dólar blue o dólar paralelo."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is the blue dollar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The blue dollar is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the parallel dollar, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. Unlike the official rate from the Central Bank of Bolivia, the blue dollar fluctuates constantly according to market supply and demand."
        }
      },
      {
        "@type": "Question",
        "name": "How does the blue dollar work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The blue dollar works through the parallel market, where people exchange dollars outside the official banking system. The quote is determined by real market supply and demand. Our platform calculates the blue dollar using real-time data from Binance P2P for the USDT/BOB pair, calculating the median of buy and sell offers."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between blue dollar and official dollar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The main difference is that the official dollar is set by the Central Bank of Bolivia and is fixed or adjusted very rarely, while the blue dollar fluctuates constantly according to market conditions. The blue dollar is generally higher than the official rate, reflecting the scarcity of dollars in the formal market. The difference can be 10-20% or more."
        }
      },
      {
        "@type": "Question",
        "name": "Why is it called blue dollar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The term blue dollar originated in Argentina, where it was associated with black market operations and \"blue\" was used as a euphemism. Over time it spread across Latin America for the parallel exchange rate. In Bolivia the same terms are used: blue dollar or parallel dollar."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? '¿Qué es el Dólar Blue? Guía 2025 – Bolivia y Latinoamérica'
          : 'What Is the Blue Dollar? Guide 2025 – Bolivia & Latin America'}
        description={language === 'es'
          ? '¿Qué es el dólar blue? Guía completa sobre el dólar blue en Bolivia. Explicación del mercado paralelo, cómo funciona, diferencia con el dólar oficial y por qué es importante. Actualizado cada 15 minutos. Gratis.'
          : 'What is the blue dollar? Complete guide about the blue dollar in Bolivia. Explanation of the parallel market, how it works, difference with official dollar and why it is important. Updated every 15 minutes. Free.'}
        keywords={language === 'es'
          ? "qué es el dólar blue, qué es dólar blue bolivia, qué es el dólar blue en bolivia, cómo funciona dólar blue, dólar blue explicación, dólar paralelo bolivia, mercado paralelo bolivia, diferencia dólar blue oficial, mejor que bolivianblue.net"
          : "what is blue dollar, what is blue dollar bolivia, how does blue dollar work, blue dollar explanation, parallel dollar bolivia, parallel market bolivia, blue dollar vs official, difference blue dollar official"}
        canonical="/que-es-dolar-blue"
        structuredData={[webPageSchema, breadcrumbSchema, articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: '¿Qué es el Dólar Blue?', path: '/que-es-dolar-blue' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'What is the Blue Dollar?', path: '/que-es-dolar-blue' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? '¿Qué es el Dólar Blue?'
            : 'What is the Blue Dollar?'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
          {language === 'es'
            ? 'Guía completa sobre el dólar blue en Bolivia: qué es, cómo funciona y por qué es importante'
            : 'Complete guide about the blue dollar in Bolivia: what it is, how it works and why it is important'}
        </p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-3 sm:mb-6">
          {language === 'es' ? 'Última actualización: Enero 2025' : 'Last updated: January 2025'}
        </p>

        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Main Content */}
        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? '¿Qué es el Dólar Blue?'
                  : 'What is the Blue Dollar?'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                {language === 'es' 
                  ? <>El <strong>dólar blue</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como <strong>dólar paralelo</strong> o <strong>dólar negro</strong>, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. Esta guía explica qué es, cómo funciona y por qué importa; para la cotización actual, consulta la <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">página principal</Link> o <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">dólar blue hoy</Link>.</>
                  : <>The <strong>blue dollar</strong> is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the <strong>parallel dollar</strong> or <strong>black dollar</strong>, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. This guide explains what it is, how it works, and why it matters; for the current quote, see the <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">homepage</Link> or <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">blue dollar today</Link>.</>}
              </p>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                {language === 'es' 
                  ? '¿Cómo Funciona el Dólar Blue?'
                  : 'How Does the Blue Dollar Work?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El dólar blue funciona a través del <strong>mercado paralelo</strong>, donde las personas intercambian dólares fuera del sistema bancario oficial. La cotización se determina por la <strong>oferta y demanda real</strong> del mercado. A diferencia del dólar oficial que es fijo o se ajusta muy raramente, el dólar blue <strong>fluctúa constantemente</strong> según las condiciones del mercado.</>
                  : <>The blue dollar works through the <strong>parallel market</strong>, where people exchange dollars outside the official banking system. The quote is determined by real <strong>market supply and demand</strong>. Unlike the official dollar which is fixed or adjusted very rarely, the blue dollar <strong>fluctuates constantly</strong> according to market conditions.</>}
              </p>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                {language === 'es' 
                  ? 'Diferencia entre Dólar Blue y Dólar Oficial'
                  : 'Difference between Blue Dollar and Official Dollar'}
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mb-6 border border-blue-200 dark:border-blue-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200 dark:border-blue-700">
                      <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                        {language === 'es' ? 'Característica' : 'Feature'}
                      </th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                        {language === 'es' ? 'Dólar Oficial' : 'Official Dollar'}
                      </th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                        {language === 'es' ? 'Dólar Blue' : 'Blue Dollar'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-100 dark:border-blue-800">
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Establecido por' : 'Set by'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Banco Central de Bolivia' : 'Central Bank of Bolivia'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Mercado paralelo' : 'Parallel market'}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100 dark:border-blue-800">
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Variación' : 'Variation'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Fijo o muy rara' : 'Fixed or very rare'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Constante' : 'Constant'}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100 dark:border-blue-800">
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Precio' : 'Price'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Más bajo (~9.00 BOB/USD)' : 'Lower (~9.00 BOB/USD)'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Más alto (~10.50 BOB/USD)' : 'Higher (~10.50 BOB/USD)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Accesibilidad' : 'Accessibility'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Restricciones' : 'Restrictions'}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {language === 'es' ? 'Más accesible' : 'More accessible'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                {language === 'es' 
                  ? '¿Por qué Existe el Dólar Blue?'
                  : 'Why Does the Blue Dollar Exist?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El dólar blue existe porque hay <strong>restricciones en el acceso al dólar oficial</strong> en Bolivia. Cuando hay limitaciones para obtener dólares a través del sistema bancario oficial, las personas recurren al mercado paralelo, donde el precio se determina por la oferta y demanda real. Esto crea el mercado del dólar blue.</>
                  : <>The blue dollar exists because there are <strong>restrictions on access to the official dollar</strong> in Bolivia. When there are limitations to obtain dollars through the official banking system, people turn to the parallel market, where the price is determined by real supply and demand. This creates the blue dollar market.</>}
              </p>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                {language === 'es' 
                  ? '¿Por qué es Importante Conocer el Dólar Blue?'
                  : 'Why is it Important to Know the Blue Dollar?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
                {language === 'es' ? (
                  <>
                    <li>Refleja el <strong>precio real</strong> del dólar en el mercado boliviano</li>
                    <li>Millones de bolivianos lo usan para <strong>transacciones diarias</strong></li>
                    <li>Te ayuda a tomar <strong>mejores decisiones financieras</strong></li>
                    <li>Puede diferir significativamente del dólar oficial (10-20% o más)</li>
                    <li>Es crucial para <strong>importadores, exportadores y personas que reciben remesas</strong></li>
                  </>
                ) : (
                  <>
                    <li>Reflects the <strong>real price</strong> of the dollar in the Bolivian market</li>
                    <li>Millions of Bolivians use it for <strong>daily transactions</strong></li>
                    <li>Helps you make <strong>better financial decisions</strong></li>
                    <li>Can differ significantly from the official dollar (10-20% or more)</li>
                    <li>Is crucial for <strong>importers, exporters and people receiving remittances</strong></li>
                  </>
                )}
              </ul>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                {language === 'es' ? 'Dólar Blue en Otros Países' : 'Blue Dollar in Other Countries'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>dólar blue</strong> existe en varios países de Latinoamérica donde hay restricciones al dólar oficial. En <strong>Argentina</strong> es muy conocido y su cotización marca el ritmo del mercado paralelo. En <strong>Venezuela</strong> el dólar paralelo también es referencia. En <strong>Bolivia</strong>, el dólar blue se calcula con datos en tiempo real de Binance P2P y se actualiza cada 15 minutos en esta plataforma.</>
                  : <>The <strong>blue dollar</strong> exists in several Latin American countries with restrictions on the official dollar. In <strong>Argentina</strong> it is well known and its quote sets the pace for the parallel market. In <strong>Venezuela</strong> the parallel dollar is also a reference. In <strong>Bolivia</strong>, the blue dollar is calculated with real-time Binance P2P data and updated every 15 minutes on this platform.</>}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? <>Consulta la cotización del dólar blue en Bolivia en vivo: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Dólar blue hoy</Link> y <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">página principal</Link>.</>
                  : <>Check the blue dollar quote in Bolivia live: <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blue dollar today</Link> and <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">homepage</Link>.</>}
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Cómo Usar Esta Información' : '💡 How to Use This Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>Ahora que sabes qué es el dólar blue, puedes:</>
                    : <>Now that you know what the blue dollar is, you can:</>}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li><Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usar nuestra calculadora</Link> para convertir divisas</li>
                      <li><Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Aprender cómo comprar dólares</Link> de forma segura</li>
                      <li><Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Consultar el dólar blue hoy</Link> actualizado cada 15 minutos</li>
                      <li><Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Ver datos históricos</Link> del dólar blue</li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies</li>
                      <li><Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Learn how to buy dollars</Link> safely</li>
                      <li><Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Check the blue dollar today</Link> updated every 15 minutes</li>
                      <li><Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">View historical data</Link> of the blue dollar</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
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
                {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización actual' : 'Current quote'}
              </div>
            </Link>
            <Link
              to="/cuanto-esta-dolar-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? '¿Cuánto está el dólar?' : 'How much is the dollar?'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Precio actual' : 'Current price'}
              </div>
            </Link>
            <Link
              to="/datos-historicos"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Datos históricos' : 'Historical data'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Archivo de cotizaciones' : 'Quote archive'}
              </div>
            </Link>
            <Link
              to="/comprar-dolares"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Comprar dólares' : 'Buy dollars'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Guía' : 'Guide'}
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default QueEsDolarBlue;


