#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('node:fs');
const { createReport, completedDate, priorDate, dayBounds, verifyReport } = require('../shared/dailyEvidence.cjs');
const { readStored, readReport, seedReport, insertReport, fetchDayRows, encodeReport } = require('../api/_lib/dailyEvidenceStore.js');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function retryRead(fn) { let error; for (let n = 0; n < 3; n++) { try { return await fn(); } catch (e) { error = e; if (n < 2) await sleep(1000 * (n + 1)); } } throw error; }
async function publishDate(client, date, { now = new Date().toISOString(), dryRun = false, revision = 1, correctionReason = '' } = {}) {
  if (date > completedDate(now)) throw new Error('Only completed Bolivia dates may be published');
  if (revision > 1 && !correctionReason.trim()) throw new Error('Correction reason required');
  const existing = await retryRead(() => readStored(client, date, revision));
  if (existing) return { report: existing, inserted: false, status: 'already-published' };
  const seed = seedReport(date, revision);
  let correction = null;
  if (revision > 1) { const previous = await readReport(client,date,revision-1); if (!previous) throw new Error('Previous revision missing'); correction = {reason:correctionReason.trim(),previous_sha256:previous.sha256}; }
  const report = seed || createReport({ date, revision, correction, rows: await retryRead(() => fetchDayRows(client, date)), previousRows: await retryRead(() => fetchDayRows(client, priorDate(date))), generatedAt: now, retrieval: { source: 'rates table; exact date-bounded query ordered by t,id', retrieved_at: now, range_complete: true } });
  if (dryRun) return { report, inserted: false, status: 'dry-run' };
  const saved = await insertReport(client, report);
  return { ...saved, status: saved.inserted ? 'published' : 'already-published' };
}
async function main() {
  const now = new Date().toISOString(), explicitDate = process.env.REPORT_DATE || '', dryRun = process.env.DRY_RUN !== 'false';
  if (process.env.GITHUB_ACTIONS === 'true' && !dryRun && process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Publishing is restricted to main');
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Existing Supabase publication environment is missing');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const revision = Number(process.env.REPORT_REVISION || 1), correctionReason = process.env.CORRECTION_REASON || '';
  if (revision !== 1 && !explicitDate) throw new Error('Corrections require an explicit report date');
  const latest = completedDate(now), dates = [];
  if (explicitDate) { dayBounds(explicitDate); if (explicitDate > latest) throw new Error('Only completed Bolivia dates may be published'); dates.push(explicitDate); }
  else { let date = latest; for (let i = 0; i < 7; i++) { if (date >= '2026-10-09') dates.unshift(date); date = priorDate(date); } }
  let failed = false;
  const summary = ['## Daily evidence', '', `Mode: ${dryRun ? 'dry run (no writes)' : 'insert-only publication'}. Bolivia completed-day target: ${latest}.`, ''];
  for (const date of dates) {
    try {
      const result = await publishDate(client, date, { now, dryRun, revision, correctionReason }); verifyReport(result.report);
      const line = `${date}: ${result.status}; ${result.report.day.coverage.eligible}/${result.report.day.coverage.total} observations; ${Buffer.byteLength(encodeReport(result.report))} stored bytes; ${result.report.url}`;
      console.log(line); summary.push(`- ${line}`);
    } catch (error) { failed = true; console.error(`${date}: FAILED: ${error.message}`); summary.push(`- ${date}: FAILED. Check job log; no fabricated report published.`); }
  }
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary.join('\n') + '\n');
  if (failed) throw new Error('One or more dates could not be published; rerun or dispatch that date after recovery');
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { retryRead, publishDate };
