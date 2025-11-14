import Header from '../components/Header';
import BlueRateCards from '../components/BlueRateCards';
import CurrencyCalculator from '../components/CurrencyCalculator';
import BinanceBanner from '../components/BinanceBanner';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchBlueRate } from '../utils/api';

function Calculator() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  
  // Load current rate for structured data
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

  // CurrencyConverter schema
  const currencyConverterSchema = currentRate ? {
    "@context": "https://schema.org",
    "@type": "CurrencyConverter",
    "name": language === 'es' ? "Calculadora de Divisas USD/BOB" : "USD/BOB Currency Calculator",
    "description": language === 'es'
      ? "Calculadora gratuita para convertir dólares estadounidenses a bolivianos usando el tipo de cambio blue en tiempo real"
      : "Free calculator to convert US dollars to bolivianos using real-time blue exchange rate",
    "provider": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz",
      "url": "https://boliviablue.com"
    },
    "fromCurrency": "USD",
    "toCurrency": "BOB",
    "currentExchangeRate": currentRate.buy?.toFixed(2) || "0",
    "dateModified": new Date().toISOString()
  } : null;
  
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
        structuredData={currencyConverterSchema ? [currencyConverterSchema] : []}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Page Title - H1 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {language === 'es' 
            ? 'Calculadora de Divisas USD/BOB'
            : 'USD/BOB Currency Calculator'}
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">
          {language === 'es'
            ? 'Convierte dólares a bolivianos y viceversa usando el tipo de cambio blue en tiempo real'
            : 'Convert US dollars to bolivianos and vice versa using real-time blue exchange rate'}
        </p>

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

