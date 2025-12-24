import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReadyWhen } from '../hooks/useAdsenseReady';
import BlueRateCards from '../components/BlueRateCards';
import { useState } from 'react';
import { fetchBlueRate } from '../utils/api';
import Footer from '../components/Footer';

function CuantoEstaDolarBoliviaHoy() {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        setCurrentRate(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading rate:', error);
        setLoading(false);
      }
    };
    loadRate();
  }, []);

  // Only allow ads when content is loaded (AdSense policy compliance)
  useAdsenseReadyWhen(loading, currentRate !== null);

  const currentDate = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": {
      "@type": "Question",
      "name": "¿Cuánto está el dólar en Bolivia hoy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Hoy ${currentDate}, el dólar blue en Bolivia está a ${currentRate?.buy_bob_per_usd || 'cargando...'} BOB para compra y ${currentRate?.sell_bob_per_usd || 'cargando...'} BOB para venta. Este precio se actualiza cada 15 minutos con datos en tiempo real del mercado paralelo boliviano.`
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://boliviablue.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "¿Cuánto está el dólar en Bolivia hoy?",
        "item": "https://boliviablue.com/cuanto-esta-dolar-bolivia-hoy"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <Helmet>
        <title>¿Cuánto Está el Dólar en Bolivia Hoy? | Cotización EN VIVO {currentDate}</title>
        <meta 
          name="description" 
          content={`¿Cuánto está el dólar en Bolivia hoy? ${currentDate}: Compra ${currentRate?.buy_bob_per_usd || ''} BOB, Venta ${currentRate?.sell_bob_per_usd || ''} BOB. Actualizado cada 15 minutos. Consulta el precio oficial y paralelo del dólar en Bolivia HOY.`}
        />
        <meta 
          name="keywords" 
          content="cuanto esta el dolar en bolivia hoy, cuanto esta el dolar hoy en bolivia, a cuanto esta el dolar en bolivia, cuanto vale el dolar en bolivia, precio dolar bolivia hoy, cotizacion dolar bolivia hoy, dolar bolivia hoy, cambio dolar bolivia hoy" 
        />
        <link rel="canonical" href="https://boliviablue.com/cuanto-esta-dolar-bolivia-hoy" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">¿Cuánto está el dólar hoy?</li>
          </ol>
        </nav>

        {/* Hero Section - Direct Answer */}
        <section className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Cuánto Está el Dólar en Bolivia Hoy?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {currentDate}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-800 dark:text-green-300 font-medium">
              Actualizado en tiempo real
            </span>
          </div>
        </section>

        {/* Current Rate Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-600 dark:text-gray-400">Cargando cotización actual...</div>
          </div>
        ) : (
          <BlueRateCards />
        )}

        {/* Direct Answer Box */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💡 Respuesta Rápida
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-600">
            <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
              <strong>Hoy {currentDate}, el dólar en Bolivia está a:</strong>
            </p>
            <ul className="mt-4 space-y-3 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400 font-bold">🟢 COMPRA:</span>
                <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">
                  {currentRate?.buy_bob_per_usd || '--'} BOB
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-red-600 dark:text-red-400 font-bold">🔴 VENTA:</span>
                <span className="font-mono font-bold text-2xl text-gray-900 dark:text-white">
                  {currentRate?.sell_bob_per_usd || '--'} BOB
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              💵 Estas tasas corresponden al <strong>mercado paralelo</strong> (dólar blue) en Bolivia y se actualizan cada 15 minutos.
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📊 ¿Por qué cambia el precio del dólar?
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                El precio del dólar en Bolivia varía constantemente debido a varios factores:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Oferta y demanda:</strong> Cuando más personas quieren comprar dólares, el precio sube</li>
                <li><strong>Decisiones del BCB:</strong> El Banco Central de Bolivia puede intervenir en el mercado</li>
                <li><strong>Inflación:</strong> Si el boliviano pierde valor, el dólar se vuelve más caro</li>
                <li><strong>Situación económica:</strong> Eventos políticos y económicos afectan el precio</li>
              </ul>
            </div>
          </section>

          {/* Right Column */}
          <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🏦 Diferencia: Dólar Oficial vs. Dólar Blue
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">Dólar Oficial</h3>
                <p className="text-sm">Fijado por el Banco Central de Bolivia. Usado en transacciones bancarias formales.</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2">Dólar Blue/Paralelo</h3>
                <p className="text-sm">Precio real del mercado informal. Refleja la oferta y demanda real de dólares en Bolivia.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Tools Section */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            🛠️ Herramientas Útiles
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/calculadora" className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-2">🧮</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Calculadora</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convierte USD a BOB al instante</p>
            </Link>
            <Link to="/" className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-2">📈</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Gráficos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ver histórico del dólar</p>
            </Link>
            <Link to="/noticias" className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-2">📰</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Noticias</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Últimas noticias económicas</p>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ❓ Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ¿Cuánto está el dólar en Bolivia hoy en tiempo real?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                El dólar blue en Bolivia hoy está a <strong>{currentRate?.buy_bob_per_usd || '--'} BOB (compra)</strong> y <strong>{currentRate?.sell_bob_per_usd || '--'} BOB (venta)</strong>. Nuestra plataforma actualiza estos precios cada 15 minutos automáticamente.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ¿Dónde puedo ver el precio del dólar en Bolivia actualizado?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                En BoliviaBlue.com mostramos el precio del dólar actualizado cada 15 minutos, utilizando datos en tiempo real de Binance P2P. Es la información más precisa y rápida disponible.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                ¿El precio del dólar es el mismo en todo Bolivia?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                El precio del dólar puede variar ligeramente entre ciudades (La Paz, Santa Cruz, Cochabamba), pero las diferencias son mínimas. Nuestro precio refleja el promedio nacional del mercado paralelo.
              </p>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Última actualización: {new Date().toLocaleString('es-BO', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/La_Paz'
              })}
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CuantoEstaDolarBoliviaHoy;

