import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SourceObservationPanel from '../components/SourceObservationPanel';
import { renderHomeSourceComparison } from '../utils/homeSourceComparison';
import RateTrioStrip from '../components/RateTrioStrip';
vi.mock('../utils/api', () => ({ fetchCardRates: vi.fn(async () => null) }));
const now = new Date('2026-10-24T13:40:00Z'), time='2026-10-24T13:35:35.531Z';
const rate = { buy:12,sell:11.96,updatedAt:time,source_observation:{version:1,observed_at:time,method:'median_of_platform_quotes',quote_asset:'USDT',fiat:'BOB',platforms:[{id:'binance',buy:12,sell:11.96},{id:'eldorado',buy:12.08,sell:11.85},{id:'bybit',buy:11.989,sell:11.96}]},official_buy:11.88,official_sell:11.88,official_mid:11.88,official_observation:{version:1,status:'verified',source:'bcb',source_url:'https://www.bcb.gob.bo/',source_date:'2026-10-24',observed_at:'2026-10-24T13:00:00Z',buy:11.88,sell:11.88,mid:11.88} };
afterEach(() => { cleanup();vi.useRealTimers(); });
const facts = element => ({ text:element.textContent.replace(/\s+/g,' ').trim(),times:[...element.querySelectorAll('time')].map(t=>t.dateTime),links:[...element.querySelectorAll('a')].map(a=>a.getAttribute('href')),cells:[...element.querySelectorAll('td')].map(td=>td.textContent),tables:element.querySelectorAll('table').length });
const cases = {
 fresh:rate, stale:{...rate,is_stale:true,official_observation:{...rate.official_observation,status:'stale'}}, missing:null,
 malformed:{...rate,source_observation:{...rate.source_observation,observed_at:'invalid'}},
 mismatched:{...rate,source_observation:{...rate.source_observation,observed_at:'2026-10-24T12:00:00Z'}},
 officialOnly:{...rate,buy:null,sell:null}, legacyOfficial:{...rate,official_observation:null},
 asymmetricOfficial:{...rate,official_buy:6.86,official_sell:6.96,official_mid:6.91,official_observation:{...rate.official_observation,buy:6.86,sell:6.96,mid:6.91}},
 hostile:{...rate,source_observation:{...rate.source_observation,platforms:[{id:'<img src=x onerror=alert(1)>',buy:12,sell:11.96}]},official_observation:{...rate.official_observation,source_url:'javascript:alert(1)'}},
 future:{...rate,updatedAt:'2099-10-24T13:35:35.531Z',source_observation:{...rate.source_observation,observed_at:'2099-10-24T13:35:35.531Z'}},
};
for(const language of ['es','en']) describe(`homepage source comparison ${language}`, () => {
 it('survives browser translation before rates arrive and during repeated refreshes', () => {
  vi.setSystemTime(now);
  const draw=(input,loading=false,error=null)=><MemoryRouter><SourceObservationPanel homepage rate={input} language={language} loading={loading} error={error}/></MemoryRouter>;
  const {container,rerender}=render(draw(null,true));
  const translate = () => {
   // Chrome Translate replaces React-owned Text nodes with nested <font> nodes.
   // Keep their original references detached, exactly as the browser does.
   const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walker.nextNode()) nodes.push(walker.currentNode);
   for(const node of nodes) {
    if(!node.textContent.trim() || node.parentElement.closest('font')) continue;
    const outer=document.createElement('font'),inner=document.createElement('font');
    inner.textContent=`Translated: ${node.textContent}`;outer.appendChild(inner);
    node.replaceWith(outer);
   }
  };
  translate();
  expect(()=>rerender(draw(rate))).not.toThrow();
  expect(container.querySelector('table')).toBeTruthy();
  expect(container.querySelector('time').dateTime).toBe(time);
  expect(container.querySelector('time').textContent).not.toContain('Translated:');
  translate();
  expect(()=>rerender(draw(rate,false,'offline'))).not.toThrow();
  expect(container.textContent).toMatch(/actualización pendiente|update pending/);
  translate();
  expect(()=>rerender(draw(null,true))).not.toThrow();
  expect(container.querySelector('table')).toBeNull();
  translate();
  expect(()=>rerender(draw(rate))).not.toThrow();
  expect(container.querySelector('table')).toBeTruthy();
 });
 for(const [name,input] of Object.entries(cases)) it(`matches the initial HTML's complete visible evidence: ${name}`, () => {
  vi.setSystemTime(now);
  const initial=document.createElement('div');initial.innerHTML=renderHomeSourceComparison(input,language,now.getTime());
  const {container}=render(<MemoryRouter><SourceObservationPanel homepage rate={input} language={language}/></MemoryRouter>);
  expect(facts(container)).toEqual(facts(initial));
  expect(container.querySelectorAll('[data-home-source-comparison]')).toHaveLength(1);
  expect(container.querySelector('img,script,[onerror]')).toBeNull();
 });
 it('replaces the initial table once and handles language/loading/error refreshes', () => {
  vi.setSystemTime(now);
  const root=document.createElement('div');root.innerHTML=renderHomeSourceComparison(rate,language,now.getTime());document.body.appendChild(root);
  const draw=(input,loading=false,error=null,lang=language)=><MemoryRouter><SourceObservationPanel homepage rate={input} language={lang} loading={loading} error={error}/></MemoryRouter>;
  const {container,rerender}=render(draw(rate),{container:root});
  expect(container.querySelectorAll('table')).toHaveLength(1);
  rerender(draw(rate,true));expect(container.querySelectorAll('table')).toHaveLength(1);
  rerender(draw(rate,false,'offline'));expect(container.querySelectorAll('table')).toHaveLength(1);expect(container.textContent).toMatch(/actualización pendiente|update pending/);
  rerender(draw(rate,false,null,language==='en'?'es':'en'));expect(container.querySelectorAll('table')).toHaveLength(1);
  rerender(draw(null,true));expect(container.querySelector('table')).toBeNull();expect(container.querySelector('[role="status"]')).toBeTruthy();
  rerender(draw(null,false,'offline'));expect(container.querySelector('table')).toBeNull();expect(container.textContent).toMatch(/Desglose de fuentes no disponible|Source breakdown unavailable/);
 });
});
it('hides only duplicate BCB content on Home and preserves cash/card controls; default keeps BCB elsewhere', () => {
 vi.setSystemTime(now);
 const component=showOfficialReference=><MemoryRouter><RateTrioStrip buy={12} sell={11.96} updatedAt={time} cardRate={11.9} cardUpdatedAt={time} officialBuy={11.88} officialSell={11.88} officialMid={11.88} officialObservation={rate.official_observation} language="en" showOfficialReference={showOfficialReference}/></MemoryRouter>;
 const {container,rerender}=render(component(false));
 expect(container.textContent).not.toMatch(/11\.88|BCB reference|If your bank uses BCB|· BCB/);
 expect(container.querySelector('select')).toBeTruthy();expect(container.querySelector('[data-daily-payment-result]')).toBeTruthy();
 rerender(component(true));expect(container.textContent).toContain('BCB reference');expect(container.textContent).toContain('11.88');
});
