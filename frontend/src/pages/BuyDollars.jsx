import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { BINANCE_REFERRAL_LINK, BINANCE_P2P_LINK } from '../config/referrals';
import { BinanceButton, AirtmButton } from '../components/BrandButton';

// Platform Card Component for Secondary Options
function PlatformCard({ name, description, features, link, color, iconColor, language }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden group"
    >
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center ${iconColor} font-bold text-lg`}>
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {description}
        </p>
        <ul className="space-y-1.5 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {language === 'es' ? 'Abrir Plataforma' : 'Open Platform'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
}

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

  const airtmReferralLink = "https://app.airtm.io/ivt/dasyl1sfs6fzr";

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
      
      <Header />

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* PRIMARY OPTIONS: Binance & Airtm - Featured Prominently */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Binance - Primary Option */}
          <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl shadow-xl border-2 border-yellow-300 dark:border-yellow-700 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-900 dark:bg-white p-3 rounded-lg">
                <svg className="w-8 h-8 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Binance P2P
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {language === 'es' ? '⭐ Recomendado - La plataforma más grande' : '⭐ Recommended - The largest platform'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
              <p className="leading-relaxed">
                {language === 'es' 
                  ? 'El exchange de criptomonedas más grande del mundo con servicio P2P seguro. Más de 200 millones de usuarios confían en Binance.'
                  : 'The world\'s largest cryptocurrency exchange with secure P2P service. Over 200 million users trust Binance.'}
              </p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Bajas comisiones' : 'Low fees'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Alta liquidez' : 'High liquidity'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Seguridad avanzada' : 'Advanced security'}</span>
                </div>
              </div>
            </div>

            {/* Primary CTA - Binance Referral Link */}
            <div className="flex flex-col gap-3">
              <BinanceButton size="lg" className="w-full justify-center">
                {language === 'es' ? 'Crear Cuenta en Binance' : 'Create Binance Account'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </BinanceButton>
              <a
                href={BINANCE_P2P_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-300 dark:border-gray-600"
              >
                {language === 'es' ? 'Ir a P2P' : 'Go to P2P'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </section>

          {/* Airtm - Primary Option */}
          <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl shadow-xl border-2 border-blue-400 dark:border-blue-600 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-white dark:text-white font-bold text-xl">A</span>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Airtm
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {language === 'es' ? '⭐ Recomendado - Plataforma global confiable' : '⭐ Recommended - Trusted global platform'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
              <p className="leading-relaxed">
                {language === 'es' 
                  ? 'Plataforma global para intercambio de divisas y criptomonedas con alcance mundial. Fácil de usar con soporte 24/7 y múltiples métodos de pago.'
                  : 'Global platform for currency and cryptocurrency exchange with worldwide reach. Easy to use with 24/7 support and multiple payment methods.'}
              </p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Fácil de usar' : 'Easy to use'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Soporte 24/7' : '24/7 Support'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{language === 'es' ? 'Múltiples métodos de pago' : 'Multiple payment methods'}</span>
                </div>
              </div>
            </div>

            {/* Primary CTA - Airtm Referral Link */}
            <div className="flex flex-col gap-3">
              <AirtmButton size="lg" className="w-full justify-center">
                {language === 'es' ? 'Crear Cuenta en Airtm' : 'Create Airtm Account'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </AirtmButton>
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {language === 'es' ? 'Protege tus ahorros' : 'Protect your savings'}
              </div>
            </div>
          </section>
        </div>

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

        {/* OTHER PLATFORMS - Secondary Options */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'Otras Plataformas' : 'Other Platforms'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'Opciones alternativas' : 'Alternative options'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Eldorado */}
            <PlatformCard
              name="Eldorado"
              description={language === 'es' 
                ? "Marketplace P2P para comprar y vender criptomonedas de forma segura y directa."
                : "P2P marketplace to buy and sell cryptocurrencies safely and directly."}
              features={language === 'es' 
                ? ["P2P directo", "Bajas fees", "Escrow seguro"]
                : ["Direct P2P", "Low fees", "Secure escrow"]}
              link="https://eldorado.app"
              color="from-gray-800 to-gray-900"
              iconColor="text-yellow-400"
              language={language}
            />

            {/* SaldoAr */}
            <PlatformCard
              name="SaldoAr"
              description={language === 'es'
                ? "Plataforma argentina para comprar y vender USDT con pesos y otras divisas."
                : "Argentine platform to buy and sell USDT with pesos and other currencies."}
              features={language === 'es'
                ? ["Interfaz simple", "Transacciones rápidas", "Soporte regional"]
                : ["Simple interface", "Fast transactions", "Regional support"]}
              link="https://saldoar.com"
              color="from-purple-600 to-purple-700"
              iconColor="text-purple-200"
              language={language}
            />

            {/* Bitget */}
            <PlatformCard
              name="Bitget"
              description={language === 'es'
                ? "Exchange global con servicio P2P para comprar USDT con moneda local."
                : "Global exchange with P2P service to buy USDT with local currency."}
              features={language === 'es'
                ? ["Trading avanzado", "P2P seguro", "Alta liquidez"]
                : ["Advanced trading", "Secure P2P", "High liquidity"]}
              link="https://www.bitget.com"
              color="from-blue-600 to-blue-700"
              iconColor="text-blue-200"
              language={language}
            />

            {/* Bybit */}
            <PlatformCard
              name="Bybit"
              description={language === 'es'
                ? "Plataforma de trading con P2P y amplia variedad de métodos de pago."
                : "Trading platform with P2P and wide variety of payment methods."}
              features={language === 'es'
                ? ["Opciones variadas", "Trading profesional", "Seguridad robusta"]
                : ["Varied options", "Professional trading", "Robust security"]}
              link="https://www.bybit.com"
              color="from-orange-600 to-orange-700"
              iconColor="text-orange-200"
              language={language}
            />

            {/* Meru */}
            <PlatformCard
              name="Meru"
              description={language === 'es'
                ? "Compra y vende criptomonedas con cuentas bancarias virtuales y facilidad."
                : "Buy and sell cryptocurrencies with virtual bank accounts and ease."}
              features={language === 'es'
                ? ["Cuentas virtuales", "Transferencias rápidas", "KYC para mayor seguridad"]
                : ["Virtual accounts", "Fast transfers", "KYC for greater security"]}
              link="https://meru.com"
              color="from-green-600 to-green-700"
              iconColor="text-green-200"
              language={language}
            />

            {/* Nebeus */}
            <PlatformCard
              name="Nebeus"
              description={language === 'es'
                ? "Compra, vende y gestiona USDT con préstamos en criptomonedas."
                : "Buy, sell and manage USDT with cryptocurrency loans."}
              features={language === 'es'
                ? ["Préstamos crypto", "Tarjeta de débito", "Staking rewards"]
                : ["Crypto loans", "Debit card", "Staking rewards"]}
              link="https://nebeus.com"
              color="from-purple-500 to-purple-600"
              iconColor="text-purple-200"
              language={language}
            />

            {/* Takenos */}
            <PlatformCard
              name="Takenos"
              description={language === 'es'
                ? "Recibe pagos internacionales en dólares o criptomonedas al instante."
                : "Receive international payments in dollars or cryptocurrencies instantly."}
              features={language === 'es'
                ? ["Pagos instantáneos", "Sin fronteras", "Múltiples divisas"]
                : ["Instant payments", "Borderless", "Multiple currencies"]}
              link="https://takenos.com"
              color="from-pink-600 to-pink-700"
              iconColor="text-pink-200"
              language={language}
            />
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

