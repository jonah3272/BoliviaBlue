import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware from '../middleware.js';
import { renderQrCardHtml, renderSantaCruzHtml } from '../seo/paymentToolsSeo.js';
const template=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
it('serves truthful tool guidance, one localized identity, and canonical metadata without JavaScript',()=>{
 for(const render of [renderQrCardHtml,renderSantaCruzHtml])for(const search of ['', '?lang=en']) {
  const html=render(template,search),twice=render(html,search);
  assert.equal((twice.match(/<h1\b/g)||[]).length,1);
  assert.equal((twice.match(/rel="canonical"/g)||[]).length,1);
  assert.equal((twice.match(/<meta name="description"/g)||[]).length,1);
  assert.match(twice,/data-seo-shell="payment-tool"/);
  assert.ok(twice.includes(search?'lang="en"':'lang="es"'));
  assert.doesNotMatch(twice,/NaN|Infinity|Invalid Date/);
  assert.match(twice,/<script[^>]+src=/);
 }
});
it('serves the exact same guidance and provider facts to Googlebot and visitors, including HEAD',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(template);
  for(const route of ['/comparar-qr-tarjeta','/dolar-blue-santa-cruz'])for(const search of ['', '?lang=en']){
   const bodies=[];
   for(const agent of ['Mozilla/5.0','Googlebot']){
    const r=await middleware(new Request('https://www.boliviablue.com'+route+search,{headers:{Accept:'text/html','User-Agent':agent}}));
    assert.equal(r.status,200);bodies.push(await r.text());
   }
   assert.equal(bodies[0],bodies[1]);
   const head=await middleware(new Request('https://www.boliviablue.com'+route+'/index.html'+search,{method:'HEAD',headers:{Accept:'text/html'}}));
   assert.equal(head.status,200);assert.equal(await head.text(),'');
  }
 }finally{globalThis.fetch=original;}
});
