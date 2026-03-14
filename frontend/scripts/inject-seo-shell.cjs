/**
 * SEO Phase 4/5: Inject crawlable static shell and minimal JSON-LD into built HTML.
 * Runs after `vite build`. Injects H1, intro, links, and route-specific JSON-LD so
 * crawlers see content without waiting for JS. React replaces shell on hydrate.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://boliviablue.com';

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
    isPartOf: { '@type': 'WebSite', name: 'Bolivia Blue con Paz', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'Bolivia Blue con Paz', url: BASE_URL }
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

/** Shell HTML for homepage (/) - Spanish */
const SHELL_HOME = `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="home">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Dólar Blue Bolivia – Cotización en Tiempo Real y Herramientas</h1>
    <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Tu fuente principal para el dólar blue en Bolivia: cotización cada 15 min, gráficos históricos, calculadora y noticias. Sin registro.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces principales">
      <a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
      <a href="/cuanto-esta-dolar-bolivia" class="text-blue-600 font-medium">¿Cuánto está el dólar?</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
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
  creator: { '@type': 'Organization', name: 'Bolivia Blue con Paz', url: BASE_URL },
  publisher: { '@type': 'Organization', name: 'Bolivia Blue con Paz', url: BASE_URL }
};

/** Route config: path -> { title, description, canonical, shell, getJsonLd } */
const ROUTES = {
  '/': {
    title: 'Dólar Blue Bolivia en Tiempo Real | Cotización Cada 15 Min',
    description: 'Cotización del dólar blue en Bolivia actualizada cada 15 min. Gráficos históricos, calculadora y alertas. Sin registro. Datos de Binance P2P.',
    canonical: BASE_URL + '/',
    shell: SHELL_HOME,
    getJsonLd: () => buildStaticJsonLd('/', 'Inicio', 'Dólar Blue Bolivia – Cotización en Tiempo Real', 'Tu fuente principal para el dólar blue en Bolivia: cotización cada 15 min, gráficos históricos, calculadora y noticias.', [])
  },
  '/dolar-blue-hoy': {
    title: 'Dólar Blue Hoy Bolivia | Cotización Actual Cada 15 Min',
    description: 'Cotización del dólar blue hoy en Bolivia. Precio actual actualizado cada 15 min. Mercado paralelo. Gratis y sin registro.',
    canonical: BASE_URL + '/dolar-blue-hoy',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="dolar-blue-hoy">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Cotización del Dólar Blue Hoy – Bolivia</h1>
    <p class="text-base text-gray-600">Esta es la cotización del dólar blue hoy en Bolivia, actualizada cada 15 minutos.</p>
    <nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces relacionados">
      <a href="/" class="text-blue-600 font-medium">Inicio</a>
      <a href="/cuanto-esta-dolar-bolivia" class="text-blue-600 font-medium">¿Cuánto está el dólar?</a>
      <a href="/datos-historicos" class="text-blue-600 font-medium">Datos históricos</a>
      <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
    </nav>
  </div>
</main>`.replace(/\n/g, '').trim(),
    getJsonLd: () => buildStaticJsonLd('/dolar-blue-hoy', 'Dólar Blue Hoy', 'Cotización del Dólar Blue Hoy – Bolivia', 'Esta es la cotización del dólar blue hoy en Bolivia, actualizada cada 15 minutos.', [])
  },
  '/dolar-paralelo-bolivia-en-vivo': {
    title: 'Dólar Paralelo Bolivia EN VIVO | Cotización en Tiempo Real',
    description: 'Dólar paralelo Bolivia EN VIVO. Cotización en tiempo real cada 15 min. Mercado cambiario boliviano. Ver precio ahora.',
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
    title: '¿Cuánto Está el Dólar en Bolivia? Precio Actual 2025',
    description: '¿Cuánto está el dólar en Bolivia? Precio actual del dólar blue. Cotización cada 15 min. Gráficos históricos y calculadora. Gratis.',
    canonical: BASE_URL + '/cuanto-esta-dolar-bolivia',
    shell: `
<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="cuanto-esta-dolar-bolivia">
  <div class="text-center space-y-4 mb-8">
    <h1 class="text-3xl sm:text-5xl font-bold text-gray-900">¿Cuánto Está el Dólar en Bolivia?</h1>
    <p class="text-base text-gray-600">Respuesta directa: el precio actual del dólar blue está abajo; usa la calculadora para cualquier monto.</p>
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
  }
};

function replaceMeta(html, routePath) {
  const r = ROUTES[routePath];
  if (!r) return html;
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${r.title}</title>`);
  out = out.replace(/<meta name="title" content="[^"]*"/i, `<meta name="title" content="${r.title.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${r.description.replace(/"/g, '&quot;')}"`);
  out = out.replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${r.canonical}"`);
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

function main() {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn('[inject-seo-shell] dist/index.html not found; run vite build first.');
    process.exit(0);
    return;
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
    '/datos-historicos'
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
}

main();
