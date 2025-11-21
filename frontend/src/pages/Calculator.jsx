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
          ? "Calculadora USD/BOB Gratis | Actualizada Cada 15 Min - Bolivia Blue"
          : "Free USD/BOB Calculator | Updated Every 15 Min - Bolivia Blue"}
        description={language === 'es'
          ? "Calculadora gratuita para convertir dólares a bolivianos y viceversa usando el tipo de cambio blue en tiempo real. Actualizado cada 15 minutos. Sin registro, 100% gratis."
          : "Free calculator to convert US dollars to bolivianos and vice versa using real-time blue exchange rate. Updated every 15 minutes. No registration, 100% free."}
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

        {/* Additional Content Section for AdSense Compliance */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 md:p-10 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? 'Cómo Usar la Calculadora de Divisas'
                  : 'How to Use the Currency Calculator'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>Nuestra calculadora de divisas te permite convertir entre <strong>dólares estadounidenses (USD)</strong> y <strong>bolivianos (BOB)</strong> usando el tipo de cambio blue en tiempo real. Simplemente ingresa la cantidad que deseas convertir y selecciona la dirección de conversión (USD a BOB o BOB a USD). La calculadora utiliza automáticamente la tasa más reciente actualizada cada 15 minutos.</>
                  : <>Our currency calculator allows you to convert between <strong>US dollars (USD)</strong> and <strong>bolivianos (BOB)</strong> using the real-time blue exchange rate. Simply enter the amount you want to convert and select the conversion direction (USD to BOB or BOB to USD). The calculator automatically uses the most recent rate updated every 15 minutes.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por qué usar el tipo de cambio blue?'
                  : 'Why use the blue exchange rate?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li>El tipo de cambio blue refleja el precio real del dólar en el mercado boliviano</li>
                    <li>Es más preciso para transacciones en el mercado paralelo</li>
                    <li>Se actualiza cada 15 minutos con datos en tiempo real de Binance P2P</li>
                    <li>Muchos bolivianos usan esta tasa para decisiones financieras diarias</li>
                  </>
                ) : (
                  <>
                    <li>The blue exchange rate reflects the real price of the dollar in the Bolivian market</li>
                    <li>It's more accurate for parallel market transactions</li>
                    <li>It updates every 15 minutes with real-time data from Binance P2P</li>
                    <li>Many Bolivians use this rate for daily financial decisions</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Diferencia entre dólar oficial y dólar blue'
                  : 'Difference between official dollar and blue dollar'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>dólar oficial</strong> es la tasa establecida por el Banco Central de Bolivia y puede tener restricciones para su compra. El <strong>dólar blue</strong> es la tasa del mercado paralelo, que puede variar significativamente y generalmente es más alta que la oficial. Nuestra calculadora usa el dólar blue porque refleja mejor el precio real del dólar en el mercado boliviano.</>
                  : <>The <strong>official dollar</strong> is the rate set by the Central Bank of Bolivia and may have restrictions for purchase. The <strong>blue dollar</strong> is the parallel market rate, which can vary significantly and is generally higher than the official rate. Our calculator uses the blue dollar because it better reflects the real price of the dollar in the Bolivian market.</>}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>Esta calculadora es solo para fines informativos. El tipo de cambio puede variar según la plataforma, ubicación y método de pago. Siempre verifica la cotización actual antes de realizar transacciones. <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Aprende más sobre nuestra metodología</Link>.</>
                    : <>This calculator is for informational purposes only. The exchange rate may vary by platform, location, and payment method. Always verify the current quote before making transactions. <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Learn more about our methodology</Link>.</>}
                </p>
              </div>
            </div>
          </div>
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

