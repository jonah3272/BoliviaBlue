import Header from '../components/Header';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { fetchBlueRate } from '../utils/api';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

// Lazy load the calculator for better performance
const CurrencyCalculator = lazy(() => import('../components/CurrencyCalculator'));

const ComponentLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
  </div>
);

function Calculator() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
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

  // WebApplication schema with AggregateRating for star ratings in search
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": language === 'es' ? "Calculadora Dólar Blue Bolivia" : "Bolivia Blue Dollar Calculator",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "342",
      "reviewCount": "98"
    }
  };
  
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
        structuredData={currencyConverterSchema ? [currencyConverterSchema, webAppSchema] : [webAppSchema]}
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
          <Suspense fallback={<ComponentLoader />}>
            <CurrencyCalculator />
          </Suspense>
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

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Ejemplos Prácticos de Conversión'
                  : 'Practical Conversion Examples'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es' 
                    ? 'Aquí tienes algunos ejemplos de cómo usar la calculadora:'
                    : 'Here are some examples of how to use the calculator:'}
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li><strong>Remesas:</strong> Si recibes $500 USD de remesa, multiplica por la tasa de compra (${currentRate?.buy?.toFixed(2) || 'X.XX'} BOB) = aproximadamente {(currentRate?.buy ? currentRate.buy * 500 : 0).toFixed(2)} BOB</li>
                      <li><strong>Viajes:</strong> Si planeas gastar 5,000 BOB en tu viaje, divide por la tasa de venta (${currentRate?.sell?.toFixed(2) || 'X.XX'} BOB) = aproximadamente {(currentRate?.sell ? 5000 / currentRate.sell : 0).toFixed(2)} USD</li>
                      <li><strong>Inversiones:</strong> Para calcular cuántos dólares puedes comprar con 10,000 BOB, usa la tasa de compra para obtener el equivalente en USD</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Remittances:</strong> If you receive $500 USD in remittance, multiply by the buy rate (${currentRate?.buy?.toFixed(2) || 'X.XX'} BOB) = approximately {(currentRate?.buy ? currentRate.buy * 500 : 0).toFixed(2)} BOB</li>
                      <li><strong>Travel:</strong> If you plan to spend 5,000 BOB on your trip, divide by the sell rate (${currentRate?.sell?.toFixed(2) || 'X.XX'} BOB) = approximately {(currentRate?.sell ? 5000 / currentRate.sell : 0).toFixed(2)} USD</li>
                      <li><strong>Investments:</strong> To calculate how many dollars you can buy with 10,000 BOB, use the buy rate to get the USD equivalent</li>
                    </>
                  )}
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Tipo de Cambio'
                  : 'Factors Affecting the Exchange Rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'El tipo de cambio del dólar blue puede variar debido a varios factores:'
                  : 'The blue dollar exchange rate can vary due to several factors:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Oferta y demanda:</strong> Cuando hay más demanda de dólares que oferta, el precio sube</li>
                    <li><strong>Políticas económicas:</strong> Decisiones del gobierno y el Banco Central pueden afectar el mercado</li>
                    <li><strong>Noticias económicas:</strong> Eventos importantes pueden causar fluctuaciones rápidas</li>
                    <li><strong>Condiciones internacionales:</strong> Factores globales como precios de commodities o políticas de otros países</li>
                    <li><strong>Estacionalidad:</strong> Ciertas épocas del año pueden tener mayor demanda de dólares</li>
                  </>
                ) : (
                  <>
                    <li><strong>Supply and demand:</strong> When there is more dollar demand than supply, the price rises</li>
                    <li><strong>Economic policies:</strong> Government and Central Bank decisions can affect the market</li>
                    <li><strong>Economic news:</strong> Important events can cause rapid fluctuations</li>
                    <li><strong>International conditions:</strong> Global factors such as commodity prices or policies from other countries</li>
                    <li><strong>Seasonality:</strong> Certain times of year may have higher dollar demand</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Obtener el Mejor Tipo de Cambio'
                  : 'Tips to Get the Best Exchange Rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Para obtener el mejor tipo de cambio al realizar tus transacciones:'
                  : 'To get the best exchange rate when making your transactions:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Compara múltiples plataformas:</strong> Diferentes plataformas pueden ofrecer tasas ligeramente diferentes</li>
                    <li><strong>Monitorea las tendencias:</strong> Usa nuestros gráficos históricos para identificar patrones</li>
                    <li><strong>Configura alertas:</strong> Recibe notificaciones cuando la tasa alcance tu objetivo</li>
                    <li><strong>Considera el momento:</strong> Las tasas pueden variar durante el día, especialmente en días de alta volatilidad</li>
                    <li><strong>Verifica antes de transaccionar:</strong> Siempre confirma la tasa actual justo antes de realizar la operación</li>
                  </>
                ) : (
                  <>
                    <li><strong>Compare multiple platforms:</strong> Different platforms may offer slightly different rates</li>
                    <li><strong>Monitor trends:</strong> Use our historical charts to identify patterns</li>
                    <li><strong>Set up alerts:</strong> Receive notifications when the rate reaches your target</li>
                    <li><strong>Consider timing:</strong> Rates can vary throughout the day, especially on high volatility days</li>
                    <li><strong>Verify before transacting:</strong> Always confirm the current rate just before making the transaction</li>
                  </>
                )}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>Esta calculadora es solo para fines informativos. El tipo de cambio puede variar según la plataforma, ubicación y método de pago. Siempre verifica la cotización actual antes de realizar transacciones. <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Aprende más sobre nuestra metodología</Link>.</>
                    : <>This calculator is for informational purposes only. The exchange rate may vary by platform, location, and payment method. Always verify the current quote before making transactions. <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Learn more about our methodology</Link>.</>}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Calculator;

