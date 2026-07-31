import fetch from 'node-fetch';

// BCB homepage — "Tipo de cambio oficial" KPI card
const BCB_HOME_URL = 'https://www.bcb.gob.bo/';
const FALLBACK_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const REQUEST_TIMEOUT = 10000;

/**
 * Fetch official exchange rate from Banco Central de Bolivia
 * Falls back to exchangerate-api.com if BCB is unavailable
 */
export async function getOfficialRate() {
  try {
    const rate = await fetchFromBCB();
    if (rate) {
      return {
        source: 'bcb',
        official_buy: rate.buy,
        official_sell: rate.sell,
        updated_at_iso: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('BCB fetch failed, trying fallback:', error.message);
  }

  try {
    const rate = await fetchFromExchangeRateAPI();
    if (rate) {
      return {
        source: 'exchangerate-api',
        official_buy: rate.buy,
        official_sell: rate.sell,
        updated_at_iso: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('All official rate sources failed:', error.message);
    throw error;
  }
}

/**
 * Parse Spanish/Bolivian number formats: "12,15" or "12.15" or "12,1500"
 */
function parseBolivianNumber(str) {
  const raw = String(str).trim();
  // If comma is decimal separator (BO style)
  let normalized = raw;
  if (raw.includes(',') && !raw.includes('.')) {
    normalized = raw.replace(',', '.');
  } else if (raw.includes(',') && raw.includes('.')) {
    // thousand . and decimal ,
    normalized = raw.replace(/\./g, '').replace(',', '.');
  }
  const value = parseFloat(normalized);
  if (!Number.isFinite(value) || value < 1 || value > 100) {
    throw new Error(`Invalid BCB numeric value: "${str}"`);
  }
  return value;
}

/**
 * Fetch from Banco Central de Bolivia homepage KPI.
 * As of 2026 the site shows a single "Tipo de cambio oficial" (Bs → N,NN),
 * not separate Compra/Venta in the old "Valor referencial" widget.
 */
async function fetchFromBCB() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(BCB_HOME_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)',
        Accept: 'text/html,application/xhtml+xml'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Prefer the dedicated official TC card
    const cardMatch = html.match(
      /<article class="bcb-kpi2-card is-tc-oficial[\s\S]*?<\/article>/i
    );
    const cardHtml = cardMatch ? cardMatch[0] : html;

    // Pattern: "Bs --> 12,15" or "Bs → 12,15" inside the official card
    const arrowMatch = cardHtml.match(/Bs\s*(?:-->|->|→|&rarr;)\s*([\d.,]+)/i);
    if (arrowMatch) {
      const mid = parseBolivianNumber(arrowMatch[1]);
      // Official board is a single mid rate; keep tiny spread for buy/sell UI
      return { buy: mid, sell: mid };
    }

    // Fallback: plain-text search near "Tipo de cambio oficial"
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
      const numMatch = slice.match(/Bs\s*(?:-->|->|→)?\s*([\d.,]+)/i)
        || slice.match(/([\d]{1,2}[.,][\d]{2,4})/);
      if (numMatch) {
        const mid = parseBolivianNumber(numMatch[1]);
        return { buy: mid, sell: mid };
      }
    }

    // Legacy: Compra / Venta under Valor referencial (older homepage layout)
    const legacyIdx = text.toLowerCase().indexOf('valor referencial del');
    if (legacyIdx !== -1) {
      const slice = text.slice(legacyIdx, legacyIdx + 400);
      const compraMatch = slice.match(/Compra\s+([\d.,]+)/i);
      const ventaMatch = slice.match(/Venta\s+([\d.,]+)/i);
      if (compraMatch && ventaMatch) {
        return {
          buy: parseBolivianNumber(compraMatch[1]),
          sell: parseBolivianNumber(ventaMatch[1])
        };
      }
    }

    throw new Error('Could not parse Tipo de cambio oficial from BCB homepage');
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Fetch from exchangerate-api.com as fallback
 */
async function fetchFromExchangeRateAPI() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(FALLBACK_API_URL, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates.BOB) {
      throw new Error('Invalid response structure');
    }

    const bobPerUsd = data.rates.BOB;
    const spread = 0.05;
    return {
      buy: bobPerUsd + spread,
      sell: bobPerUsd - spread
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Static fallback — Bolivia official mid often near recent board (~12 BOB).
 * Prefer live BCB; this is last resort only.
 */
export function getStaticOfficialRate() {
  return {
    source: 'static',
    official_buy: 12.15,
    official_sell: 12.15,
    updated_at_iso: new Date().toISOString()
  };
}
