/** Persist only the platform quotes actually used by this observation.
 * No raw ads, merchant identifiers, inferred failures, or historical backfill.
 */
const SOURCE_IDS = ['binance', 'eldorado', 'okx', 'bybit'];
const METHOD = 'median_of_platform_quotes';
const positive = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
}
function observationTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
  const [year, month, day, hour, minute, second] = value.slice(0, 19).split(/[-T:]/).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || hour > 23 || minute > 59 || second > 59) return null;
  return Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
}
function readSourceObservation(row) {
  const s = row?.source_observation;
  const timestamp = row?.t ?? row?.updated_at_iso;
  if (!s || s.version !== 1 || s.method !== METHOD || s.quote_asset !== 'USDT' || s.fiat !== 'BOB') return null;
  const instant = observationTime(s.observed_at);
  if (instant == null || instant !== observationTime(timestamp)) return null;
  if (!Array.isArray(s.platforms) || !s.platforms.length || s.platforms.length > SOURCE_IDS.length) return null;
  if (s.platforms.some(p => !p || !SOURCE_IDS.includes(p.id) || !positive(p.buy) || !positive(p.sell))) return null;
  if (new Set(s.platforms.map(p => p.id)).size !== s.platforms.length) return null;
  const buy = row.buy ?? row.buy_bob_per_usd;
  const sell = row.sell ?? row.sell_bob_per_usd;
  // rates.buy/sell use PostgreSQL REAL (float32); allow storage rounding only.
  const close = (a, b) => positive(b) && Math.abs(a - b) <= (2 ** -23) * Math.max(1, Math.abs(b));
  if (!close(median(s.platforms.map(p => p.buy)), buy) || !close(median(s.platforms.map(p => p.sell)), sell)) return null;
  // Whitelist public fields so malformed JSON cannot leak arbitrary data.
  return { version: 1, observed_at: s.observed_at, method: METHOD, quote_asset: 'USDT', fiat: 'BOB', platforms: s.platforms.map(({ id, buy, sell }) => ({ id, buy, sell })) };
}
function createSourceObservation(cross, observedAt) {
  const source_observation = { version: 1, observed_at: observedAt, method: METHOD, quote_asset: 'USDT', fiat: 'BOB', platforms: cross.platforms };
  const snapshot = readSourceObservation({ t: observedAt, buy: cross.buy, sell: cross.sell, source_observation });
  if (!snapshot) throw new Error('Invalid source observation; refusing to persist unverifiable provenance');
  return snapshot;
}
function sourcePayload(row) {
  const observation = readSourceObservation(row);
  const sources = observation?.platforms.map(p => p.id) || [];
  return {
    source: sources.length > 1 ? 'p2p-cross-median' : sources.length === 1 ? `${sources[0]}-p2p` : 'stored-p2p-reference',
    source_provenance: observation ? 'persisted_observation' : 'unavailable_for_stored_row',
    source_observation: observation,
    sources_used: sources,
    source_count: sources.length,
    quote_kind: 'usdt_p2p_median',
  };
}
module.exports = { METHOD, SOURCE_IDS, createSourceObservation, readSourceObservation, sourcePayload };
