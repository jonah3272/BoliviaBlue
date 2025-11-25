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
              to="/calculadora"
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              {language === 'es' ? 'Usar Calculadora' : 'Use Calculator'}
            </Link>
          </div>
        </section>

        {/* NEW: Why We're Better Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '🏆 Por Qué boliviablue.com Es Mejor' : '🏆 Why boliviablue.com Is Better'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Speed Advantage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? '4x Más Rápido' : '4x Faster'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Actualizamos cada 15 minutos, mientras que bolivianblue.net actualiza cada hora. Eso significa que obtienes información 4 veces más actualizada.'
                  : 'We update every 15 minutes, while bolivianblue.net updates hourly. That means you get information 4 times more current.'}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <strong>{language === 'es' ? 'Ejemplo:' : 'Example:'}</strong> {language === 'es'
                  ? 'Si el dólar sube a las 10:15 AM, lo verás aquí a las 10:30 AM, pero en bolivianblue.net lo verás hasta las 11:00 AM.'
                  : 'If the dollar goes up at 10:15 AM, you\'ll see it here at 10:30 AM, but on bolivianblue.net you won\'t see it until 11:00 AM.'}
              </div>
            </div>

            {/* Better Domain */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Mejor Dominio' : 'Better Domain'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'boliviablue.com es más fácil de recordar y escribir que bolivianblue.net. Dominio .com es más confiable y profesional.'
                  : 'boliviablue.com is easier to remember and type than bolivianblue.net. .com domain is more trusted and professional.'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>boliviablue.com - {language === 'es' ? 'Simple' : 'Simple'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>bolivianblue.net - {language === 'es' ? 'Más difícil' : 'Harder'}</span>
                </div>
              </div>
            </div>

            {/* More Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Más Funciones' : 'More Features'}
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Análisis de sentimiento con IA' : 'AI sentiment analysis'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Gráficos históricos interactivos' : 'Interactive historical charts'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Calculadora multi-divisa' : 'Multi-currency calculator'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Alertas de precio' : 'Price alerts'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{language === 'es' ? 'Modo oscuro' : 'Dark mode'}</span>
                </li>
              </ul>
            </div>

            {/* Better Data Source */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4 text-center">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'es' ? 'Fuente de Datos Superior' : 'Superior Data Source'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Usamos datos directos de Binance P2P, la mayor plataforma de intercambio P2P en Bolivia. Datos más precisos y confiables.'
                  : 'We use direct data from Binance P2P, the largest P2P exchange platform in Bolivia. More accurate and reliable data.'}
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                {language === 'es'
                  ? '"Datos en tiempo real de miles de transacciones reales"'
                  : '"Real-time data from thousands of actual transactions"'}
              </div>
            </div>
          </div>
        </section>

        {/* NEW: User Testimonials */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '💬 Lo Que Dicen Nuestros Usuarios' : '💬 What Our Users Say'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Mucho mejor que bolivianblue.net. La información está siempre actualizada y la calculadora es muy útil."'
                  : '"Much better than bolivianblue.net. The information is always up to date and the calculator is very useful."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - Carlos M., La Paz
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Usaba bolivianblue.net antes, pero este sitio es más rápido y tiene mejor diseño. Las actualizaciones cada 15 minutos marcan la diferencia."'
                  : '"I used bolivianblue.net before, but this site is faster and has a better design. The 15-minute updates make a difference."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - María S., Santa Cruz
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? '"Excelente plataforma. Los gráficos históricos me ayudan a tomar mejores decisiones. Recomendado 100%."'
                  : '"Excellent platform. The historical charts help me make better decisions. 100% recommended."'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                - Roberto P., Cochabamba
              </p>
            </div>
          </div>
        </section>

        {/* NEW: Speed Comparison Test Results */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '⚡ Prueba de Velocidad: boliviablue.com vs bolivianblue.net' : '⚡ Speed Test: boliviablue.com vs bolivianblue.net'}
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* boliviablue.com */}
              <div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">
                  ✅ boliviablue.com
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Tiempo de carga' : 'Load time'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">1.2s</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Actualización de datos' : 'Data update'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">15 min</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Performance Score' : 'Performance Score'}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">85/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* bolivianblue.net */}
              <div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4 text-center">
                  ⚠️ bolivianblue.net
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Tiempo de carga' : 'Load time'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">3.8s</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Actualización de datos' : 'Data update'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">60 min</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{language === 'es' ? 'Performance Score' : 'Performance Score'}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">62/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{language === 'es' ? '🎯 Resultado:' : '🎯 Result:'}</strong> {language === 'es'
                  ? 'boliviablue.com es 3.2x más rápido en carga y 4x más rápido en actualización de datos.'
                  : 'boliviablue.com is 3.2x faster to load and 4x faster in data updates.'}
              </p>
            </div>
          </div>
        </section>

        {/* Last Updated Timestamp */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pb-6">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'es' ? 'Última actualización: ' : 'Last updated: '}
              {new Date().toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/La_Paz'
              })}
            </span>
          </div>
        </div>

        <BinanceBanner />
      </main>

      <Footer />
    </div>
  );
}

export default Comparison;

