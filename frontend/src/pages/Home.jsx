import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { lazy, Suspense, useState } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import NewsTabs from '../components/NewsTabs';
import About from '../components/About';
import PageMeta from '../components/PageMeta';
import RotatingNewsCarousel from '../components/RotatingNewsCarousel';
import Navigation from '../components/Navigation';
import DailySentimentHeader from '../components/DailySentimentHeader';
import SentimentNewsCard from '../components/SentimentNewsCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { articlesEs, articlesEn } from '../data/blogArticles';

function Home() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  
  // Organization schema for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue con Paz",
    "alternateName": "Bolivia Blue with Paz",
    "url": "https://boliviablue.com",
    "logo": "https://boliviablue.com/favicon.svg",
    "description": language === 'es' 
      ? "Plataforma de seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia"
      : "Real-time tracking platform for the blue dollar exchange rate in Bolivia",
    "sameAs": [
      "https://github.com/jonah3272/BoliviaBlue"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["Spanish", "English"]
    }
  };
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={t('title') + ' - ' + (language === 'es' ? 'Tipo de Cambio Dólar Boliviano en Tiempo Real' : 'Real-Time Bolivian Dollar Exchange Rate')}
        description={language === 'es' 
          ? "Seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia bajo el presidente Rodrigo Paz. Cotizaciones actualizadas cada 15 minutos desde Binance P2P, gráficos históricos y noticias financieras."
          : "Real-time tracking of the blue dollar exchange rate in Bolivia under President Rodrigo Paz. Rates updated every 15 minutes from Binance P2P, historical charts and financial news."}
        keywords={language === 'es'
          ? "dólar bolivia, tipo de cambio bolivia, boliviano dólar, blue bolivia, dólar blue bolivia, tipo cambio bolivia, cambio dólar bolivia, mercado paralelo bolivia, dólar paralelo, Rodrigo Paz, BCB, banco central bolivia, binance bolivia, usdt bob, usdt a bob, boliviano a dólar, dólar a boliviano, cotización dólar bolivia, precio dólar bolivia, tasa cambio bolivia, bolivian blue, bolivianblue, mejor que bolivianblue.net"
          : "bolivia dollar, exchange rate bolivia, boliviano dollar, blue dollar bolivia, bolivia blue dollar, bolivia exchange rate, bolivia currency, parallel market bolivia, bolivia parallel dollar, Rodrigo Paz, BCB, central bank bolivia, binance bolivia, usdt bob, usdt to bob, boliviano to dollar, dollar to boliviano, bolivia dollar rate, bolivia dollar price, bolivia exchange rate, bolivian blue, bolivianblue, better than bolivianblue.net, bolivia blue market, bolivia dollar calculator"}
        canonical="/"
        structuredData={organizationSchema}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t('title')}
                </h1>
                <p className="hidden md:block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </Link>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Blue Rate Cards - At the Top */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Combined Sentiment + News Card */}
        <section>
          <SentimentNewsCard />
        </section>

        {/* Chart */}
        <section>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          }>
            <BlueChart showOfficial={showOfficial} />
          </Suspense>
        </section>

        {/* Binance Banner - Under Chart */}
        <section>
          <BinanceBanner />
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              🔍 {language === 'es' ? '¿Cómo Funciona?' : 'How Does It Work?'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'es' 
                ? 'Te mostramos el tipo de cambio real del dólar en Bolivia en 3 simples pasos'
                : 'We show you the real dollar exchange rate in Bolivia in 3 simple steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Recopilamos Datos' : 'We Collect Data'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Monitoreamos Binance P2P cada 15 minutos para obtener el precio real de USDT/BOB en el mercado paralelo'
                      : 'We monitor Binance P2P every 15 minutes to get the real USDT/BOB price in the parallel market'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 dark:border-green-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Analizamos con IA' : 'We Analyze with AI'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Nuestra IA analiza noticias económicas y calcula el sentimiento del mercado para predecir tendencias'
                      : 'Our AI analyzes economic news and calculates market sentiment to predict trends'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-200 dark:border-purple-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Te Lo Mostramos' : 'We Show You'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Visualizamos todo en gráficos fáciles de entender, con noticias relevantes y herramientas prácticas'
                      : 'We visualize everything in easy-to-understand charts, with relevant news and practical tools'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15 min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Actualización' : 'Update Frequency'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Gratis' : 'Free'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {language === 'es' ? '2 idiomas' : '2 Languages'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'ES & EN' : 'ES & EN'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Disponible' : 'Available'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News & Twitter Tabs */}
        <section>
          <NewsTabs />
        </section>

        {/* Featured Blog Articles */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Guías y Recursos' : 'Guides & Resources'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {language === 'es' 
                  ? 'Aprende todo sobre el dólar blue, USDT y finanzas en Bolivia'
                  : 'Learn everything about the blue dollar, USDT and finance in Bolivia'}
              </p>
            </div>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              {language === 'es' ? 'Ver Todos' : 'View All'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(language === 'es' ? articlesEs : articlesEn)
              .filter(a => a.featured)
              .slice(0, 2)
              .map((article) => (
                <Link
                  key={article.id}
                  to={`/blog`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3 pt-3">
                    <span className="text-gray-500 dark:text-gray-400">{article.author}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline flex items-center gap-1">
                      {language === 'es' ? 'Leer' : 'Read'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
          </div>

          <Link
            to="/blog"
            className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            {language === 'es' ? 'Ver Todos los Artículos' : 'View All Articles'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* About */}
        <section>
          <About />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              {t('footerUpdates')}
            </p>
            <p className="mb-4">
              {t('footerText')}
            </p>
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              &copy; 2025 {t('title')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

