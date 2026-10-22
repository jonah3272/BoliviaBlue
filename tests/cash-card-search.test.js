import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import middleware from '../middleware.js';
import { cashCardSnapshot, renderCashCardHtml } from '../seo/cashCardSeo.js';
import { cashCardPage, CASH_CARD_PATH } from '../frontend/src/data/cashCardPage.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
const require = createRequire(import.meta.url);
const { buildSitemapXml } = require('../api/_lib/sitemapXml.js');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const now = Date.parse('2026-10-22T15:00:00Z');
const observed = new Date(now - 60000).toISOString();
const rate = { buy_bob_per_usd: 11.9, sell_bob_per_usd: 12.1, updated_at_iso: observed };
const card = { visa_bob_per_usd: 10, t: observed };

describe('cash/card search landing', () => {
  it('serves one localized identity and complete editorial content without JavaScript', () => {
    for (const language of ['es', 'en']) {
      const page = cashCardPage(language);
      const html = renderCashCardHtml(template, language === 'en' ? '?lang=en' : '', rate, card, now);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.equal((html.match(/<meta name="description"/g) || []).length, 1);
      assert.ok(html.includes(`href="${page.canonical}"`));
      assert.ok(html.includes(`<html lang="${language}"`));
      assert.ok(html.includes(page.heading));
      assert.ok(html.includes(page.example));
      assert.ok(html.includes('16.7%'));
      assert.match(html, /<script[^>]+src=/); // Preserve application/analytics scripts.
      assert.match(html, /hreflang="es"/);
      assert.match(html, /hreflang="en"/);
      for (const [, json] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
        assert.equal(JSON.parse(json).url, page.canonical);
      }
      // Rendering a pre-rendered shell must not duplicate content or head tags.
      const repeated = renderCashCardHtml(html, language === 'en' ? '?lang=en' : '', rate, card, now);
      assert.equal((repeated.match(/<h1\b/g) || []).length, 1);
      assert.equal((repeated.match(/rel="canonical"/g) || []).length, 1);
      assert.equal((repeated.match(/<meta name="description"/g) || []).length, 1);
    }
  });
  it('uses the shared money calculation and withholds stale, future and missing readings', () => {
    assert.equal(cashCardSnapshot(rate, card, now).comparison.status, 'cash');
    assert.equal(cashCardSnapshot(rate, { ...card, visa_bob_per_usd: 12.2 }, now).comparison.status, 'card');
    assert.equal(cashCardSnapshot(rate, { ...card, visa_bob_per_usd: 12 }, now).comparison.status, 'tie');
    for (const changed of [null, 'invalid', new Date(now - 46 * 60000).toISOString(), new Date(now + 120000).toISOString()]) {
      const html = renderCashCardHtml(template, '', rate, { ...card, t: changed }, now);
      assert.match(html, /no hay recomendación para hoy/);
      assert.doesNotMatch(html, /costaría 16\.7%/);
    }
    assert.equal(cashCardSnapshot({ ...rate, is_stale: true }, card, now).comparison.status, 'stale');
    for (const value of [null, 0, true, 'invalid']) {
      const html = renderCashCardHtml(template, '', rate, { ...card, visa_bob_per_usd: value }, now);
      assert.match(html, /Faltan tasas para comparar hoy/);
      assert.doesNotMatch(html, /NaN|Infinity|Invalid Date|costaría 16\.7%/);
    }
  });
  it('serves the same content to people and crawlers, including API failure and HEAD requests', async () => {
    const original = globalThis.fetch;
    try {
      globalThis.fetch = async (url) => String(url).endsWith('/index.html') ? new Response(template) : new Response('{}', { status: 503 });
      for (const search of ['', '?lang=en']) {
        const bodies = [];
        for (const agent of ['Mozilla/5.0', 'Googlebot']) {
          const response = await middleware(new Request('https://www.boliviablue.com' + CASH_CARD_PATH + search, { headers: { Accept: 'text/html', 'User-Agent': agent } }));
          assert.equal(response.status, 200);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          bodies.push(await response.text());
        }
        assert.equal(bodies[0], bodies[1]);
        assert.match(bodies[0], /data-seo-shell="cash-card"/);
        const head = await middleware(new Request('https://www.boliviablue.com' + CASH_CARD_PATH + '/index.html' + search, { method: 'HEAD', headers: { Accept: 'text/html' } }));
        assert.equal(head.status, 200);
        assert.equal(await head.text(), '');
      }
      globalThis.fetch = async () => new Response('', { status: 503 });
      const unavailable = await middleware(new Request('https://www.boliviablue.com' + CASH_CARD_PATH, { headers: { Accept: 'text/html' } }));
      assert.equal(unavailable.status, 503);
      assert.equal(unavailable.headers.get('x-robots-tag'), 'noindex, follow');
      assert.equal(unavailable.headers.get('retry-after'), '60');
    } finally { globalThis.fetch = original; }
  });
  it('publishes both locale URLs without manufacturing modification dates', () => {
    const xml = buildSitemapXml(new Date('2030-01-01'));
    for (const suffix of ['', '?lang=en']) assert.ok(xml.includes(`<loc>https://www.boliviablue.com${CASH_CARD_PATH}${suffix}</loc>`));
    assert.doesNotMatch(xml, /2030-01-01|lang=en\?lang=en|<lastmod>undefined/);
    assert.match(xml, /<lastmod>2026-10-22<\/lastmod>/);
  });
  it('keeps one homepage answer and exposes the comparison through crawlable links', () => {
    const html = renderDollarRateHtml(template.replace('<div id="root"></div>', '<div id="root"><main data-seo-shell="home"></main></div>'), '/', null, 'es');
    assert.equal((html.match(/data-dollar-rate-answer/g) || []).length, 1);
    assert.ok(html.includes(`href="${CASH_CARD_PATH}"`));
  });
});
