import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';

function DataSource() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Fuente de Datos' : 'Data Source', url: '/fuente-de-datos' }
  ];

  // Organization schema for structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue con Paz",
    "url": "https://boliviablue.com",
    "logo": "https://boliviablue.com/favicon.svg",
    "description": language === 'es'
      ? "Plataforma de seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia"
      : "Real-time tracking platform for the blue dollar exchange rate in Bolivia",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Media Inquiries",
      "email": "contact@boliviablue.com"
    },
    "sameAs": [
      "https://boliviablue.com"
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Fuente de Datos para Medios | Bolivia Blue con Paz'
          : 'Data Source for Media | Bolivia Blue con Paz'}
        description={language === 'es'
          ? 'Bolivia Blue con Paz proporciona datos en tiempo real del dólar blue en Bolivia. Disponible para periodistas, medios de comunicación y análisis financiero.'
          : 'Bolivia Blue con Paz provides real-time data on the blue dollar in Bolivia. Available for journalists, media outlets and financial analysis.'}
        keywords={language === 'es'
          ? 'dólar blue bolivia datos, fuente datos bolivia, datos financieros bolivia, tipo cambio bolivia, datos periodistas, API dólar blue'
          : 'blue dollar bolivia data, bolivia data source, financial data bolivia, exchange rate bolivia, journalist data, blue dollar API'}
        canonical="/fuente-de-datos"
        structuredData={[organizationSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '📊 Fuente de Datos para Medios'
              : '📊 Data Source for Media'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Bolivia Blue con Paz proporciona datos precisos y actualizados del dólar blue en Bolivia. Disponible para periodistas, medios de comunicación y análisis financiero.'
              : 'Bolivia Blue con Paz provides accurate and up-to-date data on the blue dollar in Bolivia. Available for journalists, media outlets and financial analysis.'}
          </p>
        </div>

        {/* About Our Data */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Sobre Nuestros Datos' : 'About Our Data'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Bolivia Blue con Paz rastrea el tipo de cambio del dólar blue en tiempo real utilizando datos públicos de Binance P2P. Nuestros datos se actualizan cada 15 minutos y representan la mediana de las ofertas de compra y venta en el mercado P2P.'
                : 'Bolivia Blue con Paz tracks the blue dollar exchange rate in real-time using public data from Binance P2P. Our data is updated every 15 minutes and represents the median of buy and sell offers in the P2P market.'}
            </p>
            <p>
              {language === 'es'
                ? 'Nuestros datos son:'
                : 'Our data is:'}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                {language === 'es'
                  ? 'Actualizados cada 15 minutos'
                  : 'Updated every 15 minutes'}
              </li>
              <li>
                {language === 'es'
                  ? 'Basados en datos públicos de Binance P2P'
                  : 'Based on public Binance P2P data'}
              </li>
              <li>
                {language === 'es'
                  ? 'Calculados usando la mediana de ofertas (más representativo que el promedio)'
                  : 'Calculated using the median of offers (more representative than average)'}
              </li>
              <li>
                {language === 'es'
                  ? 'Disponibles históricamente para análisis de tendencias'
                  : 'Historically available for trend analysis'}
              </li>
              <li>
                {language === 'es'
                  ? 'Transparentes y verificables'
                  : 'Transparent and verifiable'}
              </li>
            </ul>
          </div>
        </section>

        {/* How to Use Our Data */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Cómo Usar Nuestros Datos' : 'How to Use Our Data'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '1. Para Artículos y Reportes' : '1. For Articles and Reports'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Puedes citar nuestros datos en tus artículos mencionando "Bolivia Blue con Paz" o "boliviablue.com" como fuente. Nuestros datos están disponibles públicamente en nuestro sitio web.'
                  : 'You can cite our data in your articles by mentioning "Bolivia Blue con Paz" or "boliviablue.com" as the source. Our data is publicly available on our website.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '2. Para Análisis Financiero' : '2. For Financial Analysis'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Nuestros datos históricos están disponibles para análisis de tendencias. Puedes acceder a nuestros gráficos históricos en cualquier momento.'
                  : 'Our historical data is available for trend analysis. You can access our historical charts at any time.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '3. Para Integraciones' : '3. For Integrations'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es'
                  ? 'Si necesitas acceso programático a nuestros datos, contáctanos para discutir opciones de API o exportación de datos.'
                  : 'If you need programmatic access to our data, contact us to discuss API or data export options.'}
              </p>
            </div>
          </div>
        </section>

        {/* Attribution Guidelines */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '📝 Guía de Atribución' : '📝 Attribution Guidelines'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Cuando uses nuestros datos, por favor incluye una atribución apropiada:'
                : 'When using our data, please include appropriate attribution:'}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="font-mono text-sm">
                {language === 'es'
                  ? 'Fuente: Bolivia Blue con Paz (boliviablue.com)'
                  : 'Source: Bolivia Blue con Paz (boliviablue.com)'}
              </p>
            </div>
            <p className="text-sm">
              {language === 'es'
                ? 'O simplemente menciona "según datos de boliviablue.com" en tu artículo.'
                : 'Or simply mention "according to data from boliviablue.com" in your article.'}
            </p>
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
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {language === 'es' ? 'Ir a Contacto' : 'Go to Contact'}
            </Link>
          </div>
        </section>

        {/* Data Accuracy Disclaimer */}
        <section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-8 border-2 border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? '⚠️ Descargo de Responsabilidad' : '⚠️ Disclaimer'}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'es'
              ? 'Nuestros datos se basan en información pública de Binance P2P y representan estimaciones del mercado paralelo. No constituyen asesoramiento financiero. Los usuarios deben verificar las tasas actuales antes de realizar transacciones.'
              : 'Our data is based on public information from Binance P2P and represents estimates of the parallel market. It does not constitute financial advice. Users should verify current rates before making transactions.'}
          </p>
        </section>

        {/* API Access Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🔌 Acceso a API' : '🔌 API Access'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? 'Para desarrolladores que necesitan acceso programático a nuestros datos, ofrecemos endpoints de API. Los datos están disponibles en formato JSON y se actualizan cada 15 minutos.'
                : 'For developers who need programmatic access to our data, we offer API endpoints. Data is available in JSON format and updates every 15 minutes.'}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
              <code className="text-blue-600 dark:text-blue-400">
                GET https://boliviablue.com/api/rate
              </code>
            </div>
            <p className="text-sm mb-3">
              {language === 'es'
                ? 'Para más información sobre la API, consulta nuestra documentación completa:'
                : 'For more information about the API, check our complete documentation:'}
            </p>
            <Link
              to="/api-docs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
            >
              {language === 'es' ? 'Ver Documentación API' : 'View API Documentation'}
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🔗 Enlaces Útiles' : '🔗 Useful Links'}
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📊 Tasas Actuales' : '📊 Current Rates'}
            </Link>
            <Link
              to="/datos-historicos"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📈 Datos Históricos' : '📈 Historical Data'}
            </Link>
            <Link
              to="/bolivian-blue"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📊 Gráficos Históricos' : '📊 Historical Charts'}
            </Link>
            <Link
              to="/noticias"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📰 Noticias Financieras' : '📰 Financial News'}
            </Link>
            <Link
              to="/acerca-de"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'ℹ️ Acerca de Nosotros' : 'ℹ️ About Us'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default DataSource;

