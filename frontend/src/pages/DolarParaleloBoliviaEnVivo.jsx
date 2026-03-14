import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlueRateCards from '../components/BlueRateCards';
import BlueChart from '../components/BlueChart';
import PageMeta from '../components/PageMeta';
import { SocialShare } from '../components/SocialShare';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchBlueRate } from '../utils/api';
import { formatDateTime } from '../utils/formatters';
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';
import { Link } from 'react-router-dom';
import { useAdsenseReadyWhen } from '../hooks/useAdsenseReady';

/**
 * DolarParaleloBoliviaEnVivo Component
 * SEO-optimized landing page targeting the high-volume keyword "dolar paralelo bolivia en vivo"
 * This page is designed to capture search traffic and outrank competitors
 */
function DolarParaleloBoliviaEnVivo() {
  const { language } = useLanguage();
  const [currentRate, setCurrentRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Only allow ads when content is loaded (AdSense policy compliance)
  useAdsenseReadyWhen(isLoading, currentRate !== null);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 900000); // 15 minutes
    return () => clearInterval(interval);
  }, []);

  const loadRates = async () => {
    try {
      const data = await fetchBlueRate();
      if (data && data.buy_bob_per_usd && data.sell_bob_per_usd) {
        setPreviousRate(currentRate);
        setCurrentRate({
          ...data,
          buy: data.buy_bob_per_usd,
          sell: data.sell_bob_per_usd
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rateDateModified = currentRate?.updated_at_iso ?? undefined;
  const webPageSchema = getWebPage({
    name: language === 'es' ? 'Dólar Paralelo Bolivia EN VIVO' : 'Bolivia Parallel Dollar LIVE',
    description: language === 'es'
      ? 'Cotización del dólar paralelo Bolivia EN VIVO. Actualizamos cada 15 minutos con datos de Binance P2P.'
      : 'Bolivia parallel dollar LIVE. We update every 15 minutes with Binance P2P data.',
    url: '/dolar-paralelo-bolivia-en-vivo',
    dateModified: rateDateModified || undefined,
    inLanguage: language === 'es' ? 'es-BO' : 'en-US',
    mainEntity: {
      '@type': 'FinancialProduct',
      name: language === 'es' ? 'Dólar Paralelo Bolivia' : 'Bolivia Parallel Dollar',
      description: language === 'es' ? 'Tipo de cambio del dólar paralelo en Bolivia' : 'Bolivia parallel dollar exchange rate'
    }
  });
  const breadcrumbSchema = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Dólar Paralelo Bolivia EN VIVO' : 'Bolivia Parallel Dollar LIVE', url: '/dolar-paralelo-bolivia-en-vivo' }
  ]);
  const structuredData = [webPageSchema, breadcrumbSchema];

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={language === 'es'
          ? '🔴 Dólar Paralelo Bolivia EN VIVO | Cotización en Tiempo Real'
          : '🔴 Bolivia Parallel Dollar LIVE | Real-Time Quote'}
        description={language === 'es'
          ? 'Dólar paralelo Bolivia EN VIVO. Cotización en tiempo real cada 15 min. Mercado cambiario boliviano. Ver precio ahora.'
          : 'Bolivia parallel dollar LIVE. Real-time quote every 15 min. Exchange market. Check price now.'}
        keywords="dolar blue en vivo, dolar paralelo bolivia en vivo, dolar blue bolivia en vivo, dolar paralelo bolivia, tipo cambio bolivia en vivo, cotizacion dolar blue bolivia, bolivia blue en vivo, precio dolar paralelo bolivia"
        canonical="/dolar-paralelo-bolivia-en-vivo"
        structuredData={structuredData}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section with Live Badge */}
        <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-red-300 dark:border-red-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">
              <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
              EN VIVO
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {language === 'es' ? 'Actualizado' : 'Updated'}: {currentRate?.updated_at_iso
                ? formatDateTime(currentRate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')
                : lastUpdate.toLocaleTimeString(language === 'es' ? 'es-BO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es'
              ? '🔴 Dólar Paralelo Bolivia EN VIVO'
              : '🔴 Bolivia Parallel Dollar LIVE'}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-6">
            {language === 'es'
              ? 'Cotización del dólar paralelo Bolivia EN VIVO. Aquí ves la cotización en tiempo real; actualizamos cada 15 minutos con datos de Binance P2P.'
              : 'Bolivia parallel dollar LIVE. Real-time quote here; we update every 15 minutes with Binance P2P data.'}
          </p>

          {/* Current Rate Display */}
          {!isLoading && currentRate && (
            <BlueRateCards />
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-600"></div>
            </div>
          )}
        </section>

        {/* What is Dolar Paralelo */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '¿Qué es el Dólar Paralelo Bolivia?'
              : 'What is the Bolivia Parallel Dollar?'}
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {language === 'es'
                ? 'El dólar paralelo Bolivia, también conocido como "dólar blue" o "dólar negro", es el tipo de cambio del dólar estadounidense que se negocia en el mercado informal boliviano. A diferencia del tipo de cambio oficial establecido por el Banco Central de Bolivia, el dólar paralelo refleja la verdadera oferta y demanda del mercado.'
                : 'The Bolivia parallel dollar, also known as "blue dollar" or "black dollar", is the US dollar exchange rate traded in the Bolivian informal market. Unlike the official exchange rate set by the Central Bank of Bolivia, the parallel dollar reflects the true market supply and demand.'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {language === 'es'
                ? 'Este mercado existe debido a las restricciones cambiarias y la escasez de dólares en el sistema bancario oficial boliviano. Millones de bolivianos consultan el dólar paralelo diariamente para realizar sus transacciones comerciales, remesas y operaciones financieras.'
                : 'This market exists due to exchange restrictions and dollar scarcity in the Bolivian official banking system. Millions of Bolivians check the parallel dollar daily for their commercial transactions, remittances, and financial operations.'}
            </p>
          </div>
        </section>

        {/* Historical Chart */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' 
              ? 'Evolución del Dólar Paralelo Bolivia'
              : 'Bolivia Parallel Dollar Evolution'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {language === 'es' ? 'Evolución del tipo de cambio en el tiempo.' : 'Exchange rate evolution over time.'}
          </p>
          <BlueChart />
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es'
              ? '⚡ Información EN VIVO - Actualizada Cada 15 Minutos'
              : '⚡ LIVE Information - Updated Every 15 Minutes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Más Rápido' : 'Faster'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Mientras otros sitios actualizan una vez al día o cada hora, nosotros actualizamos cada 15 minutos con datos directos de Binance P2P.'
                  : 'While other sites update once a day or hourly, we update every 15 minutes with direct Binance P2P data.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Más Preciso' : 'More Accurate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Obtenemos datos directamente de transacciones reales en Binance P2P Bolivia, el mercado P2P más grande del país.'
                  : 'We get data directly from real transactions on Binance P2P Bolivia, the largest P2P market in the country.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Gratis y Sin Registro' : 'Free and No Registration'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Acceso completamente gratuito sin necesidad de registro. Consulta el dólar paralelo Bolivia cuantas veces quieras.'
                  : 'Completely free access without registration required. Check the Bolivia parallel dollar as many times as you want.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Herramientas Completas' : 'Complete Tools'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Calculadora, gráficos históricos, análisis de tendencias y alertas de precio. Todo en un solo lugar.'
                  : 'Calculator, historical charts, trend analysis and price alerts. All in one place.'}
              </p>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'También te puede interesar' : 'You may also be interested in'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
            </Link>
            <Link to="/cuanto-esta-dolar-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? '¿Cuánto está el dólar?' : 'How much is the dollar?'}
            </Link>
            <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? 'Calculadora de divisas' : 'Currency calculator'}
            </Link>
            <Link to="/que-es-dolar-blue" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?'}
            </Link>
          </div>
        </section>

        {/* Social Share */}
        <SocialShare
          title="🔴 Dólar Paralelo Bolivia EN VIVO"
          description="Cotización del dólar paralelo en Bolivia actualizada cada 15 minutos"
        />

        {/* FAQ Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' 
              ? 'Preguntas Frecuentes sobre el Dólar Paralelo Bolivia'
              : 'Frequently Asked Questions about Bolivia Parallel Dollar'}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿Cada cuánto actualizan el dólar paralelo Bolivia?'
                  : 'How often do you update the Bolivia parallel dollar?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Actualizamos el dólar paralelo Bolivia cada 15 minutos, las 24 horas del día. Esto nos hace la fuente más actualizada de información sobre el tipo de cambio paralelo en Bolivia.'
                  : 'We update the Bolivia parallel dollar every 15 minutes, 24 hours a day. This makes us the most up-to-date source of information on the parallel exchange rate in Bolivia.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿De dónde obtienen los datos del dólar paralelo?'
                  : 'Where do you get the parallel dollar data from?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Obtenemos los datos directamente de Binance P2P Bolivia, la plataforma de intercambio peer-to-peer más grande de Bolivia. Los precios reflejan transacciones reales entre compradores y vendedores bolivianos.'
                  : 'We get data directly from Binance P2P Bolivia, the largest peer-to-peer exchange platform in Bolivia. Prices reflect real transactions between Bolivian buyers and sellers.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿Es legal consultar el dólar paralelo en Bolivia?'
                  : 'Is it legal to check the parallel dollar in Bolivia?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Sí, es completamente legal consultar información sobre el dólar paralelo. Somos un servicio informativo que proporciona datos públicos del mercado.'
                  : 'Yes, it is completely legal to check information about the parallel dollar. We are an information service that provides public market data.'}
              </p>
            </div>
          </div>
        </section>

        {/* Comprehensive Information Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es'
              ? 'Información Completa sobre el Dólar Paralelo Bolivia'
              : 'Complete Information about Bolivia Parallel Dollar'}
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {language === 'es' 
                ? '¿Qué es el Dólar Paralelo en Bolivia?'
                : 'What is the Parallel Dollar in Bolivia?'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'El dólar paralelo en Bolivia, también conocido como dólar blue, es el tipo de cambio del dólar estadounidense que se negocia fuera del sistema bancario oficial. Este mercado paralelo surge cuando hay restricciones o limitaciones en el acceso al dólar oficial, creando una demanda que se satisface a través de canales no oficiales. El dólar paralelo Bolivia refleja la oferta y demanda real del mercado, sin las restricciones que pueden existir en el sistema bancario formal.'
                : 'The parallel dollar in Bolivia, also known as blue dollar, is the exchange rate of the US dollar traded outside the official banking system. This parallel market arises when there are restrictions or limitations on access to the official dollar, creating demand that is satisfied through unofficial channels. The Bolivia parallel dollar reflects real market supply and demand, without the restrictions that may exist in the formal banking system.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {language === 'es' 
                ? '¿Por qué Existe el Dólar Paralelo en Bolivia?'
                : 'Why Does the Parallel Dollar Exist in Bolivia?'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'El dólar paralelo existe en Bolivia por varias razones económicas y estructurales:'
                : 'The parallel dollar exists in Bolivia for several economic and structural reasons:'}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              {language === 'es' ? (
                <>
                  <li><strong>Restricciones cambiarias:</strong> Cuando el acceso al dólar oficial está limitado, las personas buscan alternativas</li>
                  <li><strong>Control de capitales:</strong> Políticas que limitan la libre convertibilidad de monedas</li>
                  <li><strong>Diferencia de precios:</strong> El dólar paralelo puede ofrecer un precio más realista que refleja la oferta y demanda</li>
                  <li><strong>Necesidad de dólares:</strong> Muchos bolivianos necesitan dólares para transacciones internacionales, remesas, o ahorro</li>
                  <li><strong>Flexibilidad:</strong> El mercado paralelo ofrece más flexibilidad que el sistema bancario oficial</li>
                  <li><strong>Velocidad:</strong> Las transacciones en el mercado paralelo pueden ser más rápidas que en el sistema oficial</li>
                </>
              ) : (
                <>
                  <li><strong>Exchange restrictions:</strong> When access to the official dollar is limited, people seek alternatives</li>
                  <li><strong>Capital controls:</strong> Policies that limit free currency convertibility</li>
                  <li><strong>Price difference:</strong> The parallel dollar may offer a more realistic price that reflects supply and demand</li>
                  <li><strong>Need for dollars:</strong> Many Bolivians need dollars for international transactions, remittances, or savings</li>
                  <li><strong>Flexibility:</strong> The parallel market offers more flexibility than the official banking system</li>
                  <li><strong>Speed:</strong> Transactions in the parallel market can be faster than in the official system</li>
                </>
              )}
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {language === 'es' 
                ? 'Cómo Interpretar la Cotización EN VIVO'
                : 'How to Interpret the LIVE Quote'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'Cuando consultas el dólar paralelo Bolivia EN VIVO, es importante entender qué significan los números:'
                : 'When you check the Bolivia parallel dollar LIVE, it\'s important to understand what the numbers mean:'}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              {language === 'es' ? (
                <>
                  <li><strong>Precio de Compra:</strong> Es el precio al que puedes comprar dólares. Si ves 10.50 BOB, significa que necesitas 10.50 bolivianos para comprar 1 dólar.</li>
                  <li><strong>Precio de Venta:</strong> Es el precio al que puedes vender dólares. Generalmente es ligeramente más bajo que el precio de compra.</li>
                  <li><strong>Spread:</strong> La diferencia entre compra y venta representa el margen de los operadores.</li>
                  <li><strong>Actualización EN VIVO:</strong> Nuestra cotización se actualiza cada 15 minutos, reflejando cambios en tiempo real del mercado.</li>
                  <li><strong>Variación:</strong> Observa si el precio está subiendo (↗), bajando (↘), o estable (○) comparado con la última actualización.</li>
                </>
              ) : (
                <>
                  <li><strong>Buy Price:</strong> This is the price at which you can buy dollars. If you see 10.50 BOB, it means you need 10.50 bolivianos to buy 1 dollar.</li>
                  <li><strong>Sell Price:</strong> This is the price at which you can sell dollars. Generally it\'s slightly lower than the buy price.</li>
                  <li><strong>Spread:</strong> The difference between buy and sell represents operators\' margin.</li>
                  <li><strong>LIVE Update:</strong> Our quote is updated every 15 minutes, reflecting real-time market changes.</li>
                  <li><strong>Variation:</strong> Observe if the price is rising (↗), falling (↘), or stable (○) compared to the last update.</li>
                </>
              )}
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {language === 'es' 
                ? 'Ventajas de Consultar el Dólar Paralelo EN VIVO'
                : 'Advantages of Checking the Parallel Dollar LIVE'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'Consultar el dólar paralelo Bolivia EN VIVO te ofrece varias ventajas:'
                : 'Checking the Bolivia parallel dollar LIVE offers you several advantages:'}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              {language === 'es' ? (
                <>
                  <li><strong>Información actualizada:</strong> Sabes exactamente cuál es el precio actual del dólar paralelo</li>
                  <li><strong>Mejores decisiones:</strong> Puedes decidir cuándo es el mejor momento para cambiar dólares</li>
                  <li><strong>Transparencia:</strong> Ves el precio real del mercado, no solo el oficial</li>
                  <li><strong>Planificación:</strong> Puedes planificar tus transacciones con información precisa</li>
                  <li><strong>Comparación:</strong> Puedes comparar el dólar paralelo con el dólar oficial para entender la brecha</li>
                  <li><strong>Alertas:</strong> Puedes configurar alertas para ser notificado cuando el precio alcance un nivel específico</li>
                </>
              ) : (
                <>
                  <li><strong>Updated information:</strong> You know exactly what the current parallel dollar price is</li>
                  <li><strong>Better decisions:</strong> You can decide when is the best time to exchange dollars</li>
                  <li><strong>Transparency:</strong> You see the real market price, not just the official one</li>
                  <li><strong>Planning:</strong> You can plan your transactions with accurate information</li>
                  <li><strong>Comparison:</strong> You can compare the parallel dollar with the official dollar to understand the gap</li>
                  <li><strong>Alerts:</strong> You can set up alerts to be notified when the price reaches a specific level</li>
                </>
              )}
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {language === 'es' 
                ? 'Metodología de Nuestra Cotización EN VIVO'
                : 'Methodology of Our LIVE Quote'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'Nuestra cotización del dólar paralelo Bolivia EN VIVO se calcula utilizando una metodología transparente y precisa:'
                : 'Our Bolivia parallel dollar LIVE quote is calculated using a transparent and accurate methodology:'}
            </p>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              {language === 'es' ? (
                <>
                  <li><strong>Recopilación de datos:</strong> Obtenemos datos en tiempo real de Binance P2P Bolivia, la plataforma P2P más grande del país</li>
                  <li><strong>Procesamiento:</strong> Analizamos todas las ofertas públicas de compra y venta de USDT/BOB</li>
                  <li><strong>Cálculo de mediana:</strong> Calculamos la mediana de estas ofertas para obtener un precio representativo</li>
                  <li><strong>Actualización:</strong> El proceso se repite cada 15 minutos para mantener la información actualizada</li>
                  <li><strong>Validación:</strong> Validamos los datos para asegurar que reflejen transacciones reales</li>
                  <li><strong>Presentación:</strong> Mostramos la información de manera clara y accesible para todos los usuarios</li>
                </>
              ) : (
                <>
                  <li><strong>Data collection:</strong> We obtain real-time data from Binance P2P Bolivia, the largest P2P platform in the country</li>
                  <li><strong>Processing:</strong> We analyze all public buy and sell offers for USDT/BOB</li>
                  <li><strong>Median calculation:</strong> We calculate the median of these offers to obtain a representative price</li>
                  <li><strong>Update:</strong> The process repeats every 15 minutes to keep information updated</li>
                  <li><strong>Validation:</strong> We validate data to ensure it reflects real transactions</li>
                  <li><strong>Presentation:</strong> We display information clearly and accessibly for all users</li>
                </>
              )}
            </ol>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 sm:p-8 shadow-lg text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {language === 'es'
              ? '¿Necesitas más herramientas?'
              : 'Need more tools?'}
          </h2>
          <p className="text-lg mb-6">
            {language === 'es'
              ? 'Explora nuestra calculadora de divisas, gráficos históricos y alertas de precio'
              : 'Explore our currency calculator, historical charts and price alerts'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/calculadora"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              {language === 'es' ? '🧮 Calculadora' : '🧮 Calculator'}
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              {language === 'es' ? '📊 Ver Gráficos' : '📊 View Charts'}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default DolarParaleloBoliviaEnVivo;

