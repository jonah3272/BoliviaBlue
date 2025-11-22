import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RateDisplay } from '../components/RateDisplay';
import { RateChart } from '../components/RateChart';
import { PageMeta } from '../components/PageMeta';
import { SocialShare } from '../components/SocialShare';
import { useLanguage } from '../context/LanguageContext';
import { getRates } from '../services/api';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

/**
 * DolarParaleloBoliviaEnVivo Component
 * SEO-optimized landing page targeting the high-volume keyword "dolar paralelo bolivia en vivo"
 * This page is designed to capture search traffic and outrank competitors
 */
function DolarParaleloBoliviaEnVivo() {
  const { language } = useLanguage();
  const [currentRate, setCurrentRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useAdsenseReady(isLoading);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 900000); // 15 minutes
    return () => clearInterval(interval);
  }, []);

  const loadRates = async () => {
    try {
      const data = await getRates();
      if (data && data.length > 0) {
        setPreviousRate(currentRate);
        setCurrentRate(data[0]);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Structured data for this specific page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Dólar Paralelo Bolivia EN VIVO",
    "description": "Cotización del dólar paralelo en Bolivia actualizado EN VIVO cada 15 minutos. La información más actualizada del mercado cambiario boliviano.",
    "url": "https://boliviablue.com/dolar-paralelo-bolivia-en-vivo",
    "mainEntity": {
      "@type": "FinancialProduct",
      "name": "Dólar Paralelo Bolivia",
      "description": "Tipo de cambio del dólar paralelo en Bolivia",
      "feesAndCommissionsSpecification": "Información gratuita actualizada cada 15 minutos"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bolivia Blue con Paz",
      "url": "https://boliviablue.com"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title="🔴 Dólar Paralelo Bolivia EN VIVO | Actualizado Cada 15 Minutos"
        description="Consulta el DÓLAR PARALELO BOLIVIA EN VIVO actualizado cada 15 minutos. Cotización en tiempo real del mercado cambiario boliviano. Más rápido y preciso que otros sitios."
        keywords="dolar paralelo bolivia en vivo, dolar paralelo bolivia, tipo cambio bolivia en vivo, cotizacion dolar bolivia en vivo, bolivia blue en vivo, cambio dolar bolivia tiempo real, precio dolar paralelo bolivia, dolar negro bolivia en vivo"
        canonical="/dolar-paralelo-bolivia-en-vivo"
        structuredData={structuredData}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section with Live Badge */}
        <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-red-300 dark:border-red-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">
              <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
              EN VIVO
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Actualizado: {lastUpdate.toLocaleTimeString('es-BO')}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es'
              ? '🔴 Dólar Paralelo Bolivia EN VIVO'
              : '🔴 Bolivia Parallel Dollar LIVE'}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-6">
            {language === 'es'
              ? 'Cotización del dólar paralelo en Bolivia actualizada cada 15 minutos. La información más rápida y precisa del mercado cambiario boliviano.'
              : 'Bolivia parallel dollar rate updated every 15 minutes. The fastest and most accurate information from the Bolivian exchange market.'}
          </p>

          {/* Current Rate Display */}
          {!isLoading && currentRate && (
            <RateDisplay currentRate={currentRate} previousRate={previousRate} />
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-600"></div>
            </div>
          )}
        </section>

        {/* What is Dolar Paralelo */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '¿Qué es el Dólar Paralelo Bolivia?'
              : 'What is the Bolivia Parallel Dollar?'}
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {language === 'es'
                ? 'El dólar paralelo Bolivia, también conocido como "dólar blue" o "dólar negro", es el tipo de cambio del dólar estadounidense que se negocia en el mercado informal boliviano. A diferencia del tipo de cambio oficial establecido por el Banco Central de Bolivia, el dólar paralelo refleja la verdadera oferta y demanda del mercado.'
                : 'The Bolivia parallel dollar, also known as "blue dollar" or "black dollar", is the US dollar exchange rate traded in the Bolivian informal market. Unlike the official exchange rate set by the Central Bank of Bolivia, the parallel dollar reflects the true market supply and demand.'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {language === 'es'
                ? 'Este mercado existe debido a las restricciones cambiarias y la escasez de dólares en el sistema bancario oficial boliviano. Millones de bolivianos consultan el dólar paralelo diariamente para realizar sus transacciones comerciales, remesas y operaciones financieras.'
                : 'This market exists due to exchange restrictions and dollar scarcity in the Bolivian official banking system. Millions of Bolivians check the parallel dollar daily for their commercial transactions, remittances, and financial operations.'}
            </p>
          </div>
        </section>

        {/* Historical Chart */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' 
              ? 'Evolución del Dólar Paralelo Bolivia'
              : 'Bolivia Parallel Dollar Evolution'}
          </h2>
          <RateChart />
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es'
              ? '⚡ Información EN VIVO - Actualizada Cada 15 Minutos'
              : '⚡ LIVE Information - Updated Every 15 Minutes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Más Rápido' : 'Faster'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Mientras otros sitios actualizan una vez al día o cada hora, nosotros actualizamos cada 15 minutos con datos directos de Binance P2P.'
                  : 'While other sites update once a day or hourly, we update every 15 minutes with direct Binance P2P data.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Más Preciso' : 'More Accurate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Obtenemos datos directamente de transacciones reales en Binance P2P Bolivia, el mercado P2P más grande del país.'
                  : 'We get data directly from real transactions on Binance P2P Bolivia, the largest P2P market in the country.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Gratis y Sin Registro' : 'Free and No Registration'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Acceso completamente gratuito sin necesidad de registro. Consulta el dólar paralelo Bolivia cuantas veces quieras.'
                  : 'Completely free access without registration required. Check the Bolivia parallel dollar as many times as you want.'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ✅ {language === 'es' ? 'Herramientas Completas' : 'Complete Tools'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Calculadora, gráficos históricos, análisis de tendencias y alertas de precio. Todo en un solo lugar.'
                  : 'Calculator, historical charts, trend analysis and price alerts. All in one place.'}
              </p>
            </div>
          </div>
        </section>

        {/* Social Share */}
        <SocialShare
          title="🔴 Dólar Paralelo Bolivia EN VIVO"
          description="Cotización del dólar paralelo en Bolivia actualizada cada 15 minutos"
        />

        {/* FAQ Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' 
              ? 'Preguntas Frecuentes sobre el Dólar Paralelo Bolivia'
              : 'Frequently Asked Questions about Bolivia Parallel Dollar'}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿Cada cuánto actualizan el dólar paralelo Bolivia?'
                  : 'How often do you update the Bolivia parallel dollar?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Actualizamos el dólar paralelo Bolivia cada 15 minutos, las 24 horas del día. Esto nos hace la fuente más actualizada de información sobre el tipo de cambio paralelo en Bolivia.'
                  : 'We update the Bolivia parallel dollar every 15 minutes, 24 hours a day. This makes us the most up-to-date source of information on the parallel exchange rate in Bolivia.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿De dónde obtienen los datos del dólar paralelo?'
                  : 'Where do you get the parallel dollar data from?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Obtenemos los datos directamente de Binance P2P Bolivia, la plataforma de intercambio peer-to-peer más grande de Bolivia. Los precios reflejan transacciones reales entre compradores y vendedores bolivianos.'
                  : 'We get data directly from Binance P2P Bolivia, the largest peer-to-peer exchange platform in Bolivia. Prices reflect real transactions between Bolivian buyers and sellers.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {language === 'es'
                  ? '¿Es legal consultar el dólar paralelo en Bolivia?'
                  : 'Is it legal to check the parallel dollar in Bolivia?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Sí, es completamente legal consultar información sobre el dólar paralelo. Somos un servicio informativo que proporciona datos públicos del mercado.'
                  : 'Yes, it is completely legal to check information about the parallel dollar. We are an information service that provides public market data.'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 sm:p-8 shadow-lg text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {language === 'es'
              ? '¿Necesitas más herramientas?'
              : 'Need more tools?'}
          </h2>
          <p className="text-lg mb-6">
            {language === 'es'
              ? 'Explora nuestra calculadora de divisas, gráficos históricos y alertas de precio'
              : 'Explore our currency calculator, historical charts and price alerts'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/calculator"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              {language === 'es' ? '🧮 Calculadora' : '🧮 Calculator'}
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              {language === 'es' ? '📊 Ver Gráficos' : '📊 View Charts'}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DolarParaleloBoliviaEnVivo;

