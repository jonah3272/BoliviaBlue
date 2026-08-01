/**
 * Vercel Edge Middleware: inject live buy/sell into <title> / meta description
 * for crawlers so Google snippets stay fresh without waiting for a redeploy.
 *
 * Humans get the normal static HTML; React Helmet still updates rates client-side.
 */

export const config = {
  matcher: [
    '/',
    '/index.html',
    '/dolar-blue-hoy',
    '/dolar-blue-hoy/index.html',
    '/dolar-paralelo-bolivia-en-vivo',
    '/dolar-paralelo-bolivia-en-vivo/index.html',
    '/cuanto-esta-dolar-bolivia',
    '/cuanto-esta-dolar-bolivia/index.html',
    '/cotiza-dolar-paralelo',
    '/cotiza-dolar-paralelo/index.html',
  ],
};

const BOT_RE =
  /Googlebot|Google-InspectionTool|bingbot|BingPreview|Baiduspider|YandexBot|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|SemrushBot|AhrefsBot|DotBot|Bytespider|PetalBot/i;

const SKIP_HEADER = 'x-bb-skip-live-seo';

function fmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(2) : null;
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/index.html') return '/';
  return pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
}

function metaForPath(path, buy, sell) {
  const b = fmt(buy);
  const s = fmt(sell);
  if (!b || !s) return null;

  switch (path) {
    case '/dolar-blue-hoy':
      return {
        title: `Dólar Blue Hoy Bolivia: Compra ${b} · Venta ${s}`,
        description: `Dólar blue hoy en Bolivia: compra Bs ${b} y venta Bs ${s}. Mercado paralelo actualizado cada 15 min.`,
      };
    case '/dolar-paralelo-bolivia-en-vivo':
      return {
        title: `Dólar Paralelo Bolivia EN VIVO: ${b} / ${s}`,
        description: `Dólar paralelo Bolivia EN VIVO: compra Bs ${b} y venta Bs ${s}. Cotización cada 15 min desde Binance P2P.`,
      };
    case '/cuanto-esta-dolar-bolivia':
      return {
        title: `¿Cuánto está el dólar en Bolivia? Compra ${b} · Venta ${s}`,
        description: `¿Cuánto está el dólar en Bolivia hoy? Blue/paralelo: compra Bs ${b}, venta Bs ${s}. Actualizado cada 15 min.`,
      };
    case '/cotiza-dolar-paralelo':
      return {
        title: `Cotiza el Dólar Paralelo: Compra ${b} · Venta ${s}`,
        description: `Cotiza el dólar paralelo en Bolivia: compra Bs ${b}, venta Bs ${s}. Datos cada 15 min desde Binance P2P.`,
      };
    case '/':
    default:
      return {
        title: `Dólar Blue Bolivia Hoy: Compra ${b} · Venta ${s}`,
        description: `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${b} para la compra y Bs ${s} para la venta. Actualizado cada 15 min (Binance P2P).`,
      };
  }
}

function replaceMeta(html, title, description) {
  let out = html;
  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');

  const t = esc(title);
  const d = esc(description);

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

export default async function middleware(request) {
  if (request.headers.get(SKIP_HEADER) === '1') {
    return;
  }

  const ua = request.headers.get('user-agent') || '';
  if (!BOT_RE.test(ua)) {
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return;
  }

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  try {
    const assetPath = path === '/' ? '/index.html' : `${path}/index.html`;
    const htmlUrl = new URL(assetPath, url.origin);
    const htmlRes = await fetch(htmlUrl, {
      headers: { [SKIP_HEADER]: '1', Accept: 'text/html' },
    });
    if (!htmlRes.ok) return;

    const rateRes = await fetch(new URL('/api/blue-rate', url.origin), {
      headers: { [SKIP_HEADER]: '1', Accept: 'application/json' },
    });
    if (!rateRes.ok) return;

    const rate = await rateRes.json();
    const meta = metaForPath(
      path,
      rate.buy_bob_per_usd ?? rate.buy,
      rate.sell_bob_per_usd ?? rate.sell
    );
    if (!meta) return;

    let html = await htmlRes.text();
    html = replaceMeta(html, meta.title, meta.description);

    const headers = new Headers(htmlRes.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'public, s-maxage=300, stale-while-revalidate=900');
    headers.set('x-bb-live-seo', '1');
    headers.delete('content-length');

    return new Response(html, { status: 200, headers });
  } catch {
    return;
  }
}
