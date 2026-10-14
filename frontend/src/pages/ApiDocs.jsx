import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { DATA_INQUIRY_PATH, getDataInquiry } from '../data/dataInquiry';
import { getApiDocumentation } from '../data/apiDocumentation';
import { trackApiDocsViewed, trackCommercialAccessClicked } from '../utils/analyticsEvents';

function ApiDocs() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const apiDocsViewedRef = useRef(false);
  const inquiry = getDataInquiry(language);

  useEffect(() => {
    if (apiDocsViewedRef.current) return;
    apiDocsViewedRef.current = true;
    trackApiDocsViewed({ language });
  }, [language]);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Documentación API' : 'API Documentation', url: '/api-docs' }
  ];

  const page = getApiDocumentation(language);
  const { copy, endpoints } = page;


  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={copy.title}
        description={copy.description}
        keywords={language === 'es'
          ? 'API dólar blue bolivia, API tipo cambio bolivia, API bolivia blue rate, documentación API, REST API bolivia, API gratuita dólar blue'
          : 'bolivia blue dollar API, bolivia exchange rate API, bolivia blue rate API, API documentation, REST API bolivia, free blue dollar API'}
        canonical="/api-docs"
        structuredData={[page.apiSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '🔌 API del Dólar Blue Bolivia'
              : '🔌 Bolivia Blue Dollar API'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {copy.introduction}
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🚀 Inicio Rápido' : '🚀 Quick Start'}
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Obtener tasa actual:' : 'Get current rate:'}
              </p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                curl https://boliviablue.com/api/blue-rate
              </code>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Obtener datos históricos:' : 'Get historical data:'}
              </p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                curl https://www.boliviablue.com/api/historical-data.json?range=30d
              </code>
            </div>
          </div>
        </div>

        {/* Commercial / higher-volume CTA */}
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-600">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {inquiry.heading}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {inquiry.introduction}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {copy.additionalAccess}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{inquiry.limitation}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={language === 'en' ? '/datos-historicos?lang=en' : '/datos-historicos'}
              onClick={() =>
                trackCommercialAccessClicked({
                  language,
                  destination: '/datos-historicos',
                  link_label: 'api_docs_datos_historicos',
                })
              }
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'es' ? 'Descargas en datos históricos →' : 'Downloads on historical data →'}
            </Link>
            <Link
              to={inquiry.href}
              onClick={() =>
                trackCommercialAccessClicked({
                  language,
                  destination: DATA_INQUIRY_PATH,
                  link_label: 'api_docs_contact_commercial',
                })
              }
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'es' ? 'Preparar una consulta de datos →' : 'Prepare a data inquiry →'}
            </Link>
          </div>
        </div>

        <section aria-labelledby="api-interpretation" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 space-y-4 text-gray-700 dark:text-gray-300">
          <h2 id="api-interpretation" className="text-2xl font-bold text-gray-900 dark:text-white">{copy.interpretationHeading}</h2>
          {page.notes.map((note) => <p key={note} className="break-words">{note}</p>)}
        </section>

        {/* API Details */}
        <div className="space-y-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'es' ? 'Endpoints Disponibles' : 'Available Endpoints'}
          </h2>
          
          {endpoints.map((endpoint, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  endpoint.method === 'GET' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {endpoint.method}
                </span>
                <code className="min-w-0 break-all text-xl font-mono text-gray-900 dark:text-white">
                  {endpoint.path}
                </code>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {endpoint.description}
              </p>

              {endpoint.parameters.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Parámetros' : 'Parameters'}
                  </h3>
                  <div className="space-y-3">
                    {endpoint.parameters.map((param, pIndex) => (
                      <div key={pIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
                            {param.name}
                          </code>
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            {param.type}
                          </span>
                          {param.required && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                              {language === 'es' ? 'Requerido' : 'Required'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {param.description}
                        </p>
                        {param.options && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {language === 'es' ? 'Opciones:' : 'Options:'} {param.options.join(', ')}
                            {param.default && ` (${language === 'es' ? 'por defecto' : 'default'}: ${param.default})`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{copy.fieldsHeading}</h3>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm font-mono text-gray-700 dark:text-gray-300">{typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2)}</pre>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? 'Respuesta' : 'Response'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{copy.exampleNotice}</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    {JSON.stringify(endpoint.example.response, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? 'Ejemplo de Uso' : 'Usage Example'}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'es' ? 'URL:' : 'URL:'}
                  </p>
                  <code className="block text-blue-600 dark:text-blue-400 font-mono text-sm break-all">
                    {endpoint.example.url}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '💻 Ejemplos de Código' : '💻 Code Examples'}
          </h2>
          
          <div className="space-y-6">
            {/* JavaScript */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">JavaScript (Fetch)</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
{`async function getBlueRate() {
  const response = await fetch('https://boliviablue.com/api/blue-rate');
  const data = await response.json();
  console.log('Buy:', data.buy_bob_per_usd, 'BOB');
  console.log('Sell:', data.sell_bob_per_usd, 'BOB');
  return data;
}`}
                </pre>
              </div>
            </div>

            {/* Python */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Python (requests)</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
{`import requests

def get_blue_rate():
    response = requests.get('https://boliviablue.com/api/blue-rate')
    data = response.json()
    print(f"Buy: {data['buy_bob_per_usd']} BOB")
    print(f"Sell: {data['sell_bob_per_usd']} BOB")
    return data`}
                </pre>
              </div>
            </div>

            {/* cURL */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">cURL</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
{`curl https://boliviablue.com/api/blue-rate`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits & Terms */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-8 mb-8 border-2 border-yellow-200 dark:border-yellow-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '⚠️ Límites y Términos' : '⚠️ Rate Limits & Terms'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Límites de Tasa' : 'Rate Limits'}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {language === 'es'
                    ? 'Límite recomendado: 100 solicitudes por día por IP'
                    : 'Recommended limit: 100 requests per day per IP'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Para uso comercial o alto volumen, contáctanos'
                    : 'For commercial use or high volume, please contact us'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Las actualizaciones dependen de los recolectores; verificá la fecha de la observación'
                    : 'Updates depend on collection; check the observation timestamp'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Términos de Uso' : 'Terms of Use'}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  {language === 'es'
                    ? 'API gratuita para uso personal y comercial'
                    : 'Free API for personal and commercial use'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Se requiere atribución cuando sea posible'
                    : 'Attribution required when possible'}
                </li>
                <li>
                  {language === 'es'
                    ? 'No garantizamos disponibilidad 100% del tiempo'
                    : 'We do not guarantee 100% uptime'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Los datos son solo informativos, no constituyen asesoramiento financiero'
                    : 'Data is for informational purposes only, not financial advice'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '💬 Soporte' : '💬 Support'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {language === 'es'
                ? '¿Necesitas ayuda con la API? ¿Tienes preguntas o sugerencias?'
                : 'Need help with the API? Have questions or suggestions?'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contacto"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {language === 'es' ? 'Contactar' : 'Contact Us'}
              </Link>
              <Link
                to="/fuente-de-datos"
                className="inline-block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {language === 'es' ? 'Fuente de Datos' : 'Data Source'}
              </Link>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🔗 Enlaces Relacionados' : '🔗 Related Links'}
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to={language === 'en' ? '/datos-historicos?lang=en' : '/datos-historicos'}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📊 Datos Históricos' : '📊 Historical Data'}
            </Link>
            <Link
              to="/fuente-de-datos"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📈 Fuente de Datos' : '📈 Data Source'}
            </Link>
            <Link
              to="/acerca-de"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'ℹ️ Metodología' : 'ℹ️ Methodology'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ApiDocs;

