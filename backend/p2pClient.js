import fetch from 'node-fetch';
import { createRequire } from 'module';
import { median } from './median.js';

const require = createRequire(import.meta.url);
const { createSourceObservation } = require('../shared/rateProvenance.cjs');
const { fetchCrossSourceBobRates } = require('../api/_lib/p2pCrossSource.js');

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

/**
 * Sleep for a given duration
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch P2P offers from Binance with retry logic
 * @param {string} tradeType - "BUY" or "SELL"
 * @param {string} fiat - Fiat currency code (BOB, BRL, EUR, etc.)
 * @param {number} rows - Number of rows to fetch
 * @returns {Promise<number[]>} Array of prices
 */
async function fetchP2POffers(tradeType, fiat = 'BOB', rows = 20) {
  const payload = {
    asset: 'USDT',
    fiat: fiat,
    tradeType,
    rows,
    page: 1,
    merchantCheck: false,
    payTypes: []
  };

  let lastError;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(BINANCE_P2P_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response structure from Binance P2P API');
      }

      // Extract prices from advertisements
      const prices = data.data
        .map(adv => parseFloat(adv.adv?.price))
        .filter(price => Number.isFinite(price));

      return prices;

    } catch (error) {
      lastError = error;
      
      if (attempt < MAX_RETRIES - 1) {
        const backoff = INITIAL_BACKOFF * Math.pow(2, attempt);
        console.warn(`P2P fetch attempt ${attempt + 1} failed for ${tradeType}, retrying in ${backoff}ms:`, error.message);
        await sleep(backoff);
      }
    }
  }

  throw new Error(`Failed to fetch P2P ${tradeType} after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

/**
 * Get current blue market rates from Binance P2P for a specific fiat currency
 * @param {string} fiat - Fiat currency code (BOB, BRL, EUR)
 * @returns {Promise<Object>} Buy and sell rates with metadata
 */
async function getCurrentBlueRateForFiat(fiat = 'BOB') {
  try {
    // Fetch buy and sell offers in parallel
    const [buyPrices, sellPrices] = await Promise.all([
      fetchP2POffers('BUY', fiat),
      fetchP2POffers('SELL', fiat)
    ]);

    // Calculate medians
    const buyMedian = median(buyPrices);
    const sellMedian = median(sellPrices);

    if (buyMedian === null || sellMedian === null) {
      throw new Error(`Unable to calculate median for ${fiat} - insufficient data`);
    }

    return {
      buy: buyMedian,
      sell: sellMedian,
      sample_buy: buyPrices.slice(0, 5),
      sample_sell: sellPrices.slice(0, 5)
    };

  } catch (error) {
    console.error(`Error fetching blue rate for ${fiat}:`, error);
    throw error;
  }
}

async function attachFiatCross(result, bobRate, fiatRate, code, spotSymbol) {
  const key = code.toLowerCase();
  if (fiatRate) {
    result[`buy_bob_per_${key}`] = bobRate.buy / fiatRate.buy;
    result[`sell_bob_per_${key}`] = bobRate.sell / fiatRate.sell;
    result[`mid_bob_per_${key}`] = (result[`buy_bob_per_${key}`] + result[`sell_bob_per_${key}`]) / 2;
    result[`${key}_derivation`] = 'p2p-usdt';
    return;
  }
  try {
    const spotRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${spotSymbol}`);
    if (spotRes.ok) {
      const spot = await spotRes.json();
      const fiatPerUsdt = parseFloat(spot?.price);
      if (Number.isFinite(fiatPerUsdt) && fiatPerUsdt > 0) {
        result[`buy_bob_per_${key}`] = bobRate.buy / fiatPerUsdt;
        result[`sell_bob_per_${key}`] = bobRate.sell / fiatPerUsdt;
        result[`mid_bob_per_${key}`] = (result[`buy_bob_per_${key}`] + result[`sell_bob_per_${key}`]) / 2;
        result[`${key}_derivation`] = `spot-${spotSymbol.toLowerCase()}`;
      }
    }
  } catch (err) {
    console.warn(`${code} spot fallback failed:`, err.message);
  }
}

/**
 * Get current blue market rates from Binance P2P (USD/BOB - default)
 * @returns {Promise<Object>} Buy and sell rates with metadata
 */
export async function getCurrentBlueRate() {
  try {
    const cross = await fetchCrossSourceBobRates();

    return {
      source: cross.sources_used.length > 1 ? 'p2p-cross-median' : `${cross.sources_used[0]}-p2p`,
      sources_used: cross.sources_used,
      buy_bob_per_usd: cross.buy,
      sell_bob_per_usd: cross.sell,
      updated_at_iso: new Date().toISOString(),
      sample_buy: cross.platforms.map((p) => p.buy).slice(0, 5),
      sample_sell: cross.platforms.map((p) => p.sell).slice(0, 5),
    };

  } catch (error) {
    console.error('Error fetching cross-source blue rate, falling back to Binance:', error);
    const usdRate = await getCurrentBlueRateForFiat('BOB');
    return {
      source: 'binance-p2p',
      sources_used: ['binance'],
      buy_bob_per_usd: usdRate.buy,
      sell_bob_per_usd: usdRate.sell,
      updated_at_iso: new Date().toISOString(),
      sample_buy: usdRate.sample_buy,
      sample_sell: usdRate.sample_sell,
    };
  }
}

/**
 * Get current blue market rates for all supported currencies (USD, BRL, EUR)
 * @returns {Promise<Object>} Rates for all currencies
 */
export async function getAllCurrentBlueRates() {
  try {
    // Fetch all currencies in parallel
    const [bobRate, brlRate, eurRate, copRate, penRate, arsRate, clpRate] = await Promise.all([
      fetchCrossSourceBobRates().catch(err => {
        console.warn('Failed to fetch BOB rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('BRL').catch(err => {
        console.warn('BRL P2P unavailable; leaving BRL conversion empty:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('EUR').catch(err => {
        console.warn('Failed to fetch EUR rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('COP').catch(err => {
        console.warn('Failed to fetch COP rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('PEN').catch(err => {
        console.warn('Failed to fetch PEN rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('ARS').catch(err => {
        console.warn('Failed to fetch ARS rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('CLP').catch(err => {
        console.warn('Failed to fetch CLP rate:', err.message);
        return null;
      })
    ]);

    if (!bobRate) {
      throw new Error('Failed to fetch BOB rate (required for all calculations)');
    }

    const observedAt = new Date().toISOString();
    const result = {
      source_observation: createSourceObservation(bobRate, observedAt),
      source: bobRate.sources_used.length > 1 ? 'p2p-cross-median' : `${bobRate.sources_used[0]}-p2p`,
      sources_used: bobRate.sources_used,
      // USD rates (BOB per USDT, which is approximately BOB per USD)
      buy_bob_per_usd: bobRate.buy,
      sell_bob_per_usd: bobRate.sell,
      updated_at_iso: observedAt,
      sample_buy: bobRate.platforms.map((p) => p.buy).slice(0, 5),
      sample_sell: bobRate.platforms.map((p) => p.sell).slice(0, 5)
    };

    // Same-side indicative cross only when both observed BRL inputs are valid.
    // Missing BRL liquidity must not become a fixed USD/BRL guess or invented spread.
    const validBrl = brlRate && [bobRate.buy, bobRate.sell, brlRate.buy, brlRate.sell]
      .every(value => typeof value === 'number' && Number.isFinite(value) && value > 0);
    const brlBuy = validBrl ? bobRate.buy / brlRate.buy : null;
    const brlSell = validBrl ? bobRate.sell / brlRate.sell : null;
    const validCross = Number.isFinite(brlBuy) && brlBuy > 0 && Number.isFinite(brlSell) && brlSell > 0;
    result.buy_bob_per_brl = validCross ? brlBuy : null;
    result.sell_bob_per_brl = validCross ? brlSell : null;
    const brlMid = (brlBuy + brlSell) / 2;
    result.mid_bob_per_brl = validCross ? (Number.isFinite(brlMid) ? brlMid : brlBuy / 2 + brlSell / 2) : null;

    // Calculate EUR rates: BOB/EUR = (USDT/BOB) / (USDT/EUR)
    if (eurRate) {
      result.buy_bob_per_eur = bobRate.buy / eurRate.buy;
      result.sell_bob_per_eur = bobRate.sell / eurRate.sell;
      result.mid_bob_per_eur = (result.buy_bob_per_eur + result.sell_bob_per_eur) / 2;
    }

    if (copRate) {
      result.buy_bob_per_cop = bobRate.buy / copRate.buy;
      result.sell_bob_per_cop = bobRate.sell / copRate.sell;
      result.mid_bob_per_cop = (result.buy_bob_per_cop + result.sell_bob_per_cop) / 2;
      result.cop_derivation = 'p2p-usdt';
    } else {
      try {
        const spotRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTCOP');
        if (spotRes.ok) {
          const spot = await spotRes.json();
          const copPerUsdt = parseFloat(spot?.price);
          if (Number.isFinite(copPerUsdt) && copPerUsdt > 0) {
            result.buy_bob_per_cop = bobRate.buy / copPerUsdt;
            result.sell_bob_per_cop = bobRate.sell / copPerUsdt;
            result.mid_bob_per_cop = (result.buy_bob_per_cop + result.sell_bob_per_cop) / 2;
            result.cop_derivation = 'spot-usdtcop';
          }
        }
      } catch (err) {
        console.warn('COP spot fallback failed:', err.message);
      }
    }

    await Promise.all([
      attachFiatCross(result, bobRate, penRate, 'PEN', 'USDTPEN'),
      attachFiatCross(result, bobRate, arsRate, 'ARS', 'USDTARS'),
      attachFiatCross(result, bobRate, clpRate, 'CLP', 'USDTCLP'),
    ]);

    // Calculate mid rate for USD
    result.mid_bob_per_usd = (result.buy_bob_per_usd + result.sell_bob_per_usd) / 2;

    return result;

  } catch (error) {
    console.error('Error fetching all blue rates:', error);
    throw error;
  }
}

