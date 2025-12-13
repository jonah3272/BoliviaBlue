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
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BinanceP2PBolivia() {
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
      ? "Binance P2P Bolivia - Cómo Comprar y Vender USDT | Guía Completa 2025"
      : "Binance P2P Bolivia - How to Buy and Sell USDT | Complete Guide 2025",
    "description": language === 'es'
      ? "Binance P2P Bolivia: Guía completa sobre cómo usar Binance P2P para comprar y vender USDT en Bolivia. Cómo funciona, pasos detallados, seguridad y mejores prácticas. Actualizado 2025."
      : "Binance P2P Bolivia: Complete guide on how to use Binance P2P to buy and sell USDT in Bolivia. How it works, detailed steps, security and best practices. Updated 2025.",
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

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": language === 'es' 
      ? "Cómo Usar Binance P2P en Bolivia"
      : "How to Use Binance P2P in Bolivia",
    "description": language === 'es'
      ? "Guía paso a paso para usar Binance P2P en Bolivia para comprar y vender USDT"
      : "Step-by-step guide to use Binance P2P in Bolivia to buy and sell USDT",
    "step": language === 'es' ? [
      {
        "@type": "HowToStep",
        "name": "Crear cuenta en Binance",
        "text": "Regístrate en Binance.com y completa la verificación de identidad (KYC) necesaria para usar P2P."
      },
      {
        "@type": "HowToStep",
        "name": "Ir a Binance P2P",
        "text": "Navega a la sección P2P en Binance y selecciona el par USDT/BOB (Tether/Boliviano)."
      },
      {
        "@type": "HowToStep",
        "name": "Seleccionar oferta",
        "text": "Elige una oferta de compra o venta según tus necesidades. Revisa la reputación del vendedor y los métodos de pago aceptados."
      },
      {
        "@type": "HowToStep",
        "name": "Realizar transacción",
        "text": "Sigue las instrucciones de Binance P2P para completar la transacción. El sistema actúa como intermediario para mayor seguridad."
      }
    ] : [
      {
        "@type": "HowToStep",
        "name": "Create Binance account",
        "text": "Sign up on Binance.com and complete the necessary identity verification (KYC) to use P2P."
      },
      {
        "@type": "HowToStep",
        "name": "Go to Binance P2P",
        "text": "Navigate to the P2P section in Binance and select the USDT/BOB (Tether/Boliviano) pair."
      },
      {
        "@type": "HowToStep",
        "name": "Select offer",
        "text": "Choose a buy or sell offer according to your needs. Review the seller's reputation and accepted payment methods."
      },
      {
        "@type": "HowToStep",
        "name": "Complete transaction",
        "text": "Follow Binance P2P instructions to complete the transaction. The system acts as an intermediary for greater security."
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Qué es Binance P2P Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Binance P2P Bolivia es la plataforma de intercambio peer-to-peer de Binance que permite a los usuarios en Bolivia comprar y vender USDT (Tether) directamente con otros usuarios, usando bolivianos (BOB) como método de pago. Es una forma segura y regulada de intercambiar criptomonedas."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona Binance P2P en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Binance P2P funciona como un mercado donde los usuarios publican ofertas de compra o venta de USDT por BOB. Binance actúa como intermediario, reteniendo los fondos hasta que ambas partes confirmen la transacción. Esto proporciona seguridad tanto para compradores como vendedores."
        }
      },
      {
        "@type": "Question",
        "name": "¿Es seguro usar Binance P2P en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, Binance P2P es seguro porque Binance actúa como intermediario y retiene los fondos hasta que ambas partes confirmen la transacción. Además, puedes revisar la reputación de los vendedores antes de realizar transacciones. Sin embargo, siempre debes seguir las mejores prácticas de seguridad."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el tipo de cambio en Binance P2P Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El tipo de cambio en Binance P2P Bolivia varía según la oferta y demanda, pero generalmente está alrededor de ${currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USDT. Nuestra plataforma calcula el dólar blue utilizando datos de Binance P2P, actualizándose cada 15 minutos.`
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "What is Binance P2P Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Binance P2P Bolivia is Binance's peer-to-peer exchange platform that allows users in Bolivia to buy and sell USDT (Tether) directly with other users, using bolivianos (BOB) as payment method. It's a safe and regulated way to exchange cryptocurrencies."
        }
      },
      {
        "@type": "Question",
        "name": "How does Binance P2P work in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Binance P2P works as a marketplace where users post buy or sell offers for USDT for BOB. Binance acts as an intermediary, holding funds until both parties confirm the transaction. This provides security for both buyers and sellers."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Binance P2P Bolivia - Cómo Comprar y Vender USDT | Guía Completa 2025'
          : 'Binance P2P Bolivia - How to Buy and Sell USDT | Complete Guide 2025'}
        description={language === 'es'
          ? 'Binance P2P Bolivia: Guía completa sobre cómo usar Binance P2P para comprar y vender USDT en Bolivia. Cómo funciona, pasos detallados, seguridad y mejores prácticas. Actualizado 2025.'
          : 'Binance P2P Bolivia: Complete guide on how to use Binance P2P to buy and sell USDT in Bolivia. How it works, detailed steps, security and best practices. Updated 2025.'}
        keywords={language === 'es'
          ? "binance p2p bolivia, binance p2p, binance bolivia, comprar usdt binance, vender usdt binance, binance p2p usdt bob, cómo usar binance p2p, binance bolivia dólar, usdt a bob binance, mejor que bolivianblue.net"
          : "binance p2p bolivia, binance p2p, binance bolivia, buy usdt binance, sell usdt binance, binance p2p usdt bob, how to use binance p2p, binance bolivia dollar, usdt to bob binance"}
        canonical="/binance-p2p-bolivia"
        structuredData={[articleSchema, howToSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Binance P2P Bolivia', path: '/binance-p2p-bolivia' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Binance P2P Bolivia', path: '/binance-p2p-bolivia' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es' 
            ? 'Binance P2P Bolivia - Guía Completa'
            : 'Binance P2P Bolivia - Complete Guide'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
          {language === 'es'
            ? 'Aprende cómo usar Binance P2P para comprar y vender USDT en Bolivia de forma segura'
            : 'Learn how to use Binance P2P to buy and sell USDT in Bolivia safely'}
        </p>

        {/* Rate Cards */}
        <section>
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

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
                  ? '¿Qué es Binance P2P Bolivia?'
                  : 'What is Binance P2P Bolivia?'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es' 
                  ? <>Binance P2P Bolivia es la plataforma de intercambio peer-to-peer de Binance que permite a los usuarios en Bolivia comprar y vender <strong>USDT (Tether)</strong> directamente con otros usuarios, usando <strong>bolivianos (BOB)</strong> como método de pago. Esta plataforma es una de las principales fuentes de datos para calcular el <strong>dólar blue en Bolivia</strong>.</>
                  : <>Binance P2P Bolivia is Binance's peer-to-peer exchange platform that allows users in Bolivia to buy and sell <strong>USDT (Tether)</strong> directly with other users, using <strong>bolivianos (BOB)</strong> as payment method. This platform is one of the main data sources for calculating the <strong>blue dollar in Bolivia</strong>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Cómo Funciona Binance P2P en Bolivia?'
                  : 'How Does Binance P2P Work in Bolivia?'}
              </h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Crear cuenta:</strong> Regístrate en Binance.com y completa la verificación de identidad (KYC) necesaria para usar P2P.</li>
                    <li><strong>Ir a P2P:</strong> Navega a la sección P2P en Binance y selecciona el par USDT/BOB (Tether/Boliviano).</li>
                    <li><strong>Seleccionar oferta:</strong> Elige una oferta de compra o venta según tus necesidades. Revisa la reputación del vendedor y los métodos de pago aceptados.</li>
                    <li><strong>Realizar transacción:</strong> Sigue las instrucciones de Binance P2P para completar la transacción. Binance actúa como intermediario, reteniendo los fondos hasta que ambas partes confirmen.</li>
                    <li><strong>Confirmar:</strong> Una vez que ambas partes confirman, Binance libera los fondos y la transacción se completa.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Create account:</strong> Sign up on Binance.com and complete the necessary identity verification (KYC) to use P2P.</li>
                    <li><strong>Go to P2P:</strong> Navigate to the P2P section in Binance and select the USDT/BOB (Tether/Boliviano) pair.</li>
                    <li><strong>Select offer:</strong> Choose a buy or sell offer according to your needs. Review the seller's reputation and accepted payment methods.</li>
                    <li><strong>Complete transaction:</strong> Follow Binance P2P instructions to complete the transaction. Binance acts as an intermediary, holding funds until both parties confirm.</li>
                    <li><strong>Confirm:</strong> Once both parties confirm, Binance releases the funds and the transaction is completed.</li>
                  </>
                )}
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Es Seguro Usar Binance P2P en Bolivia?'
                  : 'Is it Safe to Use Binance P2P in Bolivia?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Sí, Binance P2P es seguro porque:</>
                  : <>Yes, Binance P2P is safe because:</>}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li>Binance actúa como <strong>intermediario</strong> y retiene los fondos hasta que ambas partes confirmen</li>
                    <li>Puedes revisar la <strong>reputación</strong> de los vendedores antes de realizar transacciones</li>
                    <li>El sistema tiene <strong>protección contra estafas</strong> y mecanismos de resolución de disputas</li>
                    <li>Las transacciones están <strong>reguladas</strong> y supervisadas por Binance</li>
                  </>
                ) : (
                  <>
                    <li>Binance acts as an <strong>intermediary</strong> and holds funds until both parties confirm</li>
                    <li>You can review the <strong>reputation</strong> of sellers before making transactions</li>
                    <li>The system has <strong>fraud protection</strong> and dispute resolution mechanisms</li>
                    <li>Transactions are <strong>regulated</strong> and supervised by Binance</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Tipo de Cambio en Binance P2P Bolivia'
                  : 'Exchange Rate in Binance P2P Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El tipo de cambio en Binance P2P Bolivia varía según la oferta y demanda, pero generalmente está alrededor de {currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB por USDT. Nuestra plataforma calcula el <strong>dólar blue</strong> utilizando datos de Binance P2P, actualizándose cada 15 minutos para proporcionarte la información más precisa.</>
                  : <>The exchange rate in Binance P2P Bolivia varies according to supply and demand, but is generally around {currentRate?.buy_bob_per_usd?.toFixed(2) || '10.50'} BOB per USDT. Our platform calculates the <strong>blue dollar</strong> using Binance P2P data, updating every 15 minutes to provide you with the most accurate information.</>}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Consejos de Seguridad' : '💡 Safety Tips'}
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li>Siempre verifica la reputación del vendedor antes de realizar transacciones</li>
                      <li>Usa métodos de pago seguros y verificados</li>
                      <li>Nunca completes transacciones fuera de la plataforma Binance P2P</li>
                      <li>Lee las reseñas y comentarios de otros usuarios</li>
                      <li>Mantén tus credenciales de Binance seguras</li>
                    </>
                  ) : (
                    <>
                      <li>Always verify the seller's reputation before making transactions</li>
                      <li>Use safe and verified payment methods</li>
                      <li>Never complete transactions outside the Binance P2P platform</li>
                      <li>Read reviews and comments from other users</li>
                      <li>Keep your Binance credentials secure</li>
                    </>
                  )}
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Ventajas de Usar Binance P2P en Bolivia'
                  : 'Advantages of Using Binance P2P in Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Binance P2P ofrece varias ventajas sobre otros métodos de cambio en Bolivia:'
                  : 'Binance P2P offers several advantages over other exchange methods in Bolivia:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Transparencia:</strong> Puedes ver todas las ofertas disponibles y comparar precios fácilmente</li>
                    <li><strong>Seguridad:</strong> Binance actúa como intermediario, protegiendo tanto al comprador como al vendedor</li>
                    <li><strong>Accesibilidad:</strong> Disponible 24/7 desde cualquier dispositivo con internet</li>
                    <li><strong>Variedad de métodos de pago:</strong> Acepta transferencias bancarias, efectivo, y otros métodos</li>
                    <li><strong>Reputación verificada:</strong> Puedes ver la reputación y historial de cada vendedor</li>
                    <li><strong>Sin límites geográficos:</strong> Puedes operar desde cualquier parte de Bolivia</li>
                    <li><strong>Tasas competitivas:</strong> Generalmente ofrece mejores tasas que casas de cambio físicas</li>
                  </>
                ) : (
                  <>
                    <li><strong>Transparency:</strong> You can see all available offers and easily compare prices</li>
                    <li><strong>Security:</strong> Binance acts as an intermediary, protecting both buyer and seller</li>
                    <li><strong>Accessibility:</strong> Available 24/7 from any device with internet</li>
                    <li><strong>Variety of payment methods:</strong> Accepts bank transfers, cash, and other methods</li>
                    <li><strong>Verified reputation:</strong> You can see each seller's reputation and history</li>
                    <li><strong>No geographic limits:</strong> You can operate from anywhere in Bolivia</li>
                    <li><strong>Competitive rates:</strong> Generally offers better rates than physical exchange houses</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Elegir un Vendedor en Binance P2P Bolivia'
                  : 'How to Choose a Seller on Binance P2P Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Al usar Binance P2P en Bolivia, es importante elegir vendedores confiables. Considera estos factores:'
                  : 'When using Binance P2P in Bolivia, it\'s important to choose reliable sellers. Consider these factors:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Reputación:</strong> Busca vendedores con alta calificación (4.5+ estrellas) y muchas transacciones completadas</li>
                    <li><strong>Completación de transacciones:</strong> Revisa el porcentaje de transacciones completadas exitosamente</li>
                    <li><strong>Tiempo de respuesta:</strong> Vendedores que responden rápidamente son más confiables</li>
                    <li><strong>Límites de transacción:</strong> Verifica que el vendedor acepte el monto que necesitas</li>
                    <li><strong>Métodos de pago:</strong> Asegúrate de que el vendedor acepte tu método de pago preferido</li>
                    <li><strong>Reseñas recientes:</strong> Lee las reseñas más recientes para ver la experiencia actual de otros usuarios</li>
                  </>
                ) : (
                  <>
                    <li><strong>Reputation:</strong> Look for sellers with high ratings (4.5+ stars) and many completed transactions</li>
                    <li><strong>Transaction completion:</strong> Review the percentage of successfully completed transactions</li>
                    <li><strong>Response time:</strong> Sellers who respond quickly are more reliable</li>
                    <li><strong>Transaction limits:</strong> Verify that the seller accepts the amount you need</li>
                    <li><strong>Payment methods:</strong> Make sure the seller accepts your preferred payment method</li>
                    <li><strong>Recent reviews:</strong> Read the most recent reviews to see current experience from other users</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Proceso Detallado de Transacción en Binance P2P'
                  : 'Detailed Transaction Process on Binance P2P'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El proceso completo de una transacción en Binance P2P Bolivia incluye los siguientes pasos detallados:'
                  : 'The complete process of a transaction on Binance P2P Bolivia includes the following detailed steps:'}
              </p>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-3 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Búsqueda de oferta:</strong> Navega por las ofertas disponibles, filtra por método de pago, cantidad, y reputación del vendedor</li>
                    <li><strong>Selección:</strong> Elige una oferta que se ajuste a tus necesidades y presiona "Comprar" o "Vender"</li>
                    <li><strong>Confirmación:</strong> Revisa los detalles de la transacción y confirma</li>
                    <li><strong>Pago:</strong> Realiza el pago según las instrucciones del vendedor (transferencia bancaria, efectivo, etc.)</li>
                    <li><strong>Confirmación de pago:</strong> Marca "Pago completado" en Binance después de realizar el pago</li>
                    <li><strong>Liberación:</strong> El vendedor confirma la recepción del pago y Binance libera los USDT o BOB</li>
                    <li><strong>Finalización:</strong> Ambas partes confirman y la transacción se completa</li>
                  </>
                ) : (
                  <>
                    <li><strong>Offer search:</strong> Browse available offers, filter by payment method, amount, and seller reputation</li>
                    <li><strong>Selection:</strong> Choose an offer that fits your needs and press "Buy" or "Sell"</li>
                    <li><strong>Confirmation:</strong> Review transaction details and confirm</li>
                    <li><strong>Payment:</strong> Make payment according to seller's instructions (bank transfer, cash, etc.)</li>
                    <li><strong>Payment confirmation:</strong> Mark "Payment completed" on Binance after making payment</li>
                    <li><strong>Release:</strong> Seller confirms payment receipt and Binance releases USDT or BOB</li>
                    <li><strong>Completion:</strong> Both parties confirm and the transaction is completed</li>
                  </>
                )}
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Métodos de Pago Disponibles en Binance P2P Bolivia'
                  : 'Payment Methods Available on Binance P2P Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Binance P2P en Bolivia acepta varios métodos de pago, dependiendo del vendedor:'
                  : 'Binance P2P in Bolivia accepts several payment methods, depending on the seller:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Transferencia bancaria:</strong> La forma más común, permite transferir BOB directamente desde tu banco</li>
                    <li><strong>Efectivo:</strong> Algunos vendedores aceptan pago en efectivo en persona</li>
                    <li><strong>Billeteras digitales:</strong> Algunas billeteras digitales bolivianas pueden ser aceptadas</li>
                    <li><strong>Otras criptomonedas:</strong> Algunos vendedores pueden aceptar otras criptomonedas además de USDT</li>
                  </>
                ) : (
                  <>
                    <li><strong>Bank transfer:</strong> The most common method, allows transferring BOB directly from your bank</li>
                    <li><strong>Cash:</strong> Some sellers accept cash payment in person</li>
                    <li><strong>Digital wallets:</strong> Some Bolivian digital wallets may be accepted</li>
                    <li><strong>Other cryptocurrencies:</strong> Some sellers may accept other cryptocurrencies besides USDT</li>
                  </>
                )}
              </ul>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '🔗 Recursos Relacionados' : '🔗 Related Resources'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>Aprende más sobre el dólar blue y cómo usarlo. <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Consulta nuestra guía completa para comprar dólares</Link>, <Link to="/usdt-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">aprende sobre USDT en Bolivia</Link>, o <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">usa nuestra calculadora</Link> para convertir divisas.</>
                    : <>Learn more about the blue dollar and how to use it. <Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Check our complete guide to buy dollars</Link>, <Link to="/usdt-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">learn about USDT in Bolivia</Link>, or <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">use our calculator</Link> to convert currencies.</>}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li><Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Guía completa: Cómo comprar dólares en Bolivia</Link></li>
                      <li><Link to="/usdt-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Todo sobre USDT en Bolivia</Link></li>
                      <li><Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Calculadora de divisas</Link></li>
                      <li><Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Dólar blue hoy</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/comprar-dolares" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Complete guide: How to buy dollars in Bolivia</Link></li>
                      <li><Link to="/usdt-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Everything about USDT in Bolivia</Link></li>
                      <li><Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Currency calculator</Link></li>
                      <li><Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blue dollar today</Link></li>
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
              to="/usdt-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'USDT en Bolivia' : 'USDT in Bolivia'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Guía completa' : 'Complete guide'}
              </div>
            </Link>
            <Link
              to="/comprar-dolares"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Comprar Dólares' : 'Buy Dollars'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cómo comprar' : 'How to buy'}
              </div>
            </Link>
            <Link
              to="/calculadora"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Calculadora' : 'Calculator'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Convierte divisas' : 'Convert currencies'}
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BinanceP2PBolivia;


