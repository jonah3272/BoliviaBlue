import { getCurrentBlueRate } from './p2pClient.js';
import { getOfficialRate, getStaticOfficialRate } from './officialRateClient.js';
import { fetchNews } from './newsClient.js'; // Already has Bolivia filtering
import { insertRate, insertNews } from './db-supabase.js';
import { median } from './median.js';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

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
    
    // Store in Supabase
    await insertRate(
      blueRateData.updated_at_iso,
      blueRateData.buy_bob_per_usd,
      blueRateData.sell_bob_per_usd,
      blueMid,
      officialRateData.official_buy,
      officialRateData.official_sell,
      officialMid
    );
    
    // Update cache with both rates
    cache.latestRate = {
      ...blueRateData,
      official_buy: officialRateData.official_buy,
      official_sell: officialRateData.official_sell,
      official_source: officialRateData.source
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
    
    // Store in Supabase
    let insertedCount = 0;
    for (const item of newsItems) {
      try {
        await insertNews(
          item.id,
          item.source,
          item.url,
          item.title,
          item.summary,
          item.published_at_iso,
          item.sentiment
        );
        insertedCount++;
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
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
  console.log(`Starting scheduler with ${REFRESH_INTERVAL / 1000}s interval`);
  
  // Initial refresh on boot
  runRefreshJobs().catch(console.error);
  
  // Schedule periodic refreshes
  setInterval(() => {
    runRefreshJobs().catch(console.error);
  }, REFRESH_INTERVAL);
}

