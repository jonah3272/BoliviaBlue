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
      titleWith: (b, s) => `Dólar blue hoy Bolivia: Compra ${b} · Venta ${s}`,
      titleFallback: 'Bolivia Blue | Dólar Blue Hoy, lectura P2P verificada',
      descWith: (b, s, when) =>
        `Dólar blue hoy en Bolivia: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Mediana P2P.`,
      descFallback:
        'Bolivia Blue: dólar blue hoy en Bolivia, lectura verificada, mediana multi-plataforma P2P. Gratis, sin registro.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Blue | Blue Dollar Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Bolivia Blue | Blue Dollar Today, verified P2P reading',
      descWith: (b, s, when) =>
        `Bolivia Blue: blue dollar today buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Multi-platform P2P median (Binance, El Dorado, OKX).`,
      descFallback:
        'Bolivia Blue: Bolivia blue dollar today, verified multi-platform P2P median. Free, no signup.',
    },
  },
  'dolar-blue-hoy': {
    es: {
      titleWith: (b, s) => `Dólar Blue Hoy Bolivia: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue Hoy Bolivia | Lectura Verificada Paralelo',
      descWith: (b, s, when) =>
        `Lectura verificada — dólar blue hoy: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Mediana P2P multi-plataforma.`,
      descFallback:
        'Dólar blue hoy en Bolivia: lectura verificada del paralelo. Mediana P2P actualizada cada pocos minutos.',
    },
    en: {
      titleWith: (b, s) => `Blue Dollar Today Bolivia: Buy ${b} · Sell ${s}`,
      titleFallback: 'Blue Dollar Today Bolivia | Parallel Price Now',
      descWith: (b, s, when) =>
        `Blue dollar today in Bolivia (parallel): buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Verified multi-platform P2P median.`,
      descFallback:
        'Blue dollar today in Bolivia: verified parallel reading. Multi-platform P2P median, updated every few minutes.',
    },
  },
  'bolivian-blue': {
    es: {
      titleWith: (b, s) => `Bolivian Blue Hoy: Compra ${b} · Venta ${s} | Bolivia`,
      titleFallback: 'Bolivian Blue Bolivia | Dólar Paralelo Hoy',
      descWith: (b, s, when) =>
        `Bolivian Blue en Bolivia: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Lectura verificada · mediana P2P multi-plataforma.`,
      descFallback:
        'Bolivian Blue Bolivia: cotización del dólar paralelo hoy. Lectura verificada desde varias plataformas P2P.',
    },
    en: {
      titleWith: (b, s) => `Bolivian Blue Today: Buy ${b} · Sell ${s} | Bolivia`,
      titleFallback: 'Bolivian Blue Bolivia | Parallel Dollar Today',
      descWith: (b, s, when) =>
        `Bolivian Blue in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Verified multi-platform P2P median.`,
      descFallback:
        'Bolivian Blue Bolivia: today’s parallel dollar rate. Verified reading from multiple P2P platforms.',
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
      titleFallback: 'Euro Blue Bolivia | EUR a BOB paralelo (vía USDT)',
      descWith: (b, s, when) =>
        `Euro blue / paralelo en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Precio del euro en el mercado negro vs oficial. Binance P2P.`,
      descFallback:
        'Euro blue Bolivia y precio del euro en el mercado negro: EUR a BOB paralelo vs oficial. Cotización cada 15 min (Binance P2P).',
    },
    en: {
      titleWith: (b, s) => `Euro Blue Bolivia Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Euro Blue Bolivia | Parallel EUR to BOB (via USDT)',
      descWith: (b, s, when) =>
        `Euro blue / parallel in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Parallel vs official EUR to BOB. Binance P2P.`,
      descFallback:
        'Euro blue Bolivia and parallel EUR to BOB vs official rate. Updated every 15 min from Binance P2P.',
    },
  },
  real: {
    es: {
      titleWith: (b, s) => `Real Blue Bolivia Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Real Blue Bolivia | BRL a BOB paralelo',
      descWith: (b, s, when) =>
        `Real brasileño blue / paralelo en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Mercado paralelo vs oficial. Binance P2P.`,
      descFallback:
        'Real blue Bolivia: BRL a BOB en el mercado paralelo vs oficial. Cotización cada 15 min desde Binance P2P.',
    },
    en: {
      titleWith: (b, s) => `Real Blue Bolivia Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Real Blue Bolivia | Parallel BRL to BOB',
      descWith: (b, s, when) =>
        `Brazilian real blue / parallel in Bolivia: buy Bs ${b}, sell Bs ${s}${when ? ` (as of ${when})` : ''}. Parallel vs official. Binance P2P.`,
      descFallback:
        'Real blue Bolivia: parallel BRL to BOB vs official rate. Updated every 15 min from Binance P2P.',
    },
  },
  peso: {
    es: {
      titleWith: (b, s) => `Peso colombiano a boliviano: 1.000 COP ≈ ${b} / ${s} Bs`,
      titleFallback: 'Peso colombiano a boliviano | COP a BOB paralelo (vía USDT)',
      descWith: (b, s, when) =>
        `Peso colombiano (COP) a boliviano: 1.000 COP ≈ compra Bs ${b} · venta Bs ${s}${when ? ` (${when})` : ''}. Derivado de USDT/COP en vivo, no un tipo inventado.`,
      descFallback:
        'COP a BOB en Bolivia: peso colombiano paralelo derivado de USDT/COP (P2P o spot). Nunca un multiplicador fijo.',
    },
    en: {
      titleWith: (b, s) => `Colombian peso to boliviano: 1,000 COP ≈ ${b} / ${s} Bs`,
      titleFallback: 'Colombian peso to boliviano | Parallel COP to BOB (via USDT)',
      descWith: (b, s, when) =>
        `Colombian peso (COP) to boliviano: 1,000 COP ≈ buy Bs ${b} · sell Bs ${s}${when ? ` (as of ${when})` : ''}. Live USDT/COP cross, never an invented rate.`,
      descFallback:
        'COP to BOB in Bolivia: Colombian peso derived from live USDT/COP (P2P or spot). Never a fixed multiplier.',
    },
  },
  sol: {
    es: {
      titleWith: (b, s) => `Sol peruano a boliviano: Compra ${b} · Venta ${s}`,
      titleFallback: 'Sol peruano a boliviano | PEN a BOB paralelo (vía USDT)',
      descWith: (b, s, when) =>
        `Sol peruano (PEN) a boliviano: compra Bs ${b} · venta Bs ${s}${when ? ` (${when})` : ''}. Derivado de USDT/PEN en vivo, no un tipo inventado.`,
      descFallback:
        'PEN a BOB en Bolivia: sol peruano paralelo derivado de USDT/PEN (P2P o spot). Nunca un multiplicador fijo.',
    },
    en: {
      titleWith: (b, s) => `Peruvian sol to boliviano: Buy ${b} · Sell ${s}`,
      titleFallback: 'Peruvian sol to boliviano | Parallel PEN to BOB (via USDT)',
      descWith: (b, s, when) =>
        `Peruvian sol (PEN) to boliviano: buy Bs ${b} · sell Bs ${s}${when ? ` (as of ${when})` : ''}. Live USDT/PEN cross, never an invented rate.`,
      descFallback:
        'PEN to BOB in Bolivia: Peruvian sol derived from live USDT/PEN (P2P or spot). Never a fixed multiplier.',
    },
  },
  'peso-ars': {
    es: {
      titleWith: (b, s) => `Peso argentino a boliviano: 1.000 ARS ≈ ${b} / ${s} Bs`,
      titleFallback: 'Peso argentino a boliviano | ARS a BOB paralelo (vía USDT)',
      descWith: (b, s, when) =>
        `Peso argentino (ARS) a boliviano: 1.000 ARS ≈ compra Bs ${b} · venta Bs ${s}${when ? ` (${when})` : ''}. Derivado de USDT/ARS en vivo, no un tipo inventado.`,
      descFallback:
        'ARS a BOB en Bolivia: peso argentino paralelo derivado de USDT/ARS (P2P o spot). Nunca un multiplicador fijo.',
    },
    en: {
      titleWith: (b, s) => `Argentine peso to boliviano: 1,000 ARS ≈ ${b} / ${s} Bs`,
      titleFallback: 'Argentine peso to boliviano | Parallel ARS to BOB (via USDT)',
      descWith: (b, s, when) =>
        `Argentine peso (ARS) to boliviano: 1,000 ARS ≈ buy Bs ${b} · sell Bs ${s}${when ? ` (as of ${when})` : ''}. Live USDT/ARS cross, never an invented rate.`,
      descFallback:
        'ARS to BOB in Bolivia: Argentine peso derived from live USDT/ARS (P2P or spot). Never a fixed multiplier.',
    },
  },
  'peso-clp': {
    es: {
      titleWith: (b, s) => `Peso chileno a boliviano: 1.000 CLP ≈ ${b} / ${s} Bs`,
      titleFallback: 'Peso chileno a boliviano | CLP a BOB paralelo (vía USDT)',
      descWith: (b, s, when) =>
        `Peso chileno (CLP) a boliviano: 1.000 CLP ≈ compra Bs ${b} · venta Bs ${s}${when ? ` (${when})` : ''}. Derivado de USDT/CLP en vivo, no un tipo inventado.`,
      descFallback:
        'CLP a BOB en Bolivia: peso chileno paralelo derivado de USDT/CLP (P2P o spot). Nunca un multiplicador fijo.',
    },
    en: {
      titleWith: (b, s) => `Chilean peso to boliviano: 1,000 CLP ≈ ${b} / ${s} Bs`,
      titleFallback: 'Chilean peso to boliviano | Parallel CLP to BOB (via USDT)',
      descWith: (b, s, when) =>
        `Chilean peso (CLP) to boliviano: 1,000 CLP ≈ buy Bs ${b} · sell Bs ${s}${when ? ` (as of ${when})` : ''}. Live USDT/CLP cross, never an invented rate.`,
      descFallback:
        'CLP to BOB in Bolivia: Chilean peso derived from live USDT/CLP (P2P or spot). Never a fixed multiplier.',
    },
  },
  'santa-cruz': {
    es: {
      titleWith: (b, s) => `Dólar Blue Santa Cruz Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue Santa Cruz Hoy | Paralelo Bolivia',
      descWith: (b, s, when) =>
        `Dólar blue en Santa Cruz hoy: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Misma mediana nacional P2P; referencia para Santa Cruz.`,
      descFallback:
        'Dólar blue Santa Cruz: cotización paralela nacional (P2P) como referencia para Santa Cruz. Actualizada cada 15 min.',
    },
    en: {
      titleWith: (b, s) => `Blue Dollar Santa Cruz Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Blue Dollar Santa Cruz Today | Bolivia Parallel',
      descWith: (b, s, when) =>
        `Blue dollar in Santa Cruz today: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Same national P2P median; Santa Cruz reference.`,
      descFallback:
        'Blue dollar Santa Cruz: national parallel (P2P) quote as a Santa Cruz reference. Updated every 15 min.',
    },
  },
  'la-paz': {
    es: {
      titleWith: (b, s) => `Dólar Blue La Paz Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue La Paz Hoy | Paralelo Bolivia',
      descWith: (b, s, when) =>
        `Dólar blue en La Paz hoy: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Misma mediana nacional P2P; referencia para La Paz.`,
      descFallback:
        'Dólar blue La Paz: cotización paralela nacional (P2P) como referencia para La Paz. Actualizada cada 15 min.',
    },
    en: {
      titleWith: (b, s) => `Blue Dollar La Paz Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Blue Dollar La Paz Today | Bolivia Parallel',
      descWith: (b, s, when) =>
        `Blue dollar in La Paz today: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Same national P2P median; La Paz reference.`,
      descFallback:
        'Blue dollar La Paz: national parallel (P2P) quote as a La Paz reference. Updated every 15 min.',
    },
  },
  cochabamba: {
    es: {
      titleWith: (b, s) => `Dólar Blue Cochabamba Hoy: Compra ${b} · Venta ${s}`,
      titleFallback: 'Dólar Blue Cochabamba Hoy | Paralelo Bolivia',
      descWith: (b, s, when) =>
        `Dólar blue en Cochabamba hoy: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Misma mediana nacional P2P; referencia para Cochabamba.`,
      descFallback:
        'Dólar blue Cochabamba: cotización paralela nacional (P2P) como referencia para Cochabamba. Actualizada cada 15 min.',
    },
    en: {
      titleWith: (b, s) => `Blue Dollar Cochabamba Today: Buy ${b} · Sell ${s}`,
      titleFallback: 'Blue Dollar Cochabamba Today | Bolivia Parallel',
      descWith: (b, s, when) =>
        `Blue dollar in Cochabamba today: buy Bs ${b}, sell Bs ${s}${when ? ` (${when})` : ''}. Same national P2P median; Cochabamba reference.`,
      descFallback:
        'Blue dollar Cochabamba: national parallel (P2P) quote as a Cochabamba reference. Updated every 15 min.',
    },
  },
  'guia-dinero': {
    es: {
      titleWith: (b, s) => `Guía de dinero Bolivia 2026 | Blue compra ${b} · venta ${s}`,
      titleFallback: 'Guía de dinero para viajeros en Bolivia 2026 | Efectivo, ATM y dólar blue',
      descWith: (b, s, when) =>
        `Guía para viajeros: efectivo, tarjetas, cajeros y dólar blue (compra Bs ${b} · venta Bs ${s}${when ? `, ${when}` : ''}). Tasas en vivo.`,
      descFallback:
        'Cómo manejar dinero en Bolivia en 2026: efectivo USD, tarjetas, cajeros y el dólar blue. Tasas en vivo desde P2P.',
    },
    en: {
      titleWith: (b, s) => `Bolivia Money Guide 2026 | Blue buy ${b} · sell ${s}`,
      titleFallback: 'Bolivia Money Guide for Travelers 2026 | Cash, ATMs & Blue Dollar',
      descWith: (b, s, when) =>
        `Traveler money guide: cash, cards, ATMs, and the blue dollar (buy Bs ${b} · sell Bs ${s}${when ? `, ${when}` : ''}). Live rates.`,
      descFallback:
        'How to handle money in Bolivia in 2026: USD cash, cards, ATMs, and the blue dollar. Live P2P rates.',
    },
  },
};

const PATH_TO_PAGE = {
  '/': 'home',
  '/dolar-blue-hoy': 'dolar-blue-hoy',
  '/bolivian-blue': 'bolivian-blue',
  '/dolar-paralelo-bolivia-en-vivo': 'dolar-paralelo',
  '/cotiza-dolar-paralelo': 'cotiza',
  '/cuanto-esta-dolar-bolivia': 'cuanto',
  '/euro-a-boliviano': 'euro',
  '/real-a-boliviano': 'real',
  '/peso-a-boliviano': 'peso',
  '/sol-a-boliviano': 'sol',
  '/peso-argentino-a-boliviano': 'peso-ars',
  '/peso-chileno-a-boliviano': 'peso-clp',
  '/dolar-blue-santa-cruz': 'santa-cruz',
  '/dolar-blue-la-paz': 'la-paz',
  '/dolar-blue-cochabamba': 'cochabamba',
  '/guia-dinero-bolivia': 'guia-dinero',
  '/bolivia-money-guide': 'guia-dinero',
};

/** Stable GA titles for routes that do not use live-rate copy. */
const STABLE_TITLES = {
  '/calculadora': {
    es: 'Calculadora USD/BOB Gratis | Actualizada Cada 15 Min - Bolivia Blue',
    en: 'Free USD/BOB Calculator | Updated Every 15 Min - Bolivia Blue',
  },
  '/datos-historicos': {
    es: 'Datos Históricos Dólar Blue Bolivia | Archivo 2024-2026',
    en: 'Bolivia Blue Dollar Historical Data | 2024-2026 Archive',
  },
  '/comparacion': {
    es: 'Dólar Blue vs. Dólar Oficial en Bolivia',
    en: 'Blue Dollar vs Official Rate in Bolivia',
  },
  '/comprar-dolares': {
    es: 'Cómo Comprar Dólares en Bolivia - Binance, El Dorado, Takenos, Meru - Bolivia Blue',
    en: 'How to Buy Dollars in Bolivia - Binance, El Dorado, Takenos, Meru - Bolivia Blue',
  },
  '/binance-p2p-bolivia': {
    es: 'Binance P2P Bolivia - Cómo Comprar y Vender USDT | Guía Completa 2026',
    en: 'Binance P2P Bolivia - How to Buy and Sell USDT | Complete Guide 2026',
  },
  '/noticias': {
    es: 'Noticias del Dólar y Tipo de Cambio en Bolivia',
    en: 'Bolivia Blue Dollar News',
  },
  '/blog': {
    es: 'Guías y Análisis del Dólar en Bolivia | BoliviaBlue',
    en: 'Blog - Guides and Analysis about Blue Dollar and Finance',
  },
  '/preguntas-frecuentes': {
    es: 'Preguntas Frecuentes Dólar Blue Bolivia | FAQ Tipo de Cambio',
    en: 'Bolivia Blue Dollar FAQ',
  },
  '/api-docs': {
    es: 'API del Dólar Blue Bolivia | Documentación Completa',
    en: 'Bolivia Blue Dollar API | Full Documentation',
  },
  '/widget': {
    es: 'Widget Gratuito Dólar Blue Bolivia | Embed en tu Sitio',
    en: 'Free Bolivia Blue Dollar Widget | Embed on Your Site',
  },
  '/prensa': {
    es: 'Prensa Bolivia Blue | Kit de medios, citas y datos',
    en: 'Bolivia Blue Press Kit | Media, quotes and data',
  },
  '/acerca-de': {
    es: 'Sobre Bolivia Blue | Metodología y transparencia del dólar paralelo',
    en: 'About Bolivia Blue | Parallel dollar methodology',
  },
  '/fuente-de-datos': {
    es: 'Metodología y Fuente de Datos | Dólar Blue Bolivia',
    en: 'Methodology and Data Source | Bolivia Blue Dollar',
  },
};

/**
 * Keep Google Analytics grouped by route, not by every 0.01 rate tick.
 * SERP titles can still include live buy/sell.
 */
export function analyticsTitleForPath(pathname, language = 'es') {
  const path = String(pathname || '/').split('?')[0] || '/';
  const lang = language === 'en' ? 'en' : 'es';
  const page = PATH_TO_PAGE[path];
  if (page && PAGE_COPY[page]) return PAGE_COPY[page][lang].titleFallback;
  const stable = STABLE_TITLES[path];
  if (stable) return stable[lang];
  return lang === 'en' ? 'Bolivia Blue' : 'Bolivia Blue';
}

/** Safety net if a live SERP title leaks into analytics. */
export function stripLiveRatesFromTitle(title) {
  return String(title || '')
    .replace(/\s*:\s*Compra\s+[0-9]+(?:\.[0-9]+)?\s*·\s*Venta\s+[0-9]+(?:\.[0-9]+)?(?:\s*\|[^]*)?/gi, '')
    .replace(/\s*:\s*Buy\s+[0-9]+(?:\.[0-9]+)?\s*·\s*Sell\s+[0-9]+(?:\.[0-9]+)?(?:\s*\|[^]*)?/gi, '')
    .replace(/\s+EN VIVO:\s+[0-9]+(?:\.[0-9]+)?\s*\/\s*[0-9]+(?:\.[0-9]+)?/gi, ' EN VIVO')
    .replace(/\s+LIVE:\s+[0-9]+(?:\.[0-9]+)?\s*\/\s*[0-9]+(?:\.[0-9]+)?/gi, ' LIVE')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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
    analyticsTitle: copy.titleFallback,
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

/** Display string for a BOB rate, or null if missing/junk (never emit fake 10.50). */
export function fmtLiveBob(n) {
  return fmt(n);
}

/**
 * Live buy/sell strings for UI and FAQ copy. Multipliers use the formatted buy
 * so $100 matches the snapshot shown in titles.
 */
export function liveBobParts(data) {
  const { buy, sell, updatedAt } = ratesFromBluePayload(data);
  const buyStr = fmt(buy);
  const sellStr = fmt(sell);
  const buyN = buyStr ? Number(buyStr) : NaN;
  return {
    buyStr,
    sellStr,
    updatedAt,
    times(mult) {
      const m = Number(mult);
      if (!Number.isFinite(buyN) || !Number.isFinite(m)) return null;
      return (buyN * m).toFixed(2);
    },
  };
}
