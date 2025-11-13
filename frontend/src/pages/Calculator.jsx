import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import BlueRateCards from '../components/BlueRateCards';
import CurrencyCalculator from '../components/CurrencyCalculator';
import BinanceBanner from '../components/BinanceBanner';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Calculator() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? "Calculadora de Divisas USD/BOB - Bolivia Blue con Paz"
          : "USD/BOB Currency Calculator - Bolivia Blue with Paz"}
        description={language === 'es'
          ? "Calculadora gratuita para convertir dólares a bolivianos y viceversa usando el tipo de cambio blue en tiempo real. Actualizado cada 15 minutos."
          : "Free calculator to convert US dollars to bolivianos and vice versa using real-time blue exchange rate. Updated every 15 minutes."}
        keywords={language === 'es'
          ? "calculadora dólar bolivia, convertir usd a bob, convertir bob a usd, calculadora divisas bolivia, tipo cambio calculadora, calculadora cambio bolivia, convertir dólar a boliviano, convertir boliviano a dólar, calculadora binance p2p, mejor calculadora dólar bolivia"
          : "bolivia dollar calculator, convert usd to bob, convert bob to usd, currency calculator bolivia, exchange rate calculator, bolivia exchange calculator, convert dollar to boliviano, convert boliviano to dollar, binance p2p calculator, best bolivia dollar calculator"}
        canonical="/calculator"
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
        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Binance Banner - Above Calculator */}
        <section>
          <BinanceBanner />
        </section>

        {/* Calculator */}
        <section>
          <CurrencyCalculator />
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

export default Calculator;

