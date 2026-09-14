/**
 * US-card FX proxy (Wise mid-market USD→BOB) for Vercel.
 * Visa/MC/Amex HTTP converters are blocked; never invent a number.
 */

const STALE_MS = 20 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const BOB_PER_USD_MIN = 8;
const BOB_PER_USD_MAX = 25;

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function asBobPerUsd(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < BOB_PER_USD_MIN || n > BOB_PER_USD_MAX) return null;
  return round4(n);
}

function isCardRateStale(iso, staleMs = STALE_MS) {
  if (!iso) return true;
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return true;
  return Date.now() - ms > staleMs;
}

function parseWiseLive(payload) {
  return asBobPerUsd(payload?.value);
}

function parseWiseComparison(payload) {
  const providers = Array.isArray(payload?.providers) ? payload.providers : [];
  const wise = providers.find((p) => String(p?.alias || '').toLowerCase() === 'wise');
  return asBobPerUsd(wise?.quotes?.[0]?.rate);
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)',
        ...headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWiseBobPerUsd() {
  try {
    const live = await fetchJson('https://wise.com/rates/live?source=USD&target=BOB', {
      Referer: 'https://wise.com/',
    });
    const mid = parseWiseLive(live);
    if (!mid) throw new Error('Wise live missing value');
    return { bobPerUsd: mid, source: 'wise-mid' };
  } catch (liveErr) {
    const data = await fetchJson(
      'https://wise.com/gateway/v3/comparisons?sourceCurrency=USD&targetCurrency=BOB&sendAmount=100',
      { Referer: 'https://wise.com/', Origin: 'https://wise.com' }
    );
    const rate = parseWiseComparison(data);
    if (!rate) throw liveErr;
    return { bobPerUsd: rate, source: 'wise-proxy' };
  }
}

function toCardRow(wise) {
  const nowIso = new Date().toISOString();
  return {
    t: nowIso,
    rate_date: todayUtcDate(),
    visa_bob_per_usd: wise.bobPerUsd,
    mastercard_bob_per_usd: wise.bobPerUsd,
    amex_bob_per_usd: wise.bobPerUsd,
    source: wise.source,
    notes: 'visa/mc/amex via Wise mid (network HTTP blocked)',
  };
}

function toPayload(row, extras = {}) {
  if (!row) return null;
  return {
    t: row.t,
    updated_at_iso: row.t,
    generated_at_iso: extras.generated_at_iso || new Date().toISOString(),
    rate_date: row.rate_date,
    visa_bob_per_usd: row.visa_bob_per_usd,
    mastercard_bob_per_usd: row.mastercard_bob_per_usd,
    amex_bob_per_usd: row.amex_bob_per_usd,
    source: row.source,
    notes: row.notes ?? null,
    is_stale: isCardRateStale(row.t),
  };
}

async function getLatestCardRate(supabase) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('card_rates')
    .select('t, rate_date, visa_bob_per_usd, mastercard_bob_per_usd, amex_bob_per_usd, source, notes')
    .order('rate_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function refreshCardRates(supabase) {
  const wise = await fetchWiseBobPerUsd();
  const row = toCardRow(wise);
  const { data, error } = await supabase
    .from('card_rates')
    .upsert(row, { onConflict: 'rate_date' })
    .select('t, rate_date, visa_bob_per_usd, mastercard_bob_per_usd, amex_bob_per_usd, source, notes')
    .single();
  if (error) throw error;
  return data;
}

/**
 * If today's Wise/card row is older than 20 minutes, scrape live and upsert.
 * Never throws — returns the last stored row when Wise is down.
 */
async function attachFreshCardRate(supabase, { force = false } = {}) {
  let latest = null;
  try {
    latest = await getLatestCardRate(supabase);
  } catch (err) {
    console.warn('[card] lookup failed:', err.message || err);
  }

  if (!force && latest && !isCardRateStale(latest.t)) return latest;

  try {
    return await refreshCardRates(supabase);
  } catch (err) {
    console.warn('[card] refresh failed:', err.message || err);
    return latest;
  }
}

module.exports = {
  STALE_MS,
  asBobPerUsd,
  parseWiseLive,
  parseWiseComparison,
  isCardRateStale,
  fetchWiseBobPerUsd,
  getLatestCardRate,
  refreshCardRates,
  attachFreshCardRate,
  toPayload,
};
