import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRate } from '../contexts/RateContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import CurrencyRateSnapshot, { CurrencyConversionList } from '../components/CurrencyRateSnapshot';
import { Link } from 'react-router-dom';
import { fetchBlueHistory } from '../utils/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import { formatRate, formatCopThousand } from '../utils/formatters';

function PesoToBoliviano() {
  useAdsenseReady();

  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const { rateData: currentRate, isLoading: isRateLoading, error: rateCtxError } = useRate();
  const rateError = rateCtxError;
  const [convertCop, setConvertCop] = useState('10000');
  const [weekHistory, setWeekHistory] = useState(null);

  const observedIso = currentRate?.cop_updated_at_iso || currentRate?.updated_at_iso || null;
  const lastUpdated = observedIso && !Number.isNaN(Date.parse(observedIso)) ? new Date(observedIso) : null;

  useEffect(() => {
    let cancelled = false;
    fetchBlueHistory('1W', 'COP')
      .then((hist) => {
        if (cancelled || !hist?.points?.length) return;
        const vals = hist.points.map((p) => Number(p.buy)).filter((n) => Number.isFinite(n) && n > 0);
        if (vals.length < 2) return;
        setWeekHistory({
          min: Math.min(...vals),
          max: Math.max(...vals),
          first: vals[0],
          last: vals[vals.length - 1],
          n: vals.length,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const buy = currentRate?.buy_bob_per_cop;
  const sell = currentRate?.sell_bob_per_cop;
  const buyStr = Number.isFinite(buy) ? formatRate(buy, 'COP') : null;
  const sellStr = Number.isFinite(sell) ? formatRate(sell, 'COP') : null;
  const thousandBuy = Number.isFinite(buy) ? formatCopThousand(buy) : null;

  const liveSeo = buildLiveRateSeoMeta({
    buy: Number.isFinite(buy) ? buy * 1000 : null,
    sell: Number.isFinite(sell) ? sell * 1000 : null,
    updatedAt: currentRate?.cop_updated_at_iso || currentRate?.updated_at_iso || null,
    language,
    page: 'peso',
  });

  const derivation = currentRate?.cop_derivation || 'p2p-usdt';
  const derivationEs =
    derivation === 'spot-usdtcop'
      ? 'Se deriva como USDT/BOB (P2P) ÷ USDTCOP (mercado spot). No hay un libro COP/BOB de ventanilla en Bolivia.'
      : derivation === 'p2p-usdt-last-valid' || derivation === 'usdt-cross-last-valid'
        ? 'Se muestra la última lectura COP válida (vía USDT). El horario es el de esa lectura, no el de ahora.'
        : 'Se deriva como USDT/BOB (P2P) ÷ USDT/COP (P2P). No es una cotización de pesos en efectivo observada en Bolivia.';
  const derivationEn =
    derivation === 'spot-usdtcop'
      ? 'Derived as USDT/BOB (P2P) ÷ USDTCOP (spot). There is no COP/BOB cash-desk book in Bolivia.'
      : derivation === 'p2p-usdt-last-valid' || derivation === 'usdt-cross-last-valid'
        ? 'Last valid COP reading (via USDT). The timestamp is that observation, not “now”.'
        : 'Derived as USDT/BOB (P2P) ÷ USDT/COP (P2P). Not a directly observed cash peso quote.';

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
    "datePublished": "2026-09-14",
    "dateModified": (currentRate?.cop_updated_at_iso || currentRate?.updated_at_iso || '').slice(0, 10) || undefined
  };

  const pesoFaqAnswers = thousandBuy
    ? (language === 'es' ? [
      {
        "@type": "Question",
        "name": "¿Cuánto es 1000 pesos colombianos a bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1.000 COP equivalen a aproximadamente ${thousandBuy} BOB según nuestra referencia paralela (derivada vía USDT). Un peso vale unos ${buyStr} BOB. No es el tipo oficial ni una cotización de ventanilla.`
        }
      },
      {
        "@type": "Question",
        "name": "¿El peso colombiano blue se observa en efectivo en Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Calculamos COP/BOB cruzando USDT/BOB y USDT/COP (o el spot USDTCOP si el P2P de pesos no tiene liquidez). Es una referencia, no un precio de casa de cambio. Nunca usamos un tipo fijo inventado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es 10.000 COP a bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Con la compra de referencia (${buyStr} BOB por COP), 10.000 pesos colombianos equivalen a aproximadamente ${(Number(buy) * 10000).toFixed(2)} BOB.`
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How much is 1,000 Colombian pesos to bolivianos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `1,000 COP is about ${thousandBuy} BOB on our parallel reference (derived via USDT). One peso is about ${buyStr} BOB. Not the official rate and not a cash-desk quote.`
        }
      },
      {
        "@type": "Question",
        "name": "Is the Colombian peso blue observed in cash in Bolivia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. We cross USDT/BOB with USDT/COP (or USDTCOP spot if peso P2P is thin). It is a reference, not an exchange-house price. We never use an invented fixed multiplier."
        }
      }
    ])
    : [];

  const faqSchema = pesoFaqAnswers.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": pesoFaqAnswers }
    : null;

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={liveSeo.title}
        description={liveSeo.description}
        keywords={language === 'es'
          ? "peso colombiano a boliviano, cop a bob, peso a boliviano, cuanto es 1000 pesos colombianos en bolivia, tipo de cambio colombia bolivia, cop bob paralelo, binance p2p cop"
          : "colombian peso to boliviano, cop to bob, 1000 cop in bolivia, colombia bolivia exchange rate, parallel cop bob, binance p2p cop"}
        canonical="/peso-a-boliviano"
        structuredData={[articleSchema, faqSchema].filter(Boolean)}
      />

      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 space-y-2 sm:space-y-6 md:space-y-8">
        <Breadcrumbs
          items={language === 'es'
            ? [
                { label: 'Inicio', path: '/' },
                { label: 'Peso a Boliviano', path: '/peso-a-boliviano' }
              ]
            : [
                { label: 'Home', path: '/' },
                { label: 'Peso to Boliviano', path: '/peso-a-boliviano' }
              ]}
        />

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center">
          {language === 'es'
            ? 'Peso colombiano a boliviano – COP a BOB (paralelo)'
            : 'Colombian peso to boliviano – COP to BOB (parallel)'}
        </h1>
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 min-h-[1.75rem]">
          {lastUpdated
            ? (language === 'es'
              ? <>Lectura: <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString('es-BO', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' })}</time> (hora de Bolivia)</>
              : <>Reading: <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString('en-US', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' })}</time> (Bolivia time)</>)
            : '\u00a0'}
        </p>
        {currentRate?.is_stale && (
          <p className="text-center text-sm text-amber-700 dark:text-amber-300 mb-2">
            {language === 'es'
              ? 'Mostramos la última lectura válida; la fuente no respondió ahora.'
              : 'Showing the last valid reading; the upstream source did not respond just now.'}
          </p>
        )}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-3">
          {language === 'es' ? derivationEs : derivationEn}{' '}
          <Link to="/fuente-de-datos" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {language === 'es' ? 'Metodología' : 'Methodology'}
          </Link>
        </p>
        <div className="max-w-md mx-auto mb-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-gray-800/90 p-3">
          <label htmlFor="cop-quick" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            {language === 'es' ? 'Convertir COP → BOB (compra de referencia)' : 'Convert COP → BOB (reference buy)'}
          </label>
          <div className="flex gap-2">
            <input
              id="cop-quick"
              type="number"
              min="0"
              inputMode="decimal"
              value={convertCop}
              onChange={(e) => setConvertCop(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base tabular-nums min-h-[44px]"
            />
            <div className="flex items-center px-3 rounded-lg bg-purple-50 dark:bg-purple-950 text-sm font-mono font-semibold tabular-nums min-h-[44px] min-w-[7.5rem] justify-end">
              {Number.isFinite(Number(convertCop)) && Number.isFinite(buy)
                ? `${(Number(convertCop) * buy).toFixed(2)} Bs`
                : '—'}
            </div>
          </div>
        </div>
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
          accent="purple"
          title={language === 'es'
            ? 'Tipo de cambio actual: peso colombiano a boliviano'
            : 'Current exchange rate: Colombian peso to boliviano'}
          cards={[
            {
              topLabel: '1 COP =',
              valueDisplay: buyStr,
              bottomLabel: language === 'es' ? 'Compra' : 'Buy',
              tone: 'buy',
            },
            {
              topLabel: '1 COP =',
              valueDisplay: sellStr,
              bottomLabel: language === 'es' ? 'Venta' : 'Sell',
              tone: 'sell',
            },
            {
              topLabel: '1.000 COP =',
              valueDisplay: thousandBuy,
              bottomLabel: language === 'es' ? 'Escala legible' : 'Readable scale',
              tone: 'tertiary',
            },
          ]}
          isLoading={isRateLoading}
          errorMessage={rateError
            ? (language === 'es' ? 'No se pudo cargar la cotización. Reintentando…' : 'Could not load the quote. Retrying…')
            : null}
          footnote={language === 'es'
            ? `1.000 COP ≈ ${thousandBuy || '—'} Bs. P2P, no el banco.`
            : `1,000 COP ≈ ${thousandBuy || '—'} Bs. P2P, not the bank.`}
        />

        <section className="min-h-[12rem] sm:min-h-[11rem]">
          <BinanceBanner />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es'
                  ? 'COP a BOB en Bolivia: peso colombiano vía USDT'
                  : 'COP to BOB in Bolivia: Colombian peso via USDT'}
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>El <strong>peso colombiano a boliviano</strong> no se cotiza en ventanilla como el dólar. Lo que publicamos es un cruce en vivo: BOB por USDT en P2P dividido por COP por USDT (libro P2P de Binance o, si no hay ofertas, el spot <strong>USDTCOP</strong>). Un peso vale unos {buyStr || '—'} bolivianos; por eso también mostramos <strong>1.000 COP ≈ {thousandBuy || '—'} Bs</strong>. Nunca usamos un tipo fijo tipo “4.000 COP por dólar”.</>
                  : <>The <strong>Colombian peso to boliviano</strong> is not quoted at cash desks the way the dollar is. We publish a live cross: BOB per USDT on P2P divided by COP per USDT (Binance P2P book or, if that book is empty, <strong>USDTCOP</strong> spot). One peso is about {buyStr || '—'} bolivianos, so we also show <strong>1,000 COP ≈ {thousandBuy || '—'} Bs</strong>. We never invent a fixed “4,000 COP per dollar” multiplier.</>}
              </p>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? <>Sirve si viajas de Colombia a Bolivia, recibes remesas en COP o comparas con el <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">dólar blue</Link>. Para convertir otra cantidad usa la <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculadora</Link> (moneda COP). El tipo oficial del BCB es USD/BOB; si lo cruzamos a pesos, no es una cotización BCB de COP.</>
                  : <>Useful if you travel from Colombia to Bolivia, receive COP remittances, or compare with the <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">blue dollar</Link>. Convert another amount in the <Link to="/calculadora" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">calculator</Link> (COP). The BCB official rate is USD/BOB; a COP cross of that official is not a BCB COP quote.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? 'Conversiones comunes: peso colombiano a boliviano'
                  : 'Common conversions: Colombian peso to boliviano'}
              </h3>
              <CurrencyConversionList
                fromCode="COP"
                rate={buy}
                amounts={[1000, 10000, 50000, 100000, 500000, 1000000]}
                isLoading={isRateLoading}
              />
              {weekHistory && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {language === 'es'
                    ? `En la última semana (lecturas COP disponibles): mínimo Bs ${weekHistory.min.toFixed(4)}, máximo Bs ${weekHistory.max.toFixed(4)} por peso (1.000 COP ≈ ${(weekHistory.min * 1000).toFixed(2)}–${(weekHistory.max * 1000).toFixed(2)} Bs).`
                    : `Over the last week (available COP readings): low Bs ${weekHistory.min.toFixed(4)}, high Bs ${weekHistory.max.toFixed(4)} per peso (1,000 COP ≈ ${(weekHistory.min * 1000).toFixed(2)}–${(weekHistory.max * 1000).toFixed(2)} Bs).`}
                </p>
              )}

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? '¿Cómo se calcula COP/BOB?'
                  : 'How is COP/BOB calculated?'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? <>Tomamos la mediana P2P de <strong>USDT/BOB</strong> (la misma del dólar blue) y la dividimos por COP por USDT. Si Binance P2P no tiene libro COP líquido, usamos el ticker spot <strong>USDTCOP</strong>. El resultado es Bs por 1 peso colombiano. No hay un mercado de efectivo COP/BOB comparable al del dólar en Santa Cruz o La Paz.</>
                  : <>We take the P2P median of <strong>USDT/BOB</strong> (the same as the blue dollar) and divide by COP per USDT. If Binance P2P has no liquid COP book, we use the <strong>USDTCOP</strong> spot ticker. The result is Bs per 1 Colombian peso. There is no COP/BOB cash market comparable to the dollar in Santa Cruz or La Paz.</>}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es'
                  ? 'COP, dólar blue y tipo oficial'
                  : 'COP, the blue dollar, and the official rate'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es'
                  ? <>El Banco Central cotiza USD/BOB, no COP/BOB. El paralelo en Bolivia se mueve con el <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">dólar blue</Link>. El peso sigue a esa misma escasez de dólares vía USDT. Para euros o reales ver <Link to="/euro-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">euro a boliviano</Link> y <Link to="/real-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">real a boliviano</Link>.</>
                  : <>The Central Bank quotes USD/BOB, not COP/BOB. Bolivia’s parallel market moves with the <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">blue dollar</Link>. The peso tracks that same dollar shortage via USDT. For euros or reais see <Link to="/euro-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">euro to boliviano</Link> and <Link to="/real-a-boliviano" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">real to boliviano</Link>.</>}
              </p>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '💡 Calculadora de divisas' : '💡 Currency calculator'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? <>¿Otra cantidad? <Link to="/calculadora" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">Usa la calculadora</Link> con moneda COP. También puedes ver <Link to="/euro-a-boliviano" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">euro a boliviano</Link> o <Link to="/cuanto-esta-dolar-bolivia" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">dólar a boliviano</Link>.</>
                    : <>Need another amount? <Link to="/calculadora" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">Use the calculator</Link> with COP selected. You can also see <Link to="/euro-a-boliviano" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">euro to boliviano</Link> or <Link to="/cuanto-esta-dolar-bolivia" className="text-purple-700 dark:text-purple-300 hover:underline font-medium">dollar to boliviano</Link>.</>}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Páginas relacionadas' : 'Related pages'}
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
                {language === 'es' ? 'Convierte COP a BOB' : 'Convert COP to BOB'}
              </div>
            </Link>
            <Link
              to="/euro-a-boliviano"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Euro a boliviano' : 'Euro to boliviano'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tipo EUR/BOB' : 'EUR/BOB rate'}
              </div>
            </Link>
            <Link
              to="/real-a-boliviano"
              className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Real a boliviano' : 'Real to boliviano'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tipo BRL/BOB' : 'BRL/BOB rate'}
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
                {language === 'es' ? 'Tipo USD/BOB' : 'USD/BOB rate'}
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

export default PesoToBoliviano;
