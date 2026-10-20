import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import middleware, { normalizeRates, shouldTransformPath } from '../middleware.js';
import { renderTravelerGuideHtml, TRAVELER_GUIDE_PATHS } from '../seo/travelerGuideSeo.js';
const require = createRequire(import.meta.url);
const { ROUTES } = require('../frontend/scripts/inject-seo-shell.cjs');
const now = Date.parse('2026-10-19T21:30:00Z');
const payload = { buy_bob_per_usd: 11.85, sell_bob_per_usd: 11.81, updated_at_iso: '2026-10-19T21:20:00Z' };
function shell(path) {
  const en = path === '/bolivia-money-guide';
  return `<html lang="${en ? 'en' : 'es'}"><head><title>Old guide</title><meta name="description" content="old quote"><link rel="canonical" href="https://www.boliviablue.com${path}"><link rel="alternate" hreflang="es" href="https://www.boliviablue.com/guia-dinero-bolivia"><link rel="alternate" hreflang="en" href="https://www.boliviablue.com/bolivia-money-guide"></head><body>${ROUTES[path].shell}<div data-payment-checker>checker unchanged</div></body></html>`;
}
for (const path of TRAVELER_GUIDE_PATHS) {
  const en = path === '/bolivia-money-guide';
  test(`${path}: fresh, stale, missing and invalid observation states`, () => {
    const original = shell(path);
    const fresh = renderTravelerGuideHtml(original, path, normalizeRates(payload, path), now);
    assert.equal(fresh.live, true);
    assert.match(fresh.html, /11\.85/); assert.match(fresh.html, /11\.81/);
    assert.match(fresh.html, /datetime="2026-10-19T21:20:00Z"/);
    assert.match(fresh.html, /P2P USDT\/BOB/);
    assert.ok(!fresh.html.includes(en ? 'Blue dollar today: buy' : 'Dólar blue hoy: compra'));
    for (const rates of [normalizeRates({ ...payload, is_stale: true }, path), normalizeRates({ ...payload, updated_at_iso: '2026-10-18T21:20:59Z' }, path)]) {
      const result = renderTravelerGuideHtml(original, path, rates, now);
      assert.equal(result.live, false); assert.match(result.html, en ? /reading \(stale\)/ : /lectura disponible \(desactualizada\)/);
    }
    for (const value of [null, { ...payload, updated_at_iso: '2026-10-20T21:20:00Z' }, { ...payload, updated_at_iso: null }, { ...payload, updated_at_iso: 'invalid' }, { ...payload, updated_at_iso: '2026-02-30T21:20:00Z' }, { ...payload, buy_bob_per_usd: true }]) {
      const result = renderTravelerGuideHtml(fresh.html, path, normalizeRates(value, path), now);
      assert.equal(result.live, false); assert.doesNotMatch(result.html, /<time/);
      assert.match(result.html, en ? /unavailable/ : /no disponible/);
      assert.ok(!result.html.includes('2026-10-19T21:20:00Z'));
    }
    for (const html of [fresh.html, renderTravelerGuideHtml(original, path, null, now).html]) {
      assert.ok(html.includes(`lang="${en ? 'en' : 'es'}"`));
      assert.ok(html.includes(`rel="canonical" href="https://www.boliviablue.com${path}"`));
      assert.equal((html.match(/hreflang=/g) || []).length, 2);
      assert.ok(html.includes('<div data-payment-checker>checker unchanged</div>'));
      assert.ok(html.includes(ROUTES[path].shell.match(/<nav[\s\S]*?<\/nav>/)[0]));
      assert.equal((html.match(/data-traveler-quote/g) || []).length, 1);
    }
  });
  for (const ua of ['Mozilla/5.0', 'Googlebot']) for (const suffix of ['', '?lang=en', '/', '/index.html']) {
    test(`${path}${suffix}: ${ua} uses live handler and honest rate failures`, async () => {
      assert.equal(shouldTransformPath(path, ua), true);
      const oldFetch = globalThis.fetch;
      const oldNow = Date.now;
      Date.now = () => now;
      try {
        for (const state of ['fresh', 'stale', 'missing', 'throw', 'http-error', 'invalid-json']) {
          let rateCalls = 0;
          globalThis.fetch = async input => {
            if (String(input).includes('/api/blue-rate')) {
              rateCalls++;
              if (state === 'throw') throw Error('rate service unavailable');
              if (state === 'http-error') return new Response('', { status: 503 });
              if (state === 'invalid-json') return new Response('{');
              return Response.json(state === 'missing' ? {} : { ...payload, is_stale: state === 'stale' });
            }
            return new Response(shell(path), { headers: { 'content-type': 'text/html' } });
          };
          const response = await middleware(new Request(`https://www.boliviablue.com${path}${suffix}`, { headers: { accept: 'text/html', 'user-agent': ua } }));
          assert.equal(response.status, 200); assert.equal(rateCalls, 1);
          assert.equal(response.headers.get('x-bb-live-seo'), state === 'fresh' ? '1' : '0');
          assert.equal(response.headers.get('cache-control'), state === 'fresh' ? 'public, s-maxage=300, must-revalidate' : 'no-store');
          const html = await response.text();
          assert.match(html, /data-traveler-quote/);
          assert.ok(html.includes(`rel="canonical" href="https://www.boliviablue.com${path}"`));
          if (['missing', 'throw', 'http-error', 'invalid-json'].includes(state)) assert.doesNotMatch(html, /11\.85|11\.81|<time/);
        }
      } finally { globalThis.fetch = oldFetch; Date.now = oldNow; }
    });
  }
}
