/**
 * SERP-oriented title/description with live buy/sell when available.
 * Competitors win clicks by putting Bs rates in the Google snippet.
 */

function fmt(n) {
  const x = Number(n);
  // Never emit Compra 0.00 / Venta 0.00 into titles Google indexes.
  if (!Number.isFinite(x) || x < 1) return null;
  return x.toFixed(2);
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
      titleWith: (b, s) => {
        const d = new Intl.DateTimeFormat('es-BO', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }).format(new Date());
        return `Dólar Blue Hoy ${d}: Compra ${b} · Venta ${s}`;
      },
      titleFallback: 'Dólar Blue Hoy Bolivia | Precio Actualizado Ahora',
      descWith: (b, s, when) =>
        `Dólar blue hoy en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Mercado paralelo actualizado cada 15 min.`,
      descFallback:
        'Dólar blue hoy en Bolivia: precio de compra y venta actualizado cada 15 min. Cotización del mercado paralelo, gratis y sin registro.',
    },
    en: {
      titleWith: (b, s) => {
        const d = new Intl.DateTimeFormat('en-US', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }).format(new Date());
        return `Blue Dollar Today ${d}: Buy ${b} · Sell ${s}`;
      },
      titleFallback: 'Blue Dollar Today Bolivia | Price Updated Now',
      descWith: (b, s, when) =>
        `Blue dollar today in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Parallel market, updated every 15 min.`,
      descFallback:
        'Blue dollar today in Bolivia: buy and sell price updated every 15 min. Parallel market quote, free, no signup.',
    },
  },
  'dolar-paralelo': {
    es: {
      titleWith: (b, s) => `Dólar Paralelo / Blue Bolivia EN VIVO: ${b} / ${s}`,
      titleFallback: 'Dólar Paralelo Bolivia EN VIVO | Cotización Blue Ahora',
      descWith: (b, s, when) =>
        `Dólar paralelo (blue) Bolivia EN VIVO: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Cotización cada 15 min desde Binance P2P.`,
      descFallback:
        'Dólar paralelo y dólar blue Bolivia EN VIVO: cotización del mercado cambiario actualizada cada 15 min. Ver compra y venta ahora.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Parallel / Blue Dollar LIVE: ${b} / ${s}`,
      titleFallback: 'Bolivia Parallel Dollar LIVE | Blue Quote Now',
      descWith: (b, s, when) =>
        `Bolivia parallel / blue dollar LIVE: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Updated every 15 min.`,
      descFallback:
        'Bolivia parallel / blue dollar LIVE: exchange-market quote updated every 15 min. See buy and sell now.',
    },
  },
  cotiza: {
    es: {
      titleWith: (b, s) => `Cotiza el Dólar Paralelo: Compra ${b} · Venta ${s}`,
      titleFallback: 'Cotiza el Dólar Paralelo en Bolivia | Guía y Precio',
      descWith: (b, s, when) =>
        `Cotiza el dólar paralelo (blue) en Bolivia: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Cómo leer la cotización y dónde operar.`,
      descFallback:
        'Cotiza el dólar paralelo / blue en Bolivia: guía para interpretar compra y venta, actualizada cada 15 min.',
    },
    en: {
      titleWith: (b, s) => `Quote the Parallel Dollar: Buy ${b} · Sell ${s}`,
      titleFallback: 'Quote Bolivia Parallel Dollar | Guide & Price',
      descWith: (b, s, when) =>
        `Quote Bolivia’s parallel (blue) dollar: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. How to read the quote.`,
      descFallback:
        'Quote Bolivia’s parallel / blue dollar: how to read buy and sell, updated every 15 min.',
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
