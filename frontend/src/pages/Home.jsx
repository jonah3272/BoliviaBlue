import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import NewsTabs from '../components/NewsTabs';
import About from '../components/About';
import PageMeta from '../components/PageMeta';
import RotatingNewsCarousel from '../components/RotatingNewsCarousel';
import Navigation from '../components/Navigation';
import DailySentimentHeader from '../components/DailySentimentHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

function Home() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
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
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {t('title')}
              </h1>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white max-w-3xl mx-auto leading-tight">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Blue Rate Cards - At the Top */}
        <section>
          <BlueRateCards />
        </section>

        {/* Daily Sentiment - Below Rate Cards */}
        <section>
          <DailySentimentHeader />
        </section>

        {/* Rotating News Carousel */}
        <section>
          <RotatingNewsCarousel />
        </section>

        {/* Chart */}
        <section>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          }>
            <BlueChart />
          </Suspense>
        </section>

        {/* Binance Banner - Under Chart */}
        <section>
          <BinanceBanner />
        </section>

        {/* News & Twitter Tabs */}
        <section>
          <NewsTabs />
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

