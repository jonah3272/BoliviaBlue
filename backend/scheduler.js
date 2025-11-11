import { getCurrentBlueRate } from './p2pClient.js';
import { getOfficialRate, getStaticOfficialRate } from './officialRateClient.js';
import { fetchNews } from './newsClient.js';
import { insertRate, insertNews, getRatesInRange } from './db.js';
import { median } from './median.js';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes for rates
const NEWS_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes for news

// In-memory cache for latest data
export const cache = {
  latestRate: null,
  lastUpdate: null,
  isHealthy: true
};

/**
 * Refresh blue market rate and official rate data
 */
async function refreshBlueRate() {
  try {
    console.log('Refreshing blue rate and official rate...');
    
    // Fetch both rates in parallel
    const [blueRateData, officialRateData] = await Promise.all([
      getCurrentBlueRate(),
      getOfficialRate().catch(err => {
        console.warn('Official rate fetch failed, using static:', err.message);
        return getStaticOfficialRate();
      })
    ]);
    
    // Calculate mid prices
    const blueMid = median([blueRateData.buy_bob_per_usd, blueRateData.sell_bob_per_usd]);
    const officialMid = median([officialRateData.official_buy, officialRateData.official_sell]);
    
    // Store in database
    insertRate.run(
      blueRateData.updated_at_iso,
      blueRateData.buy_bob_per_usd,
      blueRateData.sell_bob_per_usd,
      blueMid,
      officialRateData.official_buy,
      officialRateData.official_sell,
      officialMid
    );
    
    // Get yesterday's rate for daily change calculation
    const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const yesterdayRates = getRatesInRange.all(yesterdayStart);
    
    let buyChange = null;
    let sellChange = null;
    
    if (yesterdayRates.length > 0) {
      const yesterdayRate = yesterdayRates[0];
      buyChange = ((blueRateData.buy_bob_per_usd - yesterdayRate.buy) / yesterdayRate.buy * 100).toFixed(2);
      sellChange = ((blueRateData.sell_bob_per_usd - yesterdayRate.sell) / yesterdayRate.sell * 100).toFixed(2);
    }
    
    // Update cache with both rates and daily change
    cache.latestRate = {
      ...blueRateData,
      official_buy: officialRateData.official_buy,
      official_sell: officialRateData.official_sell,
      official_source: officialRateData.source,
      buy_change_24h: buyChange,
      sell_change_24h: sellChange
    };
    cache.lastUpdate = new Date();
    cache.isHealthy = true;
    
    console.log(`Blue rate: Buy ${blueRateData.buy_bob_per_usd}, Sell ${blueRateData.sell_bob_per_usd}`);
    console.log(`Official rate: Buy ${officialRateData.official_buy}, Sell ${officialRateData.official_sell}`);
    
  } catch (error) {
    console.error('Failed to refresh rates:', error);
    cache.isHealthy = false;
  }
}

/**
 * Refresh news data
 */
async function refreshNews() {
  try {
    console.log('Refreshing news...');
    
    const sources = (process.env.NEWS_SOURCES || '').split(',').filter(Boolean);
    
    if (sources.length === 0) {
      console.warn('No news sources configured');
      return;
    }
    
    const newsItems = await fetchNews(sources);
    
    // Store in database
    let insertedCount = 0;
    for (const item of newsItems) {
      try {
        insertNews.run(
          item.id,
          item.source,
          item.url,
          item.title,
          item.summary,
          item.published_at_iso,
          item.sentiment,
          item.category
        );
        insertedCount++;
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('UNIQUE constraint')) {
          console.error('Error inserting news item:', error);
        }
      }
    }
    
    console.log(`News updated: ${insertedCount} new items stored`);
    
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

/**
 * Run all refresh jobs
 */
async function runRefreshJobs() {
  await Promise.all([
    refreshBlueRate(),
    refreshNews()
  ]);
}

/**
 * Start the scheduler
 */
export function startScheduler() {
  console.log(`Starting scheduler...`);
  console.log(`- Rates: refresh every ${REFRESH_INTERVAL / 1000 / 60} minutes`);
  console.log(`- News: refresh every ${NEWS_REFRESH_INTERVAL / 1000 / 60} minutes`);
  
  // Initial refresh on boot
  refreshBlueRate().catch(console.error);
  refreshNews().catch(console.error);
  
  // Schedule periodic refreshes
  setInterval(() => {
    refreshBlueRate().catch(console.error);
  }, REFRESH_INTERVAL);
  
  setInterval(() => {
    refreshNews().catch(console.error);
  }, NEWS_REFRESH_INTERVAL);
}

