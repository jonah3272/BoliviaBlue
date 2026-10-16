/** Shared BCB-only resolver used by both collectors. No external or numeric-only fallback. */
const { BCB_HOME_URL, asOfficialRate, validDate, readOfficialObservation, createOfficialObservation, observationPayload, emptyObservation } = require('./officialProvenance.cjs');
const REQUEST_TIMEOUT_MS = 8000;
let cachedOfficial = null;
function parseBolivianNumber(value) {
  const raw = String(value).trim();
  if (!/^\d{1,2}(?:[.,]\d{2,4})?$/.test(raw)) return null;
  return asOfficialRate(Number(raw.replace(',', '.')));
}
function attribute(attrs, name) {
  const values = [...attrs.matchAll(/(?:^|\s)([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
    .filter(match => match[1].toLowerCase() === name).map(match => match[2] ?? match[3] ?? match[4]);
  return values.length === 1 ? values[0] : null;
}
function hasClass(attrs, token) {
  return (attribute(attrs, 'class') || '').split(/\s+/).includes(token);
}
function parseBcbHomepage(html) {
  if (typeof html !== 'string' || !html) return null;
  // Fail closed on layout changes; never pick a nearby unrelated number/date.
  const clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const cards = [...clean.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article\s*>/gi)]
    .filter(match => hasClass(match[1], 'is-tc-oficial'));
  if (cards.length !== 1) return null;
  const card = cards[0][2];
  const dates = [...card.matchAll(/<time\b([^>]*)>/gi)].map(match => attribute(match[1], 'datetime'));
  const values = [...card.matchAll(/<([a-z][\w:-]*)\b([^>]*)>\s*([^<]*)\s*<\/\1\s*>/gi)]
    .filter(match => hasClass(match[2], 'bcb-tco-num'));
  if (dates.length !== 1 || values.length !== 1 || !validDate(dates[0])) return null;
  const mid = parseBolivianNumber(values[0][3]);
  return mid === null ? null : { buy: mid, sell: mid, source_date: dates[0] };
}
async function fetchOfficialFromBcb({ fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(BCB_HOME_URL, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)', Accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) throw new Error(`BCB HTTP ${response.status}`);
    const parsed = parseBcbHomepage(await response.text());
    if (!parsed) throw new Error('Could not parse dated official BCB board');
    const at = now();
    // Publication dates may be earlier (weekends/holidays), never in the future.
    if (parsed.source_date > new Date(at).toISOString().slice(0, 10)) throw new Error('Future BCB board date');
    return observationPayload(createOfficialObservation(parsed, new Date(at).toISOString()), { now: at });
  } finally { clearTimeout(timeout); }
}
async function getLastOfficialFromDb(supabase) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('rates')
    .select('official_buy,official_sell,official_mid,official_observation')
    .not('official_observation', 'is', null).order('t', { ascending: false }).limit(100);
  if (error) throw error;
  return (data || []).map(readOfficialObservation).filter(Boolean)
    .sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0] || null;
}
async function resolveOfficialRate(supabase, options = {}) {
  const { scrape = true, now = () => Date.now(), ...fetchOptions } = options;
  if (scrape) {
    try {
      const live = await fetchOfficialFromBcb({ ...fetchOptions, now });
      cachedOfficial = live.official_observation;
      return live;
    } catch (err) { console.warn('[official] BCB unavailable:', err.message || err); }
  }
  let stored = null;
  try { stored = await getLastOfficialFromDb(supabase); }
  catch (err) { console.warn('[official] Verified observation lookup failed:', err.message || err); }
  const last = [cachedOfficial, stored].filter(Boolean).sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0];
  return observationPayload(last ? { ...last, status: 'stale' } : emptyObservation(), { now: now() });
}
function resetOfficialCache() { cachedOfficial = null; }
module.exports = { asOfficialRate, parseBcbHomepage, fetchOfficialFromBcb, getLastOfficialFromDb, resolveOfficialRate, resetOfficialCache };
