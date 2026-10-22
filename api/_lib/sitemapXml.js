/**
 * Sitemap XML. Only verified significant edits get lastmod.
 * A request or deployment is not evidence that the underlying rates changed.
 */

const BASE = 'https://www.boliviablue.com';

// Set lastmod only for a verified significant edit; ordinary deploys must not bump it.
// The methodology gained a reproducible source-composition example on 2026-10-10.
const PAGES = [
  { path: '/', lastmod: '2026-10-22', changefreq: 'hourly', priority: '1.0' },
  { path: '/comparar-qr-tarjeta', lastmod: '2026-10-22', changefreq: 'monthly', priority: '0.9' },
  { path: '/efectivo-o-tarjeta-bolivia', lastmod: '2026-10-22', changefreq: 'daily', priority: '0.9' },
  { path: '/dolar-blue-hoy', changefreq: 'hourly', priority: '1.0' },
  { path: '/bolivian-blue', changefreq: 'hourly', priority: '0.95' },
  { path: '/calculadora', changefreq: 'daily', priority: '0.9' },
  { path: '/cuanto-esta-dolar-bolivia', changefreq: 'hourly', priority: '0.85' },
  { path: '/cotiza-dolar-paralelo', changefreq: 'hourly', priority: '0.85' },
  { path: '/que-es-dolar-blue', changefreq: 'weekly', priority: '0.85' },
  { path: '/dolar-blue-la-paz', changefreq: 'hourly', priority: '0.85' },
  { path: '/dolar-blue-santa-cruz', lastmod: '2026-10-22', changefreq: 'hourly', priority: '0.85' },
  { path: '/dolar-blue-cochabamba', changefreq: 'hourly', priority: '0.85' },
  { path: '/noticias', changefreq: 'hourly', priority: '0.85' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/datos-historicos', changefreq: 'daily', priority: '0.9' },
  { path: '/comparacion', changefreq: 'weekly', priority: '0.8' },
  { path: '/comprar-dolares', changefreq: 'weekly', priority: '0.85' },
  { path: '/plataformas', changefreq: 'weekly', priority: '0.85' },
  { path: '/binance-p2p-bolivia', changefreq: 'daily', priority: '0.85' },
  { path: '/usdt-bolivia', changefreq: 'daily', priority: '0.85' },
  { path: '/euro-a-boliviano', changefreq: 'hourly', priority: '0.95' },
  { path: '/real-a-boliviano', changefreq: 'hourly', priority: '0.9' },
  { path: '/peso-a-boliviano', changefreq: 'hourly', priority: '0.9' },
  { path: '/sol-a-boliviano', changefreq: 'hourly', priority: '0.9' },
  { path: '/peso-argentino-a-boliviano', changefreq: 'hourly', priority: '0.9' },
  { path: '/peso-chileno-a-boliviano', changefreq: 'hourly', priority: '0.9' },
  { path: '/bancos', changefreq: 'monthly', priority: '0.75' },
  { path: '/preguntas-frecuentes', changefreq: 'monthly', priority: '0.85' },
  { path: '/fuente-de-datos', lastmod: '2026-10-10', changefreq: 'monthly', priority: '0.75' },
  { path: '/api-docs', changefreq: 'monthly', priority: '0.75' },
  { path: '/widget', changefreq: 'monthly', priority: '0.9' },
  { path: '/prensa', lastmod: '2026-10-22', changefreq: 'monthly', priority: '0.9' },
  { path: '/guia-dinero-bolivia', changefreq: 'weekly', priority: '0.9' },
  { path: '/bolivia-money-guide', changefreq: 'weekly', priority: '0.9' },
  { path: '/publicitar', changefreq: 'monthly', priority: '0.85' },
  { path: '/acerca-de', changefreq: 'monthly', priority: '0.85' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.65' },
  { path: '/terminos', changefreq: 'monthly', priority: '0.55' },
  { path: '/politica-de-privacidad', changefreq: 'monthly', priority: '0.55' },
];

const BLOG = [
  { path: '/blog/guia-comprar-dolares-binance-p2p', lastmod: '2025-11-13T12:00:00+00:00' },
  { path: '/blog/que-es-usdt-tether-guia-completa', lastmod: '2025-11-12T12:00:00+00:00' },
  { path: '/blog/estrategias-proteger-ahorros-volatilidad', lastmod: '2025-11-11T12:00:00+00:00' },
  { path: '/blog/historia-dolar-blue-bolivia-2020-2025', lastmod: '2025-11-10T12:00:00+00:00' },
  { path: '/blog/por-que-se-llama-dolar-blue-origen', lastmod: '2025-01-26T12:00:00+00:00' },
];

function urlEntry(locPath, lastmod, changefreq, priority) {
  const basePath = locPath.split('?')[0];
  const isGuide = ['/guia-dinero-bolivia', '/bolivia-money-guide'].includes(basePath);
  const esPath = isGuide ? '/guia-dinero-bolivia' : basePath;
  const enPath = isGuide ? '/bolivia-money-guide' : `${basePath}?lang=en`;
  // Blog translations use different slugs; do not invent query-string translations.
  const alternates = locPath.startsWith('/blog/') ? '' : `
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}${esPath}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${enPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${esPath}" />`;
  return `  <url>
    <loc>${BASE}${locPath}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}\
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>
`;
}

function buildSitemapXml() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

`;
  for (const page of PAGES) {
    xml += urlEntry(page.path, page.lastmod, page.changefreq, page.priority);
    if (page.path === '/efectivo-o-tarjeta-bolivia') xml += urlEntry(`${page.path}?lang=en`, page.lastmod, page.changefreq, page.priority);
  }
  for (const article of BLOG) {
    xml += urlEntry(article.path, article.lastmod, 'monthly', '0.7');
  }
  xml += '</urlset>\n';
  return xml;
}

module.exports = {
  BASE,
  PAGES,
  BLOG,
  buildSitemapXml,
};
