import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articlesEs } from '../src/data/blogArticles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const now = new Date();
const currentDate = now.toISOString().split('T')[0] + 'T12:00:00+00:00';
const baseUrl = 'https://boliviablue.com';

const pages = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/calculadora', changefreq: 'daily', priority: '0.9' },
  { path: '/cuanto-esta-dolar-bolivia', changefreq: 'hourly', priority: '0.95' },
  { path: '/dolar-blue-hoy', changefreq: 'hourly', priority: '0.95' },
  { path: '/dolar-paralelo-bolivia-en-vivo', changefreq: 'hourly', priority: '0.95' },
  { path: '/cotiza-dolar-paralelo', changefreq: 'hourly', priority: '0.9' },
  { path: '/bolivian-blue', changefreq: 'hourly', priority: '0.9' },
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
  { path: '/bancos', changefreq: 'monthly', priority: '0.75' },
  { path: '/preguntas-frecuentes', changefreq: 'monthly', priority: '0.85' },
  { path: '/fuente-de-datos', changefreq: 'monthly', priority: '0.75' },
  { path: '/api-docs', changefreq: 'monthly', priority: '0.75' },
  { path: '/widget', changefreq: 'monthly', priority: '0.9' },
  { path: '/prensa', changefreq: 'monthly', priority: '0.9' },
  { path: '/rodrigo-paz', changefreq: 'weekly', priority: '0.8' },
  { path: '/acerca-de', changefreq: 'monthly', priority: '0.7' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.65' },
  { path: '/politica-de-privacidad', changefreq: 'monthly', priority: '0.5' },
];

function urlEntry(locPath, { lastmod = currentDate, changefreq = 'weekly', priority = '0.7' } = {}) {
  return `  <url>
    <loc>${baseUrl}${locPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}${locPath}" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${locPath}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${locPath}" />
  </url>
`;
}

function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

`;

  for (const page of pages) {
    xml += urlEntry(page.path, {
      lastmod: currentDate,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  const blogSlugs = (articlesEs || [])
    .map((a) => ({
      slug: a.slug,
      lastmod: a.date ? `${a.date}T12:00:00+00:00` : currentDate,
    }))
    .filter((a) => a.slug);

  for (const article of blogSlugs) {
    xml += urlEntry(`/blog/${article.slug}`, {
      lastmod: article.lastmod,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  xml += `</urlset>\n`;
  return { xml, pageCount: pages.length, blogCount: blogSlugs.length };
}

const { xml, pageCount, blogCount } = generateSitemap();
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log('✅ Sitemap generated at:', sitemapPath);
console.log(`📅 ${currentDate} · pages=${pageCount} · blog=${blogCount} · total=${pageCount + blogCount}`);
