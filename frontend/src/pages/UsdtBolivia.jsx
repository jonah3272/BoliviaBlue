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
import Breadcrumbs from '../components/Breadcrumbs';

function UsdtBolivia() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');

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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "USDT en Bolivia - Cómo Convertir USDT a BOB | Guía Completa 2025"
      : "USDT in Bolivia - How to Convert USDT to BOB | Complete Guide 2025",
    "description": language === 'es'
      ? "USDT en Bolivia: Guía completa sobre Tether (USDT) en Bolivia. Cómo convertir USDT a BOB, dónde comprar y vender USDT, tipo de cambio actual y mejores prácticas. Actualizado 2025."
      : "USDT in Bolivia: Complete guide about Tether (USDT) in Bolivia. How to convert USDT to BOB, where to buy and sell USDT, current exchange rate and best practices. Updated 2025.",
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
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es USDT en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "USDT (Tether) es una criptomoneda estable (stablecoin) que está vinculada al dólar estadounidense. En Bolivia, USDT se usa comúnmente para intercambiar por bolivianos (BOB) a través de plataformas P2P como Binance. 1 USDT = 1 USD aproximadamente."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo convertir USDT a BOB en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Para convertir USDT a BOB en Bolivia, puedes usar Binance P2P. Ve a la sección P2P, selecciona el par USDT/BOB, elige una oferta de venta, y sigue las instrucciones. Binance actúa como intermediario para mayor seguridad. El tipo de cambio actual es aproximadamente 10.50 BOB por USDT."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 1 USDT a BOB?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1 USDT equivale aproximadamente a ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB según el dólar blue actual. Este valor se actualiza cada 15 minutos y refleja el mercado paralelo en Bolivia.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde comprar USDT en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes comprar USDT en Bolivia principalmente a través de Binance P2P, donde los usuarios publican ofertas de compra y venta. También puedes usar otras plataformas P2P, pero Binance es la más popular y segura."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is USDT in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "USDT (Tether) is a stable cryptocurrency that is pegged to the US dollar. In Bolivia, USDT is commonly used to exchange for bolivianos (BOB) through P2P platforms like Binance. 1 USDT = 1 USD approximately."
        }
      },
      {
        "@type": "Question",
        "name": "How to convert USDT to BOB in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To convert USDT to BOB in Bolivia, you can use Binance P2P. Go to the P2P section, select the USDT/BOB pair, choose a sell offer, and follow the instructions. Binance acts as an intermediary for greater security. The current exchange rate is approximately 10.50 BOB per USDT."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'USDT en Bolivia - Cómo Convertir USDT a BOB | Guía Completa 2025'
          : 'USDT in Bolivia - How to Convert USDT to BOB | Complete Guide 2025'}
        description={language === 'es'
          ? 'USDT en Bolivia: Guía completa sobre Tether (USDT) en Bolivia. Cómo convertir USDT a BOB, dónde comprar y vender USDT, tipo de cambio actual y mejores prácticas. Actualizado 2025.'
          : 'USDT in Bolivia: Complete guide about Tether (USDT) in Bolivia. How to convert USDT to BOB, where to buy and sell USDT, current exchange rate and best practices. Updated 2025.'}
        keywords={language === 'es'
          ? "usdt bolivia, usdt a bob, usdt bolivianos, convertir usdt a bob, comprar usdt bolivia, vender usdt bolivia, usdt tipo cambio, tether bolivia, usdt binance bolivia, mejor que bolivianblue.net"
          : "usdt bolivia, usdt to bob, usdt bolivianos, convert usdt to bob, buy usdt bolivia, sell usdt bolivia, usdt exchange rate, tether bolivia, usdt binance bolivia"}
        canonical="/usdt-bolivia"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'USDT en Bolivia', path: '/usdt-bolivia' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'USDT in Bolivia', path: '/usdt-bolivia' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'USDT en Bolivia - Guía Completa'
            : 'USDT in Bolivia - Complete Guide'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Todo lo que necesitas saber sobre USDT (Tether) en Bolivia: cómo convertir, dónde comprar y tipo de cambio actual'
            : 'Everything you need to know about USDT (Tether) in Bolivia: how to convert, where to buy and current exchange rate'}
        </p>

        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        {/* USDT to BOB Conversion */}
        {currentRate && (
          <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 border-2 border-purple-200 dark:border-purple-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? 'Conversión USDT a BOB'
                  : 'USDT to BOB Conversion'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? '1 USDT =' : '1 USDT ='}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {currentRate.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? '10 USDT =' : '10 USDT ='}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {((currentRate.buy_bob_per_usd || 10.50) * 10).toFixed(2)} BOB
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' ? '100 USDT =' : '100 USDT ='}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {((currentRate.buy_bob_per_usd || 10.50) * 100).toFixed(2)} BOB
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                {language === 'es'
                  ? 'Tipo de cambio actualizado cada 15 minutos'
                  : 'Exchange rate updated every 15 minutes'}
              </p>
            </div>
          </section>
        )}

        {/* Binance Banner */}
        <section>
          <BinanceBanner />
        </section>

        {/* Main Content */}
        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? '¿Qué es USDT en Bolivia?'
                  : 'What is USDT in Bolivia?'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es' 
                  ? <>USDT (Tether) es una <strong>criptomoneda estable</strong> (stablecoin) que está vinculada al dólar estadounidense. En Bolivia, <strong>USDT</strong> se usa comúnmente para intercambiar por <strong>bolivianos (BOB)</strong> a través de plataformas P2P como Binance. 1 USDT = 1 USD aproximadamente, lo que lo convierte en una forma digital de dólares.</>
                  : <>USDT (Tether) is a <strong>stable cryptocurrency</strong> (stablecoin) that is pegged to the US dollar. In Bolivia, <strong>USDT</strong> is commonly used to exchange for <strong>bolivianos (BOB)</strong> through P2P platforms like Binance. 1 USDT = 1 USD approximately, making it a digital form of dollars.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Cómo Convertir USDT a BOB en Bolivia?'
                  : 'How to Convert USDT to BOB in Bolivia?'}
              </h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Usa Binance P2P:</strong> Ve a la sección P2P en Binance y selecciona el par USDT/BOB</li>
                    <li><strong>Elige una oferta:</strong> Selecciona una oferta de venta de USDT que acepte tu método de pago preferido</li>
                    <li><strong>Inicia la transacción:</strong> Sigue las instrucciones de Binance P2P para iniciar la venta</li>
                    <li><strong>Recibe el pago:</strong> Una vez que el comprador confirme el pago, recibirás los BOB en tu cuenta bancaria</li>
                    <li><strong>Confirma:</strong> Confirma la recepción del pago en Binance para completar la transacción</li>
                  </>
                ) : (
                  <>
                    <li><strong>Use Binance P2P:</strong> Go to the P2P section in Binance and select the USDT/BOB pair</li>
                    <li><strong>Choose an offer:</strong> Select a USDT sell offer that accepts your preferred payment method</li>
                    <li><strong>Start transaction:</strong> Follow Binance P2P instructions to start the sale</li>
                    <li><strong>Receive payment:</strong> Once the buyer confirms payment, you'll receive BOB in your bank account</li>
                    <li><strong>Confirm:</strong> Confirm receipt of payment in Binance to complete the transaction</li>
                  </>
                )}
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Tipo de Cambio USDT a BOB'
                  : 'USDT to BOB Exchange Rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El tipo de cambio de <strong>USDT a BOB</strong> varía según el mercado, pero generalmente está alrededor de {currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USDT. Este valor refleja el <strong>dólar blue</strong> en Bolivia y se actualiza cada 15 minutos en nuestra plataforma utilizando datos de Binance P2P.</>
                  : <>The <strong>USDT to BOB</strong> exchange rate varies according to the market, but is generally around {currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USDT. This value reflects the <strong>blue dollar</strong> in Bolivia and is updated every 15 minutes on our platform using Binance P2P data.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Comprar y Vender USDT en Bolivia?'
                  : 'Where to Buy and Sell USDT in Bolivia?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Binance P2P</strong> - La plataforma más popular y segura para comprar y vender USDT en Bolivia</li>
                    <li><strong>Otras plataformas P2P</strong> - Como Airtm, Wallbit, pero Binance es la más utilizada</li>
                    <li><strong>Particulares</strong> - Algunas personas intercambian USDT directamente, pero es menos seguro</li>
                  </>
                ) : (
                  <>
                    <li><strong>Binance P2P</strong> - The most popular and safe platform to buy and sell USDT in Bolivia</li>
                    <li><strong>Other P2P platforms</strong> - Like Airtm, Wallbit, but Binance is the most used</li>
                    <li><strong>Individuals</strong> - Some people exchange USDT directly, but it's less safe</li>
                  </>
                )}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Información Importante' : '💡 Important Information'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>El tipo de cambio <strong>USDT a BOB</strong> se actualiza cada 15 minutos. Esta cotización es solo informativa y puede variar según la plataforma y el método de pago. Siempre verifica la cotización antes de realizar transacciones.</>
                    : <>The <strong>USDT to BOB</strong> exchange rate is updated every 15 minutes. This quote is for informational purposes only and may vary by platform and payment method. Always verify the quote before making transactions.</>}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li><Link to="/binance-p2p-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Guía completa: Binance P2P en Bolivia</Link></li>
                      <li><Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Calculadora de divisas</Link> para convertir USDT a BOB</li>
                      <li><Link to="/buy-dollars" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Cómo comprar dólares</Link> usando USDT</li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/binance-p2p-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Complete guide: Binance P2P in Bolivia</Link></li>
                      <li><Link to="/calculator" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Currency calculator</Link> to convert USDT to BOB</li>
                      <li><Link to="/buy-dollars" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">How to buy dollars</Link> using USDT</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Páginas Relacionadas' : 'Related Pages'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/binance-p2p-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Binance P2P Bolivia' : 'Binance P2P Bolivia'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Guía completa' : 'Complete guide'}
              </div>
            </Link>
            <Link
              to="/calculator"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Calculadora' : 'Calculator'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Convierte USDT a BOB' : 'Convert USDT to BOB'}
              </div>
            </Link>
            <Link
              to="/buy-dollars"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Comprar Dólares' : 'Buy Dollars'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Usando USDT' : 'Using USDT'}
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default UsdtBolivia;


