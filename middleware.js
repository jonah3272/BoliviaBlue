/**
 * Vercel Edge Middleware: inject live buy/sell into homepage HTML for every visitor,
 * and into title/meta for recognized bots on selected rate landing pages.
 *
 * Homepage (/) transformation is user-agent independent so bots and browsers
 * receive the same numeric rates in the visible SEO shell before React loads.
 */

export const config = {
  matcher: [
    '/',
    '/index.html',
    '/dolar-blue-hoy',
    '/dolar-blue-hoy/',
    '/dolar-blue-hoy/index.html',
    '/dolar-paralelo-bolivia-en-vivo',
    '/dolar-paralelo-bolivia-en-vivo/',
    '/dolar-paralelo-bolivia-en-vivo/index.html',
    '/cuanto-esta-dolar-bolivia',
    '/cuanto-esta-dolar-bolivia/',
    '/cuanto-esta-dolar-bolivia/index.html',
    '/cotiza-dolar-paralelo',
    '/cotiza-dolar-paralelo/',
    '/cotiza-dolar-paralelo/index.html',
    '/euro-a-boliviano',
    '/euro-a-boliviano/',
    '/euro-a-boliviano/index.html',
    '/real-a-boliviano',
    '/real-a-boliviano/',
    '/real-a-boliviano/index.html',
    '/peso-a-boliviano',
    '/peso-a-boliviano/',
    '/peso-a-boliviano/index.html',
    '/dolar-blue-santa-cruz',
    '/dolar-blue-santa-cruz/',
    '/dolar-blue-santa-cruz/index.html',
    '/dolar-blue-la-paz',
    '/dolar-blue-la-paz/',
    '/dolar-blue-la-paz/index.html',
    '/dolar-blue-cochabamba',
    '/dolar-blue-cochabamba/',
    '/dolar-blue-cochabamba/index.html',
    '/prensa',
    '/prensa/',
    '/prensa/index.html',
    '/guia-dinero-bolivia',
    '/guia-dinero-bolivia/',
    '/guia-dinero-bolivia/index.html',
    '/bolivia-money-guide',
    '/bolivia-money-guide/',
    '/bolivia-money-guide/index.html',
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
export function normalizeRates(rate) {
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
    buyEur: fmt(rate.buy_bob_per_eur),
    sellEur: fmt(rate.sell_bob_per_eur),
    buyBrl: fmt(rate.buy_bob_per_brl),
    sellBrl: fmt(rate.sell_bob_per_brl),
    buyCopThousand: fmtCopThousand(rate.buy_bob_per_cop),
    sellCopThousand: fmtCopThousand(rate.sell_bob_per_cop),
    eurUpdatedAt: (() => {
      if (typeof rate.eur_updated_at_iso !== 'string') return null;
      const d = new Date(rate.eur_updated_at_iso);
      return Number.isNaN(d.getTime()) ? null : rate.eur_updated_at_iso;
    })(),
  };
}

export function formatSnippetTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('es-BO', {
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

export function metaForPath(path, buy, sell) {
  if (!buy || !sell) return null;

  switch (path) {
    case '/dolar-blue-hoy':
      return {
        title: `Dólar Blue Hoy Bolivia: Compra ${buy} · Venta ${sell}`,
        description: `Dólar blue hoy en Bolivia: compra Bs ${buy} y venta Bs ${sell}. Mercado paralelo actualizado cada 15 min.`,
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
        title: `Bolivia Blue | Dólar Blue Hoy: Compra ${buy} · Venta ${sell}`,
        description: `Bolivia Blue: el dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buy} para la compra y Bs ${sell} para la venta. Actualizado cada 15 min (Binance P2P).`,
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
  const whenBit = when ? ` Última lectura: ${when}.` : '';
  const sentence =
    `Dólar Blue en Bolivia hoy: compra Bs ${buy} y venta Bs ${sell}. ` +
    `Cotización de referencia P2P (USDT), no ventanilla en efectivo.${whenBit}`;
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

export function shouldTransformPath(path, userAgent) {
  if (path === '/') return true;
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
export function metaForPathEn(path, buy, sell) {
  if (!buy || !sell) return null;
  switch (path) {
    case '/dolar-blue-hoy':
      return {
        title: `Blue Dollar Today Bolivia: Buy ${buy} · Sell ${sell}`,
        description: `Blue dollar today in Bolivia: buy Bs ${buy} and sell Bs ${sell}. Parallel market, updated every 15 min.`,
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
        title: `Bolivia Blue | Blue Dollar Today: Buy ${buy} · Sell ${sell}`,
        description: `Bolivia Blue: the parallel (blue) dollar in Bolivia is Bs ${buy} to buy and Bs ${sell} to sell. Updated every 15 min (P2P USDT).`,
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
    const enMeta = metaForPathEn(path, pair.buy, pair.sell);
    if (enMeta) out = replaceMeta(out, enMeta.title, enMeta.description);
  }
  return out;
}

export function applyLiveSeo(html, path, rates) {
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
  }

  const meta = metaForPath(path, pair.buy, pair.sell);
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

  if (request.method !== 'GET') {
    return;
  }

  if (!wantsHtmlDocument(request)) {
    return;
  }

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const ua = request.headers.get('user-agent') || '';

  if (!shouldTransformPath(path, ua)) {
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

    const rateRes = await fetch(new URL('/api/blue-rate', url.origin), {
      headers: { [SKIP_HEADER]: '1', Accept: 'application/json' },
      signal: withTimeout(RATE_TIMEOUT_MS),
    });
    if (!rateRes.ok) return;

    let rate;
    try {
      rate = await rateRes.json();
    } catch {
      return;
    }

  const rates = normalizeRates(rate);
    if (!rates) return;

    const html = await htmlRes.text();
    const lang = url.searchParams.get('lang');
    let applied = applyLiveSeo(html, path, rates);
    if (!applied) return;

    if (lang === 'en') {
      applied = {
        ...applied,
        html: applyEnglishAnnotations(applied.html, path, applied.rates),
      };
    }

    const headers = new Headers(htmlRes.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
    headers.set('x-bb-live-seo', '1');
    headers.delete('content-length');

    return new Response(applied.html, { status: 200, headers });
  } catch {
    // Timeout, network, or unexpected errors: serve static shell unchanged.
    return;
  }
}
