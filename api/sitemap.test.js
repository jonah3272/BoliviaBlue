const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildSitemapXml, PAGES, BLOG } = require('./_lib/sitemapXml');

describe('sitemap xml', () => {
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
