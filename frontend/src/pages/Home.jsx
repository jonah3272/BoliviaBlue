import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import RateCards from '../components/RateCards';
import BinanceBanner from '../components/BinanceBanner';
import BlueChart from '../components/BlueChart';
import NewsFeed from '../components/NewsFeed';
import TweetsFeed from '../components/TweetsFeed';
import About from '../components/About';
import PageMeta from '../components/PageMeta';
import RotatingNewsCarousel from '../components/RotatingNewsCarousel';
import Navigation from '../components/Navigation';
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Bolivia Blue
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
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Rotating News Carousel */}
        <section>
          <RotatingNewsCarousel />
        </section>
        
        {/* Rate Cards */}
        <section>
          <RateCards />
        </section>

        {/* Binance Banner */}
        <section>
          <BinanceBanner />
        </section>

        {/* Chart */}
        <section>
          <BlueChart />
        </section>

        {/* News Feed */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('newsTitle')}
          </h2>
          <NewsFeed />
        </section>

        {/* Tweets Feed (Social Media) */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="flex items-center gap-2">
              {/* Twitter/X Icon */}
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {t('twitterSection')}
            </span>
          </h2>
          <TweetsFeed maxItems={10} />
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

