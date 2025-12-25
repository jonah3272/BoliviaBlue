import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getApiEndpoint } from '../utils/apiUrl';

function MonthlyReport() {
  useAdsenseReady();
  
  const { month, year } = useParams();
  const navigate = useNavigate();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          getApiEndpoint(`/api/monthly-reports/${month}/${year}?lang=${language}`)
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('not_found');
          } else {
            setError('load_error');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error loading monthly report:', err);
        setError('load_error');
      } finally {
        setLoading(false);
      }
    };
    
    if (month && year) {
      loadReport();
    }
  }, [month, year, language]);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Reportes Mensuales' : 'Monthly Reports', url: '/reportes-mensuales' },
    { name: report?.title || `${month}/${year}`, url: `/reporte-mensual/${month}/${year}` }
  ];

  const articleSchema = report ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report.title,
    "description": report.excerpt,
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
    "datePublished": report.published_at,
    "dateModified": report.updated_at
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
        <Header />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'Cargando reporte...' : 'Loading report...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Reporte No Encontrado' : 'Report Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'es'
                ? 'El reporte mensual solicitado no está disponible.'
                : 'The requested monthly report is not available.'}
            </p>
            <button
              onClick={() => navigate('/reportes-mensuales')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {language === 'es' ? 'Ver Todos los Reportes' : 'View All Reports'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Error al Cargar Reporte' : 'Error Loading Report'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? 'Hubo un error al cargar el reporte. Por favor, intenta de nuevo más tarde.'
                : 'There was an error loading the report. Please try again later.'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={report.title}
        description={report.excerpt}
        canonical={`/reporte-mensual/${month}/${year}`}
        structuredData={articleSchema}
      />
      <Header />
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 mt-8">
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {report.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {report.excerpt}
            </p>
            {report.published_at && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {language === 'es' ? 'Publicado:' : 'Published:'}{' '}
                {new Date(report.published_at).toLocaleDateString(
                  language === 'es' ? 'es-BO' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </p>
            )}
          </header>

          {/* Statistics Cards */}
          {(report.average_buy_rate || report.highest_buy_rate) && (
            <section className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  {language === 'es' ? 'Promedio Mensual' : 'Monthly Average'}
                </h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {language === 'es' ? 'Compra:' : 'Buy:'} {report.average_buy_rate?.toFixed(4)} BOB
                  </p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {language === 'es' ? 'Venta:' : 'Sell:'} {report.average_sell_rate?.toFixed(4)} BOB
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  {language === 'es' ? 'Extremos del Mes' : 'Monthly Extremes'}
                </h3>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Máximo:' : 'High:'} {report.highest_buy_rate?.toFixed(4)} BOB
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Mínimo:' : 'Low:'} {report.lowest_buy_rate?.toFixed(4)} BOB
                  </p>
                  {report.volatility && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {language === 'es' ? 'Volatilidad:' : 'Volatility:'} {report.volatility.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Main Content */}
          <section
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: report.content }}
          />

          {/* Key Events */}
          {report.key_events && report.key_events.length > 0 && (
            <section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-8 border border-yellow-200 dark:border-yellow-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Eventos Clave del Mes' : 'Key Events of the Month'}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {report.key_events.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Predictions */}
          {report.predictions && (
            <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Predicciones' : 'Predictions'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {report.predictions}
              </p>
            </section>
          )}

          {/* Links to other resources */}
          <section className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Recursos Adicionales' : 'Additional Resources'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="/"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'es' ? 'Dashboard Principal' : 'Main Dashboard'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Ver tasas en tiempo real' : 'View real-time rates'}
                </p>
              </a>
              <a
                href="/datos-historicos"
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'es' ? 'Datos Históricos' : 'Historical Data'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Ver todos los datos históricos' : 'View all historical data'}
                </p>
              </a>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default MonthlyReport;


