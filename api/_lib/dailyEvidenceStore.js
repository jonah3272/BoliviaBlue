const { gzipSync, gunzipSync } = require('node:zlib');
const { verifyReport, dayBounds, reportPath, BASE } = require('../../shared/dailyEvidence.cjs');
const seeds = require('../../data/daily-evidence/index.json');
const CATEGORY = 'daily-evidence';
const PREFIX = 'evidence-p2p-';
const MAX_CONTENT_BYTES = 500000;
const slugFor = (date, revision = 1) => { reportPath(date, revision); return `${PREFIX}${date}-v${revision}`; };
function encodeReport(report) {
  verifyReport(report);
  const compressed = gzipSync(Buffer.from(JSON.stringify(report)), { level: 9, mtime: 0 }).toString('base64');
  const content = `<p>Informe de evidencia P2P: <a href="${report.url}">${report.date}, v${report.revision}</a>. Datos y metodología en el enlace permanente.</p>\n<!-- daily-evidence-gzip-v1:${compressed} -->`;
  if (Buffer.byteLength(content) > MAX_CONTENT_BYTES) throw new Error('Evidence record exceeds bounded storage limit');
  return content;
}
function decodeReport(content) {
  if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_CONTENT_BYTES) throw new Error('Invalid evidence storage');
  const match = content.match(/<!-- daily-evidence-gzip-v1:([A-Za-z0-9+/=]+) -->/);
  if (!match) throw new Error('Missing evidence payload');
  return verifyReport(JSON.parse(gunzipSync(Buffer.from(match[1], 'base64'), { maxOutputLength: 8000000 }).toString('utf8')));
}
function summary(report) { return { date: report.date, revision: report.revision, path: report.path, generated_at: report.generated_at, sha256: report.sha256 }; }
function seedReport(date, revision) { const seed = seeds.find(r => r.date === date && r.revision === revision); return seed ? verifyReport(require(`../../data/daily-evidence/${seed.date}-v${seed.revision}.json`)) : null; }
async function readStored(client, date, revision = 1) {
  const { data, error } = await client.from('blog_articles').select('slug,content').eq('category', CATEGORY).eq('slug', slugFor(date, revision)).eq('language', 'es').maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const report = decodeReport(data.content);
  if (report.date !== date || report.revision !== revision || data.slug !== slugFor(date, revision)) throw new Error('Stored report identity mismatch');
  return report;
}
async function readReport(client, date, revision = 1) { return seedReport(date, revision) || (client ? readStored(client, date, revision) : null); }
async function insertReport(client, report) {
  verifyReport(report);
  const existing = await readStored(client, report.date, report.revision);
  if (existing) return { report: existing, inserted: false };
  if (report.revision > 1) {
    const prior = await readReport(client, report.date, report.revision - 1);
    if (!prior || prior.sha256 !== report.correction.previous_sha256) throw new Error('Correction does not match previous revision');
  }
  const record = { slug: slugFor(report.date, report.revision), language: 'es', title: `Evidencia P2P ${report.date} v${report.revision}`, excerpt: report.sha256, content: encodeReport(report), content_format: 'html', author: 'Bolivia Blue', category: CATEGORY, featured: false, read_time: 4, published_at: new Date().toISOString() };
  const { error } = await client.from('blog_articles').insert(record);
  // A concurrent insert can win. Never update/upsert a published revision.
  if (error && error.code !== '23505') throw error;
  const saved = await readStored(client, report.date, report.revision);
  if (!saved) throw new Error('Evidence publication readback failed');
  if (!error && saved.sha256 !== report.sha256) throw new Error('Evidence publication readback differs');
  return { report: saved, inserted: !error };
}
async function listReports(client, before = null) {
  if (before) dayBounds(before);
  let unavailable = !client, rows = [];
  if (client) {
    try {
      const collected = [];
      // Date-prefixed slugs keep every revision of a date together. Read until
      // 31 distinct dates, so all revisions of the first 30 dates are included.
      for (let offset = 0; ; offset += 100) {
        let query = client.from('blog_articles').select('slug,published_at,excerpt').eq('category', CATEGORY).eq('language', 'es').order('slug', { ascending: false }).range(offset, offset + 99);
        if (before) query = query.lt('slug', `${PREFIX}${before}`);
        const result = await query;
        if (result.error) throw result.error;
        const page = result.data || [];
        collected.push(...page);
        const distinct = new Set(collected.map(r => r.slug.match(/^evidence-p2p-(\d{4}-\d{2}-\d{2})-v([1-9]\d?)$/)?.[1]).filter(Boolean));
        if (page.length < 100 || distinct.size > 30) break;
        if (offset >= 4000) throw new Error('Archive page exceeds bounded row limit');
      }
      rows = collected.flatMap(row => {
        const match = row.slug.match(/^evidence-p2p-(\d{4}-\d{2}-\d{2})-v([1-9]\d?)$/);
        if (!match || !/^[a-f0-9]{64}$/.test(row.excerpt || '')) return [];
        try { return [{ date: match[1], revision: Number(match[2]), path: reportPath(match[1], Number(match[2])), published_at: row.published_at, sha256: row.excerpt }]; } catch { return []; }
      });
    } catch { unavailable = true; }
  }
  const merged = new Map(rows.map(r => [r.path, r]));
  for (const seed of seeds) if (!before || seed.date < before) merged.set(seed.path, seed);
  const all = [...merged.values()].sort((a,b) => b.date.localeCompare(a.date) || b.revision-a.revision);
  // Verify the promoted edition so corrupt content cannot silently look current.
  const latest = all[0];
  if (latest && !seedReport(latest.date, latest.revision) && client) {
    try { if (!await readStored(client, latest.date, latest.revision)) unavailable = true; } catch { unavailable = true; }
  }
  // Paginate by complete date; never hide a revision of the boundary date.
  const dates = [...new Set(all.map(r => r.date))];
  const shown = dates.slice(0, 30), reports = all.filter(r => shown.includes(r.date));
  return { reports, unavailable, next_before: dates.length > 30 ? shown.at(-1) : null, timezone: 'America/La_Paz' };
}
async function revisionsForDate(client, date) {
  dayBounds(date);
  const found = new Map(seeds.filter(r => r.date === date).map(r => [r.path, r]));
  if (client) {
    const { data, error } = await client.from('blog_articles').select('slug,content').eq('category', CATEGORY).eq('language', 'es').gte('slug', `${PREFIX}${date}-v`).lt('slug', `${PREFIX}${date}-w`).limit(99);
    if (error) throw error;
    for (const row of data || []) { const report = decodeReport(row.content); if (report.date !== date || row.slug !== slugFor(date, report.revision)) throw new Error('Revision identity mismatch'); found.set(report.path, summary(report)); }
  }
  return [...found.values()].sort((a,b) => b.revision-a.revision);
}
async function fetchDayRows(client, date) {
  const bounds = dayBounds(date), rows = [], pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from('rates').select('id,t,buy,sell,source_observation').gte('t', bounds.start).lt('t', bounds.end).order('t', { ascending: true }).order('id', { ascending: true }).range(offset, offset + pageSize - 1);
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Invalid bounded evidence response');
    rows.push(...data);
    if (rows.length > 10000) throw new Error('Unexpected daily row volume; refusing truncated publication');
    if (data.length < pageSize) return rows;
  }
}
module.exports = { CATEGORY, MAX_CONTENT_BYTES, seeds, slugFor, encodeReport, decodeReport, summary, seedReport, readStored, readReport, insertReport, listReports, revisionsForDate, fetchDayRows };
