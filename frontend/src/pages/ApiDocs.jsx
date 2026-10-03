import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { getApiEndpoint } from '../utils/apiUrl';
import { trackApiDocsViewed, trackCommercialAccessClicked } from '../utils/analyticsEvents';

function ApiDocs() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const apiDocsViewedRef = useRef(false);

  useEffect(() => {
    if (apiDocsViewedRef.current) return;
    apiDocsViewedRef.current = true;
    trackApiDocsViewed({ language });
  }, [language]);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Documentación API' : 'API Documentation', url: '/api-docs' }
  ];

  // API schema for structured data
  const apiSchema = {
    "@context": "https://schema.org",
    "@type": "APIReference",
    "name": language === 'es' 
      ? "API del Dólar Blue Bolivia"
      : "Bolivia Blue Dollar API",
    "description": language === 'es'
      ? "API gratuita para acceder a datos en tiempo real del dólar blue en Bolivia. Incluye tasas actuales, observaciones históricas y estado del archivo."
      : "Free API to access real-time blue dollar data in Bolivia. Includes current rates, historical observations and archive status.",
    "url": "https://boliviablue.com/api-docs",
    "provider": {
      "@type": "Organization",
      "name": "Bolivia Blue",
      "url": "https://boliviablue.com"
    },
    "documentation": "https://boliviablue.com/api-docs",
    "termsOfService": "https://boliviablue.com/politica-de-privacidad"
  };

  // Document the deployed public API contract. The optional backend has separate routes.
  const endpoints = [
    {
      method: 'GET', path: '/api/blue-rate',
      description: language === 'es' ? 'Cotización actual USD/BOB. La composición de fuentes puede no estar registrada para la fila guardada.' : 'Current USD/BOB quote. Source composition may be unavailable for the stored row.',
      parameters: [],
      response: { buy_bob_per_usd: 'number', sell_bob_per_usd: 'number', updated_at_iso: 'ISO 8601', is_stale: 'boolean', sources_used: 'array (empty when provenance is unknown)', source_provenance: 'string' },
      example: { url: 'https://www.boliviablue.com/api/blue-rate', response: { buy_bob_per_usd: 12.34, sell_bob_per_usd: 12.56, updated_at_iso: '2026-10-03T12:00:00Z', is_stale: false, sources_used: [], source_provenance: 'unavailable_for_stored_row' } },
    },
    ...['csv', 'json'].map((format) => ({
      method: 'GET', path: `/api/historical-data.${format}`,
      description: language === 'es'
        ? 'Hasta 4.000 observaciones recientes, ordenadas por fecha ascendente. 30d limita el período; all selecciona las últimas filas disponibles, no todo el archivo. 90d y 1y devuelven 400. No se requiere token para estas muestras públicas.'
        : 'Up to 4,000 recent observations in ascending date order. 30d limits the period; all selects the latest available rows, not the entire archive. 90d and 1y return 400. These public samples do not require a token.',
      parameters: [
        { name: 'range', type: 'string', required: false, options: ['30d', 'all'], description: 'Default: 30d' },
        { name: 'limit', type: 'integer', required: false, description: '1–4000; default 4000. Larger values are capped at 4000.' },
      ],
      response: format === 'csv'
        ? 'CSV columns: t,buy,sell,mid,official_buy,official_sell,official_mid. Coverage headers: X-Data-Range, X-Data-Rows, X-Data-Limit, X-Data-Truncated, X-Data-Start, X-Data-End, X-Data-Provenance.'
        : 'JSON: { range, count, points: [{ t, buy, sell, mid, official_buy, official_sell, official_mid }], metadata: { range_requested, requested_start, requested_end, returned_start, returned_end, rows_returned, limit, truncated, selection, order, source_provenance, generated_at } }',
      example: { url: `https://www.boliviablue.com/api/historical-data.${format}?range=30d`, response: format === 'csv' ? { note: 'Read HTTP coverage headers before citing a time span.' } : { range: '30d', count: 1, points: [{ t: '2026-10-03T12:00:00Z', buy: 12.34, sell: 12.56, mid: 12.45 }], metadata: { returned_start: '2026-10-03T12:00:00Z', returned_end: '2026-10-03T12:00:00Z', rows_returned: 1, limit: 4000, truncated: false, source_provenance: 'unavailable_for_historical_rows' } } },
    })),
    {
      method: 'GET', path: '/api/health',
      description: language === 'es' ? 'Estado del archivo y fecha de la última observación.' : 'Archive status and latest observation time.',
      parameters: [], response: { ok: 'boolean', updated_at_iso: 'ISO 8601 or null', history_points: 'number', host: 'vercel' },
      example: { url: 'https://www.boliviablue.com/api/health', response: { ok: true, updated_at_iso: '2026-10-03T12:00:00Z', history_points: 29250, host: 'vercel' } },
    },
  ];
  if (import.meta.env.VITE_API_URL) {
    endpoints.push({
      method: 'GET', path: getApiEndpoint('/api/historical-data.json'),
      description: language === 'es'
        ? 'Backend separado para descargas ampliadas: 90d, 1y y all requieren el token del formulario de email en /datos-historicos. Conserva su límite de 50.000 filas y metadatos de cobertura; no es el contrato de la API pública www.'
        : 'Separate extended-export backend: 90d, 1y and all require a token from the email form on /datos-historicos. Its 50,000-row limit and coverage metadata apply; this is separate from the public www API contract.',
      parameters: [
        { name: 'range', type: 'string', required: true, options: ['90d', '1y', 'all'], description: 'Extended ranges' },
        { name: 'token', type: 'string', required: true, description: 'Use only the token issued after your existing email/consent unlock.' },
      ],
      response: 'JSON: { metadata, data: [{ timestamp, buy, sell, mid, official_buy, official_sell, official_mid }] }. CSV uses timestamp as its first column. Both formats disclose coverage and truncation.',
      example: { url: getApiEndpoint('/api/historical-data.json?range=90d&token=YOUR_TOKEN'), response: { metadata: { range_requested: '90d', limit: 50000, truncated: false }, data: [] } },
    });
  }

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'API del Dólar Blue Bolivia | Documentación Completa'
          : 'Bolivia Blue Dollar API | Complete Documentation'}
        description={language === 'es'
          ? 'Documentación completa de la API gratuita del dólar blue en Bolivia. Accede a tasas actuales, datos históricos y noticias financieras mediante endpoints REST.'
          : 'Complete documentation for the free Bolivia blue dollar API. Access current rates, historical data and financial news via REST endpoints.'}
        keywords={language === 'es'
          ? 'API dólar blue bolivia, API tipo cambio bolivia, API bolivia blue rate, documentación API, REST API bolivia, API gratuita dólar blue'
          : 'bolivia blue dollar API, bolivia exchange rate API, bolivia blue rate API, API documentation, REST API bolivia, free blue dollar API'}
        canonical="/api-docs"
        structuredData={[apiSchema]}
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
            {language === 'es'
              ? 'API REST gratuita para acceder a datos en tiempo real del dólar blue en Bolivia. Sin autenticación requerida, actualizaciones cada 15 minutos.'
              : 'Free REST API to access real-time blue dollar data in Bolivia. No authentication required, updates every 15 minutes.'}
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
            {language === 'es' ? '¿Necesitás más volumen o acceso automático?' : 'Need higher volume or automated access?'}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {language === 'es'
              ? 'La API pública cubre tasas en vivo e histórico por intervalos. Para scraping intensivo, white-label, o licencias de datos, escribinos.'
              : 'The public API covers live rates and history by interval. For heavy scraping, white-label, or data licensing, contact us.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/datos-historicos"
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
              to="/contacto"
              onClick={() =>
                trackCommercialAccessClicked({
                  language,
                  destination: '/contacto',
                  link_label: 'api_docs_contact_commercial',
                })
              }
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'es' ? 'Contacto comercial →' : 'Commercial contact →'}
            </Link>
          </div>
        </div>

        {/* API Details */}
        <div className="space-y-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'es' ? 'Endpoints Disponibles' : 'Available Endpoints'}
          </h2>
          
          {endpoints.map((endpoint, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  endpoint.method === 'GET' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-xl font-mono text-gray-900 dark:text-white">
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? 'Respuesta' : 'Response'}
                </h3>
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
  console.log('Buy:', data.buy, 'BOB');
  console.log('Sell:', data.sell, 'BOB');
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
    print(f"Buy: {data['buy']} BOB")
    print(f"Sell: {data['sell']} BOB")
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
                    ? 'Los datos se actualizan cada 15 minutos'
                    : 'Data updates every 15 minutes'}
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
              to="/datos-historicos"
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

