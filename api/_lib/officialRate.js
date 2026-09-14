/**
 * Banco Central de Bolivia official USD/BOB rate.
 * As of Sep 2026 the homepage card is a single mid in `.bcb-tco-num` (Bs span commented out).
 */

const BCB_HOME_URL = 'https://www.bcb.gob.bo/';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_MS = 6 * 60 * 60 * 1000;

let cachedOfficial = null;

function asOfficialRate(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 100) return null;
  return n;
}

function parseBolivianNumber(str) {
  const raw = String(str).trim();
  let normalized = raw;
  if (raw.includes(',') && !raw.includes('.')) {
    normalized = raw.replace(',', '.');
  } else if (raw.includes(',') && raw.includes('.')) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  }
  return asOfficialRate(parseFloat(normalized));
}

function pack(buy, sell, source) {
  const b = asOfficialRate(buy);
  const s = asOfficialRate(sell);
  if (!b || !s) return null;
  return {
    official_buy: b,
    official_sell: s,
    official_mid: (b + s) / 2,
    source,
  };
}

/**
 * Parse BCB homepage HTML. Returns { buy, sell } or null (never invents a rate).
 */
function parseBcbHomepage(html) {
  if (!html || typeof html !== 'string') return null;

  const cardMatch = html.match(/<article[^>]*is-tc-oficial[\s\S]*?<\/article>/i);
  const cardHtml = cardMatch ? cardMatch[0] : html;

  const tcoMatch =
    cardHtml.match(/class="[^"]*bcb-tco-num[^"]*"[^>]*>\s*([\d.,]+)/i) ||
    cardHtml.match(/bcb-tco-num[^>]*>\s*([\d.,]+)/i);
  if (tcoMatch) {
    const mid = parseBolivianNumber(tcoMatch[1]);
    if (mid) return { buy: mid, sell: mid };
  }

  const arrowMatch = cardHtml.match(/Bs\s*(?:-->|->|→|&rarr;)\s*([\d.,]+)/i);
  if (arrowMatch) {
    const mid = parseBolivianNumber(arrowMatch[1]);
    if (mid) return { buy: mid, sell: mid };
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const markerIdx = text.toLowerCase().indexOf('tipo de cambio oficial');
  if (markerIdx !== -1) {
    const slice = text.slice(markerIdx, markerIdx + 280);
    const numMatch =
      slice.match(/Bs\s*(?:-->|->|→)?\s*([\d.,]+)/i) || slice.match(/([\d]{1,2}[.,][\d]{2,4})/);
    if (numMatch) {
      const mid = parseBolivianNumber(numMatch[1]);
      if (mid) return { buy: mid, sell: mid };
    }
  }

  const legacyIdx = text.toLowerCase().indexOf('valor referencial del');
  if (legacyIdx !== -1) {
    const slice = text.slice(legacyIdx, legacyIdx + 400);
    const compraMatch = slice.match(/Compra\s+([\d.,]+)/i);
    const ventaMatch = slice.match(/Venta\s+([\d.,]+)/i);
    if (compraMatch && ventaMatch) {
      const buy = parseBolivianNumber(compraMatch[1]);
      const sell = parseBolivianNumber(ventaMatch[1]);
      if (buy && sell) return { buy, sell };
    }
  }

  return null;
}

async function fetchOfficialFromBcb() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(BCB_HOME_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const parsed = parseBcbHomepage(html);
    if (!parsed) throw new Error('Could not parse Tipo de cambio oficial from BCB homepage');
    return pack(parsed.buy, parsed.sell, 'bcb');
  } finally {
    clearTimeout(timeout);
  }
}

async function getLastOfficialFromDb(supabase) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('rates')
    .select('official_buy, official_sell, official_mid')
    .not('official_buy', 'is', null)
    .not('official_sell', 'is', null)
    .order('t', { ascending: false })
    .limit(1)
    .maybeSingle();
  return pack(data?.official_buy, data?.official_sell, 'rates-table');
}

function remember(official) {
  if (!official?.official_buy) return official;
  cachedOfficial = { ...official, fetchedAt: Date.now() };
  return cachedOfficial;
}

/**
 * Live BCB first, then in-memory cache, then last non-null DB row.
 * Never returns the old static 6.96 / 12.15 invented fallbacks.
 */
async function resolveOfficialRate(supabase, { scrape = true } = {}) {
  if (cachedOfficial?.official_buy && Date.now() - cachedOfficial.fetchedAt < CACHE_MS) {
    return cachedOfficial;
  }

  if (scrape) {
    try {
      const live = await fetchOfficialFromBcb();
      if (live) return remember(live);
    } catch (err) {
      console.warn('[official] BCB scrape failed:', err.message || err);
    }
  }

  if (cachedOfficial?.official_buy) return cachedOfficial;

  const last = await getLastOfficialFromDb(supabase);
  if (last) return remember(last);

  return {
    official_buy: null,
    official_sell: null,
    official_mid: null,
    source: null,
  };
}

async function attachOfficial(data, supabase) {
  if (!data) return data;
  const have =
    asOfficialRate(data.official_buy) && asOfficialRate(data.official_sell)
      ? pack(data.official_buy, data.official_sell, 'rates-row')
      : null;
  if (have) return { ...data, ...have };

  const resolved = await resolveOfficialRate(supabase);
  if (!asOfficialRate(resolved.official_buy)) return data;

  if (supabase) {
    const patch = {
      official_buy: resolved.official_buy,
      official_sell: resolved.official_sell,
      official_mid: resolved.official_mid,
    };
    try {
      let t = data.t;
      if (!t) {
        const { data: latest } = await supabase
          .from('rates')
          .select('t')
          .order('t', { ascending: false })
          .limit(1)
          .maybeSingle();
        t = latest?.t;
      }
      if (t) {
        const { error } = await supabase.from('rates').update(patch).eq('t', t);
        if (error) console.warn('[official] persist failed:', error.message);
      }
    } catch (err) {
      console.warn('[official] persist failed:', err.message || err);
    }
  }

  return {
    ...data,
    official_buy: resolved.official_buy,
    official_sell: resolved.official_sell,
    official_mid: resolved.official_mid,
    official_source: resolved.source,
  };
}

function resetOfficialCache() {
  cachedOfficial = null;
}

module.exports = {
  asOfficialRate,
  parseBcbHomepage,
  fetchOfficialFromBcb,
  getLastOfficialFromDb,
  resolveOfficialRate,
  attachOfficial,
  resetOfficialCache,
};
