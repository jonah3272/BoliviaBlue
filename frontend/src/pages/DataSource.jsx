import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { BASE_URL, getWebPage, getBreadcrumbList, getFAQPage } from '../utils/seoSchema';
import { trackMethodologyPageViewed, trackRelatedLinkClicked } from '../utils/analyticsEvents';

function DataSource() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const methodologyViewedRef = useRef(false);

  const trackRel = (destination, link_label) => () =>
    trackRelatedLinkClicked({ language, destination, link_label, page_type: 'methodology' });

  useEffect(() => {
    if (methodologyViewedRef.current) return;
    methodologyViewedRef.current = true;
    trackMethodologyPageViewed({ language });
  }, [language]);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Metodología y Fuente de Datos' : 'Methodology & Data Source', url: '/fuente-de-datos' }
  ];

  const webPageSchema = getWebPage({
    name: language === 'es' ? 'Metodología y Fuente de Datos | Bolivia Blue' : 'Methodology & Data Source | Bolivia Blue',
    description: language === 'es'
      ? 'Cómo calculamos el dólar blue en Bolivia: fuente (Binance P2P), metodología (mediana), actualización cada 15 min. Para medios, investigadores y desarrolladores.'
      : 'How we calculate the Bolivia blue dollar rate: source (Binance P2P), methodology (median), update every 15 min. For media, researchers and developers.',
    url: '/fuente-de-datos',
    inLanguage: language === 'es' ? 'es-BO' : 'en-US'
  });

  const breadcrumbSchema = getBreadcrumbList(breadcrumbs);

  const faqItems = [
    {
      q: language === 'es' ? '¿De dónde vienen los datos del dólar blue?' : 'Where does the blue dollar data come from?',
      a: language === 'es'
        ? 'Los datos provienen de ofertas públicas de compra y venta en Binance P2P (par USDT/BOB). Calculamos la mediana de las ofertas de compra y la mediana de las ofertas de venta; el sistema se actualiza cada 15 minutos.'
        : 'Data comes from public buy and sell offers on Binance P2P (USDT/BOB pair). We calculate the median of buy offers and the median of sell offers; the system updates every 15 minutes.'
    },
    {
      q: language === 'es' ? '¿Con qué frecuencia se actualiza la cotización?' : 'How often is the rate updated?',
      a: language === 'es'
        ? 'La cotización se actualiza cada 15 minutos. Puedes ver la hora de la última actualización en la página principal y en la API.'
        : 'The rate is updated every 15 minutes. You can see the time of the last update on the homepage and in the API.'
    },
    {
      q: language === 'es' ? '¿En qué se diferencia el dólar blue del tipo de cambio oficial?' : 'How does the blue dollar differ from the official rate?',
      a: language === 'es'
        ? 'El tipo de cambio oficial lo fija el Banco Central de Bolivia y se usa en bancos. El dólar blue refleja el precio en el mercado paralelo (P2P) y suele ser distinto. Mostramos ambos en nuestra plataforma.'
        : 'The official rate is set by the Central Bank of Bolivia and used in banks. The blue dollar reflects the price in the parallel (P2P) market and is often different. We show both on our platform.'
    },
    {
      q: language === 'es' ? '¿Puedo usar estos datos en artículos o investigaciones?' : 'Can I use this data in articles or research?',
      a: language === 'es'
        ? 'Sí. Puedes citar nuestros datos mencionando "Bolivia Blue con Paz" o "boliviablue.com" como fuente. Los datos históricos están disponibles para descarga en CSV y JSON en la página de datos históricos.'
        : 'Yes. You can cite our data by mentioning "Bolivia Blue con Paz" or "boliviablue.com" as the source. Historical data is available for download in CSV and JSON on the historical data page.'
    }
  ];

  const faqSchema = getFAQPage(faqItems.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  })));

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue con Paz",
    "url": BASE_URL,
    "logo": `${BASE_URL}/favicon.svg`,
    "description": language === 'es'
      ? "Plataforma de seguimiento del tipo de cambio del dólar blue en Bolivia. Metodología transparente: Binance P2P, mediana, actualización cada 15 min."
      : "Tracking platform for the blue dollar exchange rate in Bolivia. Transparent methodology: Binance P2P, median, update every 15 min.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Media Inquiries",
      "email": "contact@boliviablue.com"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Metodología y Fuente de Datos | Dólar Blue Bolivia'
          : 'Methodology & Data Source | Bolivia Blue Dollar'}
        description={language === 'es'
          ? 'Cómo calculamos el dólar blue: fuente Binance P2P, mediana de ofertas, actualización cada 15 min. Diferencia con el tipo oficial. Para medios, investigadores y desarrolladores.'
          : 'How we calculate the blue dollar: Binance P2P source, median of offers, update every 15 min. Difference from official rate. For media, researchers and developers.'}
        keywords={language === 'es'
          ? 'metodología dólar blue, fuente datos bolivia, cómo se calcula dólar blue, Binance P2P bolivia, tipo cambio bolivia, datos periodistas, API dólar blue'
          : 'blue dollar methodology, bolivia data source, how blue dollar is calculated, Binance P2P bolivia, exchange rate bolivia, journalist data, blue dollar API'}
        canonical="/fuente-de-datos"
        structuredData={[organizationSchema, webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? 'Metodología y Fuente de Datos'
              : 'Methodology & Data Source'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Explicación transparente de qué es el dólar blue en Bolivia, de dónde vienen nuestros datos, cómo los calculamos y cómo citarlos. Para periodistas, investigadores y desarrolladores.'
              : 'Transparent explanation of what the Bolivia blue dollar is, where our data comes from, how we calculate it, and how to cite it. For journalists, researchers and developers.'}
          </p>
        </div>

        {/* What is the Bolivia Blue rate */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="que-es">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '¿Qué es el dólar blue en Bolivia?' : 'What is the Bolivia Blue Dollar?'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'El "dólar blue" (o dólar paralelo) es el tipo de cambio al que se compra y vende el dólar estadounidense fuera del sistema bancario oficial en Bolivia. Refleja el precio real en el mercado paralelo, donde personas y plataformas P2P intercambian dólares o USDT por bolivianos.'
                : 'The "blue dollar" (or parallel dollar) is the exchange rate at which the US dollar is bought and sold outside the official banking system in Bolivia. It reflects the real price in the parallel market, where individuals and P2P platforms exchange dollars or USDT for bolivianos.'}
            </p>
            <p>
              {language === 'es'
                ? 'Bolivia Blue con Paz rastrea este tipo de cambio usando datos públicos del mercado P2P de Binance (par USDT/BOB), de forma transparente y actualizada.'
                : 'Bolivia Blue con Paz tracks this exchange rate using public data from Binance\'s P2P market (USDT/BOB pair), in a transparent and up-to-date way.'}
            </p>
          </div>
        </section>

        {/* Data source */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="fuente">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Fuente de los datos' : 'Data Source'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Utilizamos únicamente datos públicos de Binance P2P: el mercado peer-to-peer de Binance donde usuarios publican ofertas de compra y venta de USDT contra bolivianos (BOB). No recopilamos datos de redes sociales ni de otras plataformas para la cotización principal.'
                : 'We use only public data from Binance P2P: Binance\'s peer-to-peer market where users post buy and sell offers for USDT against bolivianos (BOB). We do not collect data from social networks or other platforms for the main quote.'}
            </p>
            <p>
              {language === 'es'
                ? 'Binance P2P es una fuente verificable y ampliamente utilizada para el precio del dólar en el mercado paralelo en Bolivia.'
                : 'Binance P2P is a verifiable and widely used source for the dollar price in Bolivia\'s parallel market.'}
            </p>
          </div>
        </section>

        {/* How the rate is calculated */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="calculo">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Cómo se calcula la cotización' : 'How the Rate is Calculated'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Para cada actualización, obtenemos una muestra de ofertas de compra (BUY) y de venta (SELL) del par USDT/BOB en Binance P2P. Sobre esas muestras aplicamos la mediana (no el promedio) para reducir el impacto de ofertas atípicas.'
                : 'For each update, we obtain a sample of buy (BUY) and sell (SELL) offers for the USDT/BOB pair on Binance P2P. We apply the median (not the average) to these samples to reduce the impact of outlier offers.'}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                {language === 'es'
                  ? 'Cotización de compra (buy): mediana de las ofertas de compra de USDT (en BOB por USDT).'
                  : 'Buy rate: median of buy offers for USDT (in BOB per USDT).'}
              </li>
              <li>
                {language === 'es'
                  ? 'Cotización de venta (sell): mediana de las ofertas de venta de USDT (en BOB por USDT).'
                  : 'Sell rate: median of sell offers for USDT (in BOB per USDT).'}
              </li>
              <li>
                {language === 'es'
                  ? 'El valor "mid" (promedio) que mostramos es el punto medio entre compra y venta.'
                  : 'The "mid" (average) value we show is the midpoint between buy and sell.'}
              </li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es'
                ? 'USDT se considera equivalente a 1 USD a efectos de cotización en este mercado.'
                : 'USDT is treated as equivalent to 1 USD for quoting purposes in this market.'}
            </p>
          </div>
        </section>

        {/* Update frequency */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="frecuencia">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Frecuencia de actualización' : 'Update Frequency'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'La cotización del dólar blue se actualiza automáticamente cada 15 minutos. En cada ciclo se consulta Binance P2P, se calculan las medianas y se guarda un nuevo registro en nuestra base de datos (que alimenta la web y la API).'
                : 'The blue dollar rate is updated automatically every 15 minutes. In each cycle we query Binance P2P, compute the medians, and store a new record in our database (which feeds the website and the API).'}
            </p>
            <p>
              {language === 'es'
                ? 'La hora de la última actualización se muestra en la página principal y está disponible en la respuesta de la API.'
                : 'The time of the last update is shown on the homepage and is available in the API response.'}
            </p>
          </div>
        </section>

        {/* Blue vs official rate */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="blue-vs-oficial">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Dólar blue frente al tipo de cambio oficial' : 'Blue Dollar vs Official Rate'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'El tipo de cambio oficial lo establece el Banco Central de Bolivia (BCB) y es el que usan los bancos para operaciones reguladas. El dólar blue es el precio en el mercado paralelo (P2P) y suele ser distinto: puede estar por encima o por debajo según la oferta y la demanda.'
                : 'The official exchange rate is set by the Central Bank of Bolivia (BCB) and is used by banks for regulated operations. The blue dollar is the price in the parallel (P2P) market and is often different: it can be above or below depending on supply and demand.'}
            </p>
            <p>
              {language === 'es'
                ? 'En nuestra plataforma mostramos ambas cotizaciones: la del mercado paralelo (blue, desde Binance P2P) y la oficial (desde el BCB o fuentes que reflejan el tipo oficial). No modificamos ni mezclamos estas fuentes.'
                : 'On our platform we show both rates: the parallel market (blue, from Binance P2P) and the official rate (from the BCB or sources that reflect the official rate). We do not modify or mix these sources.'}
            </p>
            <Link
              to="/comparacion"
              onClick={trackRel('/comparacion', 'comparison')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Comparar con otros sitios →' : 'Compare with other sites →'}
            </Link>
          </div>
        </section>

        {/* Historical data and downloads */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="historicos">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Datos históricos y descargas' : 'Historical Data and Downloads'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Guardamos un registro de cada actualización, lo que permite consultar series históricas, gráficos y estadísticas. Los datos históricos están disponibles en la página de datos históricos y mediante URLs estables en CSV y JSON.'
                : 'We store a record of each update, which allows you to query historical series, charts and statistics. Historical data is available on the historical data page and via stable URLs in CSV and JSON.'}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <Link
                  to="/datos-historicos"
                  onClick={trackRel('/datos-historicos', 'historical')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {language === 'es' ? 'Datos históricos' : 'Historical data'}
                </Link>
                {language === 'es' ? ' – gráficos, tabla y descarga por período.' : ' – charts, table and download by period.'}
              </li>
              <li>
                {language === 'es'
                  ? 'Exportación pública: CSV y JSON por rango (30d, 90d, 1y, all) en URLs estables. Ver enlaces en la misma página.'
                  : 'Public export: CSV and JSON by range (30d, 90d, 1y, all) at stable URLs. See links on that page.'}
              </li>
              <li>
                <Link
                  to="/reporte-mensual/1/2025"
                  onClick={trackRel('/reporte-mensual/1/2025', 'monthly_reports')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {language === 'es' ? 'Reportes mensuales' : 'Monthly reports'}
                </Link>
                {language === 'es' ? ' – resúmenes por mes.' : ' – monthly summaries.'}
              </li>
            </ul>
          </div>
        </section>

        {/* About Our Data - kept for continuity, shortened */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Resumen de nuestros datos' : 'Summary of Our Data'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{language === 'es' ? 'Actualizados cada 15 minutos' : 'Updated every 15 minutes'}</li>
              <li>{language === 'es' ? 'Basados en datos públicos de Binance P2P (USDT/BOB)' : 'Based on public Binance P2P data (USDT/BOB)'}</li>
              <li>{language === 'es' ? 'Calculados con mediana de ofertas (más robusto que el promedio)' : 'Calculated with median of offers (more robust than average)'}</li>
              <li>{language === 'es' ? 'Histórico disponible para análisis y descarga' : 'History available for analysis and download'}</li>
              <li>{language === 'es' ? 'Transparentes y verificables' : 'Transparent and verifiable'}</li>
            </ul>
          </div>
        </section>

        {/* API and developer use */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="api">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'API y uso para desarrolladores' : 'API and Developer Use'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Ofrecemos acceso programático a la cotización actual y a datos históricos mediante endpoints REST. Los datos se sirven en JSON y se actualizan con la misma frecuencia que la web (cada 15 minutos).'
                : 'We offer programmatic access to the current rate and historical data via REST endpoints. Data is served in JSON and updates at the same frequency as the website (every 15 minutes).'}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
              <code className="text-blue-600 dark:text-blue-400">
                GET {BASE_URL}/api/blue-rate
              </code>
            </div>
            <p className="text-sm">
              {language === 'es'
                ? 'Para la cotización actual, histórico por rango y documentación completa:'
                : 'For current rate, history by range and full documentation:'}
            </p>
            <Link
              to="/api-docs"
              onClick={trackRel('/api-docs', 'api_docs_cta')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
            >
              {language === 'es' ? 'Ver documentación API' : 'View API documentation'}
            </Link>
          </div>
        </section>

        {/* How to cite */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200 dark:border-blue-800" id="citar">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Cómo citar Bolivia Blue' : 'How to Cite Bolivia Blue'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Cuando uses nuestros datos en artículos, reportes o aplicaciones, incluye una atribución clara. Formato recomendado:'
                : 'When using our data in articles, reports or applications, include a clear attribution. Recommended format:'}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {language === 'es'
                  ? 'Fuente: Bolivia Blue, boliviablue.com, actualización cada 15 minutos.'
                  : 'Source: Bolivia Blue, boliviablue.com, updated every 15 minutes.'}
              </p>
            </div>
            <p className="text-sm">
              {language === 'es'
                ? 'Alternativas: "Bolivia Blue con Paz (boliviablue.com)" o "según datos de boliviablue.com".'
                : 'Alternatives: "Bolivia Blue con Paz (boliviablue.com)" or "according to data from boliviablue.com".'}
            </p>
          </div>
        </section>

        {/* Limitations and transparency */}
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-8 border-2 border-amber-200 dark:border-amber-800" id="limitaciones">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Limitaciones y transparencia' : 'Limitations and Transparency'}
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
            <p>
              {language === 'es'
                ? 'Nuestros datos se basan en información pública de Binance P2P y representan una estimación del mercado paralelo en Bolivia. No constituyen asesoramiento financiero ni una oferta de compra o venta.'
                : 'Our data is based on public information from Binance P2P and represents an estimate of the parallel market in Bolivia. It does not constitute financial advice or an offer to buy or sell.'}
            </p>
            <p>
              {language === 'es'
                ? 'Los usuarios deben verificar las tasas vigentes antes de realizar transacciones. El precio real en una operación P2P puede variar según el monto, el método de pago y la contraparte.'
                : 'Users should verify current rates before making transactions. The actual price in a P2P transaction may vary depending on amount, payment method and counterparty.'}
            </p>
            <p>
              {language === 'es'
                ? 'Si Binance P2P no devuelve suficientes ofertas en un ciclo, ese registro podría retrasarse hasta la siguiente actualización exitosa.'
                : 'If Binance P2P does not return enough offers in a cycle, that update may be delayed until the next successful run.'}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="faq">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-6">
            {faqItems.map(({ q, a }, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{q}</h3>
                <p className="text-gray-700 dark:text-gray-300">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact for Media */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '📧 Contacto para Medios' : '📧 Media Contact'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Si eres periodista o representante de un medio de comunicación y necesitas:'
                : 'If you are a journalist or media representative and need:'}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                {language === 'es'
                  ? 'Datos históricos específicos'
                  : 'Specific historical data'}
              </li>
              <li>
                {language === 'es'
                  ? 'Acceso a nuestra API'
                  : 'Access to our API'}
              </li>
              <li>
                {language === 'es'
                  ? 'Entrevistas o comentarios expertos'
                  : 'Interviews or expert comments'}
              </li>
              <li>
                {language === 'es'
                  ? 'Datos personalizados o exportaciones'
                  : 'Custom data or exports'}
              </li>
            </ul>
            <p className="mt-4">
              {language === 'es'
                ? 'Por favor contáctanos a través de nuestra página de contacto:'
                : 'Please contact us through our contact page:'}
            </p>
            <Link
              to="/contacto"
              onClick={trackRel('/contacto', 'contact')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {language === 'es' ? 'Ir a Contacto' : 'Go to Contact'}
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Enlaces útiles' : 'Useful links'}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/" onClick={trackRel('/', 'current_rate')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {language === 'es' ? 'Cotización actual' : 'Current rate'}
            </Link>
            <Link
              to="/datos-historicos"
              onClick={trackRel('/datos-historicos', 'historical_footer')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Datos históricos' : 'Historical data'}
            </Link>
            <Link
              to="/api-docs"
              onClick={trackRel('/api-docs', 'api_docs')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Documentación API' : 'API documentation'}
            </Link>
            <Link
              to="/comparacion"
              onClick={trackRel('/comparacion', 'comparison_footer')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Comparación' : 'Comparison'}
            </Link>
            <Link
              to="/reporte-mensual/1/2025"
              onClick={trackRel('/reporte-mensual/1/2025', 'monthly_reports_footer')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Reportes mensuales' : 'Monthly reports'}
            </Link>
            <Link
              to="/que-es-dolar-blue"
              onClick={trackRel('/que-es-dolar-blue', 'what_is_blue')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '¿Qué es el dólar blue?' : 'What is the blue dollar?'}
            </Link>
            <Link
              to="/acerca-de"
              onClick={trackRel('/acerca-de', 'about')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Acerca de' : 'About'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default DataSource;

