import fetch from 'node-fetch';
import { median } from './median.js';

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
 * @param {number} rows - Number of rows to fetch
 * @returns {Promise<number[]>} Array of prices
 */
async function fetchP2POffers(tradeType, rows = 20) {
  const payload = {
    asset: 'USDT',
    fiat: 'BOB',
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
 * Get current blue market rates from Binance P2P
 * @returns {Promise<Object>} Buy and sell rates with metadata
 */
export async function getCurrentBlueRate() {
  try {
    // Fetch buy and sell offers in parallel
    const [buyPrices, sellPrices] = await Promise.all([
      fetchP2POffers('BUY'),
      fetchP2POffers('SELL')
    ]);

    // Calculate medians
    const buyMedian = median(buyPrices);
    const sellMedian = median(sellPrices);

    if (buyMedian === null || sellMedian === null) {
      throw new Error('Unable to calculate median - insufficient data');
    }

    return {
      source: 'binance-p2p',
      buy_bob_per_usd: buyMedian,
      sell_bob_per_usd: sellMedian,
      updated_at_iso: new Date().toISOString(),
      sample_buy: buyPrices.slice(0, 5),
      sample_sell: sellPrices.slice(0, 5)
    };

  } catch (error) {
    console.error('Error fetching blue rate:', error);
    throw error;
  }
}

