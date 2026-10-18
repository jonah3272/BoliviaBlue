import { DAILY_EVIDENCE_SEEDS } from './dailyEvidenceSeeds.js';
export { DAILY_EVIDENCE_SEEDS };
export const REPORT_FEED_URL = 'https://www.boliviablue.com/prensa/informes/rss.xml';
export const REPORT_FEED_TITLE = 'Bolivia Blue · Informes diarios (español)';
export function reportFeedCopy(language = 'es') {
  return language === 'en'
    ? { label: 'Daily reports RSS (Spanish)', limit: 'Latest 30 available observed dates and their revisions, not comprehensive alerts for older corrections.' }
    : { label: 'Informes diarios RSS', limit: 'Últimas 30 fechas observadas disponibles y sus revisiones; no son alertas exhaustivas de correcciones antiguas.' };
}
export function reportFeedHead() {
  return `<link rel="alternate" type="application/rss+xml" title="${REPORT_FEED_TITLE}" href="${REPORT_FEED_URL}" data-bb-report-feed="true">`;
}
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
// Match the report API's calendar-date boundary; invalid cursors mean page one.
export function normalizeArchiveBefore(value) {
  if (typeof value !== 'string' || !datePattern.test(value) || value < '2026-01-01') return null;
  const time = Date.parse(`${value}T04:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : null;
}
export function archiveLocalePaths(value) {
  const before = normalizeArchiveBefore(value);
  const es = before ? `/prensa?before=${before}` : '/prensa';
  return { es, en: `${es}${before ? '&' : '?'}lang=en` };
}
export function validArchiveRow(row) {
  return row && datePattern.test(row.date) && new Date(`${row.date}T04:00:00Z`).toISOString().slice(0,10) === row.date && Number.isInteger(row.revision) && row.revision > 0 && row.revision <= 99 && row.path === `/prensa/informes/${row.date}/v${row.revision}`;
}
export function cleanArchive(rows) { return [...new Map((Array.isArray(rows)?rows:[]).filter(row=>{try{return validArchiveRow(row);}catch{return false;}}).map(row=>[row.path,row])).values()].sort((a,b)=>b.date.localeCompare(a.date)||b.revision-a.revision); }
export function latestCompletedDate(now = Date.now()) { return new Date(Number(now)-4*3600000-86400000).toISOString().slice(0,10); }
export function archiveCopy(language='es') {
  return language==='en'?{title:'Daily evidence reports',intro:'Completed Bolivia days, the same three-platform basket, and downloadable evidence. Each edition has a dated link, chart and exact data.',latest:'Latest edition',open:'Read report',revision:'revision',older:'Load older reports',loading:'Loading reports…',unavailable:'The archive could not be refreshed. These are the editions available here; newer reports may be missing.',behind:'The latest completed day has no published report yet. Publication can be delayed or withheld when coverage fails.',limit:'Source-verified daily evidence starts on October 9, 2026. Earlier aggregate history does not establish the same platform basket.',timezone:'Days use America/La_Paz (UTC−4).',method:'Fixed basket: Binance + El Dorado + Bybit. Sampled P2P reference, not a cash-dollar price.',empty:'No published reports in this page.'}:{title:'Informes diarios con evidencia',intro:'Días completos de Bolivia, la misma canasta de tres plataformas y evidencia descargable. Cada edición tiene enlace fechado, gráfico y datos exactos.',latest:'Última edición',open:'Leer informe',revision:'revisión',older:'Cargar informes anteriores',loading:'Cargando informes…',unavailable:'No se pudo actualizar el archivo. Estas son las ediciones disponibles aquí; podrían faltar informes más recientes.',behind:'El último día completo todavía no tiene informe publicado. La publicación puede demorarse o retenerse si la cobertura es insuficiente.',limit:'La evidencia diaria con fuentes verificadas empieza el 9 de octubre de 2026. El historial agregado anterior no acredita la misma canasta de plataformas.',timezone:'Los días usan America/La_Paz (UTC−4).',method:'Canasta fija: Binance + El Dorado + Bybit. Referencia P2P muestreada, no precio de dólares físicos.',empty:'No hay informes publicados en esta página.'};
}
export function renderArchiveHtml(rows=DAILY_EVIDENCE_SEEDS,language='es',{unavailable=false,now=Date.now(),nextBefore=null,olderPage=false}={}) {
  const clean=cleanArchive(rows),c=archiveCopy(language),feed=reportFeedCopy(language),query=language==='en'?'?lang=en':'';
  return `<section id="informes-diarios" data-daily-evidence-archive class="rounded-xl border border-sky-200 bg-sky-50 p-6 my-8"><h2 class="text-2xl font-bold text-gray-900">${c.title}</h2><p>${c.intro}</p><p>${c.timezone} ${c.method}</p><p><a href="${REPORT_FEED_URL}" type="application/rss+xml">${feed.label}</a> · ${feed.limit}</p>${unavailable?`<p role="status">${c.unavailable}</p>`:''}${!olderPage&&clean[0]?.date<latestCompletedDate(now)?`<p>${c.behind}</p>`:''}<ol>${clean.map((r,i)=>`<li><a href="${r.path}${query}">${i===0?c.latest+': ':''}${r.date} · ${c.revision} ${r.revision}</a></li>`).join('')}</ol>${datePattern.test(nextBefore||'')?`<a href="/prensa?before=${nextBefore}${language==='en'?'&amp;lang=en':''}#informes-diarios">${c.older}</a>`:''}<p>${c.limit}</p></section>`;
}
