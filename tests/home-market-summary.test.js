import { it } from 'node:test';
import assert from 'node:assert/strict';
import { homeMarketSummary } from '../frontend/src/utils/homeMarketSummary.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
const now = Date.parse('2026-10-22T16:00:00Z');
const report = {date:'2026-10-21',revision:1,path:'/prensa/informes/2026-10-21/v1',sha256:'a'.repeat(64),generated_at:'2026-10-22T09:00:00Z',median:11.83005,comparison:{date:'2026-10-20',change:0.01505,change_percent:0.127}};
const template = '<html><head><title>Home</title><link rel="canonical" href="https://www.boliviablue.com/"></head><body><main data-seo-shell="home"></main></body></html>';
it('shares exact dated summary, fixed basket caveat and immutable link across languages',()=>{
 for(const lang of ['es','en']) {
  const model=homeMarketSummary(report,lang,now);
  assert.match(model.summary,/11\.83005 BOB\/USDT/);
  assert.match(model.change,/\+0\.01505 BOB\/USDT \(\+0\.127%\)/);
  assert.match(model.caveat,/Binance \+ El Dorado \+ Bybit/);
  assert.equal(model.href,report.path+(lang==='en'?'?lang=en':''));
  const html=renderDollarRateHtml(template,'/',null,lang,now,report);
  assert.ok(html.includes(model.summary)); assert.ok(html.includes(model.caveat));
  assert.match(html,/data-home-market-summary/); assert.match(html,/comparar-qr-tarjeta/);
  assert.match(html,/<details><summary/); assert.match(html,/efectivo-o-tarjeta-bolivia/);
  assert.match(html,/rel="canonical" href="https:\/\/www.boliviablue.com\/"/);
  const twice=renderDollarRateHtml(html,'/',null,lang,now,report);
  assert.equal((twice.match(/id="home-market-summary-data"/g)||[]).length,1);
  assert.equal((twice.match(/data-home-market-summary class/g)||[]).length,1);
 }
});
it('omits absent invalid future and unsafe report projections',()=>{
 for(const r of [null,{...report,median:NaN},{...report,date:'2026-10-22'},{...report,path:'javascript:alert(1)'},{...report,revision:1e20},{...report,generated_at:'2099-01-01'}]) {
  assert.equal(homeMarketSummary(r,'es',now),null);
  assert.doesNotMatch(renderDollarRateHtml(template,'/',null,'es',now,r),/data-home-market-summary|home-market-summary-data/);
 }
 assert.doesNotMatch(renderDollarRateHtml(template,'/dolar-blue-hoy',null,'es',now,report),/data-home-market-summary/);
});
it('does not invent a comparison when previous-day evidence is missing or invalid',()=>{
 for(const comparison of [null,{...report.comparison,date:'2026-10-19'},{...report.comparison,change:NaN}]) {
  const model=homeMarketSummary({...report,comparison},'en',now);
  assert.equal(model.change,'No valid previous-day comparison.');
 }
});
it('escapes JSON bootstrap data even with irrelevant untrusted fields',()=>{
 const html=renderDollarRateHtml(template,'/',null,'es',now,{...report,extra:'</script><script>alert(1)</script>'});
 assert.doesNotMatch(html,/<script>alert/);
 const raw=html.match(/id="home-market-summary-data">([\s\S]*?)<\/script>/)[1];
 assert.equal(JSON.parse(raw).median,report.median);
});
