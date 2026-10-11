import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getRealConversionPage, realRateModel } from '../frontend/src/data/realConversionPage.js';
import { renderRealConversionHtml } from '../seo/realConversionSeo.js';
import middleware from '../middleware.js';
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const now = Date.parse('2026-10-11T06:00:00Z');
const quote = { updated_at_iso: '2026-10-11T05:55:00Z', buy_bob_per_brl: 2.34567, sell_bob_per_brl: 2.32123 };

test('BRL model preserves same-side stored crosses and rejects missing, invalid or undated pairs', () => {
  const model = realRateModel(quote, now);
  assert.equal(model.available, true); assert.equal(model.stale, false);
  assert.equal(model.buy, quote.buy_bob_per_brl); assert.equal(model.sell, quote.sell_bob_per_brl);
  for (const value of [null, undefined, 0, -1, NaN, Infinity, '2.3']) {
    assert.equal(realRateModel({ ...quote, buy_bob_per_brl: value }, now).available, false);
    assert.equal(realRateModel({ ...quote, sell_bob_per_brl: value }, now).available, false);
  }
  for (const updated_at_iso of [null, 'invalid', '2026-02-30T05:55:00Z']) assert.equal(realRateModel({ ...quote, updated_at_iso }, now).available, false);
  assert.equal(realRateModel({ ...quote, is_stale: true }, now).stale, true);
  assert.equal(realRateModel(quote, now + 21 * 60000).stale, true);
  assert.equal(realRateModel({ ...quote, updated_at_iso: '2026-10-12T05:55:00Z' }, now).stale, true);
});

for (const language of ['es', 'en']) test(`BRL initial HTML uses shared ${language} content, factual schema, identity and rounding`, () => {
  for (const input of [quote, null, { ...quote, is_stale: true }]) {
    const page = getRealConversionPage(language, input, now);
    const html = renderRealConversionHtml(template, language === 'en' ? '?lang=en?lang=en&usd=100' : '?usd=100', input, now);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.match(html, new RegExp(`<html[^>]+lang="${language}"`));
    assert.ok(html.includes(`href="${page.canonical}"`));
    for (const section of page.sections) for (const paragraph of section.paragraphs) assert.ok(html.includes(paragraph.replace(/’/g, '’')), paragraph);
    for (const faq of page.faqs) assert.ok(html.includes(faq.question));
    assert.ok(html.includes(page.status));
    assert.ok(html.includes(language === 'es' ? 'independiente' : 'independent'));
    assert.doesNotMatch(html, /2\.10|210\.00|2025-01-01|"dateModified"|href="\/calculadora\?(?:usd|bob)=/);
    if (input) { assert.ok(html.includes('2.346 BOB')); assert.ok(html.includes('234.57')); assert.ok(html.includes('232.12')); }
    else { assert.ok(html.includes('—')); assert.doesNotMatch(html, /2\.346 BOB|234\.57/); }
    const schemas = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    assert.deepEqual(schemas.map(s => s['@type']), ['WebPage', 'FAQPage']);
    assert.deepEqual(schemas[1].mainEntity.map(q => q.acceptedAnswer.text), page.faqs.map(f => f.answer));
    assert.ok(page.links.find(l => l.href === '/calculadora' + (language === 'en' ? '?lang=en' : '')));
  }
});

test('BRL head keeps preview noindex and safely discards prior numerical metadata', () => {
  const html = renderRealConversionHtml(template.replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>'), '?lang=en', null, now);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.equal((html.match(/name="robots"/g) || []).length, 1);
});

test('BRL middleware renders both locales for browsers and bots, including API failure and HEAD', async () => {
  const original = global.fetch;
  try {
    for (const language of ['es', 'en']) for (const agent of ['Googlebot', 'Mozilla/5.0']) for (const state of ['valid', 'missing', 'error']) {
      const record = { ...quote, updated_at_iso: new Date().toISOString() };
      global.fetch = async url => String(url).includes('/api/blue-rate') ? state === 'error' ? Promise.reject(new Error('offline')) : Response.json(state === 'valid' ? record : { ...record, buy_bob_per_brl: null, sell_bob_per_brl: null }) : new Response(renderRealConversionHtml(template, '', quote, now));
      const response = await middleware(new Request(`https://www.boliviablue.com/real-a-boliviano/${language === 'en' ? '?lang=en' : ''}`, { headers: { accept: 'text/html', 'user-agent': agent } }));
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, new RegExp(`<html[^>]+lang="${language}"`));
      if (state === 'valid') assert.match(html, /2\.346 BOB/);
      else { assert.doesNotMatch(html, /2\.346 BOB|234\.57/); assert.match(html, language === 'es' ? /no disponible/ : /unavailable/); }
    }
    global.fetch = async url => String(url).includes('/api/') ? Response.json(null) : new Response(template);
    const head = await middleware(new Request('https://www.boliviablue.com/real-a-boliviano/index.html?lang=en', { method: 'HEAD', headers: { accept: 'text/html' } }));
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
    global.fetch = async () => new Response('', { status: 503 });
    const failure = await middleware(new Request('https://www.boliviablue.com/real-a-boliviano?lang=en', { headers: { accept: 'text/html' } }));
    assert.equal(failure.status, 503); assert.match(await failure.text(), /lang="en"/);
  } finally { global.fetch = original; }
});

test('overflowing BRL amount totals render unavailable rather than Infinity', () => {
  const rate = { ...quote, buy_bob_per_brl: 1.2e308, sell_bob_per_brl: 1.4e308 };
  const page = getRealConversionPage('en', rate, now);
  assert.equal(page.amounts.find(row => row.amount === 100).buy, '—');
  assert.equal(page.amounts.find(row => row.amount === 100).sell, '—');
  assert.doesNotMatch(renderRealConversionHtml(template, '?lang=en', rate, now), /Infinity|NaN/);
});
