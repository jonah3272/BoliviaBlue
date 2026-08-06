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

  return { buy, sell, updatedAt };
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
    case '/':
    default:
      return {
        title: `Dólar Blue Bolivia Hoy: Compra ${buy} · Venta ${sell}`,
        description: `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buy} para la compra y Bs ${sell} para la venta. Actualizado cada 15 min (Binance P2P).`,
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

/** Visible intro inside data-seo-shell="home" — no new H1, keeps nav links. */
export function injectHomeShellRates(html, buy, sell, updatedAt) {
  const when = formatSnippetTime(updatedAt);
  const whenBit = when ? ` Última lectura: ${when}.` : '';
  const sentence =
    `Dólar Blue en Bolivia hoy: compra Bs ${buy} y venta Bs ${sell}. ` +
    `Cotización actualizada con datos del mercado paralelo.${whenBit}`;
  const safe = escapeHtml(sentence);

  const replaced = html.replace(
    /(data-seo-shell=["']home["'][\s\S]*?<p\b[^>]*>)([\s\S]*?)(<\/p>)/i,
    `$1${safe}$3`
  );

  // If the shell marker/paragraph was missing, leave HTML unchanged (caller treats as no-op success for meta-only).
  return replaced;
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
export function applyLiveSeo(html, path, rates) {
  if (!rates) return null;
  const meta = metaForPath(path, rates.buy, rates.sell);
  if (!meta) return null;

  let out = replaceMeta(html, meta.title, meta.description);
  if (path === '/') {
    out = injectHomeShellRates(out, rates.buy, rates.sell, rates.updatedAt);
  }
  return { html: out, live: true };
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
    const applied = applyLiveSeo(html, path, rates);
    if (!applied) return;

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
