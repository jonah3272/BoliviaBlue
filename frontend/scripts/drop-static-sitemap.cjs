/**
 * Production /sitemap.xml is served by api/sitemap.js so lastmod stays current
 * between deploys. Vite copies public/sitemap.xml into dist; remove that copy.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../dist/sitemap.xml');
fs.rmSync(file, { force: true });
console.log('[sitemap] Removed static dist/sitemap.xml (live file is /api/sitemap)');
