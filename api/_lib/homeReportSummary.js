const { completedDate, dayBounds, reportPath } = require('../../shared/dailyEvidence.cjs');
const { CATEGORY, readStored } = require('./dailyEvidenceStore');
const PREFIX = 'evidence-p2p-';

// Discovery is deliberately bounded: one newest date, at most 99 revisions,
// then one verified immutable payload. Never scan the full archive or use seeds.
async function homeReportSummary(client, now = new Date()) {
  if (!client) throw new Error('Report storage unavailable');
  const latestCompleted = completedDate(now);
  const before = dayBounds(latestCompleted).end.slice(0, 10);
  const query = () => client.from('blog_articles').select('slug,excerpt').eq('category', CATEGORY).eq('language', 'es');
  const latest = await query().gte('slug', PREFIX).lt('slug', `${PREFIX}${before}`).order('slug', { ascending: false }).limit(1);
  if (latest.error) throw latest.error;
  if (!Array.isArray(latest.data)) throw new Error('Invalid report discovery');
  if (!latest.data.length) return null;
  const match = latest.data[0].slug?.match(/^evidence-p2p-(\d{4}-\d{2}-\d{2})-v([1-9]\d?)$/);
  if (!match) throw new Error('Invalid report discovery');
  const date = match[1];
  reportPath(date, Number(match[2]));
  if (date > latestCompleted) throw new Error('Report day is not completed');
  const revisions = await query().gte('slug', `${PREFIX}${date}-v`).lt('slug', `${PREFIX}${date}-w`).limit(100);
  if (revisions.error) throw revisions.error;
  if (!Array.isArray(revisions.data) || !revisions.data.length || revisions.data.length > 99) throw new Error('Invalid report revisions');
  const seen = new Set();
  const editions = revisions.data.map(row => {
    const version = row.slug?.match(/^evidence-p2p-(\d{4}-\d{2}-\d{2})-v([1-9]\d?)$/);
    if (!version || version[1] !== date || seen.has(row.slug) || !/^[a-f0-9]{64}$/.test(row.excerpt || '')) throw new Error('Invalid report revisions');
    seen.add(row.slug);
    return { revision: Number(version[2]), sha256: row.excerpt };
  }).sort((a, b) => b.revision - a.revision);
  const edition = editions[0];
  const report = await readStored(client, date, edition.revision);
  if (!report || report.sha256 !== edition.sha256 || Date.parse(report.generated_at) > new Date(now).getTime()) throw new Error('Report evidence unavailable');
  return {
    date: report.date, revision: report.revision, path: report.path,
    sha256: report.sha256, generated_at: report.generated_at,
    median: report.day.summary.mid,
    comparison: report.comparison ? { date: report.comparison.date, change: report.comparison.change, change_percent: report.comparison.change_percent } : null,
  };
}
module.exports = { homeReportSummary };
