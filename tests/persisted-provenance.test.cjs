const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const p = require('../shared/rateProvenance.cjs');
const root = path.resolve(__dirname, '..');
const t = '2026-10-08T01:00:00.000Z';
const cross = { buy: 12, sell: 14, sources_used: ['binance','eldorado'], platforms: [{ id:'binance', buy:11, sell:13 },{ id:'eldorado', buy:13, sell:15 }] };
const row = () => ({ t, buy:12, sell:14, source_observation:p.createSourceObservation(cross,t) });

test('snapshot copies only observed public quote fields and survives serialization/timezone normalization', () => {
  const r = row();
  r.source_observation.platforms[0].merchant = 'private';
  assert.equal(p.readSourceObservation(r).platforms[0].merchant, undefined);
  assert.equal(p.sourcePayload(JSON.parse(JSON.stringify({ ...r, t:'2026-10-07T21:00:00-04:00' }))).source_count, 2);
  assert.equal(p.sourcePayload({ t, buy:12, sell:14 }).source_count, 0);
  assert.deepEqual(p.sourcePayload(r).sources_used, cross.sources_used);
});

test('invalid, mismatched, duplicate and unsupported provenance is never presented as recorded', () => {
  const mutations = [s=>s.version=2, s=>s.method='guess', s=>s.fiat='USD', s=>s.quote_asset='USD', s=>s.observed_at='invalid', s=>s.observed_at='2025-01-01T00:00:00Z', s=>s.platforms=[], s=>s.platforms[0].id='unknown', s=>s.platforms[1].id='binance', s=>s.platforms[0].buy='11', s=>s.platforms[0].buy=0, s=>s.platforms[0].sell=NaN, s=>s.platforms[0].buy=10];
  for(const mutate of mutations) {
    const r=row(); mutate(r.source_observation);
    assert.equal(p.sourcePayload(r).source_provenance,'unavailable_for_stored_row');
    assert.equal(p.sourcePayload(r).source_observation,null);
  }
  assert.throws(()=>p.createSourceObservation({ ...cross, platforms:[] },t));
});

test('serverless refresh atomically inserts source snapshot with unchanged quote values', async () => {
  const inserts=[];
  const supabase={ from(table){ assert.equal(table,'rates'); return { insert:async value=>{inserts.push(value);return {error:null};} }; } };
  const context={module:{exports:{}},console,Date,process:{env:{}},fetch:async()=>({ok:false}),require(name){
    if(name.includes('rateProvenance'))return p;
    if(name==='@supabase/supabase-js')return {};
    if(name==='./p2pCrossSource')return {fetchCrossSourceBobRates:async()=>cross,fetchBinanceSide:async()=>4};
    if(name==='./fxDerive')return require('../api/_lib/fxDerive');
    if(name==='./officialRate')return {resolveOfficialRate:async()=>({official_buy:6.86,official_sell:6.96,official_mid:6.91})};
    if(name==='./cardRate')return {refreshCardRates:async()=>null};
    throw Error(name);
  }};
  vm.runInNewContext(fs.readFileSync(path.join(root,'api/_lib/binanceRefresh.js'),'utf8'),context);
  const result=await context.module.exports.refreshBlueFromBinance(supabase);
  assert.equal(inserts.length,1);
  assert.equal(inserts[0].buy,12);assert.equal(inserts[0].sell,14);assert.equal(inserts[0].mid,13);
  assert.equal(p.sourcePayload(inserts[0]).source_count,2);
  assert.equal(result.row.source_observation.observed_at,result.row.t);
  assert.equal(result.row.buy_bob_per_brl,3);
});

test('backend insertRate persists exact snapshot and legacy callers remain unknown', async () => {
  let source=fs.readFileSync(path.join(root,'backend/db-supabase.js'),'utf8');
  source=source.slice(source.indexOf('export async function insertRate'),source.indexOf('/**\n * Get the most recent rate')).replace('export async function','async function');
  const writes=[];
  const context={module:{exports:{}},console,LOCAL_MODE:false,readSourceObservation:p.readSourceObservation,supabase:{from(){return{insert(value){writes.push(value);return{select(){return{single:async()=>({data:value,error:null})}}}}}}}};
  vm.runInNewContext(source+'\nmodule.exports=insertRate;',context);
  const args=[t,12,14,13,6.86,6.96,6.91,...Array(9).fill(null)];
  await context.module.exports(...args,{source_observation:row().source_observation});
  await context.module.exports(...args);
  assert.equal(p.sourcePayload(writes[0]).source_count,2);
  assert.equal(writes[1].source_observation,null);
  await assert.rejects(context.module.exports(...args,{source_observation:{version:99}}), /Invalid source observation/);
  assert.equal(writes.length,2);
  const scheduler=fs.readFileSync(path.join(root,'backend/scheduler-supabase.js'),'utf8');
  assert.match(scheduler,/source_observation: blueRateData.source_observation/);
  assert.match(scheduler,/source_observation: storedRate\?\.source_observation \?\? null/);
});

test('historical export reports mixed coverage and preserves legacy CSV schema', async () => {
  const {fetchHistoricalExport,exportOptions,toCsv}=require('../api/_lib/historicalExport');
  const rows=[row(),{t:'2026-10-07T01:00:00Z',buy:10,sell:11}];
  const q={select(){return q},lte(){return q},order(){return q},range(){return q},gte(){return q},then(resolve){return Promise.resolve({data:rows,error:null}).then(resolve)}};
  const result=await fetchHistoricalExport({from:()=>q},exportOptions({},new Date('2026-10-08T02:00:00Z')));
  assert.equal(result.metadata.source_provenance,'mixed');
  assert.equal(result.metadata.provenance_rows_recorded,1);
  assert.equal(result.metadata.provenance_rows_unavailable,1);
  assert.equal(result.points[0].source_observation,null);
  assert.equal(result.points[1].source_count,2);
  assert.equal(toCsv(result.points).split('\n')[0],'t,buy,sell,mid,official_buy,official_sell,official_mid');
});

test('PostgreSQL REAL rounding keeps recorded provenance without accepting materially different aggregates', () => {
  const quotes={buy:12.3456789,sell:12.9876543,platforms:[{id:'okx',buy:12.3456789,sell:12.9876543}]};
  const stored={t,buy:Math.fround(quotes.buy),sell:Math.fround(quotes.sell),source_observation:p.createSourceObservation(quotes,t)};
  assert.equal(p.sourcePayload(stored).source_count,1);
  assert.equal(p.sourcePayload({...stored,buy:stored.buy+0.0001}).source_count,0);
});
