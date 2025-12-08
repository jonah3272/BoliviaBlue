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
import { lazy, Suspense } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BlueRateBolivia() {
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
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
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Blue Rate Bolivia - Tipo de Cambio Dólar Blue | Actualizado Cada 15 Min'
          : 'Blue Rate Bolivia - Blue Dollar Exchange Rate | Updated Every 15 Min'}
        description={language === 'es'
          ? 'Blue Rate Bolivia - Tipo de Cambio Dólar Blue en Tiempo Real. Actualizado cada 15 minutos. Gráficos históricos y calculadora gratuita. Consulta ahora. Gratis, sin registro.'
          : 'Blue Rate Bolivia - Real-Time Blue Dollar Exchange Rate. Updated every 15 minutes. Historical charts and free calculator. Check now. Free, no registration required.'}
        keywords={language === 'es'
          ? "blue rate bolivia, blue rate, tipo cambio bolivia, dólar blue bolivia, cotización dólar bolivia"
          : "blue rate bolivia, blue rate, exchange rate bolivia, bolivia dollar rate"}
        canonical="/blue-rate-bolivia"
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={[
          { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
          { name: language === 'es' ? 'Blue Rate Bolivia' : 'Blue Rate Bolivia', url: '/blue-rate-bolivia' }
        ]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? 'Blue Rate Bolivia - Tipo de Cambio Actual'
              : 'Blue Rate Bolivia - Current Exchange Rate'}
          </h1>
        </div>

        <section className="mb-12">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <section className="mb-12">
          <BinanceBanner />
        </section>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? '¿Qué es el Blue Rate Bolivia?' : 'What is Blue Rate Bolivia?'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {language === 'es'
                ? <>El <strong>blue rate bolivia</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. El <strong>blue rate bolivia</strong> refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. Consulta el <strong>blue rate bolivia</strong> actualizado cada 15 minutos en nuestra plataforma.</>
                : <>The <strong>blue rate bolivia</strong> is the exchange rate of the US dollar in Bolivia's parallel market. The <strong>blue rate bolivia</strong> reflects the real rate at which Bolivians exchange dollars outside the official banking system. Check the <strong>blue rate bolivia</strong> updated every 15 minutes on our platform.</>}
            </p>

            <Suspense fallback={<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 animate-pulse h-64"></div>}>
              <BlueChart showOfficial={showOfficial} />
            </Suspense>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Link to="/calculadora" className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Calculadora' : 'Calculator'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Convierte divisas' : 'Convert currencies'}
                </p>
              </Link>
              <Link to="/dolar-blue-hoy" className="block p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Dólar Blue Hoy' : 'Blue Dollar Today'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Cotización actual' : 'Current quote'}
                </p>
              </Link>
              <Link to="/bolivian-blue" className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Bolivian Blue' : 'Bolivian Blue'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Guía completa' : 'Complete guide'}
                </p>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default BlueRateBolivia;



