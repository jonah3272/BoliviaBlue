import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatObservationRate, sourceObservationModel, newsroomReport } from '../frontend/src/utils/sourceObservation.js';
import { normalizeDollarRatePayload } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { buildLiveRateSeoMeta } from '../frontend/src/utils/seoRateMeta.js';
const time='2026-10-08T12:00:00Z';
const raw=11.905000000000001;
const rate={buy:11.905,sell:11.915,updatedAt:time,source_observation:{version:1,observed_at:time,method:'median_of_platform_quotes',quote_asset:'USDT',fiat:'BOB',platforms:[{id:'binance',buy:raw,sell:11.915000000000001}]}};
test('display-only rounding removes float noise without changing financial values',()=>{
 for(const n of [11.905,11.905000000000001,Math.fround(11.905)]) assert.equal(formatObservationRate(n),'11.90');
 for(const n of [11.915,11.915000000000001,Math.fround(11.915)]) assert.equal(formatObservationRate(n),'11.91');
 for(const [n,result] of [[11.9049,'11.90'],[11.9051,'11.91'],[11.996,'12.00'],[11.706,'11.71']]) assert.equal(formatObservationRate(n),result);
 for(const n of [undefined,null,'11.905',0,-1,NaN,Infinity]) assert.equal(formatObservationRate(n),'—');
});
test('ES/EN reports and homepage evidence retain raw JSON while showing consistent source values',()=>{
 const before=JSON.stringify(rate);
 for(const language of ['es','en']){
  const report=newsroomReport(rate,language,Date.parse(time));
  assert.match(report.text,/11\.90/);assert.doesNotMatch(report.text,/11\.905|11\.92/);
  assert.match(report.text,/JSON/);assert.equal(report.observation.platforms[0].buy,raw);
  const answer=buildLiveRateSeoMeta({...normalizeDollarRatePayload(rate),language,page:'home',now:Date.parse(time)}).answer;
  const initial = renderDollarRateHtml('<title>Old</title><main data-seo-shell="home"></main>', '/', normalizeDollarRatePayload(rate), language, Date.parse(time));
  assert.ok(initial.includes(answer));
  assert.match(answer,/Binance P2P: (compra|buy) Bs 11\.90, (venta|sell) Bs 11\.91/);
 }
 assert.equal(JSON.stringify(rate),before);
 assert.equal(sourceObservationModel(rate).observation.platforms[0].buy,raw);
});
test('unknown source metadata does not invent platform values',()=>{
 for(const source_observation of [null,undefined,{version:9},{...rate.source_observation,observed_at:'bad'}]){
  const report=newsroomReport({...rate,source_observation},'en');
  assert.equal(report.available,false);assert.equal(report.observation,null);
  assert.doesNotMatch(report.text,/Binance P2P/);assert.match(report.text,/Source breakdown unavailable/);
 }
});
