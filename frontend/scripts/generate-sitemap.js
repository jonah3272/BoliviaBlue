import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date in ISO format
const now = new Date();
const currentDate = now.toISOString().split('T')[0] + 'T12:00:00+00:00';

// Base URL
const baseUrl = 'https://boliviablue.com';

// Sitemap entries - ALL pages from App.jsx (Spanish URLs primary for SEO)
const pages = [
  // Core pages - Highest priority
  {
    path: '/',
    changefreq: 'hourly',
    priority: '1.0',
    lastmod: currentDate
  },
  {
    path: '/calculadora', // Spanish primary
    changefreq: 'daily',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/cuanto-esta-dolar-bolivia',
    changefreq: 'hourly',
    priority: '0.9',
    lastmod: currentDate
  },
  
  // News & Info (Spanish URLs)
  {
    path: '/noticias', // Spanish primary
    changefreq: 'hourly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/rodrigo-paz',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/acerca-de', // Spanish primary
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/contacto', // Spanish primary
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: currentDate
  },
  {
    path: '/preguntas-frecuentes', // Spanish primary
    changefreq: 'monthly',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/politica-de-privacidad', // Privacy policy
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: currentDate
  },
  
  // Blog
  {
    path: '/blog',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  },
  
  // Comparison & Education
  {
    path: '/comparacion', // Spanish primary
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/comprar-dolares', // Spanish primary (was buy-dollars)
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  },
  
  // Blue rate pages (canonical only - redirect pages removed)
  {
    path: '/bolivian-blue', // Main canonical Spanish page
    changefreq: 'hourly',
    priority: '0.95',
    lastmod: currentDate
  },
  {
    path: '/blue-dollar-bolivia', // Main canonical English page
    changefreq: 'hourly',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/cotiza-dolar-paralelo',
    changefreq: 'hourly',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/dolar-paralelo-bolivia-en-vivo',
    changefreq: 'hourly',
    priority: '0.95',
    lastmod: currentDate
  },
  
  // City-specific pages
  {
    path: '/dolar-blue-la-paz',
    changefreq: 'daily',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/dolar-blue-santa-cruz',
    changefreq: 'daily',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/dolar-blue-cochabamba',
    changefreq: 'daily',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/dolar-blue-hoy',
    changefreq: 'hourly',
    priority: '0.95',
    lastmod: currentDate
  },
  
  // Educational/Guide pages
  {
    path: '/que-es-dolar-blue',
    changefreq: 'weekly',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/cuanto-esta-dolar-bolivia',
    changefreq: 'hourly',
    priority: '0.9',
    lastmod: currentDate
  },
  
  // Crypto pages
  {
    path: '/binance-p2p-bolivia',
    changefreq: 'daily',
    priority: '0.85',
    lastmod: currentDate
  },
  {
    path: '/usdt-bolivia',
    changefreq: 'daily',
    priority: '0.85',
    lastmod: currentDate
  },
  
  // Currency conversion pages
  {
    path: '/euro-a-boliviano',
    changefreq: 'hourly',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/real-a-boliviano',
    changefreq: 'hourly',
    priority: '0.9',
    lastmod: currentDate
  },
  
  // Comparison & Banks
  {
    path: '/bancos',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: currentDate
  }
];

// Blog articles (you can extend this to fetch from Supabase if needed)
const blogArticles = [
  {
    slug: 'rodrigo-paz-impacto-mercado-cambiario',
    lastmod: '2025-11-07T12:00:00+00:00'
  },
  {
    slug: 'politicas-paz-tipo-cambio',
    lastmod: '2025-11-06T12:00:00+00:00'
  },
  {
    slug: 'dolar-blue-era-digital-binance',
    lastmod: '2025-11-05T12:00:00+00:00'
  },
  {
    slug: 'analisis-volatilidad-dolar-blue-paz',
    lastmod: '2025-11-04T12:00:00+00:00'
  },
  {
    slug: 'futuro-boliviano-perspectivas-paz',
    lastmod: '2025-11-03T12:00:00+00:00'
  }
];

// Generate sitemap XML
function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
`;

  // Add main pages
  pages.forEach(page => {
    xml += `  <!-- ${page.path === '/' ? 'Homepage / Dashboard' : page.path.charAt(1).toUpperCase() + page.path.slice(2) + ' Page'} -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}${page.path}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.path}?lang=en" />\n`;
    xml += `  </url>\n`;
    xml += `  \n`;
  });

  // Add blog articles
  blogArticles.forEach(article => {
    const articleName = article.slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    xml += `  <!-- Blog Article: ${articleName} -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${article.slug}</loc>\n`;
    xml += `    <lastmod>${article.lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/blog/${article.slug}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/blog/${article.slug}?lang=en" />\n`;
    xml += `  </url>\n`;
    xml += `  \n`;
  });

  xml += `</urlset>\n`;

  return xml;
}

// Write sitemap to public directory
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const sitemapContent = generateSitemap();

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log('✅ Sitemap generated successfully at:', sitemapPath);
console.log(`📅 Generated on: ${currentDate}`);
console.log(`📄 Total URLs: ${pages.length + blogArticles.length}`);

