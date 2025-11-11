import { getCurrentBlueRate } from './p2pClient.js';
import { getOfficialRate, getStaticOfficialRate } from './officialRateClient.js';
import { fetchNews } from './newsClient.js'; // Already has Bolivia filtering
import { fetchTwitterNews } from './twitterClient.js'; // Twitter/X integration
import { insertRate, insertNews, supabase } from './db-supabase.js';
import { median } from './median.js';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes for rates
const NEWS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for RSS news
const TWITTER_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours for Twitter (free tier is only 100/month!)

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
 * Prune old news articles to keep database clean
 * Keeps last 200 articles for better historical context
 */
async function pruneOldNews() {
  try {
    const { data: allNews, error } = await supabase
      .from('news')
      .select('id, published_at')
      .order('published_at', { ascending: false });

    if (error) throw error;

    if (allNews && allNews.length > 200) {
      const toDelete = allNews.slice(200).map(item => item.id);
      
      const { error: deleteError } = await supabase
        .from('news')
        .delete()
        .in('id', toDelete);

      if (!deleteError) {
        console.log(`Pruned ${toDelete.length} old articles (keeping last 200)`);
      }
    }
  } catch (error) {
    console.error('Failed to prune old news:', error.message);
  }
}

/**
 * Refresh news data from RSS feeds and optionally Twitter
 * @param {boolean} includeTwitter - Whether to fetch from Twitter (to conserve API quota)
 */
async function refreshNews(includeTwitter = false) {
  try {
    console.log(`Refreshing news... ${includeTwitter ? '(including Twitter)' : '(RSS only)'}`);
    
    const sources = (process.env.NEWS_SOURCES || '').split(',').filter(Boolean);
    
    // Fetch RSS feeds
    const rssNews = sources.length > 0 ? await fetchNews(sources) : [];
    
    // Only fetch Twitter if explicitly requested (to save API quota)
    let twitterNews = [];
    if (includeTwitter) {
      try {
        twitterNews = await fetchTwitterNews();
        console.log(`✅ Twitter: Fetched ${twitterNews.length} tweets`);
      } catch (err) {
        console.warn('Twitter fetch failed:', err.message);
      }
    }
    
    const allNewsItems = [...rssNews, ...twitterNews];
    
    if (allNewsItems.length === 0) {
      console.warn('No news items fetched');
      return;
    }
    
    // Store in Supabase
    let insertedCount = 0;
    for (const item of allNewsItems) {
      try {
        // Determine type: tweets from twitter.com, everything else is articles
        const type = item.source === 'twitter.com' ? 'tweet' : 'article';
        
        await insertNews(
          item.id,
          item.source,
          item.url,
          item.title,
          item.summary,
          item.published_at_iso,
          item.sentiment,
          item.category,
          type
        );
        insertedCount++;
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
          console.error('Error inserting news item:', error);
        }
      }
    }
    
    console.log(`News updated: ${insertedCount} new items stored (${rssNews.length} RSS, ${twitterNews.length} Twitter)`);
    
    // Prune old articles after inserting new ones
    await pruneOldNews();
    
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

/**
 * Start the scheduler
 */
export function startScheduler() {
  console.log(`Starting scheduler:`);
  console.log(`- Rates: every ${REFRESH_INTERVAL / 1000}s (15 min)`);
  console.log(`- RSS News: every ${NEWS_REFRESH_INTERVAL / 1000}s (5 min)`);
  console.log(`- Twitter: every ${TWITTER_REFRESH_INTERVAL / 1000}s (24 hours - conserve API quota)`);
  
  // Initial refresh on boot (include Twitter on first load)
  refreshBlueRate().catch(console.error);
  refreshNews(true).catch(console.error); // Include Twitter on startup
  
  // Schedule rates refresh (every 15 minutes)
  setInterval(() => {
    refreshBlueRate().catch(console.error);
  }, REFRESH_INTERVAL);
  
  // Schedule RSS news refresh (every 5 minutes, WITHOUT Twitter)
  setInterval(() => {
    refreshNews(false).catch(console.error); // RSS only to save Twitter API
  }, NEWS_REFRESH_INTERVAL);
  
  // Schedule Twitter refresh (once per 24 hours to stay within 100/month limit)
  setInterval(() => {
    refreshNews(true).catch(console.error); // Include Twitter
  }, TWITTER_REFRESH_INTERVAL);
}

