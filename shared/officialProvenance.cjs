/** Official BCB evidence is separate from the P2P source_observation. */
const BCB_HOME_URL = 'https://www.bcb.gob.bo/';
const MAX_OBSERVATION_AGE_MS = 6 * 60 * 60 * 1000;
function asOfficialRate(value) {
  if (value == null || value === '' || typeof value === 'boolean') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : null;
}
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validInstant(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return false;
  const [, , , h, min, s] = value.slice(0, 19).split(/[-T:]/).map(Number);
  return validDate(value.slice(0, 10)) && h < 24 && min < 60 && s < 60 && Number.isFinite(Date.parse(value));
}
function emptyObservation(status = 'unavailable') {
  return { version: 1, status, source: null, source_url: null, source_date: null, observed_at: null, buy: null, sell: null, mid: null };
}
function readOfficialObservation(row) {
  const o = row?.official_observation;
  if (!o || o.version !== 1 || !['verified', 'stale'].includes(o.status) || o.source !== 'bcb' || o.source_url !== BCB_HOME_URL || !validDate(o.source_date) || !validInstant(o.observed_at)) return null;
  if (o.source_date > new Date(o.observed_at).toISOString().slice(0, 10)) return null;
  if (![o.buy, o.sell, o.mid].every(n => typeof n === 'number' && asOfficialRate(n) !== null)) return null;
  if (Math.abs(o.mid - (o.buy + o.sell) / 2) > 1e-10) return null;
  // PostgreSQL REAL may round only the duplicated numeric columns, not the JSON evidence.
  const close = (a, b) => asOfficialRate(b) !== null && Math.abs(a - Number(b)) <= (2 ** -23) * Math.max(1, Math.abs(a));
  if (!close(o.buy, row.official_buy) || !close(o.sell, row.official_sell) || !close(o.mid, row.official_mid)) return null;
  return { version: 1, status: o.status, source: 'bcb', source_url: BCB_HOME_URL, source_date: o.source_date, observed_at: o.observed_at, buy: o.buy, sell: o.sell, mid: o.mid };
}
function createOfficialObservation({ buy, sell, source_date }, observed_at) {
  const official_buy = asOfficialRate(buy), official_sell = asOfficialRate(sell);
  const official_mid = official_buy == null || official_sell == null ? null : (official_buy + official_sell) / 2;
  const o = { version: 1, status: 'verified', source: 'bcb', source_url: BCB_HOME_URL, source_date, observed_at, buy: official_buy, sell: official_sell, mid: official_mid };
  const checked = readOfficialObservation({ official_buy, official_sell, official_mid, official_observation: o });
  if (!checked) throw new Error('Invalid official BCB observation');
  return checked;
}
function officialPayload(row, { now = Date.now() } = {}) {
  let o = readOfficialObservation(row);
  if (o) {
    // A fresh P2P timestamp must never renew an earlier official observation.
    const age = now - Date.parse(o.observed_at);
    const boliviaDate = new Date(now - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (o.status === 'stale' || age > MAX_OBSERVATION_AGE_MS || age < -5 * 60 * 1000 || o.source_date < boliviaDate) o.status = 'stale';
  } else {
    const legacy = ['official_buy', 'official_sell', 'official_mid'].some(k => row?.[k] != null);
    o = emptyObservation(legacy || row?.official_observation?.status === 'unverified' ? 'unverified' : 'unavailable');
  }
  return { official_buy: o.buy, official_sell: o.sell, official_mid: o.mid, official_observation: o,
    official_source: o.source, official_status: o.status, official_source_date: o.source_date, official_observed_at: o.observed_at };
}
/** Qualify archived numeric fields without rewriting the original recorded values. */
function officialMetadata(row, options) {
  const { official_buy, official_sell, official_mid, ...metadata } = officialPayload(row, options);
  return metadata;
}
function observationPayload(o, options) {
  return officialPayload({ official_buy: o?.buy, official_sell: o?.sell, official_mid: o?.mid, official_observation: o }, options);
}
module.exports = { BCB_HOME_URL, MAX_OBSERVATION_AGE_MS, asOfficialRate, validDate, validInstant, emptyObservation, readOfficialObservation, createOfficialObservation, officialPayload, officialMetadata, observationPayload };
