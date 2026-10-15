import { DAILY_EVIDENCE_SEEDS } from './dailyEvidenceSeeds.js';
export function legacyDailyNotice(slug, language='es') {
  const match=String(slug||'').match(/^analisis-diario-(\d{4}-\d{2}-\d{2})$/);
  if(!match||match[1]>'2026-10-14')return null;
  const report=DAILY_EVIDENCE_SEEDS.find(r=>r.date===match[1]);
  return { title:language==='en'?'Correction notice for this legacy report':'Aviso de corrección de este informe anterior',
    body:language==='en'?'The former generator compared the current observation with itself when calculating daily percentage changes. Those daily-change figures are invalid and should not be reused. The original article remains available for transparency; the new evidence reports use bounded completed days, validated sources and explicit coverage checks.':'El generador anterior comparaba la observación actual consigo misma al calcular las variaciones porcentuales diarias. Esas variaciones son inválidas y no deben reutilizarse. Conservamos el artículo original por transparencia; los nuevos informes usan días completos delimitados, fuentes validadas y controles explícitos de cobertura.',
    path:report?report.path+(language==='en'?'?lang=en':''):'/prensa'+(language==='en'?'?lang=en':'')+'#informes-diarios',
    label:report?(language==='en'?'Read the evidence report for this date':'Leer el informe con evidencia de esta fecha'):(language==='en'?'Browse the new evidence reports':'Ver los nuevos informes con evidencia') };
}
export function renderLegacyDailyNotice(slug,language='es') {
  const notice=legacyDailyNotice(slug,language);return notice?`<aside data-legacy-daily-correction role="note"><h2>${notice.title}</h2><p>${notice.body}</p><a href="${notice.path}">${notice.label}</a></aside>`:'';
}
