/**
 * Sitemap XML. Rate pages get today's lastmod on every request.
 * Pages that do not change daily keep a stable date so Google can trust lastmod.
 */

const BASE = 'https://www.boliviablue.com';
const STABLE_LASTMOD = '2026-09-26T12:00:00+00:00';

const PAGES = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/dolar-blue-hoy', changefreq: 'hourly', priority: '1.0' },
  { path: '/bolivian-blue', changefreq: 'hourly', priority: '0.95' },
  { path: '/calculadora', changefreq: 'daily', priority: '0.9' },
  { path: '/cuanto-esta-dolar-bolivia', changefreq: 'hourly', priority: '0.85' },
  { path: '/dolar-paralelo-bolivia-en-vivo', changefreq: 'hourly', priority: '0.75' },
  { path: '/cotiza-dolar-paralelo', changefreq: 'hourly', priority: '0.85' },
  { path: '/que-es-dolar-blue', changefreq: 'weekly', priority: '0.85' },
  { path: '/dolar-blue-la-paz', changefreq: 'hourly', priority: '0.85' },
  { path: '/dolar-blue-santa-cruz', changefreq: 'hourly', priority: '0.85' },
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
  { path: '/fuente-de-datos', changefreq: 'monthly', priority: '0.75' },
  { path: '/api-docs', changefreq: 'monthly', priority: '0.75' },
  { path: '/widget', changefreq: 'monthly', priority: '0.9' },
  { path: '/prensa', changefreq: 'monthly', priority: '0.9' },
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

function liveLastmod(date) {
  const d = date instanceof Date ? date : new Date();
  return d.toISOString().slice(0, 10) + 'T12:00:00+00:00';
}

function urlEntry(locPath, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${BASE}${locPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}${locPath}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${locPath}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${locPath}" />
  </url>
`;
}

function buildSitemapXml(date = new Date()) {
  const today = liveLastmod(date);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

`;
  for (const page of PAGES) {
    const fresh = page.changefreq === 'hourly' || page.changefreq === 'daily';
    xml += urlEntry(page.path, fresh ? today : STABLE_LASTMOD, page.changefreq, page.priority);
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
