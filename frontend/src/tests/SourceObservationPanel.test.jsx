import AiCitationBlock from '../components/AiCitationBlock';
import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SourceObservationPanel from '../components/SourceObservationPanel';
const time='2026-10-08T12:00:00Z';
const rate={buy:11.905,sell:11.915,updatedAt:time,source_observation:{version:1,observed_at:time,method:'median_of_platform_quotes',quote_asset:'USDT',fiat:'BOB',platforms:[{id:'binance',buy:11.905000000000001,sell:11.915000000000001}]}};
describe('stored observation display',()=>{
 for(const language of ['es','en']) {
  it(`shows consistent rounded source values while retaining raw snapshot: ${language}`,()=>{
   const before=JSON.stringify(rate);
   const {container}=render(<MemoryRouter><SourceObservationPanel rate={rate} language={language}/></MemoryRouter>);
   expect([...container.querySelectorAll('td')].map(x=>x.textContent)).toEqual(['11.90','11.91']);
   expect(container.textContent).toContain(language==='es'?'el JSON conserva la precisión guardada':'JSON retains the stored precision');
   expect(JSON.stringify(rate)).toBe(before);cleanup();
   const answer=buildLiveRateSeoMeta({...normalizeDollarRatePayload(rate),page:'home',language}).answer;
   const rendered=render(<MemoryRouter><AiCitationBlock language={language} citePath="/" answerOverride={answer}/></MemoryRouter>);
   expect(rendered.container.querySelector('#respuesta-dolar-blue-bolivia').textContent).toMatch(/Binance P2P: (compra|buy) Bs 11\.90, (venta|sell) Bs 11\.91/);
   cleanup();
  });
  it(`never invents source rows for unknown metadata: ${language}`,()=>{
   const {container}=render(<MemoryRouter><SourceObservationPanel rate={{...rate,source_observation:null}} language={language}/></MemoryRouter>);
   expect(container.querySelector('table')).toBeNull();
   expect(container.textContent).toContain(language==='es'?'Desglose de fuentes no disponible':'Source breakdown unavailable');cleanup();
  });
 }
});
