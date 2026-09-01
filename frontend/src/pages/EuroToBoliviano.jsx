import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import CurrencyRateSnapshot, { CurrencyConversionList } from '../components/CurrencyRateSnapshot';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';

function EuroToBoliviano() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');

  const language = languageContext?.language || 'es';
  const [currentRate, setCurrentRate] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate('EUR');
        setCurrentRate(data);
        setRateError(null);
        setLastUpdated(new Date(data?.updated_at_iso || Date.now()));
      } catch (err) {
        console.error('Error loading EUR rate:', err);
        setRateError(err?.message || 'rate_error');
      } finally {
        setIsRateLoading(false);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const buy = currentRate?.buy_bob_per_eur;
  const sell = currentRate?.sell_bob_per_eur;
  const buyStr = Number.isFinite(buy) ? buy.toFixed(2) : null;
  const sellStr = Number.isFinite(sell) ? sell.toFixed(2) : null;
  const hundredStr = Number.isFinite(buy) ? (buy * 100).toFixed(2) : null;

  const liveSeo = buildLiveRateSeoMeta({
    buy,
    sell,
    updatedAt: currentRate?.updated_at_iso || null,
    language,
    page: 'euro',
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": liveSeo.title,
    "description": liveSeo.description,
    "author": {
      "@type": "Organization",
      "name": "Bolivia Blue"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bolivia Blue",
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
        "name": "¿Cuánto es 1 Euro a Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1 Euro equivale actualmente a aproximadamente ${currentRate?.buy_bob_per_eur?.toFixed(2) || '11.50'} BOB según el tipo de cambio del mercado paralelo en Bolivia. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo convertir Euros a Bolivianos en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Para convertir Euros a Bolivianos en Bolivia, puedes usar Binance P2P. Ve a la sección P2P, selecciona el par USDT/EUR y USDT/BOB, o usa nuestra calculadora gratuita para ver el tipo de cambio actual. También puedes cambiar euros en casas de cambio o bancos, pero el tipo de cambio puede ser menos favorable."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 100 Euros a Bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Con el tipo de cambio actual (${currentRate?.buy_bob_per_eur?.toFixed(2) || '11.50'} BOB por EUR), 100 Euros equivalen a aproximadamente ${((currentRate?.buy_bob_per_eur || 11.50) * 100).toFixed(2)} BOB. Esta cotización refleja el mercado paralelo y se actualiza cada 15 minutos.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cambiar Euros a Bolivianos en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes cambiar Euros a Bolivianos en Bolivia a través de Binance P2P (la opción más popular), casas de cambio autorizadas, bancos, o plataformas P2P como Airtm. El tipo de cambio varía según el método que elijas, siendo generalmente más favorable en el mercado paralelo."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How much is 1 Euro to Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1 Euro is currently worth approximately ${currentRate?.buy_bob_per_eur?.toFixed(2) || '11.50'} BOB according to the parallel market exchange rate in Bolivia. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "How to convert Euros to Bolivianos in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To convert Euros to Bolivianos in Bolivia, you can use Binance P2P. Go to the P2P section, select the USDT/EUR and USDT/BOB pairs, or use our free calculator to see the current exchange rate. You can also exchange euros at exchange houses or banks, but the exchange rate may be less favorable."
        }
      },
      {
        "@type": "Question",
        "name": "How much is 100 Euros to Bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `With the current exchange rate (${currentRate?.buy_bob_per_eur?.toFixed(2) || '11.50'} BOB per EUR), 100 Euros equal approximately ${((currentRate?.buy_bob_per_eur || 11.50) * 100).toFixed(2)} BOB. This quote reflects the parallel market and is updated every 15 minutes.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es'
          ? "euro blue bolivia, euro a boliviano blue, precio del euro mercado negro bolivia, euro paralelo bolivia, eur a bob, convertir euro a boliviano, cotización euro boliviano, binance p2p euro"
          : "euro blue bolivia, parallel euro bolivia, euro black market bolivia, eur to bob, convert euro to boliviano, euro boliviano exchange rate, binance p2p euro"}
        canonical="/euro-a-boliviano"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Euro a Boliviano', path: '/euro-a-boliviano' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Euro to Boliviano', path: '/euro-a-boliviano' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es'
            ? 'Euro Blue Bolivia – EUR a BOB (Mercado Paralelo)'
            : 'Euro Blue Bolivia – EUR to BOB (Parallel Market)'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6 min-h-[1.75rem]">
          {lastUpdated
            ? (language === 'es'
              ? `Última actualización: ${lastUpdated.toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' })}`
              : `Last updated: ${lastUpdated.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`)
            : '\u00a0'}
        </p>
        <p className="text-center mb-4 sm:mb-6">
          <Link
            to="/dolar-blue-hoy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-500/20 dark:text-sky-300 dark:hover:bg-sky-500/20 transition-colors"
          >
            {language === 'es' ? 'Ver cotización del dólar blue hoy →' : 'See today’s blue dollar rate →'}
          </Link>
        </p>

        <CurrencyRateSnapshot
          language={language}
          accent="blue"
          title={language === 'es'
            ? 'Tipo de Cambio Actual: Euro a Boliviano'
            : 'Current Exchange Rate: Euro to Boliviano'}
          cards={[
            {
              topLabel: '1 EUR =',
              valueDisplay: buyStr,
              bottomLabel: language === 'es' ? 'Compra' : 'Buy',
              tone: 'buy',
            },
            {
              topLabel: '1 EUR =',
              valueDisplay: sellStr,
              bottomLabel: language === 'es' ? 'Venta' : 'Sell',
              tone: 'sell',
            },
            {
              topLabel: '100 EUR =',
              valueDisplay: hundredStr,
              bottomLabel: language === 'es' ? 'Aproximadamente' : 'Approximately',
              tone: 'tertiary',
            },
          ]}
          isLoading={isRateLoading}
          errorMessage={rateError
            ? (language === 'es' ? 'No se pudo cargar la cotización. Reintentando…' : 'Could not load the quote. Retrying…')
            : null}
          footnote={language === 'es'
            ? 'Tipo de cambio actualizado cada 15 minutos con datos en tiempo real de Binance P2P'
            : 'Exchange rate updated every 15 minutes with real-time data from Binance P2P'}
        />

        {/* Binance Banner */}
        <section className="min-h-[12rem] sm:min-h-[11rem]">
          <BinanceBanner />
        </section>

        {/* Main Content */}
        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es'
                  ? 'Euro blue / mercado negro: EUR a BOB en Bolivia'
                  : 'Euro blue / parallel market: EUR to BOB in Bolivia'}
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>euro blue</strong> (también llamado euro paralelo o precio del euro en el <strong>mercado negro</strong> de Bolivia) es la cotización EUR/BOB que realmente usan casas de cambio informales y plataformas P2P. No es el tipo oficial del Banco Central: suele estar más cerca del <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">dólar blue</Link> y de lo que ves en <Link to="/binance-p2p-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Binance P2P</Link>.</>
                  : <>The <strong>euro blue</strong> (parallel euro / informal-market EUR price in Bolivia) is the EUR/BOB quote people actually trade on P2P and informal desks. It is not the Central Bank official rate: it tracks closer to the <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">blue dollar</Link> and what you see on <Link to="/binance-p2p-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Binance P2P</Link>.</>}
              </p>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? <>Aquí mostramos el <strong>euro a boliviano blue</strong> actualizado cada 15 minutos (vía USDT en Binance P2P): útil si buscas “precio del euro mercado negro Bolivia”, “euro paralelo” o simplemente convertir EUR a BOB al valor de mercado. Para el dólar, usa también <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">dólar blue hoy</Link> y la <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculadora</Link>.</>
                  : <>We show the live <strong>euro-to-boliviano blue</strong> rate every 15 minutes (via USDT on Binance P2P)—useful for parallel/black-market EUR queries or converting EUR to BOB at the market price. For USD, see <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">blue dollar today</Link> and the <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculator</Link>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? 'Conversiones Comunes: Euro a Boliviano'
                  : 'Common Conversions: Euro to Boliviano'}
              </h3>
              <CurrencyConversionList
                fromCode="EUR"
                rate={buy}
                isLoading={isRateLoading}
              />

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cambiar Euros a Bolivianos en Bolivia?'
                  : 'Where to Exchange Euros to Bolivianos in Bolivia?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Binance P2P</strong> - La plataforma más popular para cambiar Euros a Bolivianos usando USDT como intermediario</li>
                    <li><strong>Casas de Cambio</strong> - Oficinas autorizadas que cambian divisas, aunque el tipo de cambio puede ser menos favorable</li>
                    <li><strong>Bancos</strong> - Ofrecen el tipo de cambio oficial, generalmente menos favorable que el mercado paralelo</li>
                    <li><strong>Otras plataformas P2P</strong> - Como Airtm, Wallbit, pero Binance es la más utilizada y segura</li>
                  </>
                ) : (
                  <>
                    <li><strong>Binance P2P</strong> - The most popular platform to exchange Euros to Bolivianos using USDT as intermediary</li>
                    <li><strong>Exchange Houses</strong> - Authorized offices that exchange currencies, though the exchange rate may be less favorable</li>
                    <li><strong>Banks</strong> - Offer the official exchange rate, generally less favorable than the parallel market</li>
                    <li><strong>Other P2P platforms</strong> - Like Airtm, Wallbit, but Binance is the most used and safe</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Cómo Funciona el Tipo de Cambio Euro a Boliviano?'
                  : 'How Does the Euro to Boliviano Exchange Rate Work?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El tipo de cambio <strong>Euro a Boliviano</strong> que mostramos se calcula usando datos de Binance P2P. Primero obtenemos el tipo de cambio de USDT/EUR y USDT/BOB, y luego calculamos cuántos Bolivianos equivalen a 1 Euro. Este método refleja el <strong>mercado paralelo</strong> en Bolivia, que generalmente ofrece un tipo de cambio más favorable que el tipo de cambio oficial del Banco Central de Bolivia (BCB).</>
                  : <>The <strong>Euro to Boliviano</strong> exchange rate we show is calculated using Binance P2P data. First we get the USDT/EUR and USDT/BOB exchange rates, and then we calculate how many Bolivianos equal 1 Euro. This method reflects the <strong>parallel market</strong> in Bolivia, which generally offers a more favorable exchange rate than the official exchange rate from the Central Bank of Bolivia (BCB).</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Tipo de Cambio Euro a Boliviano'
                  : 'Factors Affecting the Euro to Boliviano Exchange Rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El tipo de cambio Euro a Boliviano está influenciado por varios factores:'
                  : 'The Euro to Boliviano exchange rate is influenced by several factors:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Tipo de cambio USD/EUR:</strong> Como calculamos EUR/BOB a través de USDT, el tipo de cambio USD/EUR afecta el resultado</li>
                    <li><strong>Dólar blue en Bolivia:</strong> El tipo de cambio del dólar blue es fundamental para calcular EUR/BOB</li>
                    <li><strong>Políticas del Banco Central Europeo:</strong> Decisiones del BCE pueden afectar el valor del Euro</li>
                    <li><strong>Condiciones económicas en Europa:</strong> La salud económica de la zona euro influye en el valor del Euro</li>
                    <li><strong>Demanda de Euros en Bolivia:</strong> La demanda local de Euros puede afectar el tipo de cambio</li>
                    <li><strong>Turismo y remesas:</strong> Flujos de turistas europeos y remesas desde Europa</li>
                  </>
                ) : (
                  <>
                    <li><strong>USD/EUR exchange rate:</strong> Since we calculate EUR/BOB through USDT, the USD/EUR exchange rate affects the result</li>
                    <li><strong>Blue dollar in Bolivia:</strong> The blue dollar exchange rate is fundamental for calculating EUR/BOB</li>
                    <li><strong>European Central Bank policies:</strong> ECB decisions can affect the Euro's value</li>
                    <li><strong>Economic conditions in Europe:</strong> The health of the eurozone economy influences the Euro's value</li>
                    <li><strong>Demand for Euros in Bolivia:</strong> Local demand for Euros can affect the exchange rate</li>
                    <li><strong>Tourism and remittances:</strong> Flows of European tourists and remittances from Europe</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Cambiar Euros a Bolivianos'
                  : 'Tips for Exchanging Euros to Bolivianos'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Si necesitas cambiar Euros a Bolivianos en Bolivia, considera estos consejos:'
                  : 'If you need to exchange Euros to Bolivianos in Bolivia, consider these tips:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Consulta la cotización actual:</strong> Usa nuestra plataforma para verificar el tipo de cambio antes de cambiar</li>
                    <li><strong>Compara opciones:</strong> Diferentes métodos (Binance P2P, casas de cambio, bancos) pueden ofrecer diferentes tasas</li>
                    <li><strong>Considera el método:</strong> Binance P2P generalmente ofrece mejores tasas que bancos o casas de cambio oficiales</li>
                    <li><strong>Verifica comisiones:</strong> Algunos lugares cobran comisiones que pueden afectar el tipo de cambio efectivo</li>
                    <li><strong>Usa nuestra calculadora:</strong> Calcula cuántos bolivianos recibirás antes de cambiar</li>
                    <li><strong>Ten cuidado con estafas:</strong> Siempre usa plataformas verificadas y verifica la autenticidad de los billetes</li>
                    <li><strong>Considera el momento:</strong> El tipo de cambio puede variar durante el día, especialmente en días de alta volatilidad</li>
                  </>
                ) : (
                  <>
                    <li><strong>Check current quote:</strong> Use our platform to verify the exchange rate before exchanging</li>
                    <li><strong>Compare options:</strong> Different methods (Binance P2P, exchange houses, banks) may offer different rates</li>
                    <li><strong>Consider the method:</strong> Binance P2P generally offers better rates than banks or official exchange houses</li>
                    <li><strong>Verify fees:</strong> Some places charge fees that can affect the effective exchange rate</li>
                    <li><strong>Use our calculator:</strong> Calculate how many bolivianos you will receive before exchanging</li>
                    <li><strong>Be careful with scams:</strong> Always use verified platforms and verify the authenticity of bills</li>
                    <li><strong>Consider timing:</strong> The exchange rate can vary during the day, especially on high volatility days</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Historia del Tipo de Cambio Euro en Bolivia'
                  : 'History of the Euro Exchange Rate in Bolivia'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El Euro ha sido históricamente una moneda importante en Bolivia, especialmente debido a los vínculos comerciales y turísticos con países europeos. El tipo de cambio Euro a Boliviano ha fluctuado a lo largo de los años, influenciado tanto por factores europeos como bolivianos. En los últimos años, plataformas digitales como Binance P2P han facilitado el intercambio de Euros, haciendo el proceso más transparente y accesible para los bolivianos.'
                  : 'The Euro has historically been an important currency in Bolivia, especially due to commercial and tourist links with European countries. The Euro to Boliviano exchange rate has fluctuated over the years, influenced by both European and Bolivian factors. In recent years, digital platforms like Binance P2P have facilitated Euro exchange, making the process more transparent and accessible for Bolivians.'}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de Divisas' : '💡 Currency Calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>¿Necesitas convertir otra cantidad? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir cualquier cantidad de Euros a Bolivianos o viceversa usando el tipo de cambio actual. También puedes cambiar la moneda en la calculadora para ver otras conversiones como <Link to="/real-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Real Brasileño a Boliviano</Link> o <Link to="/cuanto-esta-dolar-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Dólar a Boliviano</Link>.</>
                    : <>Need to convert another amount? <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Use our calculator</Link> to convert any amount of Euros to Bolivianos or vice versa using the current exchange rate. You can also change the currency in the calculator to see other conversions like <Link to="/real-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Brazilian Real to Boliviano</Link> or <Link to="/cuanto-esta-dolar-bolivia" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Dollar to Boliviano</Link>.</>}
                </p>
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
              to="/calculadora"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Calculadora' : 'Calculator'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Convierte EUR a BOB' : 'Convert EUR to BOB'}
              </div>
            </Link>
            <Link
              to="/real-a-boliviano"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Real a Boliviano' : 'Real to Boliviano'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tipo de cambio BRL/BOB' : 'BRL/BOB exchange rate'}
              </div>
            </Link>
            <Link
              to="/cuanto-esta-dolar-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Dólar en Bolivia' : 'Dollar in Bolivia'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tipo de cambio USD/BOB' : 'USD/BOB exchange rate'}
              </div>
            </Link>
            <Link
              to="/binance-p2p-bolivia"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Binance P2P
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cómo operar el paralelo' : 'How to trade the parallel rate'}
              </div>
            </Link>
            <Link
              to="/dolar-blue-hoy"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cotización USD paralelo' : 'USD parallel quote'}
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default EuroToBoliviano;

