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
import { formatDateTime } from '../utils/formatters';
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';
import { buildLiveRateSeoMeta, ratesFromBluePayload, liveBobParts } from '../utils/seoRateMeta';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import PrimaryRateLink from '../components/PrimaryRateLink';
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
  const live = liveBobParts(currentRate);

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

  const rateDateModified = currentRate?.updated_at_iso ?? undefined;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "¿Cuánto Está el Dólar en Bolivia Hoy? Precio Actual | Cada 15 Min"
      : "How Much Is the Dollar in Bolivia Today? Current Price | Every 15 Min",
    "description": language === 'es'
      ? "¿Cuánto está el dólar en Bolivia? Consulta el precio actual del dólar blue en Bolivia. Cotización en tiempo real actualizada cada 15 minutos. Gráficos históricos y calculadora gratuita."
      : "How much is the dollar in Bolivia? Check the current blue dollar price in Bolivia. Real-time quote updated every 15 minutes. Historical charts and free calculator.",
    "author": { "@type": "Organization", "name": "Bolivia Blue" },
    "publisher": { "@type": "Organization", "name": "Bolivia Blue", "logo": { "@type": "ImageObject", "url": "https://boliviablue.com/favicon.svg" } },
    "datePublished": "2025-01-01",
    ...(rateDateModified && { "dateModified": rateDateModified })
  };

  const webPageSchema = getWebPage({
    name: language === 'es' ? '¿Cuánto Está el Dólar en Bolivia?' : 'How Much is the Dollar in Bolivia?',
    description: language === 'es' ? 'Respuesta directa: el precio actual del dólar blue está abajo; usa la calculadora para cualquier monto.' : 'Direct answer: the current blue dollar price is below; use the calculator for any amount.',
    url: '/cuanto-esta-dolar-bolivia',
    dateModified: rateDateModified,
    inLanguage: language === 'es' ? 'es-BO' : 'en-US'
  });

  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? '¿Cuánto Está el Dólar?' : 'How Much is the Dollar?', url: '/cuanto-esta-dolar-bolivia' }
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Cuánto está el dólar en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr && live.sellStr
            ? `El dólar blue en Bolivia está actualmente en ${live.buyStr} BOB por USD para compra y ${live.sellStr} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
            : 'El dólar blue (paralelo) en Bolivia se publica en vivo en boliviablue.com como mediana P2P, actualizada cada ~15 minutos.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto vale el dólar en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr
            ? `El dólar blue vale actualmente ${live.buyStr} BOB por USD. Esto significa que 1 dólar estadounidense equivale a ${live.buyStr} bolivianos en el mercado paralelo.`
            : 'El dólar blue (paralelo) se actualiza en vivo en boliviablue.com. Abrí la página para ver la compra y venta actuales.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es $100 USD en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr
            ? `Con el dólar blue actual (${live.buyStr} BOB por USD), $100 USD equivalen a aproximadamente ${live.times(100)} BOB. Con la tasa oficial del BCB serían menos. La diferencia puede ser significativa.`
            : 'Usá la calculadora con la cotización blue en vivo para convertir $100 USD a bolivianos al tipo paralelo.'
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 1 USD a 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr
            ? `El dólar blue actualmente está en ${live.buyStr} BOB por USD. Esto significa que 1 USD equivale a aproximadamente ${live.buyStr} BOB, mientras que 1 BOB equivale a aproximadamente ${(1 / Number(live.buyStr)).toFixed(4)} USD.`
            : 'El dólar blue (paralelo) se actualiza en vivo en boliviablue.com. 1 USD equivale a varios bolivianos al tipo paralelo, no al tipo oficial del BCB.'
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How much is the dollar in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr && live.sellStr
            ? `The blue dollar in Bolivia is currently ${live.buyStr} BOB per USD for buying and ${live.sellStr} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
            : 'The Bolivia blue (parallel) dollar is published live on boliviablue.com as a P2P median, updated about every 15 minutes.'
        }
      },
      {
        "@type": "Question",
        "name": "How much is $100 USD in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": live.buyStr
            ? `With the current blue dollar (${live.buyStr} BOB per USD), $100 USD equals approximately ${live.times(100)} BOB. The official BCB rate would convert to fewer bolivianos. The difference can be significant.`
            : 'Use the calculator with the live blue rate to convert $100 USD to bolivianos at the parallel price.'
        }
      }
    ]
  };

  const liveSeo = buildLiveRateSeoMeta({
    ...ratesFromBluePayload(currentRate),
    language,
    page: 'cuanto',
  });

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es'
          ? "cuánto está el dólar en bolivia, cuánto vale el dólar en bolivia, precio dólar bolivia, cotización dólar bolivia, cuánto es el dólar en bolivia, precio dólar blue bolivia, cuánto cuesta el dólar en bolivia"
          : "how much is dollar in bolivia, dollar price bolivia, dollar quote bolivia, how much is dollar bolivia, blue dollar price bolivia, dollar cost bolivia"}
        canonical="/cuanto-esta-dolar-bolivia"
        structuredData={[webPageSchema, breadcrumbSchema, articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <PrimaryRateLink />
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
        <p className="text-center text-base text-gray-600 dark:text-gray-400 mb-1">
          {language === 'es'
            ? 'Compra y venta blue abajo. P2P, no el banco.'
            : 'Buy and sell below. P2P, not the bank.'}
        </p>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es' ? 'Última actualización' : 'Last updated'}: {currentRate?.updated_at_iso
            ? formatDateTime(currentRate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')
            : lastUpdated.toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}
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
                    {live.buyStr || '—'} BOB
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
                    {live.sellStr || '—'} BOB
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
                    {live.times(100) || '—'} BOB
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {language === 'es' ? (
              <>Evolución reciente. Histórico completo: <Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline">Datos históricos</Link>.</>
            ) : (
              <>Recent evolution. Full history: <Link to="/datos-historicos" className="text-blue-600 dark:text-blue-400 hover:underline">Historical data</Link>.</>
            )}
          </p>
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
                  ? <>Cuando alguien pregunta <strong>¿cuánto está el dólar en Bolivia?</strong>, casi siempre quiere un número usable ya: cuántos bolivianos recibe por USD al tipo <strong>blue / paralelo</strong> (no el BCB). Aquí mostramos compra y venta en vivo, tablas de conversión rápidas y enlace a la <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculadora</Link>. Para seguir el mercado minuto a minuto usa <Link to="/dolar-paralelo-bolivia-en-vivo" className="text-blue-600 dark:text-blue-400 hover:underline">dólar paralelo EN VIVO</Link>; para el cierre del día con fecha, <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">dólar blue hoy</Link>.</>
                  : <>When people ask <strong>how much is the dollar in Bolivia?</strong>, they usually want a usable number now: how many bolivianos per USD at the <strong>blue / parallel</strong> rate (not BCB). Here you’ll find live buy/sell, quick conversion tables, and the <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline">calculator</Link>. For minute-by-minute watching use <Link to="/dolar-paralelo-bolivia-en-vivo" className="text-blue-600 dark:text-blue-400 hover:underline">parallel dollar LIVE</Link>; for a dated daily close, <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline">blue dollar today</Link>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Conversiones Comunes'
                  : 'Common Conversions'}
              </h3>
              {live.buyStr && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    {[1, 10, 50, 100, 500, 1000].map((n) => (
                      <li key={n}>
                        <strong>${n} USD</strong> = {live.times(n)} BOB
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por Qué el Precio del Dólar Varía en Bolivia?'
                  : 'Why Does the Dollar Price Vary in Bolivia?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El precio del dólar en Bolivia puede variar significativamente entre el dólar oficial y el dólar blue. Esta variación se debe a varios factores económicos y políticos:'
                  : 'The dollar price in Bolivia can vary significantly between the official dollar and the blue dollar. This variation is due to several economic and political factors:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Restricciones cambiarias:</strong> El acceso limitado a dólares en el sistema oficial crea demanda en el mercado paralelo</li>
                    <li><strong>Oferta y demanda:</strong> Cuando la demanda de dólares supera la oferta oficial, el precio en el mercado paralelo sube</li>
                    <li><strong>Inflación:</strong> La inflación puede hacer que las personas busquen dólares como protección de valor</li>
                    <li><strong>Confianza económica:</strong> La falta de confianza en la moneda local aumenta la demanda de dólares</li>
                    <li><strong>Políticas gubernamentales:</strong> Decisiones del gobierno y el Banco Central afectan directamente el mercado</li>
                    <li><strong>Factores internacionales:</strong> Condiciones económicas globales y precios de commodities</li>
                  </>
                ) : (
                  <>
                    <li><strong>Exchange restrictions:</strong> Limited access to dollars in the official system creates demand in the parallel market</li>
                    <li><strong>Supply and demand:</strong> When dollar demand exceeds official supply, the price in the parallel market rises</li>
                    <li><strong>Inflation:</strong> Inflation can make people seek dollars as a store of value</li>
                    <li><strong>Economic confidence:</strong> Lack of confidence in the local currency increases dollar demand</li>
                    <li><strong>Government policies:</strong> Government and Central Bank decisions directly affect the market</li>
                    <li><strong>International factors:</strong> Global economic conditions and commodity prices</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Interpretar el Precio del Dólar en Bolivia'
                  : 'How to Interpret the Dollar Price in Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Cuando consultas cuánto está el dólar en Bolivia, es importante entender qué significa cada precio:'
                  : 'When you check how much the dollar is in Bolivia, it\'s important to understand what each price means:'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {language === 'es' ? (
                    <>
                      <li><strong>Precio de Compra:</strong> Es cuántos bolivianos necesitás para obtener 1 USD en el paralelo. El número de compra en las tarjetas de arriba es esa referencia P2P, no un precio de ventanilla.</li>
                      <li><strong>Precio de Venta:</strong> Es el precio al que puedes vender dólares. Generalmente es ligeramente más bajo que el precio de compra.</li>
                      <li><strong>Precio Promedio (Mid):</strong> Es el promedio entre compra y venta, útil para estimaciones generales.</li>
                      <li><strong>Brecha Cambiaria:</strong> La diferencia entre el dólar blue y el dólar oficial indica la presión sobre la moneda local.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Buy Price:</strong> How many bolivianos you need to obtain 1 USD on the parallel market. The buy number on the cards above is that P2P reference, not a cash-desk price.</li>
                      <li><strong>Sell Price:</strong> This is the price at which you can sell dollars. Generally it\'s slightly lower than the buy price.</li>
                      <li><strong>Average Price (Mid):</strong> This is the average between buy and sell, useful for general estimates.</li>
                      <li><strong>Exchange Gap:</strong> The difference between the blue dollar and the official dollar indicates pressure on the local currency.</li>
                    </>
                  )}
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Preguntas Frecuentes sobre el Precio del Dólar'
                  : 'Frequently Asked Questions about Dollar Price'}
              </h3>
              <div className="space-y-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'es' ? '¿Cuánto está el dólar en Bolivia hoy?' : 'How much is the dollar in Bolivia today?'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? live.buyStr && live.sellStr
                        ? `El dólar blue en Bolivia hoy está en ${live.buyStr} BOB por USD para compra y ${live.sellStr} BOB por USD para venta. Esta cotización se actualiza cada 15 minutos en nuestra plataforma.`
                        : 'El dólar blue (paralelo) en Bolivia se publica en vivo aquí. La cotización se actualiza cada 15 minutos.'
                      : live.buyStr && live.sellStr
                        ? `The blue dollar in Bolivia today is ${live.buyStr} BOB per USD for buying and ${live.sellStr} BOB per USD for selling. This quote is updated every 15 minutes on our platform.`
                        : 'The blue dollar in Bolivia is published live here. The quote updates every 15 minutes.'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'es' ? '¿Por qué hay dos precios del dólar?' : 'Why are there two dollar prices?'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'En Bolivia existen dos mercados de dólares: el oficial (controlado por el Banco Central) y el paralelo o blue (mercado libre). El precio del dólar blue generalmente es más alto porque refleja la oferta y demanda real sin restricciones.'
                      : 'In Bolivia there are two dollar markets: the official (controlled by the Central Bank) and the parallel or blue (free market). The blue dollar price is generally higher because it reflects real supply and demand without restrictions.'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'es' ? '¿Cuál precio debo usar?' : 'Which price should I use?'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'Depende de tu situación. Si puedes acceder al dólar oficial, úsalo. Si no, el dólar blue es el precio real al que puedes realizar transacciones. Muchos bolivianos usan el dólar blue porque es más accesible y refleja el mercado real.'
                      : 'It depends on your situation. If you can access the official dollar, use it. If not, the blue dollar is the real price at which you can make transactions. Many Bolivians use the blue dollar because it\'s more accessible and reflects the real market.'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de Divisas' : '💡 Currency Calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>¿Necesitas convertir otra cantidad? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir cualquier cantidad de dólares a bolivianos o viceversa usando el tipo de cambio actual. También puedes <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">consultar el dólar blue hoy</Link> para ver la cotización más reciente.</>
                    : <>Need to convert another amount? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert any amount of dollars to bolivianos or vice versa using the current exchange rate. You can also <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">check the blue dollar today</Link> to see the most recent quote.</>}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
                {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización del día' : 'Today\'s quote'}
              </div>
            </Link>
            <Link
              to="/dolar-paralelo-bolivia-en-vivo"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Dólar paralelo EN VIVO' : 'Parallel dollar LIVE'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización en tiempo real' : 'Real-time quote'}
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CuantoEstaDolarBolivia;


