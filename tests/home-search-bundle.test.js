import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeDollarRatePayload } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { buildLiveRateSeoMeta } from '../frontend/src/utils/seoRateMeta.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import middleware from '../middleware.js';
const time = '2026-10-08T12:00:00Z';
const now = Date.parse(time);
const rate = {buy: 10.125, sell: 10.375, updatedAt: time, source_observation: {version: 1, observed_at: time, method: 'median_of_platform_quotes', quote_asset: 'USDT', fiat: 'BOB', platforms: [{id: 'binance', buy: 10.125, sell: 10.375}]}};
const html = '<html><head><title>Old</title><meta name="description" content="Old"></head><body><main data-seo-shell="home"></main></body></html>';
for (const language of ['es','en']) {
  test(`homepage identity and same-record evidence: ${language}`, () => {
    const m = buildLiveRateSeoMeta({...normalizeDollarRatePayload(rate), page: 'home', language, now});
    assert.equal(m.title, language === 'es' ? 'Dólar blue Bolivia hoy: compra y venta P2P | Bolivia Blue' : 'Bolivia blue dollar today: P2P buy and sell | Bolivia Blue');
    assert.doesNotMatch(m.title + m.description, /10\.13|10\.38/);
    assert.match(m.answer, /Binance P2P/);
    assert.match(m.answer, /10\.13/);
    assert.doesNotMatch(m.answer, /no está confirmada|not confirmed/);
    const initial = renderDollarRateHtml(html, '/', normalizeDollarRatePayload(rate), language, now);
    assert.ok(initial.includes(m.answer));
    assert.match(initial, language === 'es' ? />Dólar blue en Bolivia hoy<\/h1>/ : />Blue dollar in Bolivia today<\/h1>/);
    for (const invalid of [null, ...[['binance'], {toString:null,valueOf:null}, '__proto__', 'constructor', 'toString'].map(id => ({...rate.source_observation, platforms:[{id,buy:10.125,sell:10.375}]})), {...rate.source_observation, observed_at: '2026-10-07T12:00:00Z'}, {...rate.source_observation, platforms:[{id:'unknown',buy:10.125,sell:10.375}]}, {...rate.source_observation, platforms:[{id:'binance',buy:20,sell:30}]}]) {
      const input = normalizeDollarRatePayload({...rate,source_observation:invalid});
      const missing = buildLiveRateSeoMeta({...input, page:'home',language,now});
      assert.match(missing.answer, language === 'es' ? /Desglose de fuentes no disponible/ : /Source breakdown unavailable/);
      assert.doesNotMatch(missing.answer, /Binance P2P/);
      assert.ok(renderDollarRateHtml(html,'/',input,language,now).includes(missing.answer));
    }
    const stale = buildLiveRateSeoMeta({...normalizeDollarRatePayload(rate), page:'home',language,now:now+86400000});
    assert.match(stale.answer, /desactualizada|stale/);
    assert.match(stale.answer, /Binance P2P/);
    assert.equal(stale.observedAt,time);
    const unknown = buildLiveRateSeoMeta({...normalizeDollarRatePayload({...rate,updatedAt:null}),page:'home',language,now});
    assert.match(unknown.answer,/Hora de lectura no disponible|Observation time unavailable/);
    assert.doesNotMatch(unknown.answer,/Binance P2P/);
  });
  test(`full middleware preserves initial observation evidence: ${language}`, async () => {
    const original=globalThis.fetch;
    try {
      globalThis.fetch=async url => String(url).includes('/api/blue-rate') ? Response.json(rate) : new Response(html,{headers:{'content-type':'text/html'}});
      const response=await middleware(new Request(`https://www.boliviablue.com/${language==='en'?'?lang=en':''}`,{headers:{accept:'text/html'}}));
      assert.match(await response.text(),/Binance P2P/);
    } finally {globalThis.fetch=original;}
  });
}
test('homepage mobile and desktop headings use the same search intent', () => {
 const source=readFileSync(new URL('../frontend/src/pages/Home.jsx',import.meta.url),'utf8');
 assert.equal(source.split("'Dólar blue en Bolivia hoy' : 'Blue dollar in Bolivia today'").length-1,2);
 assert.match(source,/answerOverride=\{liveSeo.answer\}/);
});
