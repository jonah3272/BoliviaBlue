const { BASE, completedDate, dayBounds, reportPath } = require('../../shared/dailyEvidence.cjs');
const { esc } = require('../../shared/dailyEvidenceRender.cjs');
const FEED_URL = `${BASE}/prensa/informes/rss.xml`;
const SCOPE = 'Observaciones registradas de referencias P2P BOB/USDT de Binance, El Dorado y Bybit. No son cotizaciones de dólares físicos, el tipo oficial ni ofertas ejecutables equivalentes entre plataformas. Consulte la evidencia y las limitaciones metodológicas de cada informe.';

// Publication time comes only from storage, never generated_at or the observed day.
// Require an explicit timezone and a real calendar date; Date.parse alone normalizes
// impossible dates. Unknown, malformed and future publication times are omitted.
function publicationDate(value, now) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return null;
  const day = value.slice(0, 10), dayTime = Date.parse(`${day}T00:00:00Z`);
  const time = Date.parse(value);
  if (!Number.isFinite(dayTime) || new Date(dayTime).toISOString().slice(0, 10) !== day || !Number.isFinite(time) || time > new Date(now).getTime()) return null;
  return new Date(time).toUTCString();
}
function feedBefore(now) { return dayBounds(completedDate(now)).end.slice(0, 10); }
function renderFeed(rows, now = new Date()) {
  const lastDay = completedDate(now), unique = new Map();
  for (const row of rows) {
    try {
      const path = reportPath(row.date, row.revision);
      if (row.date <= lastDay && row.path === path && !unique.has(path)) unique.set(path, row);
    } catch { /* Ignore malformed discovery metadata, not a new report publication. */ }
  }
  const sorted = [...unique.values()].sort((a, b) => b.date.localeCompare(a.date) || b.revision - a.revision);
  const dates = new Set([...new Set(sorted.map(row => row.date))].slice(0, 30));
  const items = sorted.filter(row => dates.has(row.date)).map(row => {
    const url = BASE + row.path, published = publicationDate(row.published_at, now);
    return `<item><title>${esc(`Día observado ${row.date} · revisión ${row.revision} | Bolivia Blue`)}</title><link>${esc(url)}</link><guid isPermaLink="true">${esc(url)}</guid><description>${esc(SCOPE)}</description>${published ? `<pubDate>${published}</pubDate>` : ''}</item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Bolivia Blue · Informes diarios con evidencia</title><link>${BASE}/prensa#informes-diarios</link><description>${esc('Enlaces a las revisiones de las últimas 30 fechas observadas disponibles de días completos en America/La_Paz. Ventana reciente, no un registro exhaustivo de correcciones antiguas. ' + SCOPE)}</description><language>es</language><atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>\n${items}\n</channel></rss>\n`;
}
module.exports = { FEED_URL, publicationDate, feedBefore, renderFeed };
