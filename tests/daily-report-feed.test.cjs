const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHandler } = require('../api/_lib/dailyReport');
const { renderFeed, publicationDate, feedBefore, FEED_URL } = require('../api/_lib/dailyReportFeed');
const { createReport, reportPath } = require('../shared/dailyEvidence.cjs');
const store = require('../api/_lib/dailyEvidenceStore');
const seed = require('../data/daily-evidence/2026-10-13-v1.json');
const { database, record } = require('./daily-evidence-store.test.cjs');
const now = '2026-12-31T12:00:00Z';
const response = () => ({ headers: {}, body: null, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.statusCode=n; return this; }, send(body) { this.body=body; return this; }, end() { return this; } });
async function request(db, method='GET', query={view:'feed'}) { const res=response(); await createHandler(()=>db)({ method, query },res); return res; }
function report(date, revision=1, previous=null) {
  const shift = Date.parse(`${date}T04:00:00Z`) - Date.parse(seed.day.start);
  const rows = seed.day.evidence.map(row => ({ ...row, t: new Date(Date.parse(row.t)+shift).toISOString(), source_observation: { ...row.source_observation, observed_at: new Date(Date.parse(row.source_observation.observed_at)+shift).toISOString() } }));
  return createReport({date, rows, revision, generatedAt: now, correction: previous ? { reason: 'Review <&> "quoted"', previous_sha256: previous.sha256 } : null });
}
const summary = (date, revision=1, published_at='2026-12-30T12:00:00Z') => ({date,revision,path:reportPath(date,revision),published_at});

test('feed route reuses existing serverless handler and precedes press shell', () => {
  const config=require('../vercel.json');
  const route=config.rewrites.find(r=>r.source==='/prensa/informes/rss.xml');
  assert.equal(route.destination,'/api/historical-data?feature=daily-evidence&view=feed');
  assert.ok(config.rewrites.indexOf(route)<config.rewrites.findIndex(r=>r.source==='/prensa'));
  assert.equal(fs.existsSync('api/daily-report.js'),false);
});
test('GET and HEAD serve RSS metadata; mutation methods do not read or write storage', async () => {
  const db=database();
  for(const method of ['GET','HEAD']) {
    const res=await request(db,method);
    assert.equal(res.statusCode,200);
    assert.equal(res.headers['Content-Type'],'application/rss+xml; charset=utf-8');
    assert.equal(res.headers['X-Content-Type-Options'],'nosniff');
    assert.equal(res.headers['Cache-Control'],'public, max-age=0, s-maxage=300, must-revalidate');
    if(method==='GET') { assert.match(res.body,/<language>es<\/language>/); assert.ok(res.body.includes(`href="${FEED_URL}" rel="self" type="application/rss+xml"`)); }
    else assert.equal(res.body,null);
  }
  const reads=db.reads;
  for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS']) assert.equal((await request(db,method)).statusCode,405);
  assert.equal(db.reads,reads); assert.equal(db.inserts,0);
});
test('seed entries omit pubDate and stay byte-stable across requests, query options ignored', async () => {
  const db=database([record()]);
  const first=await request(db), second=await request(db,'GET',{view:'feed',before:'2026-01-01',lang:'en',format:'html'});
  assert.equal(first.body,second.body); assert.doesNotMatch(first.body,/<pubDate>|lastBuildDate|11\.86175/);
  assert.equal((first.body.match(/<item>/g)||[]).length,5);
  assert.match(first.body,/no un registro exhaustivo de correcciones antiguas/);
});
test('future observed dates cannot crowd eligible dates from storage window', async () => {
  const future=Array.from({length:40},(_,i)=>({slug:store.slugFor(new Date(Date.UTC(2090,0,i+1)).toISOString().slice(0,10)), category:store.CATEGORY,language:'es',excerpt:seed.sha256,published_at:now}));
  const res=await request(database(future));
  assert.equal(res.statusCode,200); assert.equal((res.body.match(/<item>/g)||[]).length,5); assert.doesNotMatch(res.body,/2090/);
  assert.equal(feedBefore('2026-10-14T03:59:59Z'),'2026-10-13');
  assert.equal(feedBefore('2026-10-14T04:00:00Z'),'2026-10-14');
});
test('new stored report and v2 appear on the next read without deploy; v1 identity unchanged', async () => {
  const db=database(), first=await request(db);
  // Use a completed non-seed date; generated_at is not publication time.
  const v1=report('2026-10-08'), v2=report('2026-10-08',2,v1);
  db.rows.push({...record(v1),published_at:'2026-10-14T23:00:00Z'});
  const second=await request(db);
  assert.equal(second.statusCode,200); assert.ok(!first.body.includes(v1.url)); assert.ok(second.body.includes(`<guid isPermaLink="true">${v1.url}</guid>`));
  db.rows.push({...record(v2),published_at:'2026-10-15T01:00:00Z'});
  const third=await request(db);
  assert.ok(third.body.includes(`<guid isPermaLink="true">${v2.url}</guid>`));
  const item=xml=>xml.match(new RegExp(`<item><title>Día observado 2026-10-08 · revisión 1[\\s\\S]*?</item>`))[0];
  assert.equal(item(second.body),item(third.body)); assert.match(third.body,/<pubDate>Thu, 15 Oct 2026 01:00:00 GMT<\/pubDate>/);
  assert.doesNotMatch(third.body,/Review|quoted|11\.86175/); assert.equal(db.inserts,0);
});
test('30 distinct observed dates retain every boundary revision and dedupe seed/storage overlaps', async () => {
  const rows=[];
  for(let i=1;i<=35;i++) { const date=new Date(Date.UTC(2026,10,i)).toISOString().slice(0,10); for(let rev=1;rev<=4;rev++) rows.push(summary(date,rev)); }
  const xml=renderFeed([...rows,...rows,summary('2099-01-01')],now);
  assert.equal((xml.match(/<item>/g)||[]).length,120);
  for(let revision=1;revision<=4;revision++) assert.ok(xml.includes(`2026-11-06/v${revision}</guid>`));
  assert.doesNotMatch(xml,/2026-11-05|2099/);
  assert.equal((await request(database([record(),record()]))).body.match(/<item>/g).length,5);
});
test('storage pagination keeps all revisions at 30-date boundary, including multi-page dates', async () => {
  const rows=[];
  for(let i=1;i<=35;i++) { const date=new Date(Date.UTC(2026,10,i)).toISOString().slice(0,10); for(let rev=1;rev<=12;rev++) rows.push({...record(),slug:store.slugFor(date,rev)}); }
  // Verify actual newest stored payload, while discovery-only older rows need metadata.
  const latest=report('2026-12-05',12,report('2026-12-05',11,seed));
  rows.find(r=>r.slug===store.slugFor(latest.date,12)).content=store.encodeReport(latest);
  const archive=await store.listReports(database(rows),feedBefore(now));
  assert.equal(archive.unavailable,false);
  assert.equal(archive.reports.length,360);
  const xml=renderFeed(archive.reports,now);
  assert.equal((xml.match(/<item>/g)||[]).length,360);
  assert.ok(xml.includes('2026-11-06/v12</guid>')); assert.ok(xml.includes('2026-11-06/v1</guid>'));
});
test('publication dates require valid stored timezone timestamps, never observation or generation time', () => {
  for(const value of [null,undefined,'','bad','2026-12-30','2026-12-30T12:00:00','2026-02-30T00:00:00Z','2099-01-01T00:00:00Z','2026-12-30T25:00:00Z']) assert.equal(publicationDate(value,now),null);
  assert.equal(publicationDate('2026-12-30T08:00:00.123456-04:00',now),'Wed, 30 Dec 2026 12:00:00 GMT');
  const xml=renderFeed([{...summary('2026-12-29',1,'invalid'),generated_at:'2026-12-30T12:00:00Z'},summary('2026-12-29',2,'2099-01-01T00:00:00Z')],now);
  assert.doesNotMatch(xml,/<pubDate>/);
});
test('untrusted metadata cannot become XML markup or external links', () => {
  const xml=renderFeed([{...summary('2026-12-29'),path:'https://evil.test/<&>'},summary('2026-12-29'),{date:'<&>',revision:1,path:'<&>'}],now);
  assert.equal((xml.match(/<item>/g)||[]).length,1);
  assert.doesNotMatch(xml,/evil|<script/);
  // All text escaping is shared with existing evidence exports.
  assert.equal(require('../shared/dailyEvidenceRender.cjs').esc('<&>"\''),'&lt;&amp;&gt;&quot;&#39;');
});
test('missing, failed and corrupt storage fail uncached 503 rather than seed-only RSS', async () => {
  for(const db of [null,{from(){throw new Error('offline')}},database([{...record(),slug:store.slugFor('2026-10-14'),content:'bad'}])]) {
    for(const method of ['GET','HEAD']) {
      const res=await request(db,method);
      assert.equal(res.statusCode,503); assert.equal(res.headers['Cache-Control'],'no-store');
      if(method==='GET') assert.doesNotMatch(res.body,/<rss|<item|2026-10-13/); else assert.equal(res.body,null);
    }
  }
});
test('press archive discovery is bilingual, explicit about Spanish and keeps language alternates', async () => {
  const {renderArchiveHtml,reportFeedHead}=await import('../frontend/src/data/dailyEvidenceArchive.js');
  assert.match(renderArchiveHtml([], 'es'),/Informes diarios RSS/);
  assert.match(renderArchiveHtml([], 'en'),/Daily reports RSS \(Spanish\)/);
  const {applyArchivePaginationMetadata}=await import('../middleware.js');
  const head='<head><link rel="alternate" hreflang="es" href="https://www.boliviablue.com/prensa">'+reportFeedHead()+'</head>';
  const result=applyArchivePaginationMetadata(head,'2026-10-10','en');
  assert.ok(result.includes('href="'+FEED_URL+'"')); assert.match(result,/hreflang="es" href="https:\/\/www.boliviablue.com\/prensa\?before=2026-10-10/);
});

test('RSS parses as XML with absolute canonical links and one GUID per revision', async () => {
  const { JSDOM } = require('../frontend/node_modules/jsdom');
  const res=await request(database());
  const document=new JSDOM(res.body,{contentType:'application/xml'}).window.document;
  assert.equal(document.documentElement.tagName,'rss');
  assert.equal(document.querySelector('parsererror'),null);
  assert.equal(document.querySelector('channel > language').textContent,'es');
  const self=document.getElementsByTagNameNS('http://www.w3.org/2005/Atom','link')[0];
  assert.equal(self.getAttribute('href'),FEED_URL); assert.equal(self.getAttribute('rel'),'self');
  const guids=[...document.querySelectorAll('item > guid')];
  assert.equal(new Set(guids.map(g=>g.textContent)).size,5);
  for(const item of document.querySelectorAll('item')) {
    assert.equal(item.querySelector('link').textContent,item.querySelector('guid').textContent);
    assert.match(item.querySelector('link').textContent,/^https:\/\/www\.boliviablue\.com\/prensa\/informes\/2026-10-\d{2}\/v1$/);
  }
});
