/** Daily evidence v1: deterministic, fixed-basket sampled statistics. */
const crypto = require('node:crypto');
const { readSourceObservation } = require('./rateProvenance.cjs');
const { isObservedRow } = require('../api/_lib/historicalExport.js');
const BASKET = Object.freeze(['binance', 'eldorado', 'bybit']);
const METHOD = 'fixed3-sampled-median-v1';
const DAY = 86400000;
const MINUTE = 60000;
const BASE = 'https://www.boliviablue.com';
function median(values) {
  if (!values.length) return null;
  const a = [...values].sort((a, b) => a - b), n = a.length;
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
}
function dayBounds(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid report date');
  const start = Date.parse(`${date}T04:00:00.000Z`);
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== date || date < '2026-01-01') throw new Error('Invalid report date');
  return { start: new Date(start).toISOString(), end: new Date(start + DAY).toISOString() };
}
function priorDate(date) { return new Date(Date.parse(dayBounds(date).start) - DAY).toISOString().slice(0, 10); }
function completedDate(now = new Date()) { return new Date(new Date(now).getTime() - 4 * 3600000 - DAY).toISOString().slice(0, 10); }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite evidence');
  return JSON.stringify(value);
}
function digest(value) { return crypto.createHash('sha256').update(canonical(value)).digest('hex'); }
function reportPath(date, revision = 1) { dayBounds(date); if (!Number.isInteger(revision) || revision < 1 || revision > 99) throw new Error('Invalid revision'); return `/prensa/informes/${date}/v${revision}`; }
function normalizeRow(row) {
  // Store only the public, whitelisted evidence fields, including rejected inputs.
  const s = row?.source_observation;
  return { t: typeof row?.t === 'string' ? row.t : null, buy: typeof row?.buy === 'number' && Number.isFinite(row.buy) ? row.buy : null, sell: typeof row?.sell === 'number' && Number.isFinite(row.sell) ? row.sell : null,
    source_observation: s && typeof s === 'object' ? { version: Number.isInteger(s.version) ? s.version : null, observed_at: typeof s.observed_at === 'string' ? s.observed_at : null, method: typeof s.method === 'string' ? s.method : null, quote_asset: typeof s.quote_asset === 'string' ? s.quote_asset : null, fiat: typeof s.fiat === 'string' ? s.fiat : null, platforms: Array.isArray(s.platforms) ? s.platforms.map(p => ({ id: typeof p?.id === 'string' ? p.id : null, buy: typeof p?.buy === 'number' && Number.isFinite(p.buy) ? p.buy : null, sell: typeof p?.sell === 'number' && Number.isFinite(p.sell) ? p.sell : null })) : null } : null };
}
function analyzeDay(date, inputRows, now = new Date()) {
  const bounds = dayBounds(date), start = Date.parse(bounds.start), end = Date.parse(bounds.end);
  if (end > new Date(now).getTime()) throw new Error('Report day is not completed in America/La_Paz');
  if (!Array.isArray(inputRows)) throw new Error('Expected observations');
  // Query adapters must provide exactly bounded rows; reject rather than silently trim.
  const rows = inputRows.map(normalizeRow).sort((a, b) => Date.parse(a.t) - Date.parse(b.t) || (canonical(a) < canonical(b) ? -1 : canonical(a) > canonical(b) ? 1 : 0));
  if (rows.some(r => !Number.isFinite(Date.parse(r.t)) || Date.parse(r.t) < start || Date.parse(r.t) >= end)) throw new Error('Observation outside report day or invalid timestamp');
  const counts = new Map(); rows.forEach(r => counts.set(Date.parse(r.t), (counts.get(Date.parse(r.t)) || 0) + 1));
  const eligible = [], excluded = [];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index], source = readSourceObservation(row);
    let reason = !isObservedRow(row) ? 'interpolated_row' : counts.get(Date.parse(row.t)) > 1 ? 'duplicate_timestamp' : !source ? (row.source_observation ? 'invalid_provenance' : 'missing_provenance') : BASKET.some(id => !source.platforms.some(p => p.id === id)) ? 'missing_basket_source' : null;
    if (reason) { excluded.push({ index, reason }); continue; }
    const platforms = BASKET.map(id => source.platforms.find(p => p.id === id));
    const buy = median(platforms.map(p => p.buy)), sell = median(platforms.map(p => p.sell));
    eligible.push({ index, t: row.t, buy, sell, mid: (buy + sell) / 2, buy_range: Math.max(...platforms.map(p => p.buy)) - Math.min(...platforms.map(p => p.buy)), sell_range: Math.max(...platforms.map(p => p.sell)) - Math.min(...platforms.map(p => p.sell)), platforms });
  }
  const hours = [...new Set(eligible.map(r => Math.floor((Date.parse(r.t) - start) / 3600000)))].sort((a, b) => a - b);
  const first = eligible[0]?.t || null, last = eligible.at(-1)?.t || null;
  const maxGap = eligible.length > 1 ? Math.max(...eligible.slice(1).map((r, i) => Date.parse(r.t) - Date.parse(eligible[i].t))) / MINUTE : null;
  const firstOffset = first ? (Date.parse(first) - start) / MINUTE : null, lastOffset = last ? (end - Date.parse(last)) / MINUTE : null;
  const failures = [];
  if (hours.length !== 24) failures.push('missing_hourly_coverage');
  if (firstOffset === null || firstOffset > 45) failures.push('late_first_observation');
  if (lastOffset === null || lastOffset > 45) failures.push('early_last_observation');
  if (maxGap === null || maxGap > 60) failures.push('excessive_observation_gap');
  const coverage = { total: rows.length, eligible: eligible.length, excluded: excluded.length, hours, first, last, first_offset_minutes: firstOffset, last_offset_minutes: lastOffset, max_gap_minutes: maxGap, qualifies: failures.length === 0, failures, exclusions: excluded.reduce((a, r) => ({ ...a, [r.reason]: (a[r.reason] || 0) + 1 }), {}) };
  const summary = coverage.qualifies ? { buy: median(eligible.map(r => r.buy)), sell: median(eligible.map(r => r.sell)), mid: median(eligible.map(r => r.mid)), buy_range: median(eligible.map(r => r.buy_range)), sell_range: median(eligible.map(r => r.sell_range)), platforms: BASKET.map(id => ({ id, buy: median(eligible.map(r => r.platforms.find(p => p.id === id).buy)), sell: median(eligible.map(r => r.platforms.find(p => p.id === id).sell)), mid: median(eligible.map(r => { const p = r.platforms.find(p => p.id === id); return (p.buy + p.sell) / 2; })) })) } : null;
  return { date, ...bounds, coverage, summary, evidence: rows, eligible, excluded };
}
function createReport({ date, rows, previousRows = [], revision = 1, correction = null, generatedAt = new Date().toISOString(), retrieval = {} }) {
  const path = reportPath(date, revision);
  if (!Number.isFinite(Date.parse(generatedAt))) throw new Error('Invalid publication time');
  if (revision > 1 && (!correction?.reason || !/^[a-f0-9]{64}$/.test(correction?.previous_sha256 || ''))) throw new Error('Correction requires a reason and previous revision hash');
  if (revision === 1 && correction) throw new Error('First edition cannot be a correction');
  const day = analyzeDay(date, rows, generatedAt), previous = analyzeDay(priorDate(date), previousRows, generatedAt);
  if (!day.coverage.qualifies) throw new Error(`Coverage gate failed for ${date}: ${day.coverage.failures.join(', ')}`);
  const comparison = previous.coverage.qualifies ? { date: previous.date, change: day.summary.mid - previous.summary.mid, change_percent: (day.summary.mid / previous.summary.mid - 1) * 100, platforms: BASKET.map(id => { const a = day.summary.platforms.find(p => p.id === id), b = previous.summary.platforms.find(p => p.id === id); return { id, buy_change: a.buy - b.buy, sell_change: a.sell - b.sell, mid_change: a.mid - b.mid }; }) } : null;
  const content = { schema_version: 1, date, revision, path, url: BASE + path, generated_at: generatedAt, correction, methodology: { id: METHOD, timezone: 'America/La_Paz', units: 'BOB/USDT', basket: [...BASKET], statistic: 'unweighted median of fixed-basket observation midpoints', per_observation: 'median of platform buys and median of platform sells; midpoint=(buy+sell)/2', dispersion: 'median of same-observation maximum minus minimum, separately buy and sell', gates: { all_24_hours: true, edge_minutes: 45, max_gap_minutes: 60 }, limitations: 'Sampled P2P reference; not time- or volume-weighted, not a close, cash-dollar price, executable quote, confidence interval or forecast. Same platform basket does not establish identical payment methods, trade sizes or executable conditions.' }, retrieval, day, previous, comparison };
  return { ...content, sha256: digest(content) };
}
function verifyReport(report) {
  if (!report || report.schema_version !== 1 || report.methodology?.id !== METHOD) throw new Error('Unsupported evidence report');
  const { sha256, ...content } = report;
  if (sha256 !== digest(content)) throw new Error('Evidence hash mismatch');
  const rebuilt = createReport({ date: report.date, rows: report.day.evidence, previousRows: report.previous.evidence, revision: report.revision, correction: report.correction, generatedAt: report.generated_at, retrieval: report.retrieval });
  if (canonical(rebuilt) !== canonical(report)) throw new Error('Evidence calculation mismatch');
  return report;
}
function sourceCsv(report) {
  verifyReport(report);
  const header = ['report_date','revision','evidence_date','observation_time','status','reason','source','buy_bob_per_usdt','sell_bob_per_usdt','included_in_basket','report_url','report_sha256'];
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const day of [report.previous, report.day]) day.evidence.forEach((row, i) => {
    const reason = day.excluded.find(e => e.index === i)?.reason || '';
    const sources = row.source_observation?.platforms || [];
    for (const p of sources.length ? sources : [{}]) lines.push([report.date,report.revision,day.date,row.t,reason ? 'excluded' : 'eligible',reason,BASKET.concat('okx').includes(p.id) ? p.id : p.id ? 'unrecognized_source' : '',p.buy,p.sell,!reason && BASKET.includes(p.id),report.url,report.sha256].map(cell).join(','));
  });
  return lines.join('\n') + '\n';
}
module.exports = { BASKET, METHOD, BASE, canonical, digest, median, dayBounds, priorDate, completedDate, reportPath, analyzeDay, createReport, verifyReport, sourceCsv };
