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
        assert.equal(lastmodFor(xml, pagePath), '2026-10-08');
      }
      assert.equal(lastmodFor(xml, '/terminos'), '2026-09-26T12:00:00+00:00');
      assert.equal(lastmodFor(xml, '/api-docs'), '2026-09-26T12:00:00+00:00');
    }
  });

  it('keeps the checked-in fallback consistent with the editorial dates', () => {
    const fallback = readFileSync(path.join(__dirname, '../frontend/public/sitemap.xml'), 'utf8');
    for (const page of PAGES.filter((page) => page.lastmod)) {
      assert.equal(lastmodFor(fallback, page.path), page.lastmod);
    }
  });

  it('stamps rate pages with the given day and leaves blog dates alone', () => {
    const xml = buildSitemapXml(new Date('2026-10-01T15:00:00Z'));
    assert.match(xml, /<loc>https:\/\/www\.boliviablue\.com\/<\/loc>\s*<lastmod>2026-10-01T12:00:00\+00:00<\/lastmod>/);
    assert.match(xml, /<loc>https:\/\/www\.boliviablue\.com\/euro-a-boliviano<\/loc>\s*<lastmod>2026-10-01T12:00:00\+00:00<\/lastmod>/);
    assert.match(xml, /<loc>https:\/\/www\.boliviablue\.com\/terminos<\/loc>\s*<lastmod>2026-09-26T12:00:00\+00:00<\/lastmod>/);
    assert.match(xml, /por-que-se-llama-dolar-blue-origen<\/loc>\s*<lastmod>2025-01-26T12:00:00\+00:00<\/lastmod>/);
    assert.equal((xml.match(/<loc>/g) || []).length, PAGES.length + BLOG.length);
    assert.match(xml, /hreflang="en" href="https:\/\/www\.boliviablue\.com\/\?lang=en"/);
  });
});
