/**
 * SERP-oriented title/description with live buy/sell when available.
 * Competitors win clicks by putting Bs rates in the Google snippet.
 */

function fmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(2) : null;
}

function formatSnippetTime(iso, language = 'es') {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-BO' : 'en-US', {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return null;
  }
}

const PAGE_COPY = {
  home: {
    es: {
      titleWith: (b, s) => `Dólar Blue Bolivia Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue Bolivia Hoy | Tipo de Cambio y Cotización',
      descWith: (b, s, when) =>
        `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${b} para la compra y Bs ${s} para la venta${when ? `, lectura ${when}` : ''}. Actualizado cada 15 min (Binance P2P).`,
      descFallback:
        'Cotización del dólar blue / paralelo en Bolivia hoy: tipo de cambio compra y venta. Actualizado cada 15 min desde Binance P2P. Gratis, sin registro.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Blue Dollar Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Bolivia Blue Dollar Today | Exchange Rate & Quote',
      descWith: (b, s, when) =>
        `Bolivia parallel (blue) dollar today: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Updated every 15 min from Binance P2P.`,
      descFallback:
        'Bolivia blue / parallel dollar quote today: buy and sell rates. Updated every 15 min from Binance P2P. Free, no signup.',
    },
  },
  'dolar-blue-hoy': {
    es: {
      titleWith: (b, s) => `Dólar Blue Hoy Bolivia: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue Hoy Bolivia | Precio Actualizado Ahora',
      descWith: (b, s, when) =>
        `Dólar blue hoy en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Mercado paralelo actualizado cada 15 min.`,
      descFallback:
        'Dólar blue hoy en Bolivia: precio de compra y venta actualizado cada 15 min. Cotización del mercado paralelo, gratis y sin registro.',
    },
    en: {
      titleWith: (b, s) => `Blue Dollar Today Bolivia: Buy ${b} · Sell ${s}`,
      titleFallback: 'Blue Dollar Today Bolivia | Price Updated Now',
      descWith: (b, s, when) =>
        `Blue dollar today in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Parallel market, updated every 15 min.`,
      descFallback:
        'Blue dollar today in Bolivia: buy and sell price updated every 15 min. Parallel market quote, free, no signup.',
    },
  },
  'dolar-paralelo': {
    es: {
      titleWith: (b, s) => `Dólar Paralelo Bolivia EN VIVO: ${b} / ${s}`,
      titleFallback: 'Dólar Paralelo Bolivia EN VIVO | Cotización Ahora',
      descWith: (b, s, when) =>
        `Dólar paralelo Bolivia EN VIVO: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Cotización cada 15 min desde Binance P2P.`,
      descFallback:
        'Dólar paralelo Bolivia EN VIVO: cotización del mercado cambiario actualizada cada 15 min. Ver precio de compra y venta ahora.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Parallel Dollar LIVE: ${b} / ${s}`,
      titleFallback: 'Bolivia Parallel Dollar LIVE | Quote Now',
      descWith: (b, s, when) =>
        `Bolivia parallel dollar LIVE: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Updated every 15 min.`,
      descFallback:
        'Bolivia parallel dollar LIVE: exchange-market quote updated every 15 min. See buy and sell price now.',
    },
  },
  cuanto: {
    es: {
      titleWith: (b, s) => `¿Cuánto está el dólar en Bolivia? Compra ${b} · Venta ${s}`,
      titleFallback: '¿Cuánto Está el Dólar en Bolivia Hoy? Precio Actual',
      descWith: (b, s, when) =>
        `¿Cuánto está el dólar en Bolivia hoy? Blue/paralelo: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Actualizado cada 15 min.`,
      descFallback:
        '¿Cuánto está el dólar en Bolivia hoy? Precio actual del dólar blue (paralelo), actualizado cada 15 min. Calculadora y gráficos incluidos.',
    },
    en: {
      titleWith: (b, s) => `How much is the dollar in Bolivia? Buy ${b} · Sell ${s}`,
      titleFallback: 'How Much Is the Dollar in Bolivia Today? Current Price',
      descWith: (b, s, when) =>
        `How much is the dollar in Bolivia today? Blue/parallel: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Updated every 15 min.`,
      descFallback:
        'How much is the dollar in Bolivia today? Current blue (parallel) price, updated every 15 min. Calculator and charts included.',
    },
  },
};

/**
 * @param {{ buy?: number|null, sell?: number|null, updatedAt?: string|null, language?: string, page?: keyof typeof PAGE_COPY }} opts
 */
export function buildLiveRateSeoMeta({
  buy,
  sell,
  updatedAt = null,
  language = 'es',
  page = 'home',
} = {}) {
  const buyStr = fmt(buy);
  const sellStr = fmt(sell);
  const hasRates = buyStr != null && sellStr != null;
  const lang = language === 'en' ? 'en' : 'es';
  const copy = (PAGE_COPY[page] || PAGE_COPY.home)[lang];
  const when = hasRates ? formatSnippetTime(updatedAt, lang) : null;

  return {
    title: hasRates ? copy.titleWith(buyStr, sellStr) : copy.titleFallback,
    description: hasRates
      ? copy.descWith(buyStr, sellStr, when)
      : copy.descFallback,
  };
}

/**
 * Pull buy/sell from common API shapes used on the site.
 */
export function ratesFromBluePayload(data) {
  if (!data) return { buy: null, sell: null, updatedAt: null };
  const buy = data.buy ?? data.buy_bob_per_usd ?? null;
  const sell = data.sell ?? data.sell_bob_per_usd ?? null;
  const updatedAt = data.updated_at_iso ?? data.t ?? null;
  return { buy, sell, updatedAt };
}
