import Header from '../components/Header';
import Footer from '../components/Footer';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import { lazy, Suspense, useState, useEffect } from 'react';
const BlueChart = lazy(() => import('../components/BlueChart'));
import NewsTabs from '../components/NewsTabs';
import About from '../components/About';
import PageMeta from '../components/PageMeta';
import RotatingNewsCarousel from '../components/RotatingNewsCarousel';
import Navigation from '../components/Navigation';
import DailySentimentHeader from '../components/DailySentimentHeader';
import SentimentNewsCard from '../components/SentimentNewsCard';
import RateAlertForm from '../components/RateAlertForm';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { articlesEs, articlesEn } from '../data/blogArticles';
import { fetchBlueRate } from '../utils/api';

function Home() {
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
        if (data && data.buy_bob_per_usd && data.sell_bob_per_usd) {
          // Transform to expected format with buy/sell properties
          setCurrentRate({
            ...data,
            buy: data.buy_bob_per_usd,
            sell: data.sell_bob_per_usd
          });
        }
      } catch (error) {
        console.error('Error loading rate:', error);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Organization schema for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue con Paz",
    "alternateName": "Bolivia Blue with Paz",
    "url": "https://boliviablue.com",
    "logo": "https://boliviablue.com/favicon.svg",
    "description": language === 'es' 
      ? "Bolivia blue rate y bolivia blue exchange rate - Plataforma de seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia"
      : "Bolivia blue rate and bolivia blue exchange rate - Real-time tracking platform for the blue dollar exchange rate in Bolivia",
    "keywords": language === 'es'
      ? "bolivia blue rate, bolivia blue exchange rate, dólar blue bolivia, tipo de cambio bolivia"
      : "bolivia blue rate, bolivia blue exchange rate, blue dollar bolivia, exchange rate bolivia",
    "sameAs": [
      "https://github.com/jonah3272/BoliviaBlue"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["Spanish", "English"]
    }
  };

  // FAQ Schema for homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es el Bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Bolivia blue rate es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como bolivia blue exchange rate, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial."
        }
      },
      {
        "@type": "Question",
        "name": "¿Con qué frecuencia se actualiza el bolivia blue exchange rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue exchange rate se actualiza cada 15 minutos utilizando datos en tiempo real de Binance P2P, proporcionando la información más precisa y actualizada sobre el tipo de cambio."
        }
      },
      {
        "@type": "Question",
        "name": "¿De dónde proviene el bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue rate proviene de datos públicos de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado paralelo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre el bolivia blue rate y la tasa oficial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue rate refleja el mercado paralelo y puede diferir significativamente de la tasa oficial del Banco Central de Bolivia. La tasa oficial es fija o se ajusta muy raramente, mientras que el bolivia blue exchange rate fluctúa según la oferta y demanda del mercado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué es importante conocer el bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Conocer el bolivia blue rate es importante porque refleja la realidad del mercado cambiario boliviano y es utilizado por millones de bolivianos para transacciones diarias. Te ayuda a tomar mejores decisiones financieras y entender el verdadero valor del dólar en Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es $100 USD en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Con el bolivia blue rate actual (aproximadamente 10.50 BOB por USD), $100 USD equivalen a aproximadamente 1,050 BOB. Con la tasa oficial (~9.00 BOB/USD) serían solo 900 BOB. La diferencia puede ser significativa, por eso es importante usar el bolivia blue exchange rate para obtener el mejor valor. Usa nuestra calculadora para obtener el cálculo exacto con la tasa actual."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 1 USD a 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El bolivia blue exchange rate actualmente fluctúa entre 10.00 y 11.50 BOB por USD, con un promedio de aproximadamente 10.50 BOB por USD. Esto significa que 1 USD equivale a aproximadamente 10.50 BOB, mientras que 1 BOB equivale a aproximadamente 0.095 USD. El bolivia blue rate se actualiza cada 15 minutos en nuestra plataforma."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is Bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Bolivia blue rate is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the bolivia blue exchange rate, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system."
        }
      },
      {
        "@type": "Question",
        "name": "How often is the bolivia blue exchange rate updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue exchange rate is updated every 15 minutes using real-time data from Binance P2P, providing the most accurate and up-to-date exchange rate information."
        }
      },
      {
        "@type": "Question",
        "name": "Where does the bolivia blue rate come from?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue rate comes from public Binance P2P data for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the parallel market."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between bolivia blue rate and the official rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue rate reflects the parallel market and can differ significantly from the official rate set by the Central Bank of Bolivia. The official rate is fixed or adjusted very rarely, while the bolivia blue exchange rate fluctuates according to market supply and demand."
        }
      },
      {
        "@type": "Question",
        "name": "Why is it important to know the bolivia blue rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Knowing the bolivia blue rate is important because it reflects the reality of Bolivia's exchange market and is used by millions of Bolivians for daily transactions. It helps you make better financial decisions and understand the true value of the dollar in Bolivia."
        }
      },
      {
        "@type": "Question",
        "name": "How much is $100 US in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With the current bolivia blue rate (approximately 10.50 BOB per USD), $100 USD equals approximately 1,050 BOB. With the official rate (~9.00 BOB/USD) it would only be 900 BOB. The difference can be significant, which is why it's important to use the bolivia blue exchange rate to get the best value. Use our calculator to get the exact calculation with the current rate."
        }
      },
      {
        "@type": "Question",
        "name": "How much is 1 USD to 1 Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bolivia blue exchange rate currently fluctuates between 10.00 and 11.50 BOB per USD, with an average of approximately 10.50 BOB per USD. This means 1 USD equals approximately 10.50 BOB, while 1 BOB equals approximately 0.095 USD. The bolivia blue rate is updated every 15 minutes on our platform."
        }
      }
    ]
  };

  // FinancialProduct schema for rate cards
  const financialProductSchema = currentRate ? {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": language === 'es' ? "Bolivia Blue Rate" : "Bolivia Blue Rate",
    "description": language === 'es' 
      ? "Tipo de cambio del dólar blue en Bolivia en tiempo real"
      : "Real-time blue dollar exchange rate in Bolivia",
    "provider": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz"
    },
    "exchangeRate": {
      "@type": "UnitPriceSpecification",
      "price": currentRate.buy?.toFixed(2) || "0",
      "priceCurrency": "BOB",
      "unitText": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1000"
    }
  } : null;

  // DataFeed schema for rate updates
  const dataFeedSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": language === 'es' ? "Bolivia Blue Rate - Actualizaciones en Tiempo Real" : "Bolivia Blue Rate - Real-Time Updates",
    "description": language === 'es'
      ? "Feed de datos del tipo de cambio del dólar blue en Bolivia actualizado cada 15 minutos"
      : "Data feed of Bolivia blue dollar exchange rate updated every 15 minutes",
    "dataFeedElement": currentRate ? [{
      "@type": "DataFeedItem",
      "dateModified": new Date().toISOString(),
      "item": {
        "@type": "FinancialProduct",
        "name": "Bolivia Blue Rate",
        "exchangeRate": {
          "@type": "UnitPriceSpecification",
          "price": currentRate.buy?.toFixed(2) || "0",
          "priceCurrency": "BOB"
        }
      }
    }] : []
  };

  // Combine all structured data
  const allStructuredData = [organizationSchema, faqSchema];
  if (financialProductSchema) allStructuredData.push(financialProductSchema);
  allStructuredData.push(dataFeedSchema);
  
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Bolivia Blue Rate - Actualizado Cada 15 Min | Tipo de Cambio en Tiempo Real'
          : 'Bolivia Blue Rate - Updated Every 15 Min | Real-Time Exchange Rate'}
        description={language === 'es' 
          ? "Bolivia blue rate y bolivia blue exchange rate actualizados cada 15 minutos. Seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia. Gratis, sin registro. Mejor que bolivianblue.net - Actualizaciones más frecuentes."
          : "Bolivia blue rate and bolivia blue exchange rate updated every 15 minutes. Real-time tracking of the blue dollar exchange rate in Bolivia. Free, no registration. Better than bolivianblue.net - More frequent updates."}
        keywords={language === 'es'
          ? "bolivia blue rate, bolivia blue exchange rate, dólar bolivia, tipo de cambio bolivia, boliviano dólar, blue bolivia, dólar blue bolivia, tipo cambio bolivia, cambio dólar bolivia, mercado paralelo bolivia, dólar paralelo, Rodrigo Paz, BCB, banco central bolivia, binance bolivia, usdt bob, usdt a bob, boliviano a dólar, dólar a boliviano, cotización dólar bolivia, precio dólar bolivia, tasa cambio bolivia, bolivian blue, bolivianblue, mejor que bolivianblue.net"
          : "bolivia blue rate, bolivia blue exchange rate, bolivia dollar, exchange rate bolivia, boliviano dollar, blue dollar bolivia, bolivia blue dollar, bolivia exchange rate, bolivia currency, parallel market bolivia, bolivia parallel dollar, Rodrigo Paz, BCB, central bank bolivia, binance bolivia, usdt bob, usdt to bob, boliviano to dollar, dollar to boliviano, bolivia dollar rate, bolivia dollar price, bolivia exchange rate, bolivian blue, bolivianblue, better than bolivianblue.net, bolivia blue market, bolivia dollar calculator"}
        canonical="/"
        structuredData={allStructuredData}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Visible H1 with Keywords */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {language === 'es' 
            ? 'Bolivia Blue Rate - Tipo de Cambio en Tiempo Real'
            : 'Bolivia Blue Rate - Real-Time Exchange Rate'}
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">
          {language === 'es'
            ? 'Seguimiento en tiempo real del bolivia blue exchange rate actualizado cada 15 minutos'
            : 'Real-time tracking of the bolivia blue exchange rate updated every 15 minutes'}
        </p>
        
        {/* Blue Rate Cards - At the Top */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* Combined Sentiment + News Card */}
        <section>
          <SentimentNewsCard />
        </section>

        {/* Chart */}
        <section>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          }>
            <BlueChart showOfficial={showOfficial} />
          </Suspense>
        </section>

        {/* Rate Alerts Section - Hidden for now */}
        {/* <section>
          <RateAlertForm />
        </section> */}

        {/* Binance Banner - Under Chart */}
        <section>
          <BinanceBanner />
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              🔍 {language === 'es' ? '¿Cómo Funciona?' : 'How Does It Work?'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'es' 
                ? 'Te mostramos el tipo de cambio real del dólar en Bolivia en 3 simples pasos'
                : 'We show you the real dollar exchange rate in Bolivia in 3 simple steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Recopilamos Datos' : 'We Collect Data'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Monitoreamos Binance P2P cada 15 minutos para obtener el precio real de USDT/BOB en el mercado paralelo'
                      : 'We monitor Binance P2P every 15 minutes to get the real USDT/BOB price in the parallel market'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-green-200 dark:border-green-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Analizamos con IA' : 'We Analyze with AI'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Nuestra IA analiza noticias económicas y calcula el sentimiento del mercado para predecir tendencias'
                      : 'Our AI analyzes economic news and calculates market sentiment to predict trends'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-200 dark:border-purple-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'es' ? 'Te Lo Mostramos' : 'We Show You'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {language === 'es' 
                      ? 'Visualizamos todo en gráficos fáciles de entender, con noticias relevantes y herramientas prácticas'
                      : 'We visualize everything in easy-to-understand charts, with relevant news and practical tools'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15 min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Actualización' : 'Update Frequency'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Gratis' : 'Free'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {language === 'es' ? '2 idiomas' : '2 Languages'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'ES & EN' : 'ES & EN'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Disponible' : 'Available'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News & Twitter Tabs */}
        <section>
          <NewsTabs />
        </section>

        {/* Featured Blog Articles */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Guías y Recursos' : 'Guides & Resources'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {language === 'es' 
                  ? 'Aprende todo sobre el dólar blue, USDT y finanzas en Bolivia'
                  : 'Learn everything about the blue dollar, USDT and finance in Bolivia'}
              </p>
            </div>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              {language === 'es' ? 'Ver Todos' : 'View All'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(language === 'es' ? articlesEs : articlesEn)
              .filter(a => a.featured)
              .slice(0, 2)
              .map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug || article.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3 pt-3">
                    <span className="text-gray-500 dark:text-gray-400">{article.author}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline flex items-center gap-1">
                      {language === 'es' ? 'Leer' : 'Read'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
          </div>

          <Link
            to="/blog"
            className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            {language === 'es' ? 'Ver Todos los Artículos' : 'View All Articles'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* About */}
        <section>
          <About />
        </section>

        {/* Comparison Section - Why Choose Us */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border-2 border-green-200 dark:border-green-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'es' 
                ? '¿Por qué elegir boliviablue.com?' 
                : 'Why choose boliviablue.com?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {language === 'es'
                ? 'La plataforma más precisa y actualizada para el tipo de cambio del dólar blue en Bolivia'
                : 'The most accurate and up-to-date platform for Bolivia blue dollar exchange rate'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Actualización cada 15 minutos' : '✅ Updates every 15 minutes'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'es'
                    ? 'Mientras otros sitios como bolivianblue.net actualizan cada hora o diariamente, nosotros actualizamos cada 15 minutos con datos en tiempo real de Binance P2P.'
                    : 'While other sites like bolivianblue.net update hourly or daily, we update every 15 minutes with real-time Binance P2P data.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ URL más simple y memorable' : '✅ Simpler, memorable URL'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'es'
                    ? 'boliviablue.com es más fácil de recordar que bolivianblue.net. Sin guiones, dominio .com más confiable.'
                    : 'boliviablue.com is easier to remember than bolivianblue.net. No hyphens, more trusted .com domain.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Análisis de sentimiento con IA' : '✅ AI-powered sentiment analysis'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'es'
                    ? 'Única plataforma con análisis de sentimiento de noticias financieras para predecir tendencias del dólar blue.'
                    : 'Only platform with AI sentiment analysis of financial news to predict blue dollar trends.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Herramientas avanzadas' : '✅ Advanced tools'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'es'
                    ? 'Calculadora de divisas, gráficos históricos, alertas de precio y más. Todo en un solo lugar.'
                    : 'Currency calculator, historical charts, price alerts and more. All in one place.'}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? <>💡 <strong>Mejor que bolivianblue.net:</strong> Actualizaciones más frecuentes, interfaz moderna, más herramientas y URL más fácil de recordar. <Link to="/comparison" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Ver comparación completa</Link></>
                  : <>💡 <strong>Better than bolivianblue.net:</strong> More frequent updates, modern interface, more tools, and easier-to-remember URL. <Link to="/comparison" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">See full comparison</Link></>}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section with Keywords - Moved to Bottom */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'es' ? '¿Qué es el Bolivia Blue Rate?' : 'What is Bolivia Blue Rate?'}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Última actualización:' : 'Last updated:'} {new Date().toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es' 
                  ? <>El <strong>Bolivia blue rate</strong> es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como <strong>bolivia blue exchange rate</strong>, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. A diferencia de la tasa oficial del Banco Central de Bolivia, el <strong>bolivia blue rate</strong> fluctúa constantemente según la oferta y demanda del mercado.</>
                  : <>The <strong>Bolivia blue rate</strong> is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the <strong>bolivia blue exchange rate</strong>, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. Unlike the official rate from the Central Bank of Bolivia, the <strong>Bolivia blue rate</strong> fluctuates constantly according to market supply and demand.</>}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Nuestra plataforma rastrea el <strong>bolivia blue rate</strong> en tiempo real utilizando datos de Binance P2P, actualizando el <strong>bolivia blue exchange rate</strong> cada 15 minutos para brindarte la información más precisa y actualizada. Esto nos diferencia de otros sitios como bolivianblue.net que actualizan con menor frecuencia. <Link to="/bolivia-blue-rate" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Aprende más sobre el Bolivia Blue Rate</Link>, <Link to="/bolivia-blue-rate-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">consulta el bolivia blue rate hoy</Link>, <Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">usa nuestra calculadora</Link> para convertir divisas, o <Link to="/comparison" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">compara con otros sitios</Link>.</>
                  : <>Our platform tracks the <strong>Bolivia blue rate</strong> in real-time using Binance P2P data, updating the <strong>Bolivia blue exchange rate</strong> every 15 minutes to provide you with the most accurate and up-to-date information. This differentiates us from other sites like bolivianblue.net that update less frequently. <Link to="/bolivia-blue-rate" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Learn more about Bolivia Blue Rate</Link>, <Link to="/bolivia-blue-rate-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">check the bolivia blue rate today</Link>, <Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">use our calculator</Link> to convert currencies, or <Link to="/comparison" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">compare with other sites</Link>.</>}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' ? '¿Por qué es importante el Bolivia Blue Rate?' : 'Why is Bolivia Blue Rate Important?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li>El <strong>bolivia blue rate</strong> refleja la realidad del mercado cambiario boliviano</li>
                    <li>El <strong>bolivia blue exchange rate</strong> es utilizado por millones de bolivianos para transacciones diarias</li>
                    <li>Conocer el <strong>bolivia blue rate</strong> te ayuda a tomar mejores decisiones financieras</li>
                    <li>El <strong>bolivia blue exchange rate</strong> puede diferir significativamente de la tasa oficial</li>
                  </>
                ) : (
                  <>
                    <li>The <strong>Bolivia blue rate</strong> reflects the reality of Bolivia's exchange market</li>
                    <li>The <strong>Bolivia blue exchange rate</strong> is used by millions of Bolivians for daily transactions</li>
                    <li>Knowing the <strong>Bolivia blue rate</strong> helps you make better financial decisions</li>
                    <li>The <strong>Bolivia blue exchange rate</strong> can differ significantly from the official rate</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;

