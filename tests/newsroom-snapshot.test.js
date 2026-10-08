import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceObservationModel, newsroomReport } from '../frontend/src/utils/sourceObservation.js';
import { readFileSync } from 'node:fs';
const time = '2026-10-08T00:00:00Z';
const rate = { buy: 10.1, sell: 10.3, updated_at_iso: time, source_observation: { version: 1, observed_at: time, method: 'median_of_platform_quotes', quote_asset: 'USDT', fiat: 'BOB', platforms: [{ id: 'binance', buy: 10, sell: 10.2 }, { id: 'eldorado', buy: 10.2, sell: 10.4 }] } };
test('shows only stored, matching, valid contributions', () => {
  assert.equal(sourceObservationModel(rate, Date.parse(time)).available, true);
  for (const alter of [ { source_observation: null }, { buy: 11 }, { updated_at_iso: '2026-10-08T01:00:00Z' }, { source_observation: {...rate.source_observation, platforms: []} }, { source_observation: {...rate.source_observation, platforms: [{id:'binance', buy:true, sell:10.3}]} } ]) assert.equal(sourceObservationModel({...rate,...alter}).available,false);
});
test('unknown provenance is not zero polled platforms, and stale stays explicit', () => {
  assert.match(newsroomReport({...rate,source_observation:null},'es',Date.parse(time)).text,/no significa que se consultaron cero/);
  assert.match(newsroomReport(rate,'en',Date.parse(time)+3600000).text,/Stale observation/);
  assert.doesNotMatch(newsroomReport(rate,'es',Date.parse(time)).text,/subió|bajó|increased|decreased/);
});
test('public newsroom omits prospecting desk and competitor pitch', () => {
  const s=readFileSync(new URL('../frontend/src/pages/PressKit.jsx',import.meta.url),'utf8');
  assert.doesNotMatch(s,/<OutreachDesk|Cadecocruz|Email listo para enviar/);
  assert.match(s,/<NewsroomSnapshot/);
});

test('accepts REAL float32 storage rounding but rejects nonnumeric aggregates', () => {
  assert.equal(sourceObservationModel({...rate,buy:Math.fround(rate.buy),sell:Math.fround(rate.sell)}).available,true);
  assert.equal(sourceObservationModel({...rate,buy:true}).available,false);
  assert.equal(sourceObservationModel({...rate,buy:'10.1'}).available,false);
});
