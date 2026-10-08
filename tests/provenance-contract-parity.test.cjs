const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSourceObservation, sourcePayload } = require('../shared/rateProvenance.cjs');
test('frontend direct reads and server readers agree on recorded and malformed observations', async () => {
  const { sourceObservationModel } = await import('../frontend/src/utils/sourceObservation.js');
  const t='2026-10-08T01:00:00.000Z';
  const cross={buy:12.3456789,sell:12.9876543,platforms:[{id:'binance',buy:12.3456789,sell:12.9876543}]};
  const sample=()=>({t,buy:Math.fround(cross.buy),sell:Math.fround(cross.sell),source_observation:createSourceObservation(cross,t)});
  const mutations=[()=>{},r=>r.source_observation=null,r=>r.t='2026-10-07T21:00:00-04:00',r=>r.t='2026-10-08T02:00:00Z',r=>r.source_observation.version=2,r=>r.source_observation.platforms[0].buy=1,r=>r.source_observation.platforms.push({...r.source_observation.platforms[0]}),r=>r.source_observation.platforms[0].id='unknown',r=>r.source_observation.platforms[0].sell='12.98',r=>{r.t='2026-02-30T01:00:00Z';r.source_observation.observed_at=r.t;},r=>{r.t='2026-10-08';r.source_observation.observed_at=r.t;}];
  for(const mutate of mutations){const r=sample();mutate(r);const backend=sourcePayload(r);const frontend=sourceObservationModel(r);assert.equal(frontend.available,backend.source_provenance==='persisted_observation');assert.deepEqual(frontend.observation,backend.source_observation);}
});
