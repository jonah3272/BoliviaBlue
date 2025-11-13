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

// Sitemap entries
const pages = [
  {
    path: '/',
    changefreq: 'hourly',
    priority: '1.0',
    lastmod: currentDate
  },
  {
    path: '/calculator',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/buy-dollars',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/news',
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
    path: '/about',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/faq',
    changefreq: 'monthly',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/blog',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate
  },
  {
    path: '/bolivia-blue-rate',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: currentDate
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: '0.6',
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

