import { buildDollarRateSearchCopy, DOLLAR_SEARCH_PAGES, normalizeDollarRatePayload } from './frontend/src/utils/dollarRateSearchCopy.js';
import { renderDollarRateHtml } from './seo/dollarRateSeo.js';
import { dataDocumentationPageForSearch, renderDataDocumentationHtml } from './seo/dataDocumentationSeo.js';
import { articleRequest, loadArticle, renderArticleHtml } from './seo/articleSeo.js';
import { buyGuidePageForSearch, renderBuyGuideHtml } from './seo/buyGuideSeo.js';
import { platformComparisonPageForSearch, renderPlatformComparisonHtml } from './seo/platformComparisonSeo.js';

/**
 * Vercel Edge Middleware: inject live buy/sell into homepage HTML for every visitor,
 * and into title/meta for recognized bots on selected rate landing pages.
 *
 * Homepage (/) transformation is user-agent independent so bots and browsers
 * receive the same numeric rates in the visible SEO shell before React loads.
 */

export const config = {
  // Keep this list tiny. Expanding every SEO path into 3 matcher entries
  // (40+) can fail Vercel ingest before a build starts.
  matcher: [
    '/',
    '/index.html',
    '/blog/:slug',
    '/noticias/:slug',
    '/:page(dolar-blue-hoy|bolivian-blue|dolar-paralelo-bolivia-en-vivo|cuanto-esta-dolar-bolivia|cotiza-dolar-paralelo|euro-a-boliviano|real-a-boliviano|peso-a-boliviano|sol-a-boliviano|peso-argentino-a-boliviano|peso-chileno-a-boliviano|dolar-blue-santa-cruz|dolar-blue-la-paz|dolar-blue-cochabamba|prensa|guia-dinero-bolivia|bolivia-money-guide|comprar-dolares|fuente-de-datos|datos-historicos|plataformas)',
    '/:page(dolar-blue-hoy|bolivian-blue|dolar-paralelo-bolivia-en-vivo|cuanto-esta-dolar-bolivia|cotiza-dolar-paralelo|euro-a-boliviano|real-a-boliviano|peso-a-boliviano|sol-a-boliviano|peso-argentino-a-boliviano|peso-chileno-a-boliviano|dolar-blue-santa-cruz|dolar-blue-la-paz|dolar-blue-cochabamba|prensa|guia-dinero-bolivia|bolivia-money-guide|comprar-dolares|fuente-de-datos|datos-historicos|plataformas)/',
    '/:page(dolar-blue-hoy|bolivian-blue|dolar-paralelo-bolivia-en-vivo|cuanto-esta-dolar-bolivia|cotiza-dolar-paralelo|euro-a-boliviano|real-a-boliviano|peso-a-boliviano|sol-a-boliviano|peso-argentino-a-boliviano|peso-chileno-a-boliviano|dolar-blue-santa-cruz|dolar-blue-la-paz|dolar-blue-cochabamba|prensa|guia-dinero-bolivia|bolivia-money-guide|comprar-dolares|fuente-de-datos|datos-historicos|plataformas)/index.html',
  ],
};

const BOT_RE =
  /Googlebot|Google-InspectionTool|bingbot|BingPreview|Baiduspider|YandexBot|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|SemrushBot|AhrefsBot|DotBot|Bytespider|PetalBot/i;

const SKIP_HEADER = 'x-bb-skip-live-seo';
const RATE_TIMEOUT_MS = 4000;
const HTML_TIMEOUT_MS = 4000;

/** Format a positive BOB rate for SEO. Rejects 0 / NaN so Google never sees Compra 0.00. */
export function fmt(n) {
  const x = Number(n);
  // Parallel USD/BOB is never near zero; treat junk as missing.
  if (!Number.isFinite(x) || x < 1) return null;
  return x.toFixed(2);
}

/** 1 COP is ~0.0037 BOB; SERP copy uses 1.000 COP in Bs. */
export function fmtCopThousand(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return null;
  const scaled = x * 1000;
  if (scaled < 1) return null;
  return scaled.toFixed(2);
}

export function normalizePath(pathname) {
  if (!pathname || pathname === '/index.html') return '/';
  return pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
}

export function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize /api/blue-rate JSON into validated display strings. */
export function normalizeRates(rate, path = null) {
  if (DOLLAR_SEARCH_PAGES[path]) return normalizeDollarRatePayload(rate);
  if (!rate || typeof rate !== 'object') return null;
  const buy = fmt(rate.buy_bob_per_usd ?? rate.buy);
  const sell = fmt(rate.sell_bob_per_usd ?? rate.sell);
  if (!buy || !sell) return null;

  let updatedAt = null;
  if (typeof rate.updated_at_iso === 'string' && rate.updated_at_iso.trim()) {
    const d = new Date(rate.updated_at_iso);
    if (!Number.isNaN(d.getTime())) {
      updatedAt = rate.updated_at_iso;
    }
  }

  return {
    buy,
    sell,
    updatedAt,
    isStale: rate.is_stale === true,
    buyEur: fmt(rate.buy_bob_per_eur),
    sellEur: fmt(rate.sell_bob_per_eur),
    buyBrl: fmt(rate.buy_bob_per_brl),
    sellBrl: fmt(rate.sell_bob_per_brl),
    buyCopThousand: fmtCopThousand(rate.buy_bob_per_cop),
    sellCopThousand: fmtCopThousand(rate.sell_bob_per_cop),
    buyPen: fmt(rate.buy_bob_per_pen),
    sellPen: fmt(rate.sell_bob_per_pen),
    buyArsThousand: fmtCopThousand(rate.buy_bob_per_ars),
    sellArsThousand: fmtCopThousand(rate.sell_bob_per_ars),
    buyClpThousand: fmtCopThousand(rate.buy_bob_per_clp),
    sellClpThousand: fmtCopThousand(rate.sell_bob_per_clp),
    eurUpdatedAt: (() => {
      if (typeof rate.eur_updated_at_iso !== 'string') return null;
      const d = new Date(rate.eur_updated_at_iso);
      return Number.isNaN(d.getTime()) ? null : rate.eur_updated_at_iso;
    })(),
    penUpdatedAt: (() => {
      if (typeof rate.pen_updated_at_iso !== 'string') return null;
      const d = new Date(rate.pen_updated_at_iso);
      return Number.isNaN(d.getTime()) ? null : rate.pen_updated_at_iso;
    })(),
  };
}

export function formatSnippetTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('es-BO', {
      timeZone: 'America/La_Paz',
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

export function metaForPath(path, buy, sell, updatedAt = null, isStale = false) {
  if (DOLLAR_SEARCH_PAGES[path]) return buildDollarRateSearchCopy({ page: DOLLAR_SEARCH_PAGES[path], buy, sell, updatedAt, isStale, now: Date.now() });
  if (!buy || !sell) return null;
  const when = formatSnippetTime(updatedAt);

  switch (path) {
    case '/dolar-blue-hoy':
      return {
        title: `Dólar Blue Hoy Bolivia: Compra ${buy} · Venta ${sell}`,
        description: `Dólar blue hoy en Bolivia: compra Bs ${buy} y venta Bs ${sell}. Mercado paralelo actualizado cada 15 min.`,
      };
    case '/bolivian-blue':
      return {
        title: `Bolivian Blue Today: Buy ${buy} · Sell ${sell}`,
        description: `Bolivian Blue in Bolivia: buy Bs ${buy}, sell Bs ${sell}. P2P reference quote.`,
      };
    case '/dolar-paralelo-bolivia-en-vivo':
      return {
        title: `Dólar Paralelo Bolivia EN VIVO: ${buy} / ${sell}`,
        description: `Dólar paralelo Bolivia EN VIVO: compra Bs ${buy} y venta Bs ${sell}. Cotización cada 15 min desde Binance P2P.`,
      };
    case '/cuanto-esta-dolar-bolivia':
      return {
        title: `¿Cuánto está el dólar en Bolivia? Compra ${buy} · Venta ${sell}`,
        description: `¿Cuánto está el dólar en Bolivia hoy? Blue/paralelo: compra Bs ${buy}, venta Bs ${sell}. Actualizado cada 15 min.`,
      };
    case '/cotiza-dolar-paralelo':
      return {
        title: `Cotiza el Dólar Paralelo: Compra ${buy} · Venta ${sell}`,
        description: `Cotiza el dólar paralelo en Bolivia: compra Bs ${buy}, venta Bs ${sell}. Datos cada 15 min desde Binance P2P.`,
      };
    case '/euro-a-boliviano':
      return {
        title: `Euro Blue Bolivia Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Euro blue / paralelo en Bolivia: compra Bs ${buy} y venta Bs ${sell} (derivado vía USDT). Actualizado cada 15 min.`,
      };
    case '/real-a-boliviano':
      return {
        title: `Real Blue Bolivia Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Real brasileño blue / paralelo en Bolivia: compra Bs ${buy} y venta Bs ${sell}. Actualizado cada 15 min.`,
      };
    case '/peso-a-boliviano':
      return {
        title: `Peso colombiano a boliviano: 1.000 COP ≈ ${buy} / ${sell} Bs`,
        description: `Peso colombiano (COP) a boliviano: 1.000 COP ≈ compra Bs ${buy} · venta Bs ${sell}. Derivado de USDT/COP en vivo, no un tipo inventado.`,
      };
    case '/sol-a-boliviano':
      return {
        title: `Sol peruano a boliviano: Compra ${buy} · Venta ${sell}`,
        description: `Sol peruano (PEN) a boliviano: compra Bs ${buy} y venta Bs ${sell}. Derivado de USDT/PEN en vivo, no un tipo inventado.`,
      };
    case '/peso-argentino-a-boliviano':
      return {
        title: `Peso argentino a boliviano: 1.000 ARS ≈ ${buy} / ${sell} Bs`,
        description: `Peso argentino (ARS) a boliviano: 1.000 ARS ≈ compra Bs ${buy} · venta Bs ${sell}. Derivado de USDT/ARS en vivo, no un tipo inventado.`,
      };
    case '/peso-chileno-a-boliviano':
      return {
        title: `Peso chileno a boliviano: 1.000 CLP ≈ ${buy} / ${sell} Bs`,
        description: `Peso chileno (CLP) a boliviano: 1.000 CLP ≈ compra Bs ${buy} · venta Bs ${sell}. Derivado de USDT/CLP en vivo, no un tipo inventado.`,
      };
    case '/dolar-blue-santa-cruz':
      return {
        title: `Dólar Blue Santa Cruz Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Dólar blue en Santa Cruz hoy: compra Bs ${buy}, venta Bs ${sell}. Misma mediana nacional P2P.`,
      };
    case '/dolar-blue-la-paz':
      return {
        title: `Dólar Blue La Paz Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Dólar blue en La Paz hoy: compra Bs ${buy}, venta Bs ${sell}. Misma mediana nacional P2P.`,
      };
    case '/dolar-blue-cochabamba':
      return {
        title: `Dólar Blue Cochabamba Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Dólar blue en Cochabamba hoy: compra Bs ${buy}, venta Bs ${sell}. Misma mediana nacional P2P.`,
      };
    case '/prensa':
      return {
        title: 'Prensa Bolivia Blue | Kit de medios, citas y datos',
        description: `Cita lista: dólar blue Bolivia compra Bs ${buy} · venta Bs ${sell}. CSV histórico, metodología y badge.`,
      };
    case '/guia-dinero-bolivia':
      return {
        title: `Guía de dinero Bolivia 2026 | Blue compra ${buy} · venta ${sell}`,
        description: `Guía para viajeros: efectivo, tarjetas, cajeros y dólar blue (compra Bs ${buy} · venta Bs ${sell}). Tasas en vivo, no consejos de 2024.`,
      };
    case '/bolivia-money-guide':
      return {
        title: `Bolivia Money Guide 2026 | Blue buy ${buy} · sell ${sell}`,
        description: `Traveler money guide: cash, cards, ATMs, and Bolivia’s blue dollar (buy Bs ${buy} · sell Bs ${sell}). Live rates, not leftover 2024 advice.`,
      };
    case '/':
    default:
      return {
        title: `Dólar Blue Bolivia: Compra ${buy} · Venta ${sell} | Bolivia Blue`,
        description: `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buy} para la compra y Bs ${sell} para la venta${when ? `, con lectura verificada el ${when}` : ''}, desde Bolivia Blue.`,
      };
  }
}

export function replaceMeta(html, title, description) {
  let out = html;
  const t = escapeAttr(title);
  const d = escapeAttr(description);

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${t}</title>`);
  out = out.replace(
    /<meta\s+name=["']title["']\s+content=["'][^"']*["']/i,
    `<meta name="title" content="${t}"`
  );
  out = out.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']/i,
    `<meta name="description" content="${d}"`
  );
  out = out.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']/i,
    `<meta property="og:title" content="${t}"`
  );
  out = out.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']/i,
    `<meta property="og:description" content="${d}"`
  );
  out = out.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']/i,
    `<meta name="twitter:title" content="${t}"`
  );
  out = out.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']/i,
    `<meta name="twitter:description" content="${d}"`
  );
  return out;
}

/** Replace every visible compra/venta pair so one snapshot cannot mix with a stale one. */
export function replaceAllRatePairs(html, buy, sell) {
  let out = html;
  out = out.replace(
    /compra Bs\s+[0-9]+(?:\.[0-9]+)?(\s*[·\/]\s*|\s+y\s+venta Bs\s+)[0-9]+(?:\.[0-9]+)?/gi,
    (m, sep) => {
      if (/y\s+venta/i.test(sep)) return `compra Bs ${buy} y venta Bs ${sell}`;
      if (sep.includes('/')) return `compra Bs ${buy} / ${sell}`;
      return `compra Bs ${buy} · venta Bs ${sell}`;
    }
  );
  out = out.replace(
    /Compra\s+[0-9]+(?:\.[0-9]+)?\s*·\s*Venta\s+[0-9]+(?:\.[0-9]+)?/g,
    `Compra ${buy} · Venta ${sell}`
  );
  return out;
}

function usd100FromBuy(buy) {
  const n = Number(buy);
  if (!Number.isFinite(n) || n < 1) return null;
  return String(Math.round(n * 100));
}

export function fillLiveRateSlots(html, buy, sell, updatedAt) {
  if (!html) return html;
  if (!html.includes('data-live-buy') && !html.includes('data-live-usd100')) return html;
  const when = formatSnippetTime(updatedAt);
  let out = html;
  if (buy != null) out = out.replace(/(data-live-buy[^>]*>)[^<]*/gi, `$1${buy}`);
  if (sell != null) out = out.replace(/(data-live-sell[^>]*>)[^<]*/gi, `$1${sell}`);
  const usd100 = usd100FromBuy(buy);
  if (usd100) out = out.replace(/(data-live-usd100[^>]*>)[^<]*/gi, `$1${usd100}`);
  if (updatedAt) {
    out = out.replace(/\sdatetime="[^"]*"/gi, ` datetime="${escapeAttr(updatedAt)}"`);
  }
  if (when) {
    out = out.replace(/(data-live-when[^>]*>)[^<]*/gi, `$1${when}`);
  }
  return out;
}

/** Visible intro inside data-seo-shell="home" — no new H1, keeps nav links. */
export function injectHomeShellRates(html, buy, sell, updatedAt) {
  const slotted = fillLiveRateSlots(html, buy, sell, updatedAt);
  if (slotted !== html) {
    return replaceAllRatePairs(slotted, buy, sell);
  }

  const when = formatSnippetTime(updatedAt);
  const sentence = when
    ? `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buy} para la compra y Bs ${sell} para la venta, con lectura verificada el ${when}, desde Bolivia Blue.`
    : `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buy} para la compra y Bs ${sell} para la venta, desde Bolivia Blue.`;
  const safe = escapeHtml(sentence);

  const replaced = html.replace(
    /(data-seo-shell=["']home["'][\s\S]*?<p\b[^>]*>)([\s\S]*?)(<\/p>)/i,
    `$1${safe}$3`
  );

  return replaceAllRatePairs(replaced, buy, sell);
}

export function wantsHtmlDocument(request) {
  const accept = request.headers.get('accept');
  if (!accept || accept === '*/*') return true;
  if (accept.includes('text/html')) return true;
  return false;
}

/** Search landings whose first HTML must not keep the last deploy’s rate. */
const ALWAYS_LIVE_PATHS = new Set([
  '/',
  '/dolar-blue-hoy',
  '/cuanto-esta-dolar-bolivia',
  '/bolivian-blue',
]);

export function shouldTransformPath(path, userAgent) {
  if (ALWAYS_LIVE_PATHS.has(path)) return true;
  return BOT_RE.test(userAgent || '');
}

function withTimeout(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * Apply live rates to homepage (or bot landing) HTML.
 * @returns {{ html: string, live: boolean } | null} null = leave origin response unchanged
 */
export function metaForPathEn(path, buy, sell, updatedAt = null, isStale = false) {
  if (DOLLAR_SEARCH_PAGES[path]) return buildDollarRateSearchCopy({ page: DOLLAR_SEARCH_PAGES[path], buy, sell, updatedAt, isStale, language: 'en', now: Date.now() });
  if (!buy || !sell) return null;
  switch (path) {
    case '/dolar-blue-hoy':
      return {
        title: `Blue Dollar Today Bolivia: Buy ${buy} · Sell ${sell}`,
        description: `Blue dollar today in Bolivia: buy Bs ${buy} and sell Bs ${sell}. Parallel market, updated every 15 min.`,
      };
    case '/dolar-paralelo-bolivia-en-vivo':
      return { title: `Bolivia Parallel Dollar Live: ${buy} / ${sell}`, description: `Bolivia parallel dollar: buy Bs ${buy}, sell Bs ${sell} per USD. P2P reference quote.` };
    case '/cuanto-esta-dolar-bolivia':
      return { title: `Dollar in Bolivia Today: Buy ${buy} · Sell ${sell}`, description: `Current Bolivia parallel dollar reference: buy Bs ${buy}, sell Bs ${sell}.` };
    case '/cotiza-dolar-paralelo':
      return { title: `Bolivia Parallel Dollar Quote: ${buy} / ${sell}`, description: `Parallel dollar quote in Bolivia: buy Bs ${buy}, sell Bs ${sell}.` };
    case '/bolivian-blue':
      return {
        title: `Bolivian Blue Today: Buy ${buy} · Sell ${sell}`,
        description: `Bolivian Blue in Bolivia: buy Bs ${buy}, sell Bs ${sell}. P2P reference quote.`,
      };
    case '/euro-a-boliviano':
      return {
        title: `Euro Blue Bolivia Today: Buy ${buy} · Sell ${sell}`,
        description: `Euro blue / parallel in Bolivia: buy Bs ${buy}, sell Bs ${sell} (derived via USDT). Updated every 15 min.`,
      };
    case '/real-a-boliviano':
      return {
        title: `Real Blue Bolivia Today: Buy ${buy} · Sell ${sell}`,
        description: `Brazilian real blue / parallel in Bolivia: buy Bs ${buy}, sell Bs ${sell}. Derived via USDT.`,
      };
    case '/peso-a-boliviano':
      return {
        title: `Colombian peso to boliviano: 1,000 COP ≈ ${buy} / ${sell} Bs`,
        description: `Colombian peso (COP) to boliviano: 1,000 COP ≈ buy Bs ${buy} · sell Bs ${sell}. Live USDT/COP cross, never an invented rate.`,
      };
    case '/sol-a-boliviano':
      return {
        title: `Peruvian sol to boliviano: Buy ${buy} · Sell ${sell}`,
        description: `Peruvian sol (PEN) to boliviano: buy Bs ${buy}, sell Bs ${sell}. Live USDT/PEN cross, never an invented rate.`,
      };
    case '/peso-argentino-a-boliviano':
      return {
        title: `Argentine peso to boliviano: 1,000 ARS ≈ ${buy} / ${sell} Bs`,
        description: `Argentine peso (ARS) to boliviano: 1,000 ARS ≈ buy Bs ${buy} · sell Bs ${sell}. Live USDT/ARS cross, never an invented rate.`,
      };
    case '/peso-chileno-a-boliviano':
      return {
        title: `Chilean peso to boliviano: 1,000 CLP ≈ ${buy} / ${sell} Bs`,
        description: `Chilean peso (CLP) to boliviano: 1,000 CLP ≈ buy Bs ${buy} · sell Bs ${sell}. Live USDT/CLP cross, never an invented rate.`,
      };
    case '/dolar-blue-santa-cruz':
      return {
        title: `Blue Dollar Santa Cruz Today: Buy ${buy} · Sell ${sell}`,
        description: `Blue dollar in Santa Cruz today: buy Bs ${buy}, sell Bs ${sell}. Same national P2P median.`,
      };
    case '/dolar-blue-la-paz':
      return {
        title: `Blue Dollar La Paz Today: Buy ${buy} · Sell ${sell}`,
        description: `Blue dollar in La Paz today: buy Bs ${buy}, sell Bs ${sell}. Same national P2P median.`,
      };
    case '/dolar-blue-cochabamba':
      return {
        title: `Blue Dollar Cochabamba Today: Buy ${buy} · Sell ${sell}`,
        description: `Blue dollar in Cochabamba today: buy Bs ${buy}, sell Bs ${sell}. Same national P2P median.`,
      };
    case '/prensa':
      return {
        title: 'Bolivia Blue Press | Media kit, citations & data',
        description: `Ready citation: Bolivia blue dollar buy Bs ${buy} · sell Bs ${sell}. Historical CSV, methodology and badge.`,
      };
    case '/':
    default:
      return {
        title: `Bolivian Blue | Bolivia Blue: Buy ${buy} · Sell ${sell}`,
        description: `Bolivian Blue (Bolivia Blue): buy Bs ${buy}, sell Bs ${sell}. Bolivia’s blue dollar today, P2P median.`,
      };
  }
}

/** Keep English URLs self-canonical. Do not rewrite hreflang es/x-default. */
export function withLangQuery(url, lang = 'en') {
  try {
    const u = new URL(url);
    if (lang === 'en') u.searchParams.set('lang', 'en');
    else u.searchParams.delete('lang');
    return u.toString();
  } catch {
    if (lang !== 'en') return url;
    if (/[?&]lang=en(?:&|$)/.test(url)) return url;
    return url.includes('?') ? `${url}&lang=en` : `${url}?lang=en`;
  }
}

export function applyEnglishAnnotations(html, path, pair) {
  // Dedicated translated guide URLs own their language; query strings cannot change it.
  if (path === '/guia-dinero-bolivia' || path === '/bolivia-money-guide') return html;
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const esCanon = canonMatch ? canonMatch[1] : null;
  const enCanon = esCanon ? withLangQuery(esCanon, 'en') : null;
  let out = html;
  if (enCanon) {
    out = out.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']/i,
      `<link rel="canonical" href="${escapeAttr(enCanon)}"`
    );
    out = out.replace(
      /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']/i,
      `<meta property="og:url" content="${escapeAttr(enCanon)}"`
    );
    out = out.replace(
      /<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["']/i,
      `<meta name="twitter:url" content="${escapeAttr(enCanon)}"`
    );
  }
  if (/<html[^>]*\slang=/i.test(out)) {
    out = out.replace(/<html([^>]*)\slang=["'][^"']*["']/i, '<html$1 lang="en"');
  } else {
    out = out.replace(/<html\b/i, '<html lang="en"');
  }
  out = out.replace(/<meta name="language" content="[^"]*"/i, '<meta name="language" content="English"');
  out = out.replace(/<meta property="og:locale" content="[^"]*"/i, '<meta property="og:locale" content="en_US"');
  if (pair?.buy && pair?.sell) {
    const enMeta = metaForPathEn(path, pair.buy, pair.sell, pair.updatedAt, pair.isStale);
    if (enMeta) out = replaceMeta(out, enMeta.title, enMeta.description);
  }
  // Replace the crawl shell and structured page identity too: English metadata
  // must describe visible English content, not label a Spanish shell as English.
  const fallbackTitles = {
    '/': 'Bolivia Blue | Parallel exchange rate',
    '/dolar-blue-hoy': 'Blue Dollar Today Bolivia',
    '/dolar-paralelo-bolivia-en-vivo': 'Bolivia Parallel Dollar Live',
    '/cuanto-esta-dolar-bolivia': 'Dollar Rate in Bolivia Today',
    '/cotiza-dolar-paralelo': 'Bolivia Parallel Dollar Quote',
    '/bolivian-blue': 'Bolivian Blue Exchange Rate',
    '/euro-a-boliviano': 'Euro to Boliviano',
    '/real-a-boliviano': 'Brazilian Real to Boliviano',
    '/peso-a-boliviano': 'Colombian Peso to Boliviano',
    '/sol-a-boliviano': 'Peruvian Sol to Boliviano',
    '/peso-argentino-a-boliviano': 'Argentine Peso to Boliviano',
    '/peso-chileno-a-boliviano': 'Chilean Peso to Boliviano',
    '/dolar-blue-santa-cruz': 'Blue Dollar in Santa Cruz',
    '/dolar-blue-la-paz': 'Blue Dollar in La Paz',
    '/dolar-blue-cochabamba': 'Blue Dollar in Cochabamba',
    '/prensa': 'Bolivia Blue Press | Media kit, citations and data',
  };
  const enMeta = pair?.buy && pair?.sell ? metaForPathEn(path, pair.buy, pair.sell, pair.updatedAt, pair.isStale) : {
    title: fallbackTitles[path] || 'Bolivia Blue',
    description: 'Bolivia Blue publishes reference exchange rates, historical observations and its methodology. Check the latest available quote and observation time.',
  };
  out = replaceMeta(out, enMeta.title, enMeta.description);
  out = out.replace(/<meta property="og:locale:alternate" content="[^"]*"/i, '<meta property="og:locale:alternate" content="es_BO"');
  const shell = `<main data-seo-shell="english" class="max-w-3xl mx-auto px-4 py-8"><h1>${escapeHtml(enMeta.title)}</h1><p>${escapeHtml(enMeta.description)}</p>${pair?.updatedAt ? `<p>Observation: <time datetime="${escapeAttr(pair.updatedAt)}">${escapeHtml(pair.updatedAt)}</time></p>` : ''}<nav><a href="/?lang=en">Home</a> · <a href="/dolar-blue-hoy?lang=en">Today's quote</a> · <a href="/fuente-de-datos?lang=en">Methodology</a> · <a href="/datos-historicos?lang=en">Historical data</a></nav></main>`;
  out = out.replace(/<main\b[^>]*data-seo-shell=["'][^"']*["'][^>]*>[\s\S]*?<\/main>/i, () => shell);
  out = out.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: enMeta.title, description: enMeta.description, url: enCanon, inLanguage: 'en-US', isPartOf: { '@type': 'WebSite', name: 'Bolivia Blue', url: 'https://www.boliviablue.com' } };
  out = out.replace('</head>', () => `<script type="application/ld+json" data-rh="true">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
  return DOLLAR_SEARCH_PAGES[path] ? renderDollarRateHtml(out, path, pair, 'en') : out;
}

export function applyLiveSeo(html, path, rates) {
  if (DOLLAR_SEARCH_PAGES[path]) return { html: renderDollarRateHtml(html, path, rates), live: Boolean(rates?.buy && rates?.sell), rates };
  if (!rates) return null;

  let pair = { buy: rates.buy, sell: rates.sell, updatedAt: rates.updatedAt };
  if (path === '/euro-a-boliviano') {
    if (!rates.buyEur || !rates.sellEur) return null;
    pair = {
      buy: rates.buyEur,
      sell: rates.sellEur,
      updatedAt: rates.eurUpdatedAt || rates.updatedAt,
    };
  } else if (path === '/real-a-boliviano') {
    if (!rates.buyBrl || !rates.sellBrl) return null;
    pair = { buy: rates.buyBrl, sell: rates.sellBrl, updatedAt: rates.updatedAt };
  } else if (path === '/peso-a-boliviano') {
    if (!rates.buyCopThousand || !rates.sellCopThousand) return null;
    pair = {
      buy: rates.buyCopThousand,
      sell: rates.sellCopThousand,
      updatedAt: rates.updatedAt,
    };
  } else if (path === '/sol-a-boliviano') {
    if (!rates.buyPen || !rates.sellPen) return null;
    pair = {
      buy: rates.buyPen,
      sell: rates.sellPen,
      updatedAt: rates.penUpdatedAt || rates.updatedAt,
    };
  } else if (path === '/peso-argentino-a-boliviano') {
    if (!rates.buyArsThousand || !rates.sellArsThousand) return null;
    pair = {
      buy: rates.buyArsThousand,
      sell: rates.sellArsThousand,
      updatedAt: rates.updatedAt,
    };
  } else if (path === '/peso-chileno-a-boliviano') {
    if (!rates.buyClpThousand || !rates.sellClpThousand) return null;
    pair = {
      buy: rates.buyClpThousand,
      sell: rates.sellClpThousand,
      updatedAt: rates.updatedAt,
    };
  }

  const meta = metaForPath(path, pair.buy, pair.sell, pair.updatedAt);
  if (!meta) return null;

  let out = replaceMeta(html, meta.title, meta.description);
  out = fillLiveRateSlots(out, pair.buy, pair.sell, pair.updatedAt);
  if (path === '/') {
    out = injectHomeShellRates(out, pair.buy, pair.sell, pair.updatedAt);
  } else {
    out = replaceAllRatePairs(out, pair.buy, pair.sell);
  }
  return { html: out, live: true, rates: pair };
}

export default async function middleware(request) {
  if (request.headers.get(SKIP_HEADER) === '1') {
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return;
  }

  if (!wantsHtmlDocument(request)) {
    return;
  }

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  // Editorial documentation must be useful in either locale even if all rate APIs fail.
  if (path === '/fuente-de-datos' || path === '/datos-historicos') {
    try {
      const shell = await fetch(new URL(`${path}/index.html`, url.origin), {
        headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
        signal: withTimeout(HTML_TIMEOUT_MS),
      });
      if (!shell.ok) throw new Error('Documentation shell unavailable');
      const rendered = renderDataDocumentationHtml(await shell.text(), path, url.search);
      const headers = new Headers(shell.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
      headers.delete('content-length');
      return new Response(request.method === 'HEAD' ? null : rendered, { status: 200, headers });
    } catch {
      const es = dataDocumentationPageForSearch(path, url.search).language === 'es';
      const title = es ? 'Documentación temporalmente no disponible' : 'Documentation temporarily unavailable';
      return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta name="robots" content="noindex, follow"><title>${title} | Bolivia Blue</title></head><body><h1>${title}</h1></body></html>`, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow', 'retry-after': '60' } });
    }
  }
  // Guide content is query-aware but independent of live rates and user agent.
  if (path === '/comprar-dolares') {
    try {
      const shell = await fetch(new URL('/comprar-dolares/index.html', url.origin), {
        headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
        signal: withTimeout(HTML_TIMEOUT_MS),
      });
      if (!shell.ok) throw new Error('Guide shell unavailable');
      const headers = new Headers(shell.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
      headers.delete('content-length');
      return new Response(request.method === 'HEAD' ? null : renderBuyGuideHtml(await shell.text(), url.search), { status: 200, headers });
    } catch {
      const es = buyGuidePageForSearch(url.search).language === 'es';
      const title = es ? 'Guía temporalmente no disponible' : 'Guide temporarily unavailable';
      return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta name="robots" content="noindex, follow"><title>${title} | Bolivia Blue</title></head><body><h1>${title}</h1></body></html>`, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow', 'retry-after': '60' } });
    }
  }
  // Reviewed comparison content has no live data dependency.
  if (path === '/plataformas') {
    try {
      const shell = await fetch(new URL('/plataformas/index.html', url.origin), {
        headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
        signal: withTimeout(HTML_TIMEOUT_MS),
      });
      if (!shell.ok) throw new Error('Comparison shell unavailable');
      const headers = new Headers(shell.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
      headers.delete('content-length');
      return new Response(request.method === 'HEAD' ? null : renderPlatformComparisonHtml(await shell.text(), url.search), { status: 200, headers });
    } catch {
      const es = platformComparisonPageForSearch(url.search).language === 'es';
      const title = es ? 'Comparación temporalmente no disponible' : 'Comparison temporarily unavailable';
      return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta name="robots" content="noindex, follow"><title>${title} | Bolivia Blue</title></head><body><h1>${title}</h1></body></html>`, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow', 'retry-after': '60' } });
    }
  }
  let article;
  try { article = articleRequest(path, url.search); } catch { return; }
  if (article) {
    try {
      const [content, shell] = await Promise.all([
        loadArticle(article),
        fetch(new URL(`/${article.kind}/index.html`, url.origin), {
          headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
          signal: withTimeout(HTML_TIMEOUT_MS),
        }),
      ]);
      if (!shell.ok) throw new Error('Article shell unavailable');
      const headers = new Headers(shell.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', content.status === 200 ? 'public, s-maxage=300, stale-while-revalidate=900' : 'no-store');
      headers.delete('content-length');
      if (content.status !== 200) headers.set('x-robots-tag', 'noindex, follow');
      if (content.status === 503) headers.set('retry-after', '60');
      return new Response(request.method === 'HEAD' ? null : renderArticleHtml(await shell.text(), content, article), { status: content.status, headers });
    } catch {
      return new Response(request.method === 'HEAD' ? null : '<!doctype html><html lang="es"><head><meta name="robots" content="noindex, follow"><title>Artículo temporalmente no disponible | Bolivia Blue</title></head><body><h1>Artículo temporalmente no disponible</h1><a href="/blog">Blog</a></body></html>', { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, follow', 'retry-after': '60' } });
    }
  }
  if (request.method === 'HEAD') return;
  if (path === '/blog' || path === '/noticias' || path.endsWith('/rss.xml')) return;
  const ua = request.headers.get('user-agent') || '';

  if (url.searchParams.get('lang') !== 'en' && !shouldTransformPath(path, ua)) {
    return;
  }

  try {
    const assetPath = path === '/' ? '/index.html' : `${path}/index.html`;
    const htmlUrl = new URL(assetPath, url.origin);
    const htmlRes = await fetch(htmlUrl, {
      headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
      signal: withTimeout(HTML_TIMEOUT_MS),
    });
    if (!htmlRes.ok) return;

    let rates = null;
    try {
      const rateRes = await fetch(new URL('/api/blue-rate', url.origin), {
        headers: { [SKIP_HEADER]: '1', Accept: 'application/json' },
        signal: withTimeout(RATE_TIMEOUT_MS),
      });
      if (rateRes.ok) rates = normalizeRates(await rateRes.json(), path);
    } catch { /* keep the existing snapshot on rate-service failure */ }
    const html = await htmlRes.text();
    const lang = url.searchParams.get('lang');
    let applied = applyLiveSeo(html, path, rates);
    if (!applied && lang !== 'en') return;
    applied ||= { html, live: false, rates: null };

    if (lang === 'en') {
      applied = {
        ...applied,
        html: applyEnglishAnnotations(applied.html, path, applied.rates),
      };
    }

    const headers = new Headers(htmlRes.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
    headers.set('x-bb-live-seo', applied.live ? '1' : '0');
    headers.delete('content-length');

    return new Response(applied.html, { status: 200, headers });
  } catch {
    // Timeout, network, or unexpected errors: serve static shell unchanged.
    return;
  }
}
