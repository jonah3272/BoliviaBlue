import { SITE_URL } from '../config/brand.js';
import { formatObservationRate, observationLabel, sourceObservationModel } from './sourceObservation.js';

const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Allow a small client/server clock skew, never an implausibly future observation.
const MAX_FUTURE_SKEW_MS = 60_000;

/** All press copy uses the same dated observation, units and provenance as the snapshot. */
export function buildPressCitations(rate, language = 'es', now = Date.now()) {
  const model = sourceObservationModel(rate, now);
  const es = language === 'es';
  const local = path => `${SITE_URL}${path}${es ? '' : '?lang=en'}`;
  const snapshotUrl = `${local('/prensa')}#corte-informativo`;
  const csvUrl = `${SITE_URL}/api/historical-data.csv?range=30d`;
  const lines = [];
  const canQuote = model.observedAt && Number.isFinite(now)
    && Date.parse(model.observedAt) <= now + MAX_FUTURE_SKEW_MS && model.buy && model.sell;

  if (canQuote) {
    lines.push(es
      ? `Lectura del ${observationLabel(model.observedAt, language)}. Observación: ${model.observedAt}. Campos de referencia: compra Bs ${formatObservationRate(model.buy)} · venta Bs ${formatObservationRate(model.sell)} por USDT.`
      : `Reading from ${observationLabel(model.observedAt, language)}. Observation: ${model.observedAt}. Reference fields: buy Bs ${formatObservationRate(model.buy)} · sell Bs ${formatObservationRate(model.sell)} per USDT.`);
    if (model.stale) lines.push(es ? 'Lectura desactualizada; no presentar como precio actual.' : 'Stale observation; do not present as a current price.');
  } else {
    lines.push(es ? 'Cotización fechada no disponible. Consultá el corte informativo.' : 'Dated quote unavailable. Check the newsroom snapshot.');
  }

  lines.push(es
    ? 'Referencia digital P2P USDT/BOB usada como referencia del USD; no es una cotización de dólares físicos ni el tipo oficial del BCB.'
    : 'Digital P2P USDT/BOB reference used as a USD proxy; not a physical-dollar quote or the BCB official rate.');
  lines.push(canQuote && model.available
    ? `${es ? 'Fuentes guardadas con esta lectura' : 'Sources stored with this observation'}: ${model.platforms.map(p => p.name).join(', ')}.`
    : (es ? 'Desglose de fuentes no disponible para este registro.' : 'Source breakdown unavailable for this record.'));
  const quote = lines.join(' ');
  const sourceLabel = es ? 'Fuente' : 'Source';
  const methodLabel = es ? 'Metodología' : 'Methodology';
  return {
    text: `${quote} ${sourceLabel}: Bolivia Blue (${snapshotUrl}).`,
    html: `<p>${escapeHtml(quote)} ${sourceLabel}: <a href="${snapshotUrl}">Bolivia Blue</a>. CSV 30 ${es ? 'días' : 'days'}: <a href="${csvUrl}">historical-data.csv</a>. ${methodLabel}: <a href="${local('/fuente-de-datos')}">fuente-de-datos</a>. Widget: <a href="${local('/widget')}">widget</a>.</p>`,
    markdown: `${quote} ${sourceLabel}: [Bolivia Blue](${snapshotUrl}). CSV: [${csvUrl}](${csvUrl}). ${methodLabel}: [${local('/fuente-de-datos')}](${local('/fuente-de-datos')}).`,
  };
}
