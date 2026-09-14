import fetch from 'node-fetch';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseBcbHomepage } = require('../api/_lib/officialRate.js');

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
 * Fetch from Banco Central de Bolivia homepage KPI.
 * Sep 2026 board is a single mid in `.bcb-tco-num` (Bs label commented out).
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
    const parsed = parseBcbHomepage(html);
    if (parsed) return parsed;

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
