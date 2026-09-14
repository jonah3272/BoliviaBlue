/**
 * SEO Phase 4/5: Inject crawlable static shell and minimal JSON-LD into built HTML.
 * Runs after `vite build`. Injects H1, intro, links, and route-specific JSON-LD so
 * crawlers see content without waiting for JS. React replaces shell on hydrate.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DIST = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://www.boliviablue.com';
const RATE_API = process.env.BUILD_RATE_API_URL || `${BASE_URL}/api/blue-rate`;
const RATE_FETCH_RETRIES = 3;
const RATE_FETCH_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBuySell(payload) {
  if (!payload || typeof payload !== 'object') {
    return { buy: null, sell: null, updatedAt: null, buyEur: null, sellEur: null, buyBrl: null, sellBrl: null };
  }
  const buy = payload.buy_bob_per_usd ?? payload.buy ?? null;
  const sell = payload.sell_bob_per_usd ?? payload.sell ?? null;
  const updatedAt = payload.updated_at_iso ?? payload.t ?? null;
  return {
    buy,
    sell,
    updatedAt,
    buyEur: payload.buy_bob_per_eur ?? null,
    sellEur: payload.sell_bob_per_eur ?? null,
    buyBrl: payload.buy_bob_per_brl ?? null,
    sellBrl: payload.sell_bob_per_brl ?? null,
    eurUpdatedAt: payload.eur_updated_at_iso ?? updatedAt,
  };
}

/** Fetch live USD/BOB with retries; optional BUILD_RATE_BUY/SELL env fallback for CI. */
async function fetchLiveRate() {
  const envBuy = process.env.BUILD_RATE_BUY;
  const envSell = process.env.BUILD_RATE_SELL;
  if (envBuy && envSell) {
    const buy = Number(envBuy);
    const sell = Number(envSell);
    if (fmtRate(buy) && fmtRate(sell)) {
      return { buy, sell, updatedAt: new Date().toISOString(), source: 'env', buyEur: null, sellEur: null, buyBrl: null, sellBrl: null };
    }
  }

  let lastErr;
  for (let attempt = 1; attempt <= RATE_FETCH_RETRIES; attempt += 1) {
    try {
      const payload = await fetchJson(RATE_API);
      const { buy, sell, updatedAt } = extractBuySell(payload);
      if (fmtRate(buy) && fmtRate(sell)) {
        return {
          buy,
          sell,
          updatedAt,
          buyEur: payload.buy_bob_per_eur ?? null,
          sellEur: payload.sell_bob_per_eur ?? null,
          buyBrl: payload.buy_bob_per_brl ?? null,
          sellBrl: payload.sell_bob_per_brl ?? null,
          eurUpdatedAt: payload.eur_updated_at_iso ?? updatedAt,
          source: 'api',
        };
      }
      lastErr = new Error('Rate payload missing valid buy/sell');
    } catch (err) {
      lastErr = err;
    }
    if (attempt < RATE_FETCH_RETRIES) {
      await sleep(RATE_FETCH_DELAY_MS);
    }
  }
  throw lastErr || new Error('Could not fetch live rate');
}

function fetchJson(url, timeoutMs = 8000, redirectHops = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      const code = res.statusCode || 0;
      if ([301, 302, 307, 308].includes(code) && res.headers.location) {
        if (redirectHops >= 5) {
          reject(new Error('Too many redirects'));
          res.resume();
          return;
        }
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume();
        fetchJson(next, timeoutMs, redirectHops + 1).then(resolve).catch(reject);
        return;
      }
      if (code >= 400) {
        reject(new Error(`HTTP ${code}`));
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

function fmtRate(n) {
  const x = Number(n);
  // Never bake Compra 0.00 into static shells for Google.
  if (!Number.isFinite(x) || x < 1) return null;
  return x.toFixed(2);
}

function formatSnippetTime(iso) {
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

function usd100FromBuy(buy) {
  const n = Number(buy);
  if (!Number.isFinite(n) || n < 1) return null;
  return String(Math.round(n * 100));
}

function fillLiveRateSlots(html, buy, sell, updatedAt) {
  if (!html) return html;
  if (!html.includes('data-live-buy') && !html.includes('data-live-usd100')) return html;
  const when = formatSnippetTime(updatedAt);
  let out = html;
  if (buy != null) out = out.replace(/(data-live-buy[^>]*>)[^<]*/gi, `$1${buy}`);
  if (sell != null) out = out.replace(/(data-live-sell[^>]*>)[^<]*/gi, `$1${sell}`);
  const usd100 = usd100FromBuy(buy);
  if (usd100) out = out.replace(/(data-live-usd100[^>]*>)[^<]*/gi, `$1${usd100}`);
  if (updatedAt) {
    out = out.replace(/\sdatetime="[^"]*"/gi, ` datetime="${updatedAt}"`);
  }
  if (when) {
    out = out.replace(/(data-live-when[^>]*>)[^<]*/gi, `$1${when}`);
  }
  return out;
}

/** Apply live buy/sell into static meta + shell so crawlers see numbers without JS. */
function applyLiveRatesToRoutes(buy, sell, updatedAt, extra = {}) {
  const b = fmtRate(buy);
  const s = fmtRate(sell);
  if (!b || !s) return false;
  const when = formatSnippetTime(updatedAt);
  const whenBit = when ? `, lectura ${when}` : '';

  const home = ROUTES['/'];
  home.title = `Dólar Blue Bolivia Hoy: Compra ${b} · Venta ${s}`;
  home.description = `Lectura verificada: el dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${b} para la compra y Bs ${s} para la venta${whenBit}. Mediana multi-plataforma P2P (USDT).`;
  home.shell = fillLiveRateSlots(home.shell, b, s, updatedAt);

  const hoy = ROUTES['/dolar-blue-hoy'];
  if (hoy) {
    hoy.title = `Dólar Blue Hoy Bolivia: Compra ${b} · Venta ${s}`;
    hoy.description = `Dólar blue hoy en Bolivia: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Referencia P2P USDT, actualizada cada 15 min.`;
    hoy.shell = fillLiveRateSlots(hoy.shell, b, s, updatedAt);
  }

  const vivo = ROUTES['/dolar-paralelo-bolivia-en-vivo'];
  if (vivo) {
    vivo.title = `Dólar Paralelo Bolivia EN VIVO: ${b} / ${s}`;
    vivo.description = `Dólar paralelo Bolivia EN VIVO: compra Bs ${b} y venta Bs ${s}${when ? ` (${when})` : ''}. Cotización cada 15 min desde P2P USDT.`;
    vivo.shell = fillLiveRateSlots(vivo.shell, b, s, updatedAt);
  }

  const cuanto = ROUTES['/cuanto-esta-dolar-bolivia'];
  if (cuanto) {
    cuanto.title = `¿Cuánto está el dólar en Bolivia? Compra ${b} · Venta ${s}`;
    cuanto.description = `¿Cuánto está el dólar en Bolivia hoy? Blue/paralelo: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Actualizado cada 15 min.`;
    cuanto.shell = fillLiveRateSlots(cuanto.shell, b, s, updatedAt);
  }

  const cotiza = ROUTES['/cotiza-dolar-paralelo'];
  if (cotiza) {
    cotiza.title = `Cotiza el Dólar Paralelo: Compra ${b} · Venta ${s}`;
    cotiza.description = `Cotiza el dólar paralelo en Bolivia: compra Bs ${b}, venta Bs ${s}${when ? ` (${when})` : ''}. Datos cada 15 min desde P2P USDT.`;
    cotiza.shell = fillLiveRateSlots(cotiza.shell, b, s, updatedAt);
  }

  const santa = ROUTES['/dolar-blue-santa-cruz'];
  if (santa) {
    santa.title = `Dólar Blue Santa Cruz Hoy: Compra ${b} · Venta ${s}`;
    santa.description = `Dólar blue en Santa Cruz hoy: compra Bs ${b}, venta Bs ${s}. Misma mediana nacional P2P.`;
    santa.shell = fillLiveRateSlots(santa.shell, b, s, updatedAt);
  }
  const lapaz = ROUTES['/dolar-blue-la-paz'];
  if (lapaz) {
    lapaz.title = `Dólar Blue La Paz Hoy: Compra ${b} · Venta ${s}`;
    lapaz.description = `Dólar blue en La Paz hoy: compra Bs ${b}, venta Bs ${s}. Misma mediana nacional P2P.`;
    lapaz.shell = fillLiveRateSlots(lapaz.shell, b, s, updatedAt);
  }
  const cba = ROUTES['/dolar-blue-cochabamba'];
  if (cba) {
    cba.title = `Dólar Blue Cochabamba Hoy: Compra ${b} · Venta ${s}`;
    cba.description = `Dólar blue en Cochabamba hoy: compra Bs ${b}, venta Bs ${s}. Misma mediana nacional P2P.`;
    cba.shell = fillLiveRateSlots(cba.shell, b, s, updatedAt);
  }

  const prensa = ROUTES['/prensa'];
  if (prensa) {
    prensa.description = `Cita lista: dólar blue Bolivia compra Bs ${b} · venta Bs ${s}. CSV histórico, metodología y badge.`;
    prensa.shell = fillLiveRateSlots(prensa.shell, b, s, updatedAt);
  }

  const eurB = fmtRate(extra.buyEur);
  const eurS = fmtRate(extra.sellEur);
  const euro = ROUTES['/euro-a-boliviano'];
  if (euro && eurB && eurS) {
    euro.title = `Euro Blue Bolivia Hoy: Compra ${eurB} · Venta ${eurS}`;
    euro.description = `Euro blue / paralelo en Bolivia: compra Bs ${eurB} y venta Bs ${eurS}. Derivado vía USDT (no es una cotización de ventanilla).`;
    euro.shell = fillLiveRateSlots(euro.shell, eurB, eurS, extra.eurUpdatedAt || updatedAt);
  }

  const brlB = fmtRate(extra.buyBrl);
  const brlS = fmtRate(extra.sellBrl);
  const real = ROUTES['/real-a-boliviano'];
  if (real && brlB && brlS) {
    real.title = `Real Blue Bolivia Hoy: Compra ${brlB} · Venta ${brlS}`;
    real.description = `Real brasileño blue / paralelo en Bolivia: compra Bs ${brlB} y venta Bs ${brlS}. Derivado vía USDT.`;
    real.shell = fillLiveRateSlots(real.shell, brlB, brlS, updatedAt);
  }

  return true;
}

/** Helper: build minimal WebPage + BreadcrumbList for a route */
function buildStaticJsonLd(routePath, routeName, pageName, pageDescription, extraSchemas = []) {
  const canonical = BASE_URL + routePath;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageName,
    description: pageDescription,
    url: canonical,
    inLanguage: routePath === '/bolivian-blue' ? 'en-US' : 'es-BO',
    isPartOf: { '@type': 'WebSite', name: 'Bolivia Blue', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE_URL }
  };
  const breadcrumbItems = [{ name: routePath === '/' ? 'Inicio' : 'Home', url: '/' }];
  if (routePath !== '/') breadcrumbItems.push({ name: routeName, url: routePath });
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: BASE_URL + item.url
    }))
  };
  return [webPage, breadcrumb, ...extraSchemas];
}

/** Shell HTML for homepage (/) - Spanish — one rate snapshot, no duplicate "today" figures */
const SHELL_HOME = `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="home">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Dólar Blue Bolivia Hoy</h1>
    <p class="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
      Compra <span data-live-buy>—</span> · Venta <span data-live-sell>—</span>
    </p>
    <p class="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto" data-seo-rate-sentence>
      Precio del dólar hoy en Bolivia (blue / paralelo / mercado negro de referencia P2P):
      Compra = Bs para obtener 1 USD en P2P (USDT). Venta = Bs al vender 1 USD.
      No es ventanilla en efectivo ni el tipo oficial del BCB.
      Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia).
    </p>
    <p class="text-lg font-semibold text-gray-800">
      100 USD ≈ <span data-live-usd100>—</span> Bs (compra P2P).
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces principales">
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/prensa" class="text-blue-600 font-medium">Prensa</a>
      <a href="/fuente-de-datos" class="text-blue-600 font-medium">Fuente de datos</a>
      <a href="/binance-p2p-bolivia" class="text-blue-600 font-medium">Binance P2P</a>
      <a href="/euro-a-boliviano" class="text-blue-600 font-medium">Euro blue</a>
    </nav>
    <nav class="flex flex-wrap justify-center gap-3 mt-3" aria-label="Cotización por ciudad">
      <a href="/dolar-blue-santa-cruz" class="text-blue-600 font-medium">Santa Cruz</a>
      <a href="/dolar-blue-la-paz" class="text-blue-600 font-medium">La Paz</a>
      <a href="/dolar-blue-cochabamba" class="text-blue-600 font-medium">Cochabamba</a>
    </nav>
    <nav class="flex flex-wrap justify-center gap-3 mt-3" aria-label="Bolivia Blue">
      <a href="/acerca-de" class="text-blue-600 font-medium">Sobre Bolivia Blue</a>
      <a href="/publicitar" class="text-blue-600 font-medium">Publicitar en Bolivia Blue</a>
      <a href="/blog" class="text-blue-600 font-medium">Blog</a>
      <a href="/terminos" class="text-blue-600 font-medium">Términos y Condiciones</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim();

/** Dataset schema for /datos-historicos (aligned with static shell text) */
const DATASET_DATOS = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Historical Blue Dollar Exchange Rate Data – Bolivia',
  description: 'Archive of blue dollar USD/BOB buy and sell quotes from 2024 to present. Same source as the live quote, updated every 15 minutes. Chart and table show trends and averages by period.',
  url: BASE_URL + '/datos-historicos',
  inLanguage: 'es-BO',
  datePublished: '2024-01-01',
  temporalCoverage: '2024-01-01/..',
  variableMeasured: { '@type': 'PropertyValue', name: 'USD/BOB blue dollar exchange rate' },
  creator: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE_URL },
  publisher: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE_URL },
  distribution: [
    { '@type': 'DataDownload', contentUrl: BASE_URL + '/api/historical-data.csv?range=30d', encodingFormat: 'text/csv', name: 'CSV últimos 30 días' },
    { '@type': 'DataDownload', contentUrl: BASE_URL + '/api/historical-data.json?range=30d', encodingFormat: 'application/json', name: 'JSON últimos 30 días' }
  ]
};

/** Route config: path -> { title, description, canonical, shell, getJsonLd } */
const ROUTES = {
  '/': {
    title: 'Bolivia Blue | Dólar Blue Hoy, cotización P2P',
    description: 'Bolivia Blue: dólar blue Bolivia hoy, compra y venta de referencia P2P (USDT). Gráficos, calculadora y noticias. Gratis, sin registro.',
    canonical: BASE_URL + '/',
    shell: SHELL_HOME,
    getJsonLd: () => buildStaticJsonLd('/', 'Inicio', 'Dólar Blue Bolivia Hoy', 'Dólar blue Bolivia hoy: compra y venta de referencia P2P (USDT), actualizadas cada 15 min.', [])
  },
  '/dolar-blue-hoy': {
    title: 'Dólar Blue Hoy Bolivia | Precio Actualizado Ahora',
    description: 'Dólar blue hoy en Bolivia: precio de compra y venta actualizado cada 15 min. Cotización del mercado paralelo, gratis y sin registro.',
    canonical: BASE_URL + '/dolar-blue-hoy',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-blue-hoy">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Cotización del Dólar Blue Hoy – Bolivia</h1>
    <p class="text-base text-gray-600">Cotización del dólar blue hoy: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Referencia P2P (USDT).</p>
    <p class="text-sm text-gray-700 max-w-2xl mx-auto">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). Metodología: <a href="/fuente-de-datos">fuente de datos</a>.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/euro-a-boliviano" class="text-blue-600 font-medium">Euro blue</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-blue-hoy', 'Dólar Blue Hoy', 'Cotización del Dólar Blue Hoy – Bolivia', 'Esta es la cotización del dólar blue hoy en Bolivia, actualizada cada 15 minutos.', [])
  },
  '/dolar-paralelo-bolivia-en-vivo': {
    title: 'Dólar Paralelo Bolivia EN VIVO | Cotización Ahora',
    description: 'Dólar paralelo Bolivia EN VIVO: cotización del mercado cambiario actualizada cada 15 min. Ver precio de compra y venta ahora.',
    canonical: BASE_URL + '/dolar-paralelo-bolivia-en-vivo',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-paralelo-bolivia-en-vivo">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Dólar Paralelo Bolivia EN VIVO</h1>
    <p class="text-base text-gray-600">Cotización del dólar paralelo Bolivia EN VIVO. Actualizamos cada 15 minutos con datos de Binance P2P.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/cuanto-esta-dolar-bolivia" class="text-blue-600 font-medium">¿Cuánto está el dólar?</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-paralelo-bolivia-en-vivo', 'Dólar Paralelo Bolivia EN VIVO', 'Dólar Paralelo Bolivia EN VIVO', 'Cotización del dólar paralelo Bolivia EN VIVO. Actualizamos cada 15 minutos con datos de Binance P2P.', [])
  },
  '/cuanto-esta-dolar-bolivia': {
    title: '¿Cuánto Está el Dólar en Bolivia Hoy? Precio Actual',
    description: '¿Cuánto está el dólar en Bolivia hoy? Precio actual del dólar blue (paralelo), actualizado cada 15 min. Calculadora y gráficos incluidos.',
    canonical: BASE_URL + '/cuanto-esta-dolar-bolivia',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="cuanto-esta-dolar-bolivia">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">¿Cuánto Está el Dólar en Bolivia?</h1>
    <p class="text-base text-gray-600">Precio del dólar hoy (blue / paralelo / mercado negro de referencia P2P): compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs. 100 USD ≈ <span data-live-usd100>—</span> Bs. No es ventanilla ni BCB. Usá la calculadora para cualquier monto.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/cuanto-esta-dolar-bolivia', '¿Cuánto Está el Dólar?', '¿Cuánto Está el Dólar en Bolivia?', 'Respuesta directa: el precio actual del dólar blue está abajo; usa la calculadora para cualquier monto.', [])
  },
  '/bolivian-blue': {
    title: 'Bolivian Blue | Bolivia Blue Dollar Exchange Rate',
    description: 'Bolivian Blue: real-time Bolivia blue dollar exchange rate. Updated every 15 min. Charts, calculator and news. Bolivian parallel market.',
    canonical: BASE_URL + '/bolivian-blue',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="bolivian-blue">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Bolivian Blue – Bolivia Blue Dollar Exchange Rate</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">This page is for readers looking for the Bolivia blue dollar rate in English. The Bolivian Blue is the parallel market rate used by millions in Bolivia; we update it every 15 minutes.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Related links">
      <a href="/" class="text-blue-600 font-medium">Home</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Blue dollar today</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Historical data</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculator</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/bolivian-blue', 'Bolivian Blue', 'Bolivian Blue – Bolivia Blue Dollar Exchange Rate', 'This page is for readers looking for the Bolivia blue dollar rate in English. The Bolivian Blue is the parallel market rate used by millions in Bolivia; we update it every 15 minutes.', [])
  },
  '/que-es-dolar-blue': {
    title: '¿Qué es el Dólar Blue? Guía 2025 – Bolivia y Latinoamérica',
    description: '¿Qué es el dólar blue? Guía completa sobre el dólar blue en Bolivia. Explicación del mercado paralelo, cómo funciona, diferencia con el dólar oficial. Actualizado cada 15 minutos. Gratis.',
    canonical: BASE_URL + '/que-es-dolar-blue',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="que-es-dolar-blue">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">¿Qué es el Dólar Blue?</h1>
    <p class="text-base text-gray-600">Guía completa sobre el dólar blue en Bolivia: qué es, cómo funciona y por qué es importante.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/que-es-dolar-blue', '¿Qué es el Dólar Blue?', '¿Qué es el Dólar Blue?', 'Guía completa sobre el dólar blue en Bolivia: qué es, cómo funciona y por qué es importante.', [])
  },
  '/datos-historicos': {
    title: 'Datos Históricos Dólar Blue Bolivia | Archivo 2024-2025',
    description: 'Archivo de datos históricos del dólar blue en Bolivia. Promedios, máximos, mínimos y tendencias desde 2024. Misma fuente que la cotización en vivo.',
    canonical: BASE_URL + '/datos-historicos',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="datos-historicos">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Datos Históricos del Dólar Blue</h1>
    <p class="text-base text-gray-600">Archivo de cotizaciones pasadas para analizar tendencias. Datos desde 2024.</p>
    <p class="text-sm text-gray-500 max-w-2xl mx-auto">El gráfico y la tabla muestran compra, venta y promedio por período. Los datos provienen de la misma fuente que la cotización en vivo (actualización cada 15 min).</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Cotización actual</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
      <a href="/que-es-dolar-blue" class="text-blue-600 font-medium">¿Qué es el dólar blue?</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/datos-historicos', 'Datos Históricos', 'Datos Históricos del Dólar Blue', 'Archivo de cotizaciones pasadas para analizar tendencias. El gráfico y la tabla muestran compra, venta y promedio por período. Misma fuente que la cotización en vivo (cada 15 min).', [DATASET_DATOS])
  },
  '/cotiza-dolar-paralelo': {
    title: 'Cotiza el Dólar Paralelo en Bolivia | Cotización en Tiempo Real',
    description: 'Cotiza el dólar paralelo en Bolivia con datos cada 15 min. Cotización del dólar blue, tipo de cambio paralelo y precio actual. Gratis y sin registro.',
    canonical: BASE_URL + '/cotiza-dolar-paralelo',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="cotiza-dolar-paralelo">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Cotiza el Dólar Paralelo en Bolivia</h1>
    <p class="text-base text-gray-600">Cotización del dólar paralelo (dólar blue): compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Actualizada cada 15 minutos con datos P2P (USDT).</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/dolar-paralelo-bolivia-en-vivo" class="text-blue-600 font-medium">Dólar paralelo en vivo</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/cotiza-dolar-paralelo', 'Cotiza Dólar Paralelo', 'Cotiza el Dólar Paralelo en Bolivia', 'Cotización del dólar paralelo (dólar blue) actualizada cada 15 minutos con datos de Binance P2P.', [])
  },
  '/preguntas-frecuentes': {
    title: 'Preguntas Frecuentes Dólar Blue Bolivia | FAQ Tipo de Cambio',
    description: 'Preguntas frecuentes sobre el dólar blue en Bolivia. Qué es, cómo funciona, Binance P2P, diferencia con el oficial y más. Guía actualizada.',
    canonical: BASE_URL + '/preguntas-frecuentes',
    shell: `
<main class="max-w-4xl mx-auto px-4 py-8" data-seo-shell="preguntas-frecuentes">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Preguntas Frecuentes sobre el Dólar Blue</h1>
    <p class="text-base text-gray-600">Respuestas claras sobre el tipo de cambio paralelo en Bolivia: qué es el dólar blue, cómo se calcula y dónde ver la cotización actual.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Cotización actual</a>
      <a href="/que-es-dolar-blue" class="text-blue-600 font-medium">¿Qué es el dólar blue?</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => {
      const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: '¿Qué es el dólar blue en Bolivia?', acceptedAnswer: { '@type': 'Answer', text: 'El dólar blue es el tipo de cambio del dólar estadounidense en el mercado paralelo boliviano, fuera del tipo oficial del Banco Central.' } },
          { '@type': 'Question', name: '¿Cada cuánto se actualiza la cotización?', acceptedAnswer: { '@type': 'Answer', text: 'En Bolivia Blue la cotización se actualiza cada 15 minutos con datos de ofertas públicas en Binance P2P (USDT/BOB).' } },
          { '@type': 'Question', name: '¿De dónde salen los datos?', acceptedAnswer: { '@type': 'Answer', text: 'Procesamos ofertas de compra y venta en Binance P2P y calculamos la mediana para estimar el precio del mercado paralelo.' } }
        ]
      };
      return buildStaticJsonLd('/preguntas-frecuentes', 'Preguntas Frecuentes', 'Preguntas Frecuentes sobre el Dólar Blue', 'Respuestas claras sobre el tipo de cambio paralelo en Bolivia.', [faq]);
    }
  },
  '/comparacion': {
    title: 'Dólar Blue vs. Dólar Oficial en Bolivia',
    description: 'Compara el dólar blue con el tipo de cambio oficial del BCB y consulta las diferencias entre ambas cotizaciones en Bolivia.',
    canonical: BASE_URL + '/comparacion',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="comparacion">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Dólar Blue vs. Dólar Oficial</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">Compara el dólar blue (mercado paralelo) con el tipo de cambio oficial del Banco Central de Bolivia (BCB) y entiende la diferencia entre ambas cotizaciones.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/fuente-de-datos" class="text-blue-600 font-medium">Metodología</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd(
      '/comparacion',
      'Comparación',
      'Dólar Blue vs. Dólar Oficial',
      'Compara el dólar blue con el tipo de cambio oficial del BCB y consulta las diferencias entre ambas cotizaciones en Bolivia.',
      []
    )
  },
  '/calculadora': {
    title: 'Calculadora de Dólares a Bolivianos | BoliviaBlue',
    description: 'Convierte dólares a bolivianos y bolivianos a dólares utilizando las cotizaciones disponibles del mercado paralelo y oficial.',
    canonical: BASE_URL + '/calculadora',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="calculadora">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Calculadora de Dólares a Bolivianos</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">Convierte entre dólares estadounidenses (USD) y bolivianos (BOB) usando las cotizaciones de referencia del mercado paralelo y oficial disponibles en la plataforma.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/comparacion" class="text-blue-600 font-medium">Comparación</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd(
      '/calculadora',
      'Calculadora',
      'Calculadora de Dólares a Bolivianos',
      'Convierte dólares a bolivianos y bolivianos a dólares utilizando las cotizaciones disponibles del mercado paralelo y oficial.',
      []
    )
  },
  '/blog': {
    title: 'Blog | Bolivia Blue',
    description: 'Consulta guías, análisis y explicaciones sobre el dólar blue, el tipo de cambio y el mercado cambiario en Bolivia.',
    canonical: BASE_URL + '/blog',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="blog">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Blog</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">Guías y análisis sobre el dólar blue, el tipo de cambio y el mercado cambiario en Bolivia.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/noticias" class="text-blue-600 font-medium">Noticias</a>
      <a href="/comparacion" class="text-blue-600 font-medium">Comparación</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd(
      '/blog',
      'Blog',
      'Guías y Análisis',
      'Consulta guías, análisis y explicaciones sobre el dólar blue, el tipo de cambio y el mercado cambiario en Bolivia.',
      []
    )
  },
  '/noticias': {
    title: 'Noticias del Dólar y Tipo de Cambio en Bolivia',
    description: 'Consulta noticias y actualizaciones sobre el dólar, el tipo de cambio y el mercado cambiario en Bolivia.',
    canonical: BASE_URL + '/noticias',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="noticias">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Noticias del Dólar en Bolivia</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">Noticias y actualizaciones sobre el dólar, el tipo de cambio y el mercado cambiario en Bolivia.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/blog" class="text-blue-600 font-medium">Blog</a>
      <a href="/comparacion" class="text-blue-600 font-medium">Comparación</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd(
      '/noticias',
      'Noticias',
      'Noticias del Dólar en Bolivia',
      'Consulta noticias y actualizaciones sobre el dólar, el tipo de cambio y el mercado cambiario en Bolivia.',
      []
    )
  },
  '/euro-a-boliviano': {
    title: 'Euro Blue Bolivia | EUR a BOB (Mercado Paralelo)',
    description: 'Euro blue en Bolivia: EUR a BOB derivado vía USDT en P2P. Cotización, conversor y metodología. No es tipo oficial ni de ventanilla.',
    canonical: BASE_URL + '/euro-a-boliviano',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="euro-a-boliviano">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Euro Blue Bolivia – EUR a BOB</h1>
    <p class="text-base text-gray-700 max-w-2xl mx-auto">Euro blue hoy: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por EUR. Derivado vía USDT (P2P), no es una cotización de efectivo observada directamente.</p>
    <p class="text-sm text-gray-600">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). <a href="/fuente-de-datos">Metodología</a> · <a href="/calculadora">Calculadora</a></p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Dólar blue</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/real-a-boliviano" class="text-blue-600 font-medium">Real a boliviano</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/euro-a-boliviano', 'Euro a Boliviano', 'Euro Blue Bolivia – EUR a BOB', 'Euro blue en Bolivia derivado vía USDT. No es tipo oficial ni de ventanilla.', [])
  },
  '/real-a-boliviano': {
    title: 'Real Blue Bolivia | BRL a BOB (Mercado Paralelo)',
    description: 'Real brasileño blue en Bolivia: BRL a BOB derivado vía USDT en P2P. Cotización y conversiones de referencia.',
    canonical: BASE_URL + '/real-a-boliviano',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="real-a-boliviano">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Real Blue Bolivia – BRL a BOB</h1>
    <p class="text-base text-gray-700 max-w-2xl mx-auto">Real blue hoy: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por BRL. Derivado vía USDT, no es una cotización de ventanilla.</p>
    <p class="text-sm text-gray-600">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). <a href="/fuente-de-datos">Metodología</a></p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/euro-a-boliviano" class="text-blue-600 font-medium">Euro blue</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/real-a-boliviano', 'Real a Boliviano', 'Real Blue Bolivia – BRL a BOB', 'Real brasileño blue en Bolivia derivado vía USDT.', [])
  },
  '/prensa': {
    title: 'Prensa Bolivia Blue | Kit de medios, citas y datos',
    description: 'Recursos gratis para periodistas: cómo citar el dólar blue, badge SVG, widget embed, CSV histórico y metodología.',
    canonical: BASE_URL + '/prensa',
    shell: `
<main class="max-w-3xl mx-auto px-4 py-8" data-seo-shell="prensa">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Kit de prensa y backlinks</h1>
    <p class="text-base text-gray-700 max-w-2xl mx-auto">Cita lista para medios: el dólar blue (paralelo) en Bolivia cotiza hoy compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Lectura: <time data-live-when datetime="">—</time>. 100 USD ≈ <span data-live-usd100>—</span> Bs (compra P2P, no efectivo ni BCB).</p>
    <p class="text-sm text-gray-600 max-w-2xl mx-auto">CSV 30 días: <a href="/api/historical-data.csv?range=30d" class="text-blue-600 font-medium">descargar CSV</a>. Metodología: <a href="/fuente-de-datos" class="text-blue-600 font-medium">fuente de datos</a>. Widget: <a href="/widget" class="text-blue-600 font-medium">embed</a>. Iframe: <a href="/embed.html" class="text-blue-600 font-medium">embed.html</a>.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/api-docs" class="text-blue-600 font-medium">API</a>
      <a href="/fuente-de-datos" class="text-blue-600 font-medium">Metodología</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/prensa', 'Prensa', 'Kit de prensa Bolivia Blue', 'Recursos para periodistas: citas, badge, widget y datos históricos del dólar blue.', [])
  },
  '/api-docs': {
    title: 'API del Dólar Blue Bolivia | Documentación Completa',
    description: 'Documentación de la API gratuita del dólar blue en Bolivia: tasas actuales, histórico y noticias vía REST.',
    canonical: BASE_URL + '/api-docs',
    shell: `
<main class="max-w-5xl mx-auto px-4 py-8" data-seo-shell="api-docs">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">API del Dólar Blue Bolivia</h1>
    <p class="text-base text-gray-600 max-w-2xl mx-auto">API REST para tasas P2P de referencia (USDT/BOB), histórico y noticias. Sin autenticación para el endpoint público de cotización.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/prensa" class="text-blue-600 font-medium">Prensa</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/api-docs', 'API', 'API del Dólar Blue Bolivia', 'Documentación de la API pública de cotización del dólar blue.', [])
  },
  '/dolar-blue-santa-cruz': {
    title: 'Dólar Blue Santa Cruz Hoy | Paralelo Bolivia',
    description: 'Dólar blue en Santa Cruz: misma mediana nacional P2P (USDT), usada como referencia local. Actualizada cada 15 min.',
    canonical: BASE_URL + '/dolar-blue-santa-cruz',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-blue-santa-cruz">
  <h1 class="text-3xl font-bold text-gray-900">Dólar Blue Santa Cruz Hoy</h1>
  <p class="text-base text-gray-600 mt-3">Referencia del paralelo para Santa Cruz: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Misma mediana nacional P2P, no es un precio de ventanilla local.</p>
  <p class="text-sm text-gray-700 mt-2">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). <a href="/fuente-de-datos">Metodología</a>.</p>
  <nav class="flex flex-wrap gap-3 mt-4" aria-label="Enlaces"><a href="/" class="text-blue-600">Inicio</a><a href="/dolar-blue-hoy" class="text-blue-600">Dólar blue hoy</a><a href="/calculadora" class="text-blue-600">Calculadora</a><a href="/dolar-blue-la-paz" class="text-blue-600">La Paz</a><a href="/dolar-blue-cochabamba" class="text-blue-600">Cochabamba</a></nav>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-blue-santa-cruz', 'Dólar blue Santa Cruz', 'Dólar Blue Santa Cruz Hoy', 'Cotización paralela nacional como referencia para Santa Cruz.', [])
  },
  '/dolar-blue-la-paz': {
    title: 'Dólar Blue La Paz Hoy | Paralelo Bolivia',
    description: 'Dólar blue en La Paz: misma mediana nacional P2P (USDT), usada como referencia local. Actualizada cada 15 min.',
    canonical: BASE_URL + '/dolar-blue-la-paz',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-blue-la-paz">
  <h1 class="text-3xl font-bold text-gray-900">Dólar Blue La Paz Hoy</h1>
  <p class="text-base text-gray-600 mt-3">Referencia del paralelo para La Paz: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Misma mediana nacional P2P, no es un precio de ventanilla local.</p>
  <p class="text-sm text-gray-700 mt-2">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). <a href="/fuente-de-datos">Metodología</a>.</p>
  <nav class="flex flex-wrap gap-3 mt-4" aria-label="Enlaces"><a href="/" class="text-blue-600">Inicio</a><a href="/dolar-blue-hoy" class="text-blue-600">Dólar blue hoy</a><a href="/calculadora" class="text-blue-600">Calculadora</a><a href="/dolar-blue-santa-cruz" class="text-blue-600">Santa Cruz</a><a href="/dolar-blue-cochabamba" class="text-blue-600">Cochabamba</a></nav>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-blue-la-paz', 'Dólar blue La Paz', 'Dólar Blue La Paz Hoy', 'Cotización paralela nacional como referencia para La Paz.', [])
  },
  '/dolar-blue-cochabamba': {
    title: 'Dólar Blue Cochabamba Hoy | Paralelo Bolivia',
    description: 'Dólar blue en Cochabamba: misma mediana nacional P2P (USDT), usada como referencia local. Actualizada cada 15 min.',
    canonical: BASE_URL + '/dolar-blue-cochabamba',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-blue-cochabamba">
  <h1 class="text-3xl font-bold text-gray-900">Dólar Blue Cochabamba Hoy</h1>
  <p class="text-base text-gray-600 mt-3">Referencia del paralelo para Cochabamba: compra <span data-live-buy>—</span> · venta <span data-live-sell>—</span> Bs por USD. Misma mediana nacional P2P, no es un precio de ventanilla local.</p>
  <p class="text-sm text-gray-700 mt-2">Lectura: <time data-live-when datetime="">—</time> (hora de Bolivia). <a href="/fuente-de-datos">Metodología</a>.</p>
  <nav class="flex flex-wrap gap-3 mt-4" aria-label="Enlaces"><a href="/" class="text-blue-600">Inicio</a><a href="/dolar-blue-hoy" class="text-blue-600">Dólar blue hoy</a><a href="/calculadora" class="text-blue-600">Calculadora</a><a href="/dolar-blue-santa-cruz" class="text-blue-600">Santa Cruz</a><a href="/dolar-blue-la-paz" class="text-blue-600">La Paz</a></nav>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-blue-cochabamba', 'Dólar blue Cochabamba', 'Dólar Blue Cochabamba Hoy', 'Cotización paralela nacional como referencia para Cochabamba.', [])
  }
};

function englishAlternateUrl(canonical) {
  if (!canonical) return canonical;
  if (/[?&]lang=en(?:&|$)/.test(canonical)) return canonical;
  return canonical.includes('?') ? `${canonical}&lang=en` : `${canonical}?lang=en`;
}

function upsertHreflang(html, esUrl, enUrl) {
  let out = html;
  if (/rel="alternate" hreflang="es"/i.test(out)) {
    out = out.replace(/<link rel="alternate" hreflang="es" href="[^"]*"/i, `<link rel="alternate" hreflang="es" href="${esUrl}"`);
    out = out.replace(/<link rel="alternate" hreflang="en" href="[^"]*"/i, `<link rel="alternate" hreflang="en" href="${enUrl}"`);
    out = out.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"/i, `<link rel="alternate" hreflang="x-default" href="${esUrl}"`);
    return out;
  }
  return out.replace(
    /(<link rel="canonical" href="[^"]*"\s*\/?>)/i,
    `$1\n    <link rel="alternate" hreflang="es" href="${esUrl}" />\n    <link rel="alternate" hreflang="en" href="${enUrl}" />\n    <link rel="alternate" hreflang="x-default" href="${esUrl}" />`
  );
}

function replaceMeta(html, routePath) {
  const r = ROUTES[routePath];
  if (!r) return html;
  const enUrl = englishAlternateUrl(r.canonical);
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${r.title}</title>`);
  out = out.replace(/<meta name="title" content="[^"]*"/i, `<meta name="title" content="${r.title.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${r.description.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${r.canonical}"`);
  out = upsertHreflang(out, r.canonical, enUrl);
  out = out.replace(/<meta property="og:title" content="[^"]*"/i, `<meta property="og:title" content="${r.title.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta property="og:description" content="[^"]*"/i, `<meta property="og:description" content="${r.description.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta property="og:url" content="[^"]*"/i, `<meta property="og:url" content="${r.canonical}"`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*"/i, `<meta name="twitter:title" content="${r.title.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*"/i, `<meta name="twitter:description" content="${r.description.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta name="twitter:url" content="[^"]*"/i, `<meta name="twitter:url" content="${r.canonical}"`);
  return out;
}

function injectRootShell(html, shell) {
  const rootOpen = '<div id="root">';
  const rootClose = '</div>';
  const emptyRoot = rootOpen + rootClose;
  const withShell = rootOpen + shell + rootClose;
  return html.replace(emptyRoot, withShell);
}

/** Insert route-specific JSON-LD script(s) before </head>. Minimal; React may add more after hydrate. */
function injectStaticJsonLd(html, routePath) {
  const r = ROUTES[routePath];
  if (!r || !r.getJsonLd) return html;
  const schemas = r.getJsonLd();
  const scripts = schemas.map((s) => '<script type="application/ld+json">' + JSON.stringify(s) + '</script>').join('\n    ');
  return html.replace('</head>', '    <!-- SEO Phase 5: static JSON-LD for crawlability -->\n    ' + scripts + '\n  </head>');
}

async function main() {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn('[inject-seo-shell] dist/index.html not found; run vite build first.');
    process.exit(0);
    return;
  }

  try {
    const live = await fetchLiveRate();
    const ok = applyLiveRatesToRoutes(live.buy, live.sell, live.updatedAt, {
      buyEur: live.buyEur,
      sellEur: live.sellEur,
      buyBrl: live.buyBrl,
      sellBrl: live.sellBrl,
      eurUpdatedAt: live.eurUpdatedAt,
    });
    if (ok) {
      console.log(`[inject-seo-shell] Injected live buy/sell into SEO meta + shells (${live.source})`);
    } else {
      console.warn('[inject-seo-shell] Rate payload missing buy/sell; using static meta');
    }
  } catch (err) {
    console.warn('[inject-seo-shell] Could not fetch live rate (using static meta):', err.message);
  }

  const originalHtml = fs.readFileSync(indexPath, 'utf8');

  // 1) Home (/) – inject shell + static JSON-LD into root index
  const home = ROUTES['/'];
  let homeHtml = replaceMeta(originalHtml, '/');
  homeHtml = injectRootShell(homeHtml, home.shell);
  homeHtml = injectStaticJsonLd(homeHtml, '/');
  fs.writeFileSync(indexPath, homeHtml, 'utf8');
  console.log('[inject-seo-shell] Injected SEO shell + JSON-LD for / into dist/index.html');

  // 2) Other routes – write dist/<path>/index.html with route-specific meta, shell, and JSON-LD
  const otherPaths = [
    '/dolar-blue-hoy',
    '/dolar-paralelo-bolivia-en-vivo',
    '/cuanto-esta-dolar-bolivia',
    '/bolivian-blue',
    '/que-es-dolar-blue',
    '/datos-historicos',
    '/cotiza-dolar-paralelo',
    '/preguntas-frecuentes',
    '/comparacion',
    '/calculadora',
    '/blog',
    '/noticias',
    '/euro-a-boliviano',
    '/real-a-boliviano',
    '/prensa',
    '/api-docs',
  ];
  for (const routePath of otherPaths) {
    const r = ROUTES[routePath];
    if (!r) continue;
    let routeHtml = replaceMeta(originalHtml, routePath);
    routeHtml = injectRootShell(routeHtml, r.shell);
    routeHtml = injectStaticJsonLd(routeHtml, routePath);
    const dir = path.join(DIST, routePath.slice(1));
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, 'index.html');
    fs.writeFileSync(outPath, routeHtml, 'utf8');
    console.log(`[inject-seo-shell] Wrote ${outPath}`);
  }

  const extraSpa = [
    ['/acerca-de', 'Sobre Bolivia Blue', 'Qué es Bolivia Blue, metodología y transparencia del dólar paralelo.'],
    ['/publicitar', 'Publicitar en Bolivia Blue', 'Opciones de publicidad en Bolivia Blue.'],
    ['/contacto', 'Contacto Bolivia Blue', 'Contacto y consultas sobre el dólar blue en Bolivia.'],
    ['/politica-de-privacidad', 'Política de privacidad', 'Política de privacidad de Bolivia Blue.'],
    ['/terminos', 'Términos y Condiciones', 'Términos y condiciones de uso de Bolivia Blue.'],
    ['/correcciones', 'Correcciones', 'Cómo reportar un error en Bolivia Blue.'],
    ['/politica-editorial', 'Política editorial', 'Política editorial de Bolivia Blue.'],
    ['/equipo', 'Equipo Bolivia Blue', 'Quién publica Bolivia Blue.'],
    ['/comprar-dolares', 'Cómo comprar dólares en Bolivia', 'Guía para comprar dólares con Binance P2P en Bolivia.'],
    ['/bancos', 'Dólar en bancos de Bolivia', 'Tipo de cambio oficial y bancos en Bolivia.'],
    ['/plataformas', 'Plataformas P2P en Bolivia', 'Plataformas P2P usadas para la referencia del paralelo.'],
    ['/fuente-de-datos', 'Fuente de datos del dólar blue', 'Metodología: mediana P2P USDT/BOB, no ventanilla.'],
    ['/widget', 'Widget del dólar blue', 'Embebí la cotización de Bolivia Blue en tu sitio.'],
    ['/binance-p2p-bolivia', 'Binance P2P Bolivia', 'Cómo usar Binance P2P para el paralelo en Bolivia.'],
    ['/usdt-bolivia', 'USDT en Bolivia', 'USDT como referencia del dólar paralelo en Bolivia.'],
    ['/unsubscribe', 'Darse de baja', 'Cancelar suscripción de alertas de Bolivia Blue.'],
    ['/chat', 'Comunidad Bolivia Blue', 'Comentarios y comunidad sobre el dólar blue.'],
  ];
  for (const [routePath, title, description] of extraSpa) {
    const slug = routePath.slice(1);
    const shell = `<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="${slug}"><h1 class="text-3xl font-bold text-gray-900">${title}</h1><p class="text-base text-gray-600 mt-3">${description}</p><nav class="flex flex-wrap gap-3 mt-4" aria-label="Enlaces"><a href="/" class="text-blue-600">Inicio</a><a href="/dolar-blue-hoy" class="text-blue-600">Dólar blue hoy</a><a href="/euro-a-boliviano" class="text-blue-600">Euro blue</a></nav></main>`;
    ROUTES[routePath] = {
      title,
      description,
      canonical: BASE_URL + routePath,
      shell,
      getJsonLd: () => buildStaticJsonLd(routePath, title, title, description, []),
    };
    let routeHtml = replaceMeta(originalHtml, routePath);
    routeHtml = injectRootShell(routeHtml, shell);
    routeHtml = injectStaticJsonLd(routeHtml, routePath);
    const dir = path.join(DIST, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), routeHtml, 'utf8');
    console.log(`[inject-seo-shell] Wrote extra SPA shell ${routePath}`);
  }

  const notFoundShell = `<main class="max-w-3xl mx-auto px-4 py-16 text-center" data-seo-shell="404"><h1 class="text-3xl font-bold text-gray-900">Página no encontrada</h1><p class="text-gray-600 mt-3">Esa URL no existe. Volvé al inicio o a la cotización del dólar blue hoy.</p><nav class="flex flex-wrap justify-center gap-3 mt-6"><a href="/" class="text-blue-600">Inicio</a><a href="/dolar-blue-hoy" class="text-blue-600">Dólar blue hoy</a><a href="/euro-a-boliviano" class="text-blue-600">Euro blue</a></nav></main>`;
  let notFoundHtml = originalHtml
    .replace(/<title>[^<]*<\/title>/i, '<title>Página no encontrada | Bolivia Blue</title>')
    .replace(/<meta name="description" content="[^"]*"/i, '<meta name="description" content="La página que buscás no existe en Bolivia Blue."')
    .replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${BASE_URL}/404"`)
    .replace(/<meta name="robots" content="[^"]*"/i, '<meta name="robots" content="noindex, follow"');
  notFoundHtml = injectRootShell(notFoundHtml, notFoundShell);
  fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml, 'utf8');
  console.log('[inject-seo-shell] Wrote dist/404.html');
}

module.exports = {
  BASE_URL,
  ROUTES,
  replaceMeta,
  injectRootShell,
  injectStaticJsonLd,
  buildStaticJsonLd,
  fetchLiveRate,
  applyLiveRatesToRoutes,
  fmtRate,
  fillLiveRateSlots,
  main
};

if (require.main === module) {
  main().catch((err) => {
    console.error('[inject-seo-shell] Fatal:', err);
    process.exit(1);
  });
}