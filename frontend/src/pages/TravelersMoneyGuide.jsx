import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import BlueRateCards from '../components/BlueRateCards';
import { BinanceButton } from '../components/BrandButton';
import { fetchBlueRate, fetchCardRates } from '../utils/api';
import { formatRate } from '../utils/formatters';
import { liveBobParts } from '../utils/seoRateMeta';
import { TRAVEL_GUIDE_EN, TRAVEL_GUIDE_ES } from '../config/travelGuide';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { SITE_URL } from '../config/brand';

const PUBLISHED = '2026-09-14';

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) && x >= 1 ? x : null;
}

function cardBob(row) {
  if (!row) return null;
  return n(row.visa_bob_per_usd) ?? n(row.mastercard_bob_per_usd) ?? n(row.amex_bob_per_usd);
}

export default function TravelersMoneyGuide() {
  useAdsenseReady();
  const language = useLanguage()?.language || 'es';
  const es = language === 'es';
  const { pathname } = useLocation();
  const canonical = pathname.startsWith(TRAVEL_GUIDE_EN) ? TRAVEL_GUIDE_EN : TRAVEL_GUIDE_ES;

  const [rate, setRate] = useState(null);
  const [card, setCard] = useState(null);
  const [usd, setUsd] = useState('500');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBlueRate(), fetchCardRates().catch(() => null)])
      .then(([blue, cards]) => {
        if (cancelled) return;
        setRate(blue);
        setCard(cards);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const live = liveBobParts(rate);
  const sell = n(rate?.sell_bob_per_usd ?? rate?.sell);
  const official = n(rate?.official_buy ?? rate?.officialBuy) ?? n(rate?.official_mid);
  const cardRate = cardBob(card);
  const amount = Math.max(0, Number(usd) || 0);
  const atSell = sell != null ? amount * sell : null;
  const atOfficial = official != null ? amount * official : null;
  const atCard = cardRate != null ? amount * cardRate : null;

  const title = es
    ? live.buy && live.sell
      ? `Guía de dinero Bolivia 2026 | Blue compra ${live.buy} · venta ${live.sell}`
      : 'Guía de dinero para viajeros en Bolivia 2026 | Efectivo, ATM y dólar blue'
    : live.buy && live.sell
      ? `Bolivia Money Guide 2026 | Blue buy ${live.buy} · sell ${live.sell}`
      : 'Bolivia Money Guide for Travelers 2026 | Cash, ATMs & Blue Dollar';

  const description = es
    ? live.buy && live.sell
      ? `Cómo manejar dinero en Bolivia en 2026: efectivo USD, tarjetas, cajeros y dólar blue (compra ${live.buy} · venta ${live.sell}). Tasas en vivo, no consejos de 2024.`
      : 'Guía 2026 para turistas en Bolivia: efectivo, tarjetas, cajeros y el dólar blue. Tasas en vivo desde P2P.'
    : live.buy && live.sell
      ? `How to handle money in Bolivia in 2026: USD cash, cards, ATMs, and the blue dollar (buy ${live.buy} · sell ${live.sell}). Live rates — not leftover 2024 advice.`
      : '2026 traveler money guide for Bolivia: cash, cards, ATMs, and the blue dollar. Live P2P rates.';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: es
      ? 'Guía de dinero para viajeros en Bolivia (2026)'
      : 'The Bolivia Money Guide for Travelers (2026)',
    description,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    inLanguage: es ? 'es-BO' : 'en',
    author: { '@type': 'Organization', name: 'Bolivia Blue', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Bolivia Blue',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${canonical}` },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: es
      ? [
          {
            '@type': 'Question',
            name: '¿Sigue el dólar oficial en 6,96 bolivianos?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Esa cifra es de guías viejas. El BCB publica un tipo de cambio oficial que se mueve; míralo en vivo en esta página junto al paralelo (blue).',
            },
          },
          {
            '@type': 'Question',
            name: '¿Debo llevar dólares en efectivo a Bolivia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, una parte en billetes USD impecables (preferible 50 y 100, serie reciente). Bolivia sigue siendo un país de efectivo para mercados, buses y pueblos. No hace falta traer todo el presupuesto en cash.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Los cajeros dan el tipo blue?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Un ATM con tarjeta extranjera acredita bolivianos al circuito bancario/oficial, más comisiones y tope de retiro. No es la mediana P2P que publicamos como dólar blue.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Conviene Binance P2P a un turista?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sirve si te quedas varias semanas y puedes recibir BOB (cuenta local, QR o alguien de confianza). Para un viaje corto, efectivo USD + algo de tarjeta suele ser más simple.',
            },
          },
        ]
      : [
          {
            '@type': 'Question',
            name: 'Is the official dollar still 6.96 bolivianos?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. That number is leftover from old blogs. The BCB publishes a moving official rate; check it live on this page next to the parallel (blue) rate.',
            },
          },
          {
            '@type': 'Question',
            name: 'Should I bring US cash to Bolivia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — some of your budget in pristine USD bills (prefer $50s and $100s, recent series). Bolivia is still cash-first for markets, buses, and small towns. You do not need to carry your entire trip in cash.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do ATMs give the blue rate?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. A foreign card at a Bolivian ATM pays out bolivianos through the banking/official channel, plus fees and withdrawal caps. That is not the P2P median we publish as the blue dollar.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Binance P2P worth it for a tourist?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'It helps if you stay several weeks and can receive BOB (local account, QR, or a trusted person). For a short trip, clean USD cash plus a backup card is simpler.',
            },
          },
        ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: es ? 'Cómo manejar dinero en un viaje a Bolivia' : 'How to handle money on a trip to Bolivia',
    step: es
      ? [
          { '@type': 'HowToStep', name: 'Revisar tasas en vivo', text: 'Mirá el dólar blue y el tipo BCB en Bolivia Blue antes de cambiar.' },
          { '@type': 'HowToStep', name: 'Llevar USD impecable', text: 'Billetes de 50 y 100, sin roturas ni sellos, para casas de cambio.' },
          { '@type': 'HowToStep', name: 'Usar tarjeta como respaldo', text: 'Hoteles y supermercados grandes; no cuentes con ella en pueblos ni tours.' },
          { '@type': 'HowToStep', name: 'P2P solo si te quedas', text: 'Binance P2P tiene sentido con estadía larga y forma de cobrar en BOB.' },
        ]
      : [
          { '@type': 'HowToStep', name: 'Check live rates', text: 'Look at the blue dollar and BCB rate on Bolivia Blue before you exchange.' },
          { '@type': 'HowToStep', name: 'Bring pristine USD', text: 'Mostly $50s and $100s, no tears or stamps, for casas de cambio.' },
          { '@type': 'HowToStep', name: 'Keep a card as backup', text: 'Hotels and large supermarkets; do not count on it in villages or on tours.' },
          { '@type': 'HowToStep', name: 'Use P2P only if you stay', text: 'Binance P2P is useful on a longer stay when you can receive BOB.' },
        ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: es ? 'Inicio' : 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: es ? 'Guía de dinero' : 'Money guide', item: `${SITE_URL}${canonical}` },
    ],
  };

  const toc = es
    ? [
        { id: 'tasas', label: 'Tasas en vivo' },
        { id: '2026', label: 'Qué cambió en 2026' },
        { id: 'efectivo', label: 'Efectivo USD' },
        { id: 'cajeros', label: 'Cajeros y tarjetas' },
        { id: 'p2p', label: 'Binance P2P' },
        { id: 'ciudades', label: 'La Paz, Santa Cruz, Uyuni' },
        { id: 'esim', label: 'eSIM y extras' },
        { id: 'faq', label: 'Preguntas' },
      ]
    : [
        { id: 'tasas', label: 'Live rates' },
        { id: '2026', label: 'What changed in 2026' },
        { id: 'efectivo', label: 'USD cash' },
        { id: 'cajeros', label: 'ATMs and cards' },
        { id: 'p2p', label: 'Binance P2P' },
        { id: 'ciudades', label: 'La Paz, Santa Cruz, Uyuni' },
        { id: 'esim', label: 'eSIM and extras' },
        { id: 'faq', label: 'FAQ' },
      ];

  const faqs = useMemo(
    () => faqSchema.mainEntity.map((q) => ({ q: q.name, a: q.acceptedAnswer.text })),
    [faqSchema.mainEntity]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title={title}
        description={description}
        keywords={
          es
            ? 'dinero en bolivia turistas, cambiar dólares bolivia, cajero bolivia, dólar blue viajeros, efectivo usd bolivia, atm bolivia 2026'
            : 'bolivia money guide, cash or card bolivia, atm bolivia tourists, blue dollar travel, exchange money bolivia 2026'
        }
        canonical={canonical}
        ogType="article"
        localePaths={{ es: TRAVEL_GUIDE_ES, en: TRAVEL_GUIDE_EN }}
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
      />
      <Header />
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { name: es ? 'Inicio' : 'Home', url: '/' },
            { name: es ? 'Guía de dinero' : 'Money guide', url: canonical },
          ]}
        />

        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          {es ? 'Guía para viajeros · 2026' : 'Traveler guide · 2026'}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {es ? 'Guía de dinero para viajeros en Bolivia' : 'The Bolivia money guide for travelers'}
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          {es
            ? 'Uyuni, La Paz, Santa Cruz: cómo cambiar, cuándo usar tarjeta y cuándo el paralelo (blue) importa. Tasas en vivo, no un artículo congelado de 2024.'
            : 'Uyuni, La Paz, Santa Cruz: how to exchange, when a card is fine, and when the parallel (blue) rate matters. Live quotes — not a frozen 2024 article.'}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {es ? 'Actualizado el 14 sep 2026 · ~8 min' : 'Updated 14 Sep 2026 · ~8 min read'}
        </p>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label={es ? 'Contenido' : 'On this page'}>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-300 hover:border-blue-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <section id="tasas" className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Tasas en vivo (no un promedio de blog)' : 'Live rates (not a blog average)'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Si vendés dólares en efectivo, te acercás a la venta (cuántos Bs te dan por 1 USD). El BCB es el tipo oficial. La tarjeta suele cotizar cerca del mercado, no del “oficial histórico”.'
              : 'If you sell cash dollars, you are near sell (how many Bs you get per 1 USD). BCB is the official print. Cards usually sit near mid-market — not some historic official peg.'}
          </p>
          <div className="mt-4">
            <BlueRateCards showTimestampInCards={false} showCrossSourceBadge={false} />
          </div>
          <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <label htmlFor="guide-usd" className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {es ? '¿Cuántos USD pensás cambiar?' : 'How many USD will you change?'}
            </label>
            <input
              id="guide-usd"
              type="number"
              min="0"
              inputMode="decimal"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 font-mono tabular-nums"
            />
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-sky-50 dark:bg-sky-950/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">{es ? 'Al paralelo (venta)' : 'At parallel (sell)'}</dt>
                <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                  {atSell != null ? `${formatRate(atSell)} Bs` : '—'}
                </dd>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">BCB</dt>
                <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                  {atOfficial != null ? `${formatRate(atOfficial)} Bs` : '—'}
                </dd>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">{es ? 'Tarjeta (est. Wise)' : 'Card (Wise est.)'}</dt>
                <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                  {atCard != null ? `${formatRate(atCard)} Bs` : '—'}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {es
                ? 'Referencia P2P/USDT y BCB en vivo. Una casa de cambio te va a dar un poco menos. La tarjeta no es Visa/Mastercard liquidación; es un estimado de mercado.'
                : 'Live P2P/USDT and BCB reference. A casa de cambio will shave a bit. The card figure is a mid-market estimate, not a Visa/Mastercard settlement print.'}
            </p>
            <Link to="/calculadora" className="mt-2 inline-block text-sm font-medium text-blue-700 dark:text-blue-300">
              {es ? 'Calculadora completa →' : 'Full calculator →'}
            </Link>
          </div>
        </section>

        <section id="2026" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Qué cambió en 2026 (y por qué otras guías mienten)' : 'What changed in 2026 (and why other guides are wrong)'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Muchos artículos de viaje todavía dicen que el oficial está “alrededor de 6,96” y que el cajero te “roba” esa diferencia enorme. Eso era cierto cuando el BCB tenía un tipo clavado y el paralelo estaba muy por encima. Hoy el oficial se publica y se mueve; el blue sigue siendo otra lectura (P2P), pero la brecha ya no es automáticamente un 40%.'
              : 'Plenty of travel posts still say the official rate is “around 6.96” and that ATMs “steal” that huge gap. That was true when the BCB rate was stuck and the parallel sat far above it. Today the official print moves; blue is still a different (P2P) reading — but it is no longer automatically a 40% haircut.'}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Por eso esta guía mira números en vivo. Traé efectivo porque Bolivia es un país de cash, no porque un blog de 2024 te prometió duplicar el presupuesto.'
              : 'That is why this guide uses live numbers. Bring cash because Bolivia is a cash country — not because a 2024 blog promised to double your budget.'}
          </p>
        </section>

        <section id="efectivo" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Efectivo USD: sigue siendo el plan A' : 'USD cash: still plan A'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Mercados, micros, trufis, tours chicos y pueblos no toman tarjeta. Cambiá en casas de cambio (no en la calle si podés evitarlo). Compará con la venta de esta página antes de aceptar.'
              : 'Markets, micros, trufis, small tours, and villages do not take cards. Change at casas de cambio (skip the street if you can). Compare with this page’s sell rate before you say yes.'}
          </p>
          <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 list-disc pl-5">
            <li>
              {es
                ? 'Billetes impecables: sin roturas, escritura, sellos ni cinta. Un pliegue fuerte a veces alcanza para que te los rechacen.'
                : 'Pristine bills: no tears, writing, stamps, or tape. A hard fold is sometimes enough for a desk to refuse them.'}
            </li>
            <li>
              {es
                ? 'Preferí 100 y 50 de serie reciente (franja azul). Los 20 y 10 suelen pagar peor o ni los toman.'
                : 'Prefer recent-series $100s and $50s (blue stripe). $20s and $10s often pay worse — or are refused.'}
            </li>
            <li>
              {es
                ? 'No cambies todo el día 1. Cambia lo de unos días, guardá el resto separado del pasaporte.'
                : 'Do not change everything on day one. Change a few days of spend; keep the rest apart from your passport.'}
            </li>
            <li>
              {es
                ? 'Contá los Bs en el mostrador. Si la tasa está muy por encima de nuestra venta, desconfiá.'
                : 'Count bolivianos at the counter. If the rate is wildly above our sell, walk away.'}
            </li>
          </ul>
        </section>

        <section id="cajeros" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Cajeros y tarjetas: respaldo, no el plan entero' : 'ATMs and cards: backup, not the whole plan'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Hoteles, supermercados y algunos restaurantes toman Visa/Mastercard. El comercio es de efectivo. Un ATM extranjero te da BOB por el circuito bancario, con tope bajo y comisión local + la de tu banco. No es el dólar blue.'
              : 'Hotels, supermarkets, and some restaurants take Visa/Mastercard. Street commerce is cash. A foreign ATM pays BOB through the banking rail, with a low cap plus local and home-bank fees. That is not the blue dollar.'}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Si el datáfono pregunta “¿cobrar en USD o BOB?”, elegí BOB para no pagar una conversión extra del comercio. Avisá a tu banco que viajás a Bolivia.'
              : 'If the terminal asks USD vs BOB, choose BOB so you do not pay the merchant’s extra conversion. Tell your bank you are traveling to Bolivia.'}
          </p>
        </section>

        <section id="p2p" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Binance P2P si te quedás más tiempo' : 'Binance P2P if you are staying longer'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'El blue que ves arriba es una mediana de ofertas P2P (USDT/BOB), no el precio de una ventanilla. Si vas a estar semanas y podés recibir bolivianos (cuenta, QR Simple, o alguien de confianza), P2P suele acercarte a esa lectura. Para 10 días de Uyuni + Copacabana, el efectivo gana en simpleza.'
              : 'The blue rate above is a median of P2P offers (USDT/BOB), not a teller price. If you are here for weeks and can receive bolivianos (account, QR Simple, or someone you trust), P2P usually gets you close to that reading. For a 10-day Uyuni + Copacabana loop, cash wins on simplicity.'}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'No quedes con extraños a cambiar maletines. Usá el escrow de Binance, vendedores con muchas operaciones y métodos que ya uses. KYC lleva tiempo: hacelo antes de volar.'
              : 'Do not meet strangers with a bag of cash. Use Binance escrow, high-trade counterparties, and rails you already use. KYC takes time — finish it before you fly.'}
          </p>
          <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {es ? 'Cuenta Binance (enlace de referido)' : 'Binance account (referral link)'}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {es
                ? 'Si no tenés cuenta, este enlace es nuestro referido. La guía de P2P paso a paso está en el sitio.'
                : 'If you do not have an account yet, this is our referral link. The step-by-step P2P walkthrough lives on the site.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <BinanceButton placement="travelers_guide">
                {es ? 'Crear cuenta Binance' : 'Create a Binance account'}
              </BinanceButton>
              <Link
                to="/binance-p2p-bolivia"
                className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100"
              >
                {es ? 'Cómo usar P2P' : 'How P2P works'}
              </Link>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {es
                ? 'Enlace de afiliado: podemos ganar una comisión sin costo extra para vos.'
                : 'Affiliate link: we may earn a commission at no extra cost to you.'}
            </p>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {es
              ? 'Western Union a veces cotiza entre el banco y el paralelo. Sirve como plan C si se te acaba el efectivo, no como estrategia del viaje.'
              : 'Western Union sometimes sits between the bank and the parallel. Treat it as plan C if you run out of cash, not as the trip strategy.'}
          </p>
        </section>

        <section id="ciudades" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'La Paz, Santa Cruz y Uyuni' : 'La Paz, Santa Cruz, and Uyuni'}
          </h2>
          <div className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {es ? (
                <>
                  <strong>La Paz / El Alto:</strong> más casas de cambio cerca de Sagárnaga y el centro. Compará dos ventanillas.{' '}
                  <Link to="/dolar-blue-la-paz" className="text-blue-700 dark:text-blue-300 hover:underline">
                    Cotización La Paz
                  </Link>
                  . El Alto es aeropuerto: cambia poco ahí; las tasas de aeropuerto son flojas.
                </>
              ) : (
                <>
                  <strong>La Paz / El Alto:</strong> more casas de cambio around Sagárnaga and downtown. Compare two windows.{' '}
                  <Link to="/dolar-blue-la-paz" className="text-blue-700 dark:text-blue-300 hover:underline">
                    La Paz quote
                  </Link>
                  . El Alto is the airport — change little there; airport rates are weak.
                </>
              )}
            </p>
            <p>
              {es ? (
                <>
                  <strong>Santa Cruz:</strong> Equipetrol y el centro manejan más volumen. Útil si aterrizás en VVI.{' '}
                  <Link to="/dolar-blue-santa-cruz" className="text-blue-700 dark:text-blue-300 hover:underline">
                    Cotización Santa Cruz
                  </Link>
                  .
                </>
              ) : (
                <>
                  <strong>Santa Cruz:</strong> Equipetrol and downtown see more volume. Useful if you land at VVI.{' '}
                  <Link to="/dolar-blue-santa-cruz" className="text-blue-700 dark:text-blue-300 hover:underline">
                    Santa Cruz quote
                  </Link>
                  .
                </>
              )}
            </p>
            <p>
              {es ? (
                <>
                  <strong>Uyuni / tours:</strong> operadores cotizan en USD y te “redondean” el BOB peor. Llevá Bs ya cambiados para comida y souvenirs. La Paz o Santa Cruz primero.
                </>
              ) : (
                <>
                  <strong>Uyuni / tours:</strong> operators quote in USD and “round” BOB against you. Bring bolivianos already changed for food and souvenirs. Change in La Paz or Santa Cruz first.
                </>
              )}
            </p>
          </div>
        </section>

        <section id="esim" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Datos, seguro y sentido común' : 'Data, insurance, and common sense'}
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'Instalá un eSIM (Airalo, Holafly u otro) antes de aterrizar para abrir mapas y esta página en El Alto. No tenemos referido de SIM por ahora: comprá donde te convenga. Entel y Tigo también venden chips en el aeropuerto si preferís local.'
              : 'Install an eSIM (Airalo, Holafly, or similar) before you land so maps and this page work at El Alto. We do not have a SIM referral right now — buy wherever is convenient. Entel and Tigo also sell SIMs at the airport if you prefer local.'}
          </p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {es
              ? 'La Paz está a 3.640 m. Un seguro que cubra altitud y tours (Salar, Death Road) vale más que ahorrar 20 USD en el cambio.'
              : 'La Paz sits at 3,640 m. Insurance that covers altitude and tours (Salar, Death Road) is worth more than squeezing 20 dollars out of FX.'}
          </p>
        </section>

        <section id="faq" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {es ? 'Preguntas frecuentes' : 'FAQ'}
          </h2>
          <dl className="mt-4 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <dt className="font-semibold text-gray-900 dark:text-white">{item.q}</dt>
                <dd className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {es ? 'En resumen' : 'The short version'}
          </h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>{es ? 'Mirá las tasas en vivo acá el día que cambies.' : 'Check live rates here on the day you exchange.'}</li>
            <li>{es ? 'Llevá USD impecable para el día a día en efectivo.' : 'Bring pristine USD for day-to-day cash.'}</li>
            <li>{es ? 'Tarjeta y ATM como respaldo, no como único canal.' : 'Card and ATM as backup, not the only channel.'}</li>
            <li>{es ? 'P2P si te quedás; no para un tour de una semana.' : 'P2P if you stay; skip it for a one-week tour.'}</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/" className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
              {es ? 'Cotización en vivo' : 'Live quote'}
            </Link>
            <Link to="/dolar-blue-hoy" className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
              {es ? 'Dólar blue hoy' : 'Blue dollar today'}
            </Link>
            <Link to="/comprar-dolares" className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
              {es ? 'Cómo comprar dólares' : 'How to buy dollars'}
            </Link>
            <Link to="/fuente-de-datos" className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
              {es ? 'Metodología' : 'Methodology'}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
