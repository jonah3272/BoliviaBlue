import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildSitemapXml, PAGES, BLOG } = require('../../api/_lib/sitemapXml.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const xml = buildSitemapXml(new Date());
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log('✅ Sitemap generated at:', sitemapPath);
console.log(`📅 pages=${PAGES.length} · blog=${BLOG.length} · total=${PAGES.length + BLOG.length}`);
