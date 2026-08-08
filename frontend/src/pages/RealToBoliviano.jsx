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

function RealToBoliviano() {
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
        const data = await fetchBlueRate('BRL');
        setCurrentRate(data);
        setRateError(null);
        setLastUpdated(new Date(data?.updated_at_iso || Date.now()));
      } catch (err) {
        console.error('Error loading BRL rate:', err);
        setRateError(err?.message || 'rate_error');
      } finally {
        setIsRateLoading(false);
      }
    };
    loadRate();
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const buy = currentRate?.buy_bob_per_brl;
  const sell = currentRate?.sell_bob_per_brl;
  const buyStr = Number.isFinite(buy) ? buy.toFixed(2) : null;
  const sellStr = Number.isFinite(sell) ? sell.toFixed(2) : null;
  const hundredStr = Number.isFinite(buy) ? (buy * 100).toFixed(2) : null;

  const liveSeo = buildLiveRateSeoMeta({
    buy,
    sell,
    updatedAt: currentRate?.updated_at_iso || null,
    language,
    page: 'real',
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": liveSeo.title,
    "description": liveSeo.description,
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
        "name": "¿Cuánto es 1 Real Brasileño a Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1 Real Brasileño (BRL) equivale actualmente a aproximadamente ${currentRate?.buy_bob_per_brl?.toFixed(2) || '2.10'} BOB según el tipo de cambio del mercado paralelo en Bolivia. Esta cotización se actualiza cada 15 minutos con datos en tiempo real de Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo convertir Reales Brasileños a Bolivianos en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Para convertir Reales Brasileños a Bolivianos en Bolivia, puedes usar Binance P2P. Ve a la sección P2P, selecciona el par USDT/BRL y USDT/BOB, o usa nuestra calculadora gratuita para ver el tipo de cambio actual. También puedes cambiar reales en casas de cambio o bancos, pero el tipo de cambio puede ser menos favorable."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 100 Reales Brasileños a Bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Con el tipo de cambio actual (${currentRate?.buy_bob_per_brl?.toFixed(2) || '2.10'} BOB por BRL), 100 Reales Brasileños equivalen a aproximadamente ${((currentRate?.buy_bob_per_brl || 2.10) * 100).toFixed(2)} BOB. Esta cotización refleja el mercado paralelo y se actualiza cada 15 minutos.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde cambiar Reales Brasileños a Bolivianos en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes cambiar Reales Brasileños a Bolivianos en Bolivia a través de Binance P2P (la opción más popular), casas de cambio autorizadas, bancos, o plataformas P2P como Airtm. El tipo de cambio varía según el método que elijas, siendo generalmente más favorable en el mercado paralelo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Por qué es importante el tipo de cambio Real a Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tipo de cambio Real Brasileño a Boliviano es importante para personas que viajan entre Brasil y Bolivia, reciben remesas desde Brasil, hacen negocios entre ambos países, o necesitan cambiar divisas. Bolivia comparte frontera con Brasil, por lo que hay un flujo constante de personas y comercio que requiere conversión de divisas."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How much is 1 Brazilian Real to Boliviano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1 Brazilian Real (BRL) is currently worth approximately ${currentRate?.buy_bob_per_brl?.toFixed(2) || '2.10'} BOB according to the parallel market exchange rate in Bolivia. This quote is updated every 15 minutes with real-time data from Binance P2P.`
        }
      },
      {
        "@type": "Question",
        "name": "How to convert Brazilian Reais to Bolivianos in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To convert Brazilian Reais to Bolivianos in Bolivia, you can use Binance P2P. Go to the P2P section, select the USDT/BRL and USDT/BOB pairs, or use our free calculator to see the current exchange rate. You can also exchange reais at exchange houses or banks, but the exchange rate may be less favorable."
        }
      },
      {
        "@type": "Question",
        "name": "How much is 100 Brazilian Reais to Bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `With the current exchange rate (${currentRate?.buy_bob_per_brl?.toFixed(2) || '2.10'} BOB per BRL), 100 Brazilian Reais equal approximately ${((currentRate?.buy_bob_per_brl || 2.10) * 100).toFixed(2)} BOB. This quote reflects the parallel market and is updated every 15 minutes.`
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
          ? "real blue bolivia, real a boliviano paralelo, brl a bob mercado negro, real brasileño bolivia, convertir real a boliviano, cotización real boliviano, binance p2p real"
          : "real blue bolivia, parallel brl to bob, brazilian real bolivia, convert real to boliviano, brl/bob, binance p2p real"}
        canonical="/real-a-boliviano"
        structuredData={[articleSchema, faqSchema]}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es' 
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Real a Boliviano', path: '/real-a-boliviano' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Real to Boliviano', path: '/real-a-boliviano' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es'
            ? 'Real Blue Bolivia – BRL a BOB (Mercado Paralelo)'
            : 'Real Blue Bolivia – BRL to BOB (Parallel Market)'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-6 min-h-[1.75rem]">
          {lastUpdated
            ? (language === 'es'
              ? `Última actualización: ${lastUpdated.toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' })}`
              : `Last updated: ${lastUpdated.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`)
            : '\u00a0'}
        </p>

        <CurrencyRateSnapshot
          language={language}
          accent="green"
          title={language === 'es'
            ? 'Tipo de Cambio Actual: Real Brasileño a Boliviano'
            : 'Current Exchange Rate: Brazilian Real to Boliviano'}
          cards={[
            {
              topLabel: '1 BRL =',
              valueDisplay: buyStr,
              bottomLabel: language === 'es' ? 'Compra' : 'Buy',
              tone: 'buy',
            },
            {
              topLabel: '1 BRL =',
              valueDisplay: sellStr,
              bottomLabel: language === 'es' ? 'Venta' : 'Sell',
              tone: 'sell',
            },
            {
              topLabel: '100 BRL =',
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
                  ? 'Real blue / mercado paralelo: BRL a BOB en Bolivia'
                  : 'Real blue / parallel market: BRL to BOB in Bolivia'}
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>real blue</strong> (real paralelo o precio del real en el mercado informal) es la cotización BRL/BOB que se negocia fuera del tipo oficial del BCB—sobre todo en frontera y en <Link to="/binance-p2p-bolivia" className="text-green-600 dark:text-green-400 hover:underline font-medium">Binance P2P</Link>. Se mueve con el <Link to="/" className="text-green-600 dark:text-green-400 hover:underline font-medium">dólar blue</Link> y con la demanda fronteriza con Brasil.</>
                  : <>The <strong>real blue</strong> (parallel/informal BRL price) is the BRL/BOB quote traded outside the official BCB rate—especially at the border and on <Link to="/binance-p2p-bolivia" className="text-green-600 dark:text-green-400 hover:underline font-medium">Binance P2P</Link>. It moves with the <Link to="/" className="text-green-600 dark:text-green-400 hover:underline font-medium">blue dollar</Link> and Brazil–Bolivia border demand.</>}
              </p>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? <>Actualizamos el <strong>real a boliviano</strong> cada 15 minutos. Si también sigues el dólar, mira <Link to="/dolar-blue-hoy" className="text-green-600 dark:text-green-400 hover:underline font-medium">dólar blue hoy</Link> o la <Link to="/calculadora" className="text-green-600 dark:text-green-400 hover:underline font-medium">calculadora</Link>.</>
                  : <>We update <strong>real-to-boliviano</strong> every 15 minutes. For USD, see <Link to="/dolar-blue-hoy" className="text-green-600 dark:text-green-400 hover:underline font-medium">blue dollar today</Link> or the <Link to="/calculadora" className="text-green-600 dark:text-green-400 hover:underline font-medium">calculator</Link>.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? 'Conversiones Comunes: Real Brasileño a Boliviano'
                  : 'Common Conversions: Brazilian Real to Boliviano'}
              </h3>
              <CurrencyConversionList
                fromCode="BRL"
                rate={buy}
                isLoading={isRateLoading}
              />

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Dónde Cambiar Reales Brasileños a Bolivianos en Bolivia?'
                  : 'Where to Exchange Brazilian Reais to Bolivianos in Bolivia?'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Binance P2P</strong> - La plataforma más popular para cambiar Reales Brasileños a Bolivianos usando USDT como intermediario</li>
                    <li><strong>Casas de Cambio</strong> - Especialmente en ciudades fronterizas como Cobija, Guayaramerín y Puerto Suárez, donde hay más demanda de cambio BRL/BOB</li>
                    <li><strong>Bancos</strong> - Ofrecen el tipo de cambio oficial, generalmente menos favorable que el mercado paralelo</li>
                    <li><strong>Otras plataformas P2P</strong> - Como Airtm, Wallbit, pero Binance es la más utilizada y segura</li>
                    <li><strong>Cambios en la frontera</strong> - En puntos fronterizos entre Brasil y Bolivia, aunque hay que tener cuidado con la seguridad</li>
                  </>
                ) : (
                  <>
                    <li><strong>Binance P2P</strong> - The most popular platform to exchange Brazilian Reais to Bolivianos using USDT as intermediary</li>
                    <li><strong>Exchange Houses</strong> - Especially in border cities like Cobija, Guayaramerín and Puerto Suárez, where there is more demand for BRL/BOB exchange</li>
                    <li><strong>Banks</strong> - Offer the official exchange rate, generally less favorable than the parallel market</li>
                    <li><strong>Other P2P platforms</strong> - Like Airtm, Wallbit, but Binance is the most used and safe</li>
                    <li><strong>Border exchanges</strong> - At border points between Brazil and Bolivia, though you need to be careful with security</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Por qué es Importante el Tipo de Cambio Real a Boliviano?'
                  : 'Why is the Real to Boliviano Exchange Rate Important?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Bolivia comparte una extensa frontera con Brasil, lo que genera un <strong>flujo constante de personas y comercio</strong> entre ambos países. El tipo de cambio Real Brasileño a Boliviano es esencial para:</>
                  : <>Bolivia shares an extensive border with Brazil, which generates a <strong>constant flow of people and trade</strong> between both countries. The Brazilian Real to Boliviano exchange rate is essential for:</>}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                {language === 'es' ? (
                  <>
                    <li><strong>Viajeros</strong> - Personas que viajan entre Brasil y Bolivia necesitan cambiar divisas</li>
                    <li><strong>Comerciantes</strong> - Empresarios que importan o exportan productos entre ambos países</li>
                    <li><strong>Remesas</strong> - Personas que reciben dinero desde Brasil o envían dinero a Brasil</li>
                    <li><strong>Turismo</strong> - Turistas brasileños que visitan Bolivia o bolivianos que visitan Brasil</li>
                    <li><strong>Inversión</strong> - Inversores que operan en ambos mercados</li>
                  </>
                ) : (
                  <>
                    <li><strong>Travelers</strong> - People traveling between Brazil and Bolivia need to exchange currencies</li>
                    <li><strong>Merchants</strong> - Businesspeople who import or export products between both countries</li>
                    <li><strong>Remittances</strong> - People receiving money from Brazil or sending money to Brazil</li>
                    <li><strong>Tourism</strong> - Brazilian tourists visiting Bolivia or Bolivians visiting Brazil</li>
                    <li><strong>Investment</strong> - Investors operating in both markets</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? '¿Cómo Funciona el Tipo de Cambio Real a Boliviano?'
                  : 'How Does the Real to Boliviano Exchange Rate Work?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El tipo de cambio <strong>Real Brasileño a Boliviano</strong> que mostramos se calcula usando datos de Binance P2P. Primero obtenemos el tipo de cambio de USDT/BRL y USDT/BOB, y luego calculamos cuántos Bolivianos equivalen a 1 Real Brasileño. Este método refleja el <strong>mercado paralelo</strong> en Bolivia, que generalmente ofrece un tipo de cambio más favorable que el tipo de cambio oficial del Banco Central de Bolivia (BCB).</>
                  : <>The <strong>Brazilian Real to Boliviano</strong> exchange rate we show is calculated using Binance P2P data. First we get the USDT/BRL and USDT/BOB exchange rates, and then we calculate how many Bolivianos equal 1 Brazilian Real. This method reflects the <strong>parallel market</strong> in Bolivia, which generally offers a more favorable exchange rate than the official exchange rate from the Central Bank of Bolivia (BCB).</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Factores que Afectan el Tipo de Cambio Real a Boliviano'
                  : 'Factors Affecting the Real to Boliviano Exchange Rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'El tipo de cambio Real Brasileño a Boliviano está influenciado por varios factores:'
                  : 'The Brazilian Real to Boliviano exchange rate is influenced by several factors:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Políticas económicas de Brasil:</strong> Decisiones del Banco Central de Brasil afectan el valor del Real</li>
                    <li><strong>Dólar blue en Bolivia:</strong> Como calculamos BRL/BOB a través de USDT, el dólar blue es fundamental</li>
                    <li><strong>Comercio fronterizo:</strong> El volumen de comercio entre Brasil y Bolivia influye en la demanda</li>
                    <li><strong>Turismo:</strong> Flujos de turistas brasileños a Bolivia y viceversa</li>
                    <li><strong>Remesas:</strong> Personas que envían o reciben dinero entre ambos países</li>
                    <li><strong>Condiciones económicas:</strong> La salud económica de ambos países afecta el tipo de cambio</li>
                    <li><strong>Inflación:</strong> Tasas de inflación en Brasil y Bolivia</li>
                  </>
                ) : (
                  <>
                    <li><strong>Brazil's economic policies:</strong> Central Bank of Brazil decisions affect the Real's value</li>
                    <li><strong>Blue dollar in Bolivia:</strong> Since we calculate BRL/BOB through USDT, the blue dollar is fundamental</li>
                    <li><strong>Border trade:</strong> The volume of trade between Brazil and Bolivia influences demand</li>
                    <li><strong>Tourism:</strong> Flows of Brazilian tourists to Bolivia and vice versa</li>
                    <li><strong>Remittances:</strong> People sending or receiving money between both countries</li>
                    <li><strong>Economic conditions:</strong> The economic health of both countries affects the exchange rate</li>
                    <li><strong>Inflation:</strong> Inflation rates in Brazil and Bolivia</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Consejos para Cambiar Reales Brasileños a Bolivianos'
                  : 'Tips for Exchanging Brazilian Reais to Bolivianos'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Si necesitas cambiar Reales Brasileños a Bolivianos, considera estos consejos:'
                  : 'If you need to exchange Brazilian Reais to Bolivianos, consider these tips:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Consulta la cotización actual:</strong> Usa nuestra plataforma para verificar el tipo de cambio antes de cambiar</li>
                    <li><strong>Considera la ubicación:</strong> En ciudades fronterizas, las tasas pueden ser diferentes</li>
                    <li><strong>Compara opciones:</strong> Binance P2P, casas de cambio, y bancos ofrecen diferentes tasas</li>
                    <li><strong>Verifica comisiones:</strong> Algunos lugares cobran comisiones que afectan el tipo de cambio efectivo</li>
                    <li><strong>Usa nuestra calculadora:</strong> Calcula cuántos bolivianos recibirás antes de cambiar</li>
                    <li><strong>Ten cuidado con estafas:</strong> Especialmente en puntos fronterizos, usa lugares establecidos</li>
                    <li><strong>Considera el volumen:</strong> Si cambias grandes cantidades, puedes negociar mejores tasas</li>
                  </>
                ) : (
                  <>
                    <li><strong>Check current quote:</strong> Use our platform to verify the exchange rate before exchanging</li>
                    <li><strong>Consider location:</strong> In border cities, rates may be different</li>
                    <li><strong>Compare options:</strong> Binance P2P, exchange houses, and banks offer different rates</li>
                    <li><strong>Verify fees:</strong> Some places charge fees that affect the effective exchange rate</li>
                    <li><strong>Use our calculator:</strong> Calculate how many bolivianos you will receive before exchanging</li>
                    <li><strong>Be careful with scams:</strong> Especially at border points, use established places</li>
                    <li><strong>Consider volume:</strong> If you exchange large amounts, you can negotiate better rates</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Importancia del Comercio Fronterizo'
                  : 'Importance of Border Trade'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? 'Bolivia y Brasil comparten una extensa frontera de más de 3,400 kilómetros, lo que genera un comercio fronterizo significativo. Ciudades como Cobija, Guayaramerín, Puerto Suárez, y otras ciudades fronterizas tienen una alta demanda de cambio entre Real Brasileño y Boliviano. Este comercio fronterizo es una de las razones por las que el tipo de cambio Real a Boliviano es importante para muchos bolivianos, especialmente aquellos que viven cerca de la frontera o que tienen negocios relacionados con Brasil.'
                  : 'Bolivia and Brazil share an extensive border of more than 3,400 kilometers, which generates significant border trade. Cities like Cobija, Guayaramerín, Puerto Suárez, and other border cities have high demand for exchange between Brazilian Real and Boliviano. This border trade is one of the reasons why the Real to Boliviano exchange rate is important for many Bolivians, especially those living near the border or who have businesses related to Brazil.'}
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de Divisas' : '💡 Currency Calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>¿Necesitas convertir otra cantidad? <Link to="/calculadora" className="text-green-600 dark:text-green-400 hover:underline font-medium">Usa nuestra calculadora</Link> para convertir cualquier cantidad de Reales Brasileños a Bolivianos o viceversa usando el tipo de cambio actual. También puedes cambiar la moneda en la calculadora para ver otras conversiones como <Link to="/euro-a-boliviano" className="text-green-600 dark:text-green-400 hover:underline font-medium">Euro a Boliviano</Link> o <Link to="/cuanto-esta-dolar-bolivia" className="text-green-600 dark:text-green-400 hover:underline font-medium">Dólar a Boliviano</Link>.</>
                    : <>Need to convert another amount? <Link to="/calculadora" className="text-green-600 dark:text-green-400 hover:underline font-medium">Use our calculator</Link> to convert any amount of Brazilian Reais to Bolivianos or vice versa using the current exchange rate. You can also change the currency in the calculator to see other conversions like <Link to="/euro-a-boliviano" className="text-green-600 dark:text-green-400 hover:underline font-medium">Euro to Boliviano</Link> or <Link to="/cuanto-esta-dolar-bolivia" className="text-green-600 dark:text-green-400 hover:underline font-medium">Dollar to Boliviano</Link>.</>}
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
                {language === 'es' ? 'Convierte BRL a BOB' : 'Convert BRL to BOB'}
              </div>
            </Link>
            <Link
              to="/euro-a-boliviano"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Euro a Boliviano' : 'Euro to Boliviano'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tipo de cambio EUR/BOB' : 'EUR/BOB exchange rate'}
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RealToBoliviano;

