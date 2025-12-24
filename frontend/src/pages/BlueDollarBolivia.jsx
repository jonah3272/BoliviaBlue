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

function BlueDollarBolivia() {
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        setCurrentRate(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading rate:', err);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Blue Dollar Bolivia - Blue Dollar Exchange Rate | Updated Every 15 Min",
    "description": "Blue Dollar Bolivia - Real-Time Blue Dollar Exchange Rate. Updated every 15 minutes. Historical charts, free calculator and news. The most accurate information on the Bolivian parallel market.",
    "author": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz",
      "logo": {
        "@type": "ImageObject",
        "url": "https://boliviablue.com/favicon.svg"
      }
    },
    "datePublished": "2025-01-20",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the blue dollar in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The blue dollar in Bolivia is the exchange rate of the US dollar in the parallel market. Currently, the blue dollar is approximately ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and ${currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "Where can I see the blue dollar in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can see the blue dollar in Bolivia on our platform boliviablue.com, which updates the quote every 15 minutes with real-time data from Binance P2P. You can also check other platforms, but our update frequency is higher than most."
        }
      },
      {
        "@type": "Question",
        "name": "How is the blue dollar calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The blue dollar is calculated using real-time data from Binance P2P for the USDT/BOB pair. We process public buy and sell offers, calculating the median of these offers to obtain a representative estimate of the parallel market exchange rate."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between blue dollar and official rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The main difference is that the official rate is set by the Central Bank of Bolivia and is fixed or adjusted very rarely, while the blue dollar fluctuates constantly according to market conditions. The blue dollar is generally higher than the official rate, reflecting the scarcity of dollars in the formal market. The difference can be 10-20% or more."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title="Blue Dollar Bolivia - Blue Dollar Exchange Rate | Updated Every 15 Min"
        description="Blue Dollar Bolivia - Real-Time Blue Dollar Exchange Rate. Updated every 15 minutes. Historical charts, free calculator and news. The most accurate information on the Bolivian parallel market. Check now."
        keywords="blue dollar bolivia, blue dollar exchange rate bolivia, bolivia dollar rate, bolivia dollar price, exchange rate bolivia, bolivia blue dollar, parallel dollar bolivia"
        canonical="/blue-dollar-bolivia"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          { name: 'Blue Dollar Bolivia', url: '/blue-dollar-bolivia' }
        ]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blue Dollar Bolivia - Current Exchange Rate
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
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
              What is Blue Dollar Bolivia?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The <strong>blue dollar in Bolivia</strong> is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the <strong>bolivia blue dollar</strong> or <strong>parallel dollar</strong>, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system. Unlike the official rate set by the Central Bank of Bolivia, the <strong>blue dollar bolivia</strong> fluctuates constantly according to market supply and demand.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              How is Blue Dollar Bolivia Calculated?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our platform calculates the <strong>blue dollar bolivia</strong> using real-time data from Binance P2P for the USDT/BOB pair. We process public buy and sell offers, calculating the median of these offers to obtain a representative estimate of the <strong>blue dollar exchange rate</strong>. This method allows us to provide an accurate rate that reflects the real conditions of the parallel market. <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert currencies or <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn more about our methodology</Link>.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Why is Blue Dollar Bolivia Important?
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
              <li>The <strong>blue dollar bolivia</strong> reflects the reality of Bolivia's exchange market, not just the official rate</li>
              <li>Millions of Bolivians use the <strong>blue dollar rate</strong> for daily transactions</li>
              <li>Knowing the <strong>blue dollar bolivia</strong> helps you make better financial decisions</li>
              <li>The <strong>blue dollar exchange rate</strong> can differ significantly from the official rate, sometimes by 10-20%</li>
              <li>For importers, exporters, and people receiving remittances, the <strong>blue dollar</strong> is crucial</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Difference between Blue Dollar and Official Rate
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The official rate from the Central Bank of Bolivia is fixed or adjusted very rarely. In contrast, the <strong>blue dollar bolivia</strong> fluctuates constantly according to market conditions. The <strong>blue dollar rate</strong> is generally higher than the official rate, reflecting the scarcity of dollars in the formal market.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              How Often is Blue Dollar Bolivia Updated?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our platform updates the <strong>blue dollar bolivia</strong> every 15 minutes using real-time data from Binance P2P. This ensures you always have access to the most accurate and up-to-date information about the <strong>blue dollar rate</strong>. This update frequency is higher than most other platforms, such as bolivianblue.net, which update less frequently.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Historical Chart of Blue Dollar Bolivia
            </h2>
            <div className="mb-6">
              <Suspense fallback={
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 animate-pulse">
                  <div className="h-64"></div>
                </div>
              }>
                <BlueChart showOfficial={showOfficial} />
              </Suspense>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Frequently Asked Questions about Blue Dollar Bolivia
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  What is the blue dollar in Bolivia?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The blue dollar in Bolivia is the exchange rate of the US dollar in the parallel market. Currently, the blue dollar is approximately {currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USD for buying and {currentRate?.sell_bob_per_usd?.toFixed(2) || '10.60'} BOB per USD for selling.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Where can I see the blue dollar in Bolivia?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You can see the blue dollar in Bolivia on our platform boliviablue.com, which updates the quote every 15 minutes with real-time data from Binance P2P. You can also check other platforms, but our update frequency is higher than most.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Additional Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/calculadora"
                className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Currency Calculator
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calculate conversions using the blue dollar
                </p>
              </Link>
              <Link
                to="/dolar-blue-hoy"
                className="block p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Blue Dollar Today
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check the current quote
                </p>
              </Link>
              <Link
                to="/bolivian-blue"
                className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Bolivian Blue
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete guide in Spanish
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

export default BlueDollarBolivia;










