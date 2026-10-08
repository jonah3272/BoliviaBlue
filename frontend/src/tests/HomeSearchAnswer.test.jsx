import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiCitationBlock from '../components/AiCitationBlock';
import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
const time='2026-10-08T12:00:00Z';
const rate={buy:10.125,sell:10.375,updatedAt:time,source_observation:{version:1,observed_at:time,method:'median_of_platform_quotes',quote_asset:'USDT',fiat:'BOB',platforms:[{id:'binance',buy:10.125,sell:10.375}]}};
describe('homepage rendered answer',()=>{
 for(const language of ['es','en']) for(const state of ['stored','unknown','invalid','stale','no-time','unavailable']) it(`${language} ${state}`,()=>{
  const input=state==='unavailable'?null:{...rate,source_observation:state==='unknown'?null:state==='invalid'?{...rate.source_observation,observed_at:'2026-10-07T12:00:00Z'}:rate.source_observation,updatedAt:state==='no-time'?null:time};
  const model=buildLiveRateSeoMeta({...normalizeDollarRatePayload(input),language,page:'home',now:Date.parse(time)+(state==='stale'?86400000:0)});
  const {container}=render(<MemoryRouter><AiCitationBlock language={language} citePath="/" answerOverride={model.answer} summaryLabel={model.observation}/></MemoryRouter>);
  expect(container.querySelector('#respuesta-dolar-blue-bolivia').textContent).toBe(model.answer);
  expect(container.querySelector('#respuesta-dolar-blue-bolivia-desktop').textContent).toBe(model.answer);
  if(['stored','stale'].includes(state)) expect(model.answer).toContain('Binance P2P');
  else expect(model.answer).not.toContain('Binance P2P');
  if(state==='stale') expect(model.answer).toMatch(/desactualizada|stale/);
  cleanup();
 });
});
