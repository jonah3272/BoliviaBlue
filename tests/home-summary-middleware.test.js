import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware, { loadHomeSummary } from '../middleware.js';
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8').replace('<div id="root">', '<div id="root"><main data-seo-shell="home"></main>');
const report = { date:'2026-10-20',revision:1,path:'/prensa/informes/2026-10-20/v1',sha256:'a'.repeat(64),generated_at:'2026-10-21T10:00:00Z',median:11.83015,comparison:{date:'2026-10-19',change:0.01515,change_percent:0.128}};
test('optional evidence lookup succeeds, fails closed, and enforces timeout without signal cooperation', async () => {
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async()=>Response.json({report});
  assert.deepEqual(await loadHomeSummary('https://www.boliviablue.com'),report);
  globalThis.fetch=async()=>new Response('unavailable',{status:503});
  assert.equal(await loadHomeSummary('https://www.boliviablue.com'),null);
  globalThis.fetch=async()=>{throw new Error('offline');};
  assert.equal(await loadHomeSummary('https://www.boliviablue.com'),null);
  globalThis.fetch=()=>new Promise(()=>{});
  const start=Date.now();
  assert.equal(await loadHomeSummary('https://www.boliviablue.com',20),null);
  assert.ok(Date.now()-start<250);
 } finally {globalThis.fetch=original;}
});
test('homepage awaits delayed summary in both locales without changing caching or newer sections',async()=>{
 const original=globalThis.fetch;
 try {
  for(const language of ['es','en']) {
   globalThis.fetch=async url=>{
    const route=String(url);
    if(route.includes('view=home-summary')) {await new Promise(resolve=>setTimeout(resolve,15));return Response.json({report});}
    if(route.includes('/api/blue-rate'))return Response.json({});
    return new Response(template);
   };
   const response=await middleware(new Request('https://www.boliviablue.com/'+(language==='en'?'?lang=en':''),{headers:{accept:'text/html'}}));
   const html=await response.text();
   assert.match(html,/<section data-home-market-summary/);
   assert.match(html,/11\.83015/);
   assert.ok(html.includes(report.path+(language==='en'?'?lang=en':'')));
   assert.match(html,/comparar-qr-tarjeta/);
   assert.match(html,/efectivo-o-tarjeta-bolivia/);
   assert.match(html,/<details><summary/);
   assert.equal(response.headers.get('cache-control'),'public, s-maxage=300, stale-while-revalidate=900');
  }
 }finally{globalThis.fetch=original;}
});
