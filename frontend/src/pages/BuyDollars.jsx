import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';

function BuyDollars() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        setCurrentRate(data);
      } catch (err) {
        console.error('Error loading rate:', err);
      }
    };
    loadRate();
  }, []);

  const referralLink = "https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default";
  const binanceP2PLink = "https://www.binance.com/en/p2p";

  // HowTo structured data
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": language === 'es' 
      ? "Cómo comprar dólares en Bolivia usando Binance P2P"
      : "How to buy dollars in Bolivia using Binance P2P",
    "description": language === 'es'
      ? "Guía paso a paso para comprar dólares estadounidenses en Bolivia usando Binance P2P de forma segura y rápida."
      : "Step-by-step guide to buy US dollars in Bolivia using Binance P2P safely and quickly.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": language === 'es' ? "Crear cuenta en Binance" : "Create Binance account",
        "text": language === 'es'
          ? "Regístrate en Binance.com con tu correo electrónico o número de teléfono. Verifica tu identidad completando el proceso KYC (Know Your Customer)."
          : "Sign up on Binance.com with your email or phone number. Verify your identity by completing the KYC (Know Your Customer) process."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": language === 'es' ? "Comprar USDT" : "Buy USDT",
        "text": language === 'es'
          ? "Compra USDT (Tether) usando tu tarjeta de crédito/débito o transferencia bancaria. USDT es una criptomoneda estable vinculada al dólar estadounidense."
          : "Buy USDT (Tether) using your credit/debit card or bank transfer. USDT is a stablecoin pegged to the US dollar."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": language === 'es' ? "Ir a Binance P2P" : "Go to Binance P2P",
        "text": language === 'es'
          ? "Navega a la sección P2P de Binance. Selecciona 'Vender' USDT y 'Comprar' BOB (Bolivianos)."
          : "Navigate to Binance P2P section. Select 'Sell' USDT and 'Buy' BOB (Bolivianos)."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": language === 'es' ? "Seleccionar vendedor" : "Select seller",
        "text": language === 'es'
          ? "Elige un vendedor con buena reputación y alta tasa de finalización. Revisa los límites mínimos y máximos de transacción."
          : "Choose a seller with good reputation and high completion rate. Check minimum and maximum transaction limits."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": language === 'es' ? "Realizar transacción" : "Complete transaction",
        "text": language === 'es'
          ? "Ingresa la cantidad de USDT que deseas vender. Confirma la transacción y espera a que Binance bloquee los fondos. Transfiere los bolivianos al vendedor según las instrucciones. Una vez confirmado, recibirás los USDT en tu cuenta."
          : "Enter the amount of USDT you want to sell. Confirm the transaction and wait for Binance to escrow the funds. Transfer bolivianos to the seller as instructed. Once confirmed, you'll receive USDT in your account."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? "Cómo Comprar Dólares en Bolivia - Binance P2P - Bolivia Blue con Paz"
          : "How to Buy Dollars in Bolivia - Binance P2P - Bolivia Blue with Paz"}
        description={language === 'es'
          ? "Guía completa para comprar dólares en Bolivia usando Binance P2P. Pasos detallados, tasas actuales y consejos de seguridad."
          : "Complete guide to buy dollars in Bolivia using Binance P2P. Detailed steps, current rates and safety tips."}
        keywords={language === 'es'
          ? "comprar dólares bolivia, binance p2p bolivia, cómo comprar dólares, dólar blue bolivia, comprar usdt bolivia, cambiar bolivianos a dólares, binance bolivia, mercado paralelo bolivia, bolivian blue, bolivianblue, mejor que bolivianblue.net"
          : "buy dollars bolivia, binance p2p bolivia, how to buy dollars, blue dollar bolivia, buy usdt bolivia, exchange bolivianos to dollars, binance bolivia, parallel market bolivia, bolivian blue, bolivianblue, better than bolivianblue.net"}
        canonical="/buy-dollars"
        structuredData={howToSchema}
      />
      
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('buyDollarsPageTitle')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('buyDollarsPageSubtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Current Rates */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('buyDollarsCurrentRates')}
          </h2>
          <BlueRateCards />
        </section>

        {/* What is Binance P2P */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('buyDollarsWhatIsP2P')}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              {t('buyDollarsP2PDesc1')}
            </p>
            <p className="leading-relaxed">
              {t('buyDollarsP2PDesc2')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('buyDollarsP2PAdvantage1')}</li>
              <li>{t('buyDollarsP2PAdvantage2')}</li>
              <li>{t('buyDollarsP2PAdvantage3')}</li>
              <li>{t('buyDollarsP2PAdvantage4')}</li>
            </ul>
          </div>
        </section>

        {/* Step by Step Guide */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('buyDollarsStepByStep')}
          </h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  1
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('buyDollarsStep1Title')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                {t('buyDollarsStep1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  2
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('buyDollarsStep2Title')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                {t('buyDollarsStep2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  3
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('buyDollarsStep3Title')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                {t('buyDollarsStep3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  4
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('buyDollarsStep4Title')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                {t('buyDollarsStep4Desc')}
              </p>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  5
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('buyDollarsStep5Title')}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                {t('buyDollarsStep5Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-800 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('buyDollarsSafetyTips')}
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold mt-1">✓</span>
              <span>{t('buyDollarsSafetyTip1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold mt-1">✓</span>
              <span>{t('buyDollarsSafetyTip2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold mt-1">✓</span>
              <span>{t('buyDollarsSafetyTip3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold mt-1">✓</span>
              <span>{t('buyDollarsSafetyTip4')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold mt-1">✓</span>
              <span>{t('buyDollarsSafetyTip5')}</span>
            </li>
          </ul>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t('buyDollarsReadyToStart')}
          </h2>
          <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
            {t('buyDollarsReadyDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
              {t('buyDollarsCreateAccount')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href={binanceP2PLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-400 transition-colors"
            >
              {t('buyDollarsGoToP2P')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('buyDollarsFAQ')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('buyDollarsFAQ1Q')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('buyDollarsFAQ1A')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('buyDollarsFAQ2Q')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('buyDollarsFAQ2A')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('buyDollarsFAQ3Q')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('buyDollarsFAQ3A')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('buyDollarsFAQ4Q')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('buyDollarsFAQ4A')}
              </p>
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

export default BuyDollars;

