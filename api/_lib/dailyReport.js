const { createClient } = require('@supabase/supabase-js');
const { reportPath, sourceCsv, completedDate } = require('../../shared/dailyEvidence.cjs');
const { readReport, listReports, revisionsForDate, seedReport } = require('./dailyEvidenceStore');
const { reportHtml, chartSvg, citation, esc } = require('../../shared/dailyEvidenceRender.cjs');
function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
function createHandler(getClient = client) {
  return async function handler(req, res) {
    if (!['GET','HEAD'].includes(req.method)) return res.status(405).end();
    const format = String(req.query.format || 'json'), lang = req.query.lang === 'en' ? 'en' : 'es';
    const send = (status, type, body) => { res.setHeader('Content-Type', type); return req.method === 'HEAD' ? res.status(status).end() : res.status(status).send(body); };
    try {
      if (req.query.view === 'home-summary') {
        const { homeReportSummary } = require('./homeReportSummary');
        const now = new Date();
        const report = await homeReportSummary(getClient(), now);
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return send(200, 'application/json; charset=utf-8', JSON.stringify({ report, latest_completed_date: completedDate(now), unavailable: false }));
      }
      if (req.query.view === 'feed') {
        const { feedBefore, renderFeed } = require('./dailyReportFeed');
        const now = new Date();
        // Bound the query before selecting 30 dates: unfinished days must not
        // displace eligible dates. Ignore archive cursors on the canonical feed.
        const archive = await listReports(getClient(), feedBefore(now));
        if (archive.unavailable) throw new Error('Report storage unavailable');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return send(200, 'application/rss+xml; charset=utf-8', renderFeed(archive.reports, now));
      }
      if (req.query.view === 'archive') {
        const archive = await listReports(getClient(), req.query.before || null);
        archive.reports = archive.reports.filter(r => r.date <= completedDate());
        res.setHeader('Cache-Control', archive.unavailable ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600');
        return send(200,'application/json; charset=utf-8', JSON.stringify({ ...archive, latest_completed_date: completedDate(), checked_at: new Date().toISOString() }));
      }
      const date = String(req.query.date || ''), revision = Number(req.query.revision || 1);
      reportPath(date, revision);
      if (!['html','json','csv','svg','txt'].includes(format)) throw new Error('Invalid format');
      const database = getClient();
      if (!database && !seedReport(date, revision)) throw new Error('Report storage unavailable');
      const report = await readReport(database, date, revision);
      if (report && (report.date > completedDate() || Date.parse(report.generated_at) > Date.now())) throw new Error('Report day is not completed');
      if (!report) {
        res.setHeader('Cache-Control','no-store'); res.setHeader('X-Robots-Tag','noindex, follow');
        return send(404,format === 'html'?'text/html; charset=utf-8':'application/json; charset=utf-8',format === 'html'?`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${lang==='en'?'Report not published':'Informe no publicado'} | Bolivia Blue</title></head><body><h1>${lang==='en'?'Report not published':'Informe no publicado'}</h1><p>${lang==='en'?'This date or revision is not available. Reports require completed-day coverage.':'Esta fecha o revisión no está disponible. Los informes requieren cobertura del día completo.'}</p><a href="/prensa#informes-diarios">${lang==='en'?'Report archive':'Archivo de informes'}</a></body></html>`:JSON.stringify({error:'Report not published'}));
      }
      res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
      res.setHeader('X-Evidence-SHA256',report.sha256);
      res.setHeader('X-Content-Type-Options','nosniff');
      if (format !== 'html') res.setHeader('Content-Disposition',`attachment; filename="bolivia-blue-${date}-v${revision}.${format}"`);
      if (format === 'json') return send(200,'application/json; charset=utf-8',JSON.stringify(report,null,2)+'\n');
      if (format === 'csv') return send(200,'text/csv; charset=utf-8',sourceCsv(report));
      if (format === 'svg') return send(200,'image/svg+xml; charset=utf-8',chartSvg(report,lang));
      if (format === 'txt') return send(200,'text/plain; charset=utf-8',citation(report,lang)+'\n');
      const revisions = await revisionsForDate(database, date);
      return send(200,'text/html; charset=utf-8',reportHtml(report,lang,{laterRevisions:revisions.filter(r=>r.revision>revision)}));
    } catch (error) {
      const invalid = /Invalid report date|Invalid revision|Invalid format/.test(error.message);
      res.setHeader('Cache-Control','no-store'); res.setHeader('X-Robots-Tag','noindex, follow');
      const message = invalid ? 'Invalid report request' : 'Report evidence temporarily unavailable';
      return send(invalid?400:503,format === 'html'?'text/html; charset=utf-8':'application/json; charset=utf-8',format === 'html'?`<!doctype html><html lang="${lang}"><head><meta name="robots" content="noindex, follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(message)} | Bolivia Blue</title></head><body><h1>${esc(message)}</h1><p>${lang==='en'?'The evidence could not be verified. No report figures are shown.':'No se pudo verificar la evidencia. No se muestran cifras del informe.'}</p><a href="/prensa#informes-diarios">${lang==='en'?'Report archive':'Archivo de informes'}</a></body></html>`:JSON.stringify({error:message}));
    }
  };
}
module.exports = createHandler();
module.exports.createHandler = createHandler;
