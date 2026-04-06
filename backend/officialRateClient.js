import fetch from 'node-fetch';

// New BCB homepage where the "Valor referencial del dólar estadounidense" widget lives
const BCB_HOME_URL = 'https://www.bcb.gob.bo/';
const FALLBACK_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const REQUEST_TIMEOUT = 10000;

/**
 * Fetch official exchange rate from Banco Central de Bolivia
 * Falls back to exchangerate-api.com if BCB is unavailable
 */
export async function getOfficialRate() {
  try {
    // Try BCB first
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
    // Fallback to exchangerate-api
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
 * Fetch from Banco Central de Bolivia
 * Note: BCB rate is typically fixed by the government
 */
async function fetchFromBCB() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    // Fetch BCB homepage HTML where the "Valor referencial del dólar estadounidense" block appears
    const response = await fetch(BCB_HOME_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Convert HTML to a rough text stream so we can regex around the "Valor referencial" block
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Locate the "Valor referencial del dólar estadounidense" section in the plain text
    const marker = 'Valor referencial del dólar estadounidense';
    const idx = text.indexOf(marker);
    if (idx === -1) {
      throw new Error('Valor referencial block not found in BCB homepage');
    }

    const slice = text.slice(idx, idx + 400); // small window around the marker

    // Regex: look for "Compra <number>" and "Venta <number>" within that slice
    const compraMatch = slice.match(/Compra\s+([\d.,]+)/i);
    const ventaMatch = slice.match(/Venta\s+([\d.,]+)/i);

    if (!compraMatch || !ventaMatch) {
      throw new Error('Could not parse Compra/Venta from Valor referencial block');
    }

    // Convert Spanish decimal format (e.g. 8,96) to JS float
    const parseBolivianNumber = (str) => {
      const normalized = str.replace(/\./g, '').replace(',', '.').trim();
      const value = parseFloat(normalized);
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid numeric value from BCB: "${str}"`);
      }
      return value;
    };

    const buy = parseBolivianNumber(compraMatch[1]);
    const sell = parseBolivianNumber(ventaMatch[1]);

    return { buy, sell };

  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Fetch from exchangerate-api.com as fallback
 * This provides market rates which approximate official rates
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

    // Apply small spread for buy/sell
    const spread = 0.05; // 0.05 BOB spread
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
 * Get a static official rate as ultimate fallback
 * Bolivia's official rate is government-controlled and rarely changes
 */
export function getStaticOfficialRate() {
  return {
    source: 'static',
    official_buy: 6.96,
    official_sell: 6.86,
    updated_at_iso: new Date().toISOString()
  };
}

