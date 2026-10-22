const { test } = require('node:test');
const assert = require('node:assert/strict');
const { homeReportSummary } = require('../api/_lib/homeReportSummary');
const { createHandler } = require('../api/_lib/dailyReport');
const { createReport } = require('../shared/dailyEvidence.cjs');
const { database, record } = require('./daily-evidence-store.test.cjs');
const seed = require('../data/daily-evidence/2026-10-13-v1.json');
const now = new Date('2026-10-22T18:00:00Z');
function edition(revision, previousRows = seed.previous.evidence) {
  return createReport({ date: seed.date, rows: seed.day.evidence, previousRows, revision,
    generatedAt: seed.generated_at, correction: revision > 1 ? {reason:'Verified correction', previous_sha256:seed.sha256} : null });
}
const response = () => ({headers:{},body:null,setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},send(b){this.body=b;return this},end(){return this}});
async function request(db, method='GET') { const res=response();await createHandler(()=>db)({method,query:{view:'home-summary'}},res);return res; }

test('home summary projects exact verified evidence in three bounded reads without observations', async () => {
  const db=database([record(seed)]), summary=await homeReportSummary(db,now);
  assert.deepEqual(summary,{date:seed.date,revision:1,path:seed.path,sha256:seed.sha256,generated_at:seed.generated_at,median:seed.day.summary.mid,comparison:{date:seed.comparison.date,change:seed.comparison.change,change_percent:seed.comparison.change_percent}});
  assert.equal(db.reads,3);assert.equal(db.inserts,0);assert.equal('evidence' in summary,false);
});
test('revision selection is numeric and never promotes a lexicographic v9 over v10',async()=>{
  const v9=edition(9),v10=edition(10),db=database([record(v10),record(v9),record(seed)]);
  assert.equal((await homeReportSummary(db,now)).revision,10);assert.equal(db.reads,3);
});
test('no stored reports means no stale seed fallback; missing coverage omits change',async()=>{
  const db=database();assert.equal(await homeReportSummary(db,now),null);assert.equal(db.reads,1);
  const missing=edition(1,[]);assert.equal((await homeReportSummary(database([record(missing)]),now)).comparison,null);
});
test('unfinished report dates do not crowd out completed dates at La Paz midnight',async()=>{
  const future={...record(seed),slug:'evidence-p2p-2026-10-22-v99'};
  const today={...record(seed),slug:'evidence-p2p-2026-10-14-v1'};
  const midnight=createReport({date:seed.date,rows:seed.day.evidence,generatedAt:'2026-10-14T04:00:00Z'});
  const db=database([record(midnight),future,today]);
  assert.equal((await homeReportSummary(db,'2026-10-14T04:00:00Z')).date,seed.date);
  assert.equal(await homeReportSummary(database([record(seed)]),'2026-10-14T03:59:59Z'),null);
});
test('corrupt payload, discovery hash mismatch, malformed revision and revision overflow fail closed',async()=>{
  for(const rows of [
    [{...record(seed),content:'bad'}],
    [{...record(seed),excerpt:'0'.repeat(64)}],
    [record(seed),{...record(seed),slug:`evidence-p2p-${seed.date}-v100`}],
    Array.from({length:100},()=>record(seed)),
    [{...record(seed),slug:`evidence-p2p-${seed.date}-v01`}],
  ]) await assert.rejects(homeReportSummary(database(rows),now));
});
test('future generation and storage query errors fail closed',async()=>{
  const future=createReport({date:seed.date,rows:seed.day.evidence,generatedAt:'2099-01-01T00:00:00Z'});
  await assert.rejects(homeReportSummary(database([record(future)]),now));
  await assert.rejects(homeReportSummary(null,now));
  await assert.rejects(homeReportSummary({from(){throw Error('offline')}},now));
});
test('GET and HEAD have bounded caching, while unavailable storage returns uncached 503',async()=>{
  for(const method of ['GET','HEAD']) {
    const good=await request(database([record(seed)]),method);assert.equal(good.statusCode,200);
    assert.equal(good.headers['Cache-Control'],'public, s-maxage=300, stale-while-revalidate=600');
    if(method==='GET') {const body=JSON.parse(good.body);assert.equal(body.report.median,seed.day.summary.mid);assert.equal(body.unavailable,false);}
    else assert.equal(good.body,null);
    const bad=await request(null,method);assert.equal(bad.statusCode,503);assert.equal(bad.headers['Cache-Control'],'no-store');
    if(method==='GET')assert.doesNotMatch(bad.body,/11\.86175/);else assert.equal(bad.body,null);
  }
  const db=database();assert.equal((await request(db,'POST')).statusCode,405);assert.equal(db.reads,0);
});
