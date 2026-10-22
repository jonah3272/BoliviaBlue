const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { buildSitemapXml, PAGES, BLOG } = require('./_lib/sitemapXml');

function lastmodFor(xml, pagePath) {
  const entry = xml.split('<url>').find((part) => part.includes(`<loc>https://www.boliviablue.com${pagePath}</loc>`));
  return entry?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
}

describe('sitemap xml', () => {
  it('keeps verified editorial dates stable across later requests and rebuilds', () => {
    for (const now of ['2026-10-08T18:00:00Z', '2026-10-09T02:00:00Z', '2027-01-01T00:00:00Z']) {
      const xml = buildSitemapXml(new Date(now));
      for (const pagePath of ['/fuente-de-datos', '/prensa']) {
        assert.equal(lastmodFor(xml, pagePath), pagePath === '/fuente-de-datos' ? '2026-10-10' : '2026-10-22');
      }
      assert.equal(lastmodFor(xml, '/terminos'), undefined);
      assert.equal(lastmodFor(xml, '/api-docs'), undefined);
    }
  });

  it('keeps the checked-in fallback consistent with the editorial dates', () => {
    const fallback = readFileSync(path.join(__dirname, '../frontend/public/sitemap.xml'), 'utf8');
    for (const page of PAGES.filter((page) => page.lastmod)) {
      assert.equal(lastmodFor(fallback, page.path), page.lastmod);
    }
  });

  it('uses only verified edit dates and includes the QR tool', () => {
    const xml = buildSitemapXml(new Date('2026-10-22T15:00:00Z'));
    assert.equal(lastmodFor(xml, '/'), '2026-10-22');
    assert.equal(lastmodFor(xml, '/comparar-qr-tarjeta'), '2026-10-22');
    assert.equal(lastmodFor(xml, '/euro-a-boliviano'), undefined);
    assert.equal((xml.match(/<loc>/g) || []).length, PAGES.length + BLOG.length + 1);
    assert.match(xml, /hreflang="en" href="https:\/\/www\.boliviablue\.com\/comparar-qr-tarjeta\?lang=en"/);
  });
});
