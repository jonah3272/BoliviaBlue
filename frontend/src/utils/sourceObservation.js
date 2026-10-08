import { validObservationTime } from './observationTime.js';

export const SOURCE_NAMES = { binance: 'Binance P2P', eldorado: 'El Dorado', okx: 'OKX P2P', bybit: 'Bybit P2P' };
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
// Remove float-storage noise for display only; never rewrite persisted quotes.
export const formatObservationRate = value => positive(value) ? Number(value.toPrecision(7)).toFixed(2) : '—';
const median = values => { const a = [...values].sort((a, b) => a - b); const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };

/** Never infer contributors from a source label or a list without stored quotes. */
export function sourceObservationModel(rate, now = Date.now()) {
  const observedAt = validObservationTime(rate?.updated_at_iso ?? rate?.updatedAt ?? rate?.t);
  const raw = rate?.source_observation;
  const buy = (rate?.buy_bob_per_usd ?? rate?.buy);
  const sell = (rate?.sell_bob_per_usd ?? rate?.sell);
  const rows = raw?.platforms;
  const valid = observedAt && raw?.version === 1 && raw.method === 'median_of_platform_quotes'
    && raw.quote_asset === 'USDT' && raw.fiat === 'BOB'
    && validObservationTime(raw.observed_at) && Date.parse(raw.observed_at) === Date.parse(observedAt)
    && Array.isArray(rows) && rows.length > 0 && rows.length <= 4
    && new Set(rows.map(row => row?.id)).size === rows.length
    && rows.every(row => typeof row?.id === 'string' && Object.hasOwn(SOURCE_NAMES, row.id) && positive(row.buy) && positive(row.sell))
    && positive(buy) && positive(sell)
    && Math.abs(median(rows.map(row => row.buy)) - buy) <= 2**-23 * Math.max(1, Math.abs(buy))
    && Math.abs(median(rows.map(row => row.sell)) - sell) <= 2**-23 * Math.max(1, Math.abs(sell));
  const stale = Boolean(rate?.is_stale || rate?.isStale || (observedAt && now - Date.parse(observedAt) > 45 * 60000));
  return { available: Boolean(valid), observedAt, stale, buy: positive(buy) ? buy : null, sell: positive(sell) ? sell : null,
    platforms: valid ? rows.map(row => ({ ...row, name: SOURCE_NAMES[row.id] })) : [], observation: valid ? { version: 1, observed_at: raw.observed_at, method: raw.method, quote_asset: 'USDT', fiat: 'BOB', platforms: rows.map(({id,buy,sell}) => ({id,buy,sell})) } : null };
}

export function observationLabel(iso, language = 'es') {
  if (!iso) return language === 'es' ? 'Hora de lectura no disponible' : 'Observation time unavailable';
  return new Intl.DateTimeFormat(language === 'es' ? 'es-BO' : 'en-GB', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso)) + ' (Bolivia, UTC−4)';
}

export function newsroomReport(rate, language = 'es', now = Date.now()) {
  const m = sourceObservationModel(rate, now); const es = language === 'es';
  const lines = [es ? 'Bolivia Blue: corte informativo P2P USDT/BOB' : 'Bolivia Blue: P2P USDT/BOB snapshot', observationLabel(m.observedAt, language)];
  if (m.stale) lines.push(es ? 'Lectura desactualizada; no presentar como precio actual.' : 'Stale observation; do not present as a current price.');
  if (m.buy && m.sell) lines.push(es ? `Referencia recogida: compra Bs ${formatObservationRate(m.buy)}; venta Bs ${formatObservationRate(m.sell)} por USDT.` : `Collected reference: buy Bs ${formatObservationRate(m.buy)}; sell Bs ${formatObservationRate(m.sell)} per USDT.`);
  else lines.push(es ? 'Cotización no disponible.' : 'Quote unavailable.');
  lines.push(es ? 'Referencia digital P2P USDT/BOB; no es cotización de dólares físicos ni tipo oficial del BCB.' : 'Digital P2P USDT/BOB reference; not a physical-dollar quote or the BCB official rate.');
  if (m.available) {
    lines.push(es ? `Fuentes guardadas con esta lectura (${m.platforms.length}):` : `Sources stored with this observation (${m.platforms.length}):`);
    for (const p of m.platforms) lines.push(`${p.name}: ${es ? 'compra' : 'buy'} ${formatObservationRate(p.buy)} · ${es ? 'venta' : 'sell'} ${formatObservationRate(p.sell)} BOB/USDT`);

  } else lines.push(es ? 'Desglose de fuentes no disponible para este registro; no significa que se consultaron cero plataformas.' : 'Source breakdown unavailable for this record. This does not mean zero platforms were queried.');

  lines.push(es ? 'Valores mostrados redondeados; el JSON conserva la precisión guardada.' : 'Displayed values are rounded; JSON retains the stored precision.');
  lines.push('Fuente / Source: https://www.boliviablue.com/prensa', `Observación / Observation: ${m.observedAt || 'no disponible / unavailable'}`);
  return { ...m, text: lines.join('\n\n') };
}
