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
      titleWith: (b, s) => `Dólar Blue Hoy Bolivia: Compra ${b} · Venta ${s} | Paralelo`,
      titleFallback: 'Dólar Blue Hoy Bolivia | Paralelo, Binance P2P y Cotización',
      descWith: (b, s, when) =>
        `Dólar blue hoy / paralelo en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Cotización cada 15 min desde Binance P2P.`,
      descFallback:
        'Dólar blue hoy y paralelo en Bolivia: compra y venta actualizados cada 15 min desde Binance P2P. Gratis, sin registro.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Blue Dollar Today: Buy ${b} · Sell ${s} | Parallel`,
      titleFallback: 'Bolivia Blue Dollar Today | Parallel Rate & Binance P2P',
      descWith: (b, s, when) =>
        `Bolivia blue / parallel dollar today: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Updated every 15 min from Binance P2P.`,
      descFallback:
        'Bolivia blue / parallel dollar today: buy and sell rates. Updated every 15 min from Binance P2P. Free, no signup.',
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
      titleFallback: 'Dólar Blue Hoy Bolivia | Precio Paralelo Actualizado',
      descWith: (b, s, when) =>
        `Dólar blue hoy en Bolivia (mercado paralelo): compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Datos Binance P2P cada 15 min.`,
      descFallback:
        'Dólar blue hoy en Bolivia: precio paralelo de compra y venta. Actualizado cada 15 min desde Binance P2P.',
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
      titleFallback: 'Blue Dollar Today Bolivia | Parallel Price Now',
      descWith: (b, s, when) =>
        `Blue dollar today in Bolivia (parallel market): buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Binance P2P, every 15 min.`,
      descFallback:
        'Blue dollar today in Bolivia: parallel buy and sell price. Updated every 15 min from Binance P2P.',
    },
  },
  'dolar-paralelo': {
    es: {
      titleWith: (b, s) => `Dólar Paralelo Bolivia EN VIVO: ${b} / ${s} | Blue`,
      titleFallback: 'Dólar Paralelo Bolivia EN VIVO | Blue y Binance P2P',
      descWith: (b, s, when) =>
        `Dólar paralelo / blue Bolivia EN VIVO: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Cotización Binance P2P cada 15 min.`,
      descFallback:
        'Dólar paralelo y dólar blue Bolivia EN VIVO: cotización del mercado cambiario cada 15 min (Binance P2P).',
    },
    en: {
      titleWith: (b, s) => `Bolivia Parallel Dollar LIVE: ${b} / ${s} | Blue`,
      titleFallback: 'Bolivia Parallel Dollar LIVE | Blue & Binance P2P',
      descWith: (b, s, when) =>
        `Bolivia parallel / blue dollar LIVE: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Binance P2P every 15 min.`,
      descFallback:
        'Bolivia parallel / blue dollar LIVE: exchange-market quote every 15 min from Binance P2P.',
    },
  },
  cotiza: {
    es: {
      titleWith: (b, s) => `Cotiza Dólar Paralelo / Blue: Compra ${b} · Venta ${s}`,
      titleFallback: 'Cotiza el Dólar Paralelo en Bolivia | Blue Hoy',
      descWith: (b, s, when) =>
        `Cotiza el dólar paralelo (blue) en Bolivia hoy: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Guía y Binance P2P.`,
      descFallback:
        'Cotiza el dólar paralelo / blue en Bolivia hoy: cómo leer compra y venta, actualizado cada 15 min (Binance P2P).',
    },
    en: {
      titleWith: (b, s) => `Quote Parallel / Blue Dollar: Buy ${b} · Sell ${s}`,
      titleFallback: 'Quote Bolivia Parallel Dollar | Blue Today',
      descWith: (b, s, when) =>
        `Quote Bolivia’s parallel (blue) dollar today: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. How to read the quote.`,
      descFallback:
        'Quote Bolivia’s parallel / blue dollar today: how to read buy and sell, updated every 15 min.',
    },
  },
  cuanto: {
    es: {
      titleWith: (b, s) => `¿Cuánto está el dólar blue hoy? Compra ${b} · Venta ${s}`,
      titleFallback: '¿Cuánto Está el Dólar Blue en Bolivia Hoy? Paralelo',
      descWith: (b, s, when) =>
        `¿Cuánto está el dólar en Bolivia hoy? Blue/paralelo: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Binance P2P, cada 15 min.`,
      descFallback:
        '¿Cuánto está el dólar blue en Bolivia hoy? Precio paralelo actualizado cada 15 min (Binance P2P). Calculadora incluida.',
    },
    en: {
      titleWith: (b, s) => `How much is the blue dollar today? Buy ${b} · Sell ${s}`,
      titleFallback: 'How Much Is the Blue Dollar in Bolivia Today?',
      descWith: (b, s, when) =>
        `How much is the dollar in Bolivia today? Blue/parallel: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Binance P2P every 15 min.`,
      descFallback:
        'How much is the blue dollar in Bolivia today? Parallel price updated every 15 min from Binance P2P.',
    },
  },
  euro: {
    es: {
      titleWith: (b, s) => `Euro Blue Bolivia Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Euro Blue Bolivia | Mercado Negro EUR a BOB 2026',
      descWith: (b, s, when) =>
        `Euro blue / paralelo en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Precio del euro en el mercado negro vs oficial. Binance P2P.`,
      descFallback:
        'Euro blue Bolivia y precio del euro en el mercado negro: EUR a BOB paralelo vs oficial. Cotización cada 15 min (Binance P2P).',
    },
    en: {
      titleWith: (b, s) => `Euro Blue Bolivia Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Euro Blue Bolivia | Parallel EUR to BOB 2026',
      descWith: (b, s, when) =>
        `Euro blue / parallel in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Parallel vs official EUR to BOB. Binance P2P.`,
      descFallback:
        'Euro blue Bolivia and parallel EUR to BOB vs official rate. Updated every 15 min from Binance P2P.',
    },
  },
  real: {
    es: {
      titleWith: (b, s) => `Real Blue Bolivia Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Real Blue Bolivia | BRL a BOB Paralelo 2026',
      descWith: (b, s, when) =>
        `Real brasileño blue / paralelo en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Mercado paralelo vs oficial. Binance P2P.`,
      descFallback:
        'Real blue Bolivia: BRL a BOB en el mercado paralelo vs oficial. Cotización cada 15 min desde Binance P2P.',
    },
    en: {
      titleWith: (b, s) => `Real Blue Bolivia Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Real Blue Bolivia | Parallel BRL to BOB 2026',
      descWith: (b, s, when) =>
        `Brazilian real blue / parallel in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Parallel vs official. Binance P2P.`,
      descFallback:
        'Real blue Bolivia: parallel BRL to BOB vs official rate. Updated every 15 min from Binance P2P.',
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
