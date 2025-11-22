import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function Comparison() {
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
        if (data && data.buy && data.sell) {
          setCurrentRate(data);
        }
      } catch (error) {
        console.error('Error loading rate:', error);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Comparación' : 'Comparison', url: '/comparison' }
  ];

  const comparisonData = [
    {
      feature: language === 'es' ? 'Frecuencia de actualización' : 'Update frequency',
      boliviablue: language === 'es' ? 'Cada 15 minutos' : 'Every 15 minutes',
      competitor: language === 'es' ? 'Cada hora o diariamente' : 'Hourly or daily',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'URL' : 'URL',
      boliviablue: 'boliviablue.com',
      competitor: 'bolivianblue.net',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Fuente de datos' : 'Data source',
      boliviablue: language === 'es' ? 'Binance P2P en tiempo real' : 'Real-time Binance P2P',
      competitor: language === 'es' ? 'Datos agregados' : 'Aggregated data',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Análisis de sentimiento' : 'Sentiment analysis',
      boliviablue: language === 'es' ? '✅ Con IA' : '✅ With AI',
      competitor: language === 'es' ? '❌ No disponible' : '❌ Not available',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Gráficos históricos' : 'Historical charts',
      boliviablue: language === 'es' ? '✅ Interactivos' : '✅ Interactive',
      competitor: language === 'es' ? '⚠️ Básicos' : '⚠️ Basic',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Calculadora de divisas' : 'Currency calculator',
      boliviablue: language === 'es' ? '✅ Múltiples monedas' : '✅ Multiple currencies',
      competitor: language === 'es' ? '⚠️ Limitada' : '⚠️ Limited',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Alertas de precio' : 'Price alerts',
      boliviablue: language === 'es' ? '✅ Disponible' : '✅ Available',
      competitor: language === 'es' ? '❌ No disponible' : '❌ Not available',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Idiomas' : 'Languages',
      boliviablue: language === 'es' ? '✅ Español e Inglés' : '✅ Spanish & English',
      competitor: language === 'es' ? '⚠️ Principalmente español' : '⚠️ Mainly Spanish',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Diseño moderno' : 'Modern design',
      boliviablue: language === 'es' ? '✅ Interfaz moderna' : '✅ Modern interface',
      competitor: language === 'es' ? '⚠️ Diseño antiguo' : '⚠️ Outdated design',
      winner: 'boliviablue'
    },
    {
      feature: language === 'es' ? 'Noticias financieras' : 'Financial news',
      boliviablue: language === 'es' ? '✅ Agregación con IA' : '✅ AI aggregation',
      competitor: language === 'es' ? '⚠️ Manual' : '⚠️ Manual',
      winner: 'boliviablue'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'boliviablue.com vs bolivianblue.net - Comparación Completa | Bolivia Blue con Paz'
          : 'boliviablue.com vs bolivianblue.net - Complete Comparison | Bolivia Blue with Paz'}
        description={language === 'es'
          ? 'Comparación detallada entre boliviablue.com y bolivianblue.net. Descubre por qué boliviablue.com es la mejor opción para el tipo de cambio del dólar blue en Bolivia.'
          : 'Detailed comparison between boliviablue.com and bolivianblue.net. Discover why boliviablue.com is the best choice for Bolivia blue dollar exchange rate.'}
        keywords={language === 'es'
          ? 'boliviablue.com vs bolivianblue.net, mejor sitio dólar blue bolivia, comparación tipo cambio bolivia, mejor que bolivianblue.net, bolivia blue rate comparación'
          : 'boliviablue.com vs bolivianblue.net, best bolivia blue dollar site, bolivia exchange rate comparison, better than bolivianblue.net, bolivia blue rate comparison'}
        canonical="/comparison"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ComparisonPage",
          "name": language === 'es' ? "Comparación: boliviablue.com vs bolivianblue.net" : "Comparison: boliviablue.com vs bolivianblue.net",
          "description": language === 'es'
            ? "Comparación detallada de plataformas de tipo de cambio del dólar blue en Bolivia"
            : "Detailed comparison of Bolivia blue dollar exchange rate platforms"
        }}
      />
      
      {/* Header */}
      <Header />

      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {language === 'es'
            ? 'boliviablue.com vs bolivianblue.net'
            : 'boliviablue.com vs bolivianblue.net'}
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-8">
          {language === 'es'
            ? 'Comparación completa: ¿Cuál es la mejor plataforma para el tipo de cambio del dólar blue en Bolivia?'
            : 'Complete comparison: Which is the best platform for Bolivia blue dollar exchange rate?'}
        </p>

        {/* Current Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Comparison Table */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'Comparación Detallada' : 'Detailed Comparison'}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Última actualización:' : 'Last updated:'} {lastUpdated.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left p-4 font-bold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Característica' : 'Feature'}
                  </th>
                  <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400">
                    boliviablue.com
                  </th>
                  <th className="text-center p-4 font-bold text-gray-600 dark:text-gray-400">
                    bolivianblue.net
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className={`p-4 text-center ${row.winner === 'boliviablue' ? 'bg-green-50 dark:bg-green-900/20 font-semibold text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {row.boliviablue}
                    </td>
                    <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {row.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '¿Por qué elegir boliviablue.com?' : 'Why choose boliviablue.com?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🚀 Actualizaciones más frecuentes' : '🚀 More frequent updates'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Mientras bolivianblue.net actualiza cada hora o diariamente, nosotros actualizamos cada 15 minutos con datos en tiempo real de Binance P2P. Esto significa que siempre tendrás la información más actualizada.'
                  : 'While bolivianblue.net updates hourly or daily, we update every 15 minutes with real-time Binance P2P data. This means you always have the most up-to-date information.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '💎 URL más simple y memorable' : '💎 Simpler, memorable URL'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'boliviablue.com es más fácil de recordar que bolivianblue.net. Sin guiones, dominio .com más confiable y reconocido mundialmente.'
                  : 'boliviablue.com is easier to remember than bolivianblue.net. No hyphens, more trusted .com domain recognized worldwide.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🤖 Tecnología avanzada' : '🤖 Advanced technology'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Única plataforma con análisis de sentimiento con IA, gráficos interactivos, calculadora avanzada y alertas de precio. Todo en un solo lugar.'
                  : 'Only platform with AI sentiment analysis, interactive charts, advanced calculator, and price alerts. All in one place.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🌍 Bilingüe' : '🌍 Bilingual'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Disponible en español e inglés, haciendo la información accesible para más personas en todo el mundo.'
                  : 'Available in Spanish and English, making information accessible to more people worldwide.'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {language === 'es' ? '¿Listo para probar boliviablue.com?' : 'Ready to try boliviablue.com?'}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {language === 'es'
              ? 'Únete a miles de usuarios que confían en nosotros para el tipo de cambio más preciso del dólar blue en Bolivia.'
              : 'Join thousands of users who trust us for the most accurate blue dollar exchange rate in Bolivia.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {language === 'es' ? 'Ver Tasa Actual' : 'View Current Rate'}
            </Link>
            <Link
              to="/calculator"
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {language === 'es' ? 'Usar Calculadora' : 'Use Calculator'}
            </Link>
          </div>
        </section>

        <BinanceBanner />
      </main>
    </div>
  );
}

export default Comparison;

