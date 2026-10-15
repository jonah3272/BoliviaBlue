const {test}=require('node:test');const assert=require('node:assert/strict');
const store=require('../api/_lib/dailyEvidenceStore');const seed=require('../data/daily-evidence/2026-10-13-v1.json');const {createHandler}=require('../api/_lib/dailyReport');
function database(initial=[]){let rows=initial, reads=0,inserts=0;return {get rows(){return rows},get inserts(){return inserts},get reads(){return reads},from(table){let filters=[],first=0,last=Infinity,sort=null;const q={select(){return q},eq(k,v){filters.push(r=>r[k]===v);return q},lt(k,v){filters.push(r=>r[k]<v);return q},gte(k,v){filters.push(r=>r[k]>=v);return q},order(k,{ascending}){sort={k,ascending};return q},range(a,b){first=a;last=b;return q},limit(n){last=n-1;return q},async maybeSingle(){const out=await q;return {data:out.data[0]||null,error:null}},async insert(record){inserts++;if(rows.some(r=>r.slug===record.slug))return {error:{code:'23505'}};rows.push(record);return {error:null}},then(resolve,reject){reads++;let out=rows.filter(r=>filters.every(f=>f(r)));if(sort)out.sort((a,b)=>String(a[sort.k]).localeCompare(String(b[sort.k]))*(sort.ascending?1:-1));return Promise.resolve({data:out.slice(first,last+1),error:null}).then(resolve,reject)}};return q}}}
function record(r=seed){return{slug:store.slugFor(r.date,r.revision),category:store.CATEGORY,language:'es',content:store.encodeReport(r),excerpt:r.sha256,published_at:r.generated_at};}
test('compressed stored payload validates and corruption fails closed',()=>{assert.deepEqual(store.decodeReport(store.encodeReport(seed)),seed);assert.throws(()=>store.decodeReport('bad'));assert.throws(()=>store.decodeReport('x'.repeat(500001)));let broken=JSON.parse(JSON.stringify(seed));broken.day.summary.mid=999;assert.throws(()=>store.encodeReport(broken));});
test('publication inserts once, reads back verified evidence, never updates an edition',async()=>{let db=database();let first=await store.insertReport(db,seed),second=await store.insertReport(db,seed);assert.equal(first.inserted,true);assert.equal(second.inserted,false);assert.equal(db.inserts,1);assert.equal(second.report.sha256,seed.sha256);});
test('invalid existing records block publication instead of being overwritten',async()=>{let db=database([{...record(),content:'invalid'}]);await assert.rejects(store.insertReport(db,seed));assert.equal(db.inserts,0);});
test('archive pagination includes all revisions and advertises earlier dates',async()=>{const rows=[];for(let i=1;i<=40;i++){const d=new Date(Date.UTC(2027,0,i)).toISOString().slice(0,10);for(let rev=1;rev<=3;rev++)rows.push({slug:store.slugFor(d,rev),category:store.CATEGORY,language:'es',excerpt:seed.sha256,published_at:'2027-03-01T00:00:00Z'});}const db=database(rows),a=await store.listReports(db);assert.equal(new Set(a.reports.map(r=>r.date)).size,30);assert.equal(a.reports.length,90);assert.ok(a.next_before);const b=await store.listReports(db,a.next_before);assert.ok(b.reports.length);assert.ok(b.reports.every(r=>r.date<a.next_before));assert.equal(new Set(a.reports.map(r=>r.path)).size,90);});
test('archive storage failure retains seeds and reports unavailable status',async()=>{const db={from(){throw new Error('unavailable')}};let a=await store.listReports(db);assert.equal(a.unavailable,true);assert.equal(a.reports.length,5);});
test('exact-date read refuses unexpected volume rather than publishing capped history',async()=>{const db=database(Array.from({length:10001},(_,i)=>({id:i,t:'2026-10-13T12:00:00Z'})));await assert.rejects(store.fetchDayRows(db,'2026-10-13'),/volume/);});
function response(){return {headers:{},statusCode:null,body:null,setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},send(b){this.body=b;return this},end(){return this}}}
test('report endpoint serves HTML, JSON, CSV, SVG, citations and HEAD from frozen seed',async()=>{const handler=createHandler(()=>database());for(const format of ['html','json','csv','svg','txt']){const res=response();await handler({method:'GET',query:{date:seed.date,revision:'1',format},headers:{}},res);assert.equal(res.statusCode,200);assert.equal(res.headers['X-Evidence-SHA256'],seed.sha256);assert.ok(res.body.includes(seed.sha256));}const head=response();await handler({method:'HEAD',query:{date:seed.date,format:'html'}},head);assert.equal(head.statusCode,200);assert.equal(head.body,null);});
test('endpoint rejects invalid parameters and corrupt evidence without numbers',async()=>{let res=response();await createHandler(()=>database())({method:'GET',query:{date:'2026-99-99'}},res);assert.equal(res.statusCode,400);res=response();await createHandler(()=>database([{...record(),slug:'evidence-p2p-2026-10-15-v1',content:'bad'}]))({method:'GET',query:{date:'2026-10-15',format:'html'}},res);assert.equal(res.statusCode,503);assert.doesNotMatch(res.body,/11\.86175/);assert.equal(res.headers['X-Robots-Tag'],'noindex, follow');});
module.exports={database,record};
test('backend callers can import the publisher without a root database-client installation',()=>{
  const {spawnSync}=require('node:child_process');
  const publisherPath=require.resolve('../scripts/publish-daily-evidence.cjs');
  const child=spawnSync(process.execPath,['-e',`
    const Module=require('node:module');
    const original=Module._load;
    Module._load=function(name,...args){
      if(name==='@supabase/supabase-js')throw new Error('Root database client is deliberately unavailable');
      return original.call(this,name,...args);
    };
    const publisher=require(${JSON.stringify(publisherPath)});
    if(typeof publisher.publishDate!=='function')throw new Error('Publisher export missing');
  `],{encoding:'utf8'});
  assert.equal(child.status,0,child.stderr);
});
