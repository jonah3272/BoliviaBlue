import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import middleware from '../middleware.js';
import { euroRateModel, renderEuroRateHtml } from '../seo/euroRateSeo.js';

const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd, applyLiveRatesToRoutes } = require('../frontend/scripts/inject-seo-shell.cjs');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const now = Date.parse('2026-10-28T03:00:00Z');
const payload = {
  buy_bob_per_eur: 13.4055, sell_bob_per_eur: 13.5, eur_updated_at_iso: '2026-10-28T02:47:00.858Z',
  updated_at_iso: '2026-10-28T02:59:00Z', generated_at_iso: '2026-10-28T03:00:00Z',
  buy_bob_per_usd: 12.01, sell_bob_per_usd: 12.03, eur_derivation: 'p2p-usdt', is_stale: false,
};
const old = { ...payload, buy_bob_per_eur: 13.36, sell_bob_per_eur: 13.2, eur_updated_at_iso: '2026-10-24T14:34:33.148Z' };
const oldShell = renderEuroRateHtml(template, '', old, Date.parse(old.eur_updated_at_iso));
const title = html => html.match(/<title>([^<]*)<\/title>/)[1];

test('EUR validation requires both actual numeric EUR values and their own valid observation', () => {
  assert.deepEqual(euroRateModel(payload, now), { available: true, stale: false, observedAt: payload.eur_updated_at_iso, buy: '13.41', sell: '13.50' });
  assert.equal(euroRateModel({ buy_bob_per_eur: 13.4055, sell_bob_per_eur: 13.5, eur_updated_at_iso: payload.eur_updated_at_iso }, now).available, true, 'EUR does not require a USD pair');
  for (const field of ['buy_bob_per_eur', 'sell_bob_per_eur']) for (const value of [null, undefined, 0, -1, NaN, Infinity, true, '13.41', '']) {
    assert.equal(euroRateModel({ ...payload, [field]: value }, now).available, false, `${field}=${value}`);
  }
  for (const value of [null, undefined, '', 'invalid', '2026-02-30T02:47:00Z', '2026-10-28T02:47:00', '2026-10-29T02:47:00Z']) {
    const model = euroRateModel({ ...payload, eur_updated_at_iso: value }, now);
    assert.equal(model.available, false); assert.equal(model.observedAt, null);
  }
});

test('old EUR stays stale even when USD, response generation and global stale flag look fresh', () => {
  assert.equal(euroRateModel(old, now).stale, true);
  assert.equal(euroRateModel({ ...payload, is_stale: true }, now).stale, true);
  assert.equal(euroRateModel({ ...payload, eur_derivation: 'usdt-cross-last-valid' }, now).stale, true);
  assert.equal(euroRateModel({ ...payload, eur_updated_at_iso: new Date(now - 20 * 60000).toISOString() }, now).stale, false);
  assert.equal(euroRateModel({ ...payload, eur_updated_at_iso: new Date(now - 20 * 60000 - 1).toISOString() }, now).stale, true);
});

for (const language of ['es', 'en']) test(`${language}: head, visible EUR quote and original observation agree across fresh/stale/unavailable`, () => {
  const search = language === 'en' ? '?lang=en?lang=en&utm_source=test' : '?lang=es';
  for (const input of [payload, old, null, { ...payload, eur_updated_at_iso: null }]) {
    const model = euroRateModel(input, now);
    const html = renderEuroRateHtml(oldShell, search, input, now);
    const canonical = `https://www.boliviablue.com/euro-a-boliviano${language === 'en' ? '?lang=en' : ''}`;
    assert.match(html, new RegExp(`<html[^>]+lang="${language}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/hreflang=/g) || []).length, 3);
    assert.ok(html.includes(`rel="canonical" href="${canonical}" data-rh="true"`));
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
    assert.ok(html.includes(`name="twitter:url" content="${canonical}"`));
    const schemas = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    assert.equal(schemas.length, 1); assert.equal(schemas[0]['@type'], 'WebPage'); assert.equal(schemas[0].url, canonical);
    assert.doesNotMatch(html, /datePublished|dateModified|Actualizado cada 15|Updated every 15|12\.01|12\.03/);
    assert.ok(!html.includes(payload.updated_at_iso)); assert.ok(!html.includes(payload.generated_at_iso));
    if (model.available) {
      assert.ok(title(html).includes(model.buy)); assert.ok(title(html).includes(model.sell));
      assert.ok(html.includes(`datetime="${model.observedAt}"`));
      assert.match(html, language === 'es' ? /por EUR/ : /per EUR/);
      if (model.stale) { assert.match(html, language === 'es' ? /desactualizada/ : /\(stale\)/); assert.doesNotMatch(title(html), /Hoy|Today/); }
      else assert.equal(title(html), language === 'es' ? 'Euro Blue Bolivia Hoy: Compra 13.41 · Venta 13.50' : 'Euro Blue Bolivia Today: Buy 13.41 · Sell 13.50');
    } else {
      assert.doesNotMatch(html, /13\.36|13\.20|13\.41|13\.50|<time\b/);
      assert.match(html, language === 'es' ? /no disponible/ : /unavailable/);
      assert.doesNotMatch(title(html), /Hoy|Today/);
    }
  }
});

test('EUR rendering preserves application assets, verification, CSP and preview noindex', () => {
  const extra = '<meta name="google-site-verification" content="keep-me"><meta http-equiv="Content-Security-Policy" content="fixture"><script id="analytics-fixture" src="/analytics.js"></script><link rel="stylesheet" href="/assets/style.css"><meta name="robots" content="noindex, nofollow">';
  const html = renderEuroRateHtml(template.replace('</head>', extra + '</head>'), '?lang=en', payload, now);
  for (const part of ['content="keep-me"', 'http-equiv="Content-Security-Policy"', 'id="analytics-fixture"', 'href="/assets/style.css"', 'src="/src/main.jsx"']) assert.ok(html.includes(part), part);
  assert.equal((html.match(/name="robots"/g) || []).length, 1);
  assert.match(html, /name="robots" content="noindex, nofollow" data-rh="true"/);
  assert.equal(renderEuroRateHtml(html, '?lang=en', payload, now).replace(/>\s+</g, '><'), html.replace(/>\s+</g, '><'), 'render is repeatable without duplicate page identity');
});

for (const language of ['es', 'en']) for (const path of ['/euro-a-boliviano', '/euro-a-boliviano/', '/euro-a-boliviano/index.html']) {
  test(`${path} ${language}: browsers, mobile browsers and bots get identical data-state HTML`, async () => {
    const originalFetch = globalThis.fetch, originalNow = Date.now;
    Date.now = () => now;
    try {
      for (const state of ['fresh', 'stale', 'last-valid', 'missing', 'undated', 'throw', 'http-error', 'invalid-json', 'timeout']) {
        let firstHtml;
        for (const ua of ['Mozilla/5.0', 'Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36', 'Googlebot']) {
          let rateCalls = 0;
          globalThis.fetch = async (url, options) => {
            assert.equal(options.headers['x-bb-skip-live-seo'], '1');
            assert.ok(options.signal instanceof AbortSignal);
            if (String(url).includes('/api/blue-rate')) {
              rateCalls++;
              if (state === 'throw') throw Error('offline');
              if (state === 'timeout') throw new DOMException('timed out', 'TimeoutError');
              if (state === 'http-error') return new Response('', { status: 503 });
              if (state === 'invalid-json') return new Response('{');
              return Response.json(state === 'missing' ? {} : state === 'stale' ? old : { ...payload,
                ...(state === 'undated' ? { eur_updated_at_iso: null } : {}),
                ...(state === 'last-valid' ? { eur_derivation: 'usdt-cross-last-valid' } : {}),
              });
            }
            assert.equal(new URL(url).pathname, '/euro-a-boliviano/index.html');
            return new Response(oldShell, { headers: { etag: 'old-build', 'last-modified': 'Sat, 24 Oct 2026 14:36:59 GMT', age: '185905', 'content-length': '123', 'content-security-policy': 'fixture' } });
          };
          const response = await middleware(new Request(`https://www.boliviablue.com${path}${language === 'en' ? '?lang=en' : ''}`, { headers: { accept: 'text/html', 'user-agent': ua } }));
          assert.equal(response.status, 200); assert.equal(rateCalls, 1);
          assert.equal(response.headers.get('x-bb-live-seo'), state === 'fresh' ? '1' : '0');
          assert.equal(response.headers.get('cache-control'), state === 'fresh' ? 'public, max-age=0, s-maxage=60, must-revalidate' : 'no-store');
          for (const name of ['etag', 'last-modified', 'age', 'content-length']) assert.equal(response.headers.get(name), null);
          assert.equal(response.headers.get('content-security-policy'), 'fixture');
          const html = await response.text();
          if (firstHtml) assert.equal(html, firstHtml); else firstHtml = html;
          if (state === 'fresh') { assert.match(html, /13\.41/); assert.match(html, /13\.50/); assert.ok(html.includes(payload.eur_updated_at_iso)); }
          else if (['stale', 'last-valid'].includes(state)) { assert.match(html, language === 'es' ? /desactualizada/ : /\(stale\)/); assert.doesNotMatch(title(html), /Hoy|Today/); }
          else { assert.doesNotMatch(html, /13\.36|13\.20|13\.41|13\.50|<time\b/); assert.match(html, language === 'es' ? /no disponible/ : /unavailable/); }
        }
      }
    } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
  });
}

test('EUR HEAD, skip-header and non-document requests respect the middleware contract', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw Error('must not fetch'); };
    for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) {
      assert.equal(await middleware(new Request('https://www.boliviablue.com/euro-a-boliviano', options)), undefined);
    }
    globalThis.fetch = async url => String(url).includes('/api/') ? Response.json(null) : new Response(oldShell);
    const response = await middleware(new Request('https://www.boliviablue.com/euro-a-boliviano/index.html?lang=en', { method: 'HEAD' }));
    assert.equal(response.status, 200); assert.equal(await response.text(), ''); assert.equal(response.headers.get('cache-control'), 'no-store');
    for (const method of ['GET', 'HEAD']) for (const lang of ['es', 'en']) {
      globalThis.fetch = async () => new Response('', { status: 503 });
      const response = await middleware(new Request(`https://www.boliviablue.com/euro-a-boliviano?lang=${lang}`, { method }));
      assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('retry-after'), '60'); assert.match(response.headers.get('x-robots-tag'), /noindex/);
      const html = await response.text();
      if (method === 'HEAD') assert.equal(html, ''); else assert.ok(html.includes(`lang="${lang}"`));
      assert.doesNotMatch(html, /13\.36|13\.20/);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('static EUR route no longer freezes a build quote; final build uses the same unavailable renderer', () => {
  const before = JSON.stringify(ROUTES['/euro-a-boliviano']);
  applyLiveRatesToRoutes(12.01, 12.03, payload.updated_at_iso, { buyEur: 13.4055, sellEur: 13.5, eurUpdatedAt: payload.eur_updated_at_iso });
  assert.equal(JSON.stringify(ROUTES['/euro-a-boliviano']), before);
  const shell = injectStaticJsonLd(injectRootShell(replaceMeta(template, '/euro-a-boliviano'), ROUTES['/euro-a-boliviano'].shell), '/euro-a-boliviano');
  const finalHtml = renderEuroRateHtml(shell);
  assert.match(finalHtml, /no disponible/); assert.doesNotMatch(finalHtml, /<time\b|13\.41|13\.50/);
  const build = readFileSync(new URL('../frontend/scripts/inject-seo-shell.cjs', import.meta.url), 'utf8');
  assert.match(build, /writeFileSync\(path\.join\(euroDir, 'index\.html'\), renderEuroRateHtml\(originalHtml\)/);
});

test('an upstream 200 login/error page is never relabeled as a valid EUR document', async () => {
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('<html><head><title>Log in</title></head><body>Protected content</body></html>'); };
    const response = await middleware(new Request('https://www.boliviablue.com/euro-a-boliviano?lang=en'));
    assert.equal(response.status, 503); assert.equal(calls, 1);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const html = await response.text();
    assert.match(html, /Page temporarily unavailable/); assert.doesNotMatch(html, /Protected content|Log in/);
  } finally { globalThis.fetch = originalFetch; }
});
