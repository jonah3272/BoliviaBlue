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

/**
 * Get current blue market rates from Binance P2P (USD/BOB - default)
 * @returns {Promise<Object>} Buy and sell rates with metadata
 */
export async function getCurrentBlueRate() {
  try {
    const usdRate = await getCurrentBlueRateForFiat('BOB');
    
    return {
      source: 'binance-p2p',
      buy_bob_per_usd: usdRate.buy,
      sell_bob_per_usd: usdRate.sell,
      updated_at_iso: new Date().toISOString(),
      sample_buy: usdRate.sample_buy,
      sample_sell: usdRate.sample_sell
    };

  } catch (error) {
    console.error('Error fetching blue rate:', error);
    throw error;
  }
}

/**
 * Get current blue market rates for all supported currencies (USD, BRL, EUR)
 * @returns {Promise<Object>} Rates for all currencies
 */
export async function getAllCurrentBlueRates() {
  try {
    // Fetch all currencies in parallel
    const [bobRate, brlRate, eurRate] = await Promise.all([
      getCurrentBlueRateForFiat('BOB').catch(err => {
        console.warn('Failed to fetch BOB rate:', err.message);
        return null;
      }),
      getCurrentBlueRateForFiat('BRL').catch(err => {
        // Silently handle BRL rate failures - we have a fallback calculation
        if (err.message && err.message.includes('insufficient data')) {
          console.log('BRL rate not available from Binance P2P, will use USD-based fallback');
        } else {
          console.warn('Failed to fetch BRL rate:', err.message);
        }
        return null;
      }),
      getCurrentBlueRateForFiat('EUR').catch(err => {
        console.warn('Failed to fetch EUR rate:', err.message);
        return null;
      })
    ]);

    if (!bobRate) {
      throw new Error('Failed to fetch BOB rate (required for all calculations)');
    }

    const result = {
      source: 'binance-p2p',
      // USD rates (BOB per USDT, which is approximately BOB per USD)
      buy_bob_per_usd: bobRate.buy,
      sell_bob_per_usd: bobRate.sell,
      updated_at_iso: new Date().toISOString(),
      sample_buy: bobRate.sample_buy,
      sample_sell: bobRate.sample_sell
    };

    // Calculate BRL rates: BOB/BRL = (USDT/BOB) / (USDT/BRL)
    if (brlRate) {
      result.buy_bob_per_brl = bobRate.buy / brlRate.buy;
      result.sell_bob_per_brl = bobRate.sell / brlRate.sell;
      result.mid_bob_per_brl = (result.buy_bob_per_brl + result.sell_bob_per_brl) / 2;
    } else {
      // Fallback: Calculate BRL from USD rates if Binance P2P doesn't have BRL pairs
      // Using approximate conversion: 1 USD ≈ 5.0 BRL
      // We need to ensure there's always a spread, so we'll use a slightly different rate for buy/sell
      const USD_TO_BRL_BUY = 5.0;   // Slightly lower for buy (you get more BRL per USD)
      const USD_TO_BRL_SELL = 5.05; // Slightly higher for sell (you pay more BRL per USD)
      console.warn('BRL rate not available from Binance P2P, using USD-based calculation with spread');
      
      // Calculate with spread: buy should be lower (better for buyer), sell should be higher (better for seller)
      result.buy_bob_per_brl = bobRate.buy / USD_TO_BRL_BUY;
      result.sell_bob_per_brl = bobRate.sell / USD_TO_BRL_SELL;
      
      // Ensure minimum spread of at least 0.01
      const spread = result.sell_bob_per_brl - result.buy_bob_per_brl;
      if (spread < 0.01) {
        result.sell_bob_per_brl = result.buy_bob_per_brl + 0.01;
      }
      
      result.mid_bob_per_brl = (result.buy_bob_per_brl + result.sell_bob_per_brl) / 2;
    }

    // Calculate EUR rates: BOB/EUR = (USDT/BOB) / (USDT/EUR)
    if (eurRate) {
      result.buy_bob_per_eur = bobRate.buy / eurRate.buy;
      result.sell_bob_per_eur = bobRate.sell / eurRate.sell;
      result.mid_bob_per_eur = (result.buy_bob_per_eur + result.sell_bob_per_eur) / 2;
    }

    // Calculate mid rate for USD
    result.mid_bob_per_usd = (result.buy_bob_per_usd + result.sell_bob_per_usd) / 2;

    return result;

  } catch (error) {
    console.error('Error fetching all blue rates:', error);
    throw error;
  }
}

