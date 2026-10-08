import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { sourceObservationModel } from '../frontend/src/utils/sourceObservation.js';
const base = {buy:10.1,sell:10.3,mid:10.2,official_buy:6.86,official_sell:6.96};
const observation = t => ({version:1,observed_at:t,method:'median_of_platform_quotes',quote_asset:'USDT',fiat:'BOB',platforms:[{id:'binance',buy:10.1,sell:10.3}]});
async function run(row, healed) {
  const query = new Proxy({}, {get(_,key) {if(key==='single') return async()=>({data:row});if(key==='maybeSingle')return async()=>({data:null});if(key==='then')return (resolve)=>resolve({data:null});return ()=>query;}});
  const context={supabase:{from:()=>query},sourceObservationModel,logger:{warn(){},error(){}},console,Date,Map,Number,Promise,setTimeout:()=>0,fetch:async()=>({ok:true,json:async()=>healed})};
  vm.createContext(context);
  const source=readFileSync(new URL('../frontend/src/utils/api.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
  vm.runInContext(source+'\nthis.fetchRate = fetchBlueRate;',context);
  return context.fetchRate();
}
test('direct Supabase read carries validated snapshot and source count',async()=>{
 const t=new Date().toISOString();const data=await run({...base,t,source_observation:observation(t)});
 assert.equal(data.source_provenance,'persisted_observation');assert.equal(data.source_count,1);assert.equal(data.source_observation.observed_at,t);
});
test('heal replaces snapshot with new row and does not inherit sources when absent',async()=>{
 const t=new Date(Date.now()-3600000).toISOString(), fresh=new Date().toISOString();
 const old={...base,t,source_observation:observation(t),sources_used:['binance'],source_count:1};
 const payload={buy_bob_per_usd:10.1,sell_bob_per_usd:10.3,updated_at_iso:fresh};
 const unavailable=await run(old,payload);assert.equal(unavailable.source_observation,null);assert.equal(unavailable.source_count,null);assert.equal(unavailable.sources_used.length,0);
 const available=await run(old,{...payload,source_observation:observation(fresh)});assert.equal(available.source_observation.observed_at,fresh);assert.equal(available.source_provenance,'persisted_observation');
 const mismatch=await run(old,{...payload,source_observation:observation(t)});assert.equal(mismatch.source_observation,null);
});
