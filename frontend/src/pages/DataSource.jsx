import { useEffect, useRef } from 'react';
import { getDataDocumentationPage, PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON } from '../data/dataDocumentation';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/seoSchema';
import { trackMethodologyPageViewed, trackRelatedLinkClicked } from '../utils/analyticsEvents';
import { LLMS_TXT_URL } from '../utils/citationCopy';

function DataSource() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const page = getDataDocumentationPage('/fuente-de-datos', language);
  const { copy } = page;
  const methodologyViewedRef = useRef(false);

  const trackRel = (destination, link_label) => () =>
    trackRelatedLinkClicked({ language, destination, link_label, page_type: 'methodology' });

  useEffect(() => {
    if (methodologyViewedRef.current) return;
    methodologyViewedRef.current = true;
    trackMethodologyPageViewed({ language });
  }, [language]);

  const { breadcrumbs, webPageSchema, breadcrumbSchema, faqItems, faqSchema } = page;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue",
    "url": BASE_URL,
    "logo": `${BASE_URL}/favicon.svg`,
    "description": language === 'es'
      ? "Plataforma de seguimiento del tipo de cambio del dólar blue en Bolivia. Metodología transparente: referencia P2P, mediana, actualizaciones periódicas."
      : "Tracking platform for the blue dollar exchange rate in Bolivia. Transparent methodology: P2P reference, median, periodic updates.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Media Inquiries",
      "email": "contact@boliviablue.com"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={copy.title}
        description={copy.description}
        keywords={copy.keywords}
        canonical="/fuente-de-datos"
        structuredData={[organizationSchema, webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        <section
          className="mb-8 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/30 p-6"
          aria-label={copy.citationGuideLabel}
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {copy.citationGuideHeading}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {copy.citationGuideDescription}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/dolar-blue-hoy" className="font-semibold text-sky-700 hover:underline dark:text-sky-300" onClick={trackRel('/dolar-blue-hoy', 'dolar-blue-hoy')}>
              {copy.todayLabel}
            </Link>
            <Link to="/prensa" className="font-semibold text-sky-700 hover:underline dark:text-sky-300" onClick={trackRel('/prensa', 'prensa')}>
              {copy.pressLabel}
            </Link>
            <Link to="/api-docs" className="font-semibold text-sky-700 hover:underline dark:text-sky-300" onClick={trackRel('/api-docs', 'api-docs')}>
              API
            </Link>
            <a href={LLMS_TXT_URL} className="font-semibold text-sky-700 hover:underline dark:text-sky-300">
              llms.txt
            </a>
          </div>
        </section>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.heading}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {copy.introduction}
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
                ? 'Bolivia Blue rastrea este tipo de cambio con una lectura verificada: mediana cross-source de plataformas P2P (USDT/BOB), de forma transparente y actualizada.'
                : 'Bolivia Blue tracks this exchange rate with a verified reading: cross-source median from P2P platforms (USDT/BOB), transparent and up to date.'}
            </p>
          </div>
        </section>

        {/* Data source */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="fuente">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.sourceHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.sourceDescription}
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
            {copy.calculationHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.calculationDescription}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                {copy.buyDefinition}
              </li>
              <li>
                {copy.sellDefinition}
              </li>
              <li>
                {copy.midDefinition}
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
            {copy.frequencyHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.frequencyDescription}
            </p>
            <p>
              {copy.timestampDescription}
            </p>
          </div>
        </section>

        {/* Blue vs official rate */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="blue-vs-oficial">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.officialHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.officialDescription}
            </p>
            <p>
              {copy.officialSeparation}
            </p>
            <Link
              to="/comparacion"
              onClick={trackRel('/comparacion', 'comparison')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {copy.comparisonLabel}
            </Link>
          </div>
        </section>

        {/* Historical data and downloads */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="historicos">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.historyHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.historyDescription}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <Link
                  to="/datos-historicos"
                  onClick={trackRel('/datos-historicos', 'historical')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {copy.historyLabel}
                </Link>
                {copy.historyLinkDescription}
              </li>
              <li>
                {copy.exportLimits}
              </li>
              <li className="flex flex-wrap gap-4">
                <a href={PUBLIC_HISTORY_CSV} className="text-blue-600 dark:text-blue-400 hover:underline">CSV (30d)</a>
                <a href={PUBLIC_HISTORY_JSON} className="text-blue-600 dark:text-blue-400 hover:underline">JSON (30d)</a>
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

        <section className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 mb-8" id="provenance">
          <h2 className="text-xl font-bold mb-3">{copy.provenanceHeading}</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {copy.provenanceDescription}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {copy.coverageDescription}
          </p>
        </section>

        {/* About Our Data - kept for continuity, shortened */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Resumen de nuestros datos' : 'Summary of Our Data'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{language === 'es' ? 'Intentos de actualización periódicos' : 'Periodic update attempts'}</li>
              <li>{language === 'es' ? 'Basados en datos públicos P2P (USDT/BOB)' : 'Based on public P2P data (USDT/BOB)'}</li>
              <li>{language === 'es' ? 'Calculados con mediana de ofertas (más robusto que el promedio)' : 'Calculated with median of offers (more robust than average)'}</li>
              <li>{language === 'es' ? 'Histórico disponible para análisis y descarga' : 'History available for analysis and download'}</li>
              <li>{language === 'es' ? 'Transparentes y verificables' : 'Transparent and verifiable'}</li>
            </ul>
          </div>
        </section>

        {/* API and developer use */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="api">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.apiHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.apiDescription}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
              <code className="text-blue-600 dark:text-blue-400">
                GET {BASE_URL}/api/blue-rate
              </code>
            </div>
            <p className="text-sm">
              {copy.apiIntroduction}
            </p>
            <Link
              to="/api-docs"
              onClick={trackRel('/api-docs', 'api_docs_cta')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
            >
              {copy.apiLabel}
            </Link>
          </div>
        </section>

        {/* How to cite */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200 dark:border-blue-800" id="citar">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.citeHeading}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {copy.citeIntroduction}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {copy.citation}
              </p>
            </div>
            <p className="text-sm">
              {copy.citationAlternatives}
            </p>
          </div>
        </section>

        {/* Limitations and transparency */}
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-8 border-2 border-amber-200 dark:border-amber-800" id="limitaciones">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.limitationsHeading}
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
            <p>
              {copy.limitationsDescription}
            </p>
            <p>
              {copy.executionWarning}
            </p>
            <p>
              {copy.delayWarning}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8" id="faq">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {copy.faqHeading}
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
              {copy.contactLabel}
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
              to="/widget"
              onClick={trackRel('/widget', 'widget')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Widget
            </Link>
            <Link
              to="/prensa"
              onClick={trackRel('/prensa', 'press')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'Kit de prensa' : 'Press kit'}
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

