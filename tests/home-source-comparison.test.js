import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homeSourceComparison, renderHomeSourceComparison } from '../frontend/src/utils/homeSourceComparison.js';
import { normalizeHomeRatePayload } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import middleware, { normalizeRates } from '../middleware.js';
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const time = '2026-10-24T13:35:35.531Z', now = Date.parse('2026-10-24T13:40:00Z');
const rate = {
 buy_bob_per_usd: 12, sell_bob_per_usd: 11.96, updated_at_iso: time,
 source_observation: { version:1, observed_at:time, method:'median_of_platform_quotes', quote_asset:'USDT', fiat:'BOB', platforms:[{id:'binance',buy:12,sell:11.96},{id:'eldorado',buy:12.08,sell:11.85},{id:'bybit',buy:11.989,sell:11.96}] },
 official_buy:Math.fround(11.88), official_sell:Math.fround(11.88), official_mid:Math.fround(11.88),
 official_observation:{version:1,status:'verified',source:'bcb',source_url:'https://www.bcb.gob.bo/',source_date:'2026-10-24',observed_at:'2026-10-24T13:00:00Z',buy:11.88,sell:11.88,mid:11.88},
};
const documentFor = html => new JSDOM(html).window.document;
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8').replace('<div id="root">','<div id="root"><main data-seo-shell="home"><nav><a href="/">Inicio</a></nav></main>');

for (const language of ['es','en']) {
 test(`initial ${language} table has same-record directions, original timestamps and a separate single BCB reference`, () => {
  const before = JSON.stringify(rate), normalized = normalizeRates(rate, '/');
  assert.deepEqual(normalized, normalizeHomeRatePayload(rate));
  assert.equal(normalized.homeSourceRate.source_observation.platforms[2].buy, 11.989);
  const html = renderDollarRateHtml(template, '/', normalized, language, now);
  const document = documentFor(html), section = document.querySelector('[data-home-source-comparison]');
  assert.equal(document.querySelectorAll('[data-home-source-comparison]').length,1);
  assert.equal(section.querySelectorAll('table').length,1);
  assert.deepEqual([...section.querySelectorAll('tbody td')].map(x=>x.textContent),['12.00','11.96','12.08','11.85','11.99','11.96']);
  const copy = homeSourceComparison(rate, language, now).copy;
  for(const key of ['buy','sell','caption','method','caveat','officialCaveat']) assert.ok(section.textContent.includes(copy[key]), key);
  assert.equal(section.querySelector('time').dateTime,time);
  const bcb = section.querySelector('[data-home-official-reference]');
  assert.ok(bcb.textContent.includes('11.88 Bs/USD'));
  assert.deepEqual([...bcb.querySelectorAll('time')].map(t=>t.dateTime),['2026-10-24','2026-10-24T13:00:00Z']);
  assert.equal(bcb.querySelector('a').href,'https://www.bcb.gob.bo/');
  assert.equal(section.querySelector('table').textContent.includes('BCB'),false);
  for(const a of section.querySelectorAll('nav a')) assert.equal(new URL(a.href,'https://www.boliviablue.com').searchParams.get('lang'),language==='en'?'en':null);
  assert.equal(JSON.stringify(rate),before);
  assert.equal(renderDollarRateHtml(html,'/',normalized,language,now),html);
  assert.equal(renderDollarRateHtml(renderDollarRateHtml(html,'/',normalized,language,now),'/',normalized,language,now),html);
 });
 test(`${language} stale P2P and BCB retain dates and never imply current/executable quotes`, () => {
  const document = documentFor(renderHomeSourceComparison({...rate,is_stale:true},language,now + 86400000));
  const copy = homeSourceComparison(rate,language,now).copy;
  assert.ok(document.body.textContent.includes(copy.stale));
  assert.ok(document.body.textContent.includes(copy.officialStale));
  assert.equal(document.querySelector('time').dateTime,time);
  assert.equal(document.querySelectorAll('tbody tr').length,3);
  assert.doesNotMatch(document.body.textContent,/%/);
 });
 test(`${language} official evidence survives missing P2P and never borrows its newer clock`, () => {
  const normalized=normalizeHomeRatePayload({...rate,buy_bob_per_usd:null,sell_bob_per_usd:null,updated_at_iso:'2026-10-24T22:00:00Z'});
  const html=renderDollarRateHtml(template,'/',normalized,language,Date.parse('2026-10-24T22:00:00Z'));
  const document=documentFor(html), section=document.querySelector('[data-home-source-comparison]');
  assert.equal(section.querySelector('table'),null);
  assert.ok(section.textContent.includes('11.88 Bs/USD'));
  assert.ok(section.textContent.includes(homeSourceComparison(rate,language,now).copy.officialStale));
  assert.equal(section.querySelector('[data-home-official-reference] time[datetime*="T"]').dateTime,'2026-10-24T13:00:00Z');
 });
}

test('missing, malformed, mismatched and hostile source evidence never creates platform rows', () => {
 for(const source_observation of [null,{}, {...rate.source_observation,observed_at:'2026-10-23T13:35:35.531Z'}, {...rate.source_observation,method:'invented'}, {...rate.source_observation,platforms:[{id:'binance',buy:1,sell:2}]}, {...rate.source_observation,platforms:[{id:'<img src=x onerror=alert(1)>',buy:12,sell:11.96}]}, {...rate.source_observation,platforms:[{id:'binance',buy:'12',sell:11.96}]}]) {
  const input={...rate,source_observation};
  const html=renderHomeSourceComparison(input,'en',now), document=documentFor(html);
  assert.equal(document.querySelector('table'),null);
  assert.ok(document.body.textContent.includes('Source breakdown unavailable'));
  assert.equal(document.querySelector('img,script,[onerror]'),null);
 }
 for(const input of [null,{}, {...rate,updated_at_iso:'<script>alert(1)</script>'}]) {
  const document=documentFor(renderHomeSourceComparison(input,'en',now));
  assert.equal(document.querySelector('table'),null);
  assert.ok(document.body.textContent.includes('Observation time unavailable'));
 }
});

test('official legacy numbers, mismatches, hostile links and asymmetric buy/sell cannot become a single TCO', () => {
 const asymmetric={...rate,official_buy:6.86,official_sell:6.96,official_mid:6.91,official_observation:{...rate.official_observation,buy:6.86,sell:6.96,mid:6.91}};
 for(const input of [null,{}, {...rate,official_observation:null}, {...rate,official_buy:11.9}, {...rate,official_observation:{...rate.official_observation,source_url:'javascript:alert(1)'}}, {...rate,official_observation:{...rate.official_observation,source_date:'2026-02-30'}}, asymmetric]) {
  const document=documentFor(renderHomeSourceComparison(input,'en',now));
  const bcb=document.querySelector('[data-home-official-reference]');
  assert.equal(bcb.querySelector('time, a'),null);
  assert.doesNotMatch(bcb.textContent,/11\.88|6\.91/);
  assert.match(bcb.textContent,/unavailable/);
 }
});

test('homepage owns one comparison; the summary, QR/card/share flows and other source-panel uses remain', () => {
 const home=readFileSync(new URL('../frontend/src/pages/Home.jsx', import.meta.url),'utf8');
 assert.equal((home.match(/<SourceObservationPanel/g)||[]).length,1);
 assert.ok(home.indexOf('<HomeMarketSummary')<home.indexOf('<SourceObservationPanel'));
 assert.ok(home.indexOf('<SourceObservationPanel')<home.indexOf('<RateTrioStrip'));
 for(const marker of ['<ShareRate compact','<BlueRateCards','<RateTrioStrip','showOfficialReference={false}','/comparar-qr-tarjeta']) assert.ok(home.includes(marker),marker);
 for(const path of ['/bolivian-blue','/cuanto-esta-dolar-bolivia','/dolar-blue-hoy']) assert.doesNotMatch(renderDollarRateHtml(template,path,normalizeHomeRatePayload(rate),'en',now),/data-home-source-comparison/);
});

test('middleware ES/EN GET shares existing data requests and preserve metadata, summary and a single table', async () => {
 const previous=globalThis.fetch, calls=[];
 const report={date:'2026-10-23',revision:1,path:'/prensa/informes/2026-10-23/v1',sha256:'a'.repeat(64),generated_at:'2026-10-24T10:00:00Z',median:11.83,comparison:null};
 try {
  globalThis.fetch=async url=>{const path=String(url);calls.push(path);if(path.includes('/api/blue-rate'))return Response.json(rate);if(path.includes('view=home-summary'))return Response.json({report});return new Response(template);};
  for(const language of ['es','en']) {
   const method='GET';
   calls.length=0;
   const response=await middleware(new Request('https://www.boliviablue.com/'+(language==='en'?'?lang=en':''),{method,headers:{accept:'text/html'}}));
   assert.equal(response.status,200);assert.equal(calls.length,3);
   const html=await response.text();if(method==='HEAD'){assert.equal(html,'');continue;}
   const document=documentFor(html);
   assert.equal(document.querySelectorAll('[data-home-source-comparison]').length,1);
   assert.equal(document.querySelectorAll('[data-home-source-links]').length,1);
   assert.equal(document.querySelectorAll('table').length,1);
   assert.equal(document.querySelectorAll('[data-home-market-summary]').length,1);
   assert.equal(document.querySelector('link[rel="canonical"]').href,'https://www.boliviablue.com/'+(language==='en'?'?lang=en':''));
   assert.ok(document.querySelector('a[href*="comparar-qr-tarjeta"]'));
   assert.ok(document.querySelector('a[href*="efectivo-o-tarjeta-bolivia"]'));
  }
 } finally {globalThis.fetch=previous;}
});


test('future P2P and BCB evidence cannot be displayed as current values', () => {
 const future='2099-10-24T13:35:35.531Z';
 const input={...rate,updated_at_iso:future,source_observation:{...rate.source_observation,observed_at:future},official_observation:{...rate.official_observation,observed_at:future,source_date:'2099-10-24'}};
 const m=homeSourceComparison(input,'en',now);
 assert.equal(m.sources.available,false);assert.equal(m.sources.stale,true);assert.equal(m.singleOfficial,false);
 const document=documentFor(renderHomeSourceComparison(input,'en',now));
 assert.equal(document.querySelector('table'),null);
 assert.doesNotMatch(document.querySelector('[data-home-official-reference]').textContent,/11\.88/);
});
