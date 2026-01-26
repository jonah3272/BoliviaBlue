import { getAllCurrentBlueRates } from './p2pClient.js';
import { getOfficialRate, getStaticOfficialRate } from './officialRateClient.js';
import { fetchNews } from './newsClient.js'; // Already has Bolivia filtering
import { fetchTwitterNews } from './twitterClient.js'; // Twitter/X integration
import { insertRate, insertNews, supabase } from './db-supabase.js';
import { median } from './median.js';
import { checkAlerts } from './alertChecker.js';
import { generateDailyArticles } from './dailyArticleGenerator.js';
import { sendWeeklyNewsletter } from './weeklyNewsletterGenerator.js';
import { generatePreviousMonthReport } from './monthlyReportGenerator.js';
import { evaluatePredictions } from './predictionFeedback.js';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes for rates
const NEWS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for RSS news
const TWITTER_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours for Twitter (free tier is only 100/month!)
const DAILY_ARTICLE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours for daily articles
const WEEKLY_NEWSLETTER_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days (weekly)
const MONTHLY_REPORT_INTERVAL = 24 * 60 * 60 * 1000; // Check daily if it's the 1st of the month
const PREDICTION_EVALUATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours - evaluate predictions daily

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
      getAllCurrentBlueRates(),
      getOfficialRate().catch(err => {
        console.warn('Official rate fetch failed, using static:', err.message);
        return getStaticOfficialRate();
      })
    ]);
    
    // Calculate mid prices
    const blueMid = median([blueRateData.buy_bob_per_usd, blueRateData.sell_bob_per_usd]);
    const officialMid = median([officialRateData.official_buy, officialRateData.official_sell]);
    
    // Store in Supabase with all currencies
    await insertRate(
      blueRateData.updated_at_iso,
      blueRateData.buy_bob_per_usd,
      blueRateData.sell_bob_per_usd,
      blueMid,
      officialRateData.official_buy,
      officialRateData.official_sell,
      officialMid,
      blueRateData.buy_bob_per_brl || null,
      blueRateData.sell_bob_per_brl || null,
      blueRateData.mid_bob_per_brl || null,
      blueRateData.buy_bob_per_eur || null,
      blueRateData.sell_bob_per_eur || null,
      blueRateData.mid_bob_per_eur || null
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
    
    // Check alerts after updating rates
    await checkAlerts();
    
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
    let duplicateCount = 0;
    for (const item of allNewsItems) {
      try {
        // Determine type: tweets from twitter.com, everything else is articles
        const type = item.source === 'twitter.com' ? 'tweet' : 'article';
        
        const result = await insertNews(
          item.id,
          item.source,
          item.url,
          item.title,
          item.summary,
          item.published_at_iso,
          item.sentiment,
          item.category,
          type,
          item.sentiment_strength || null
        );
        
        // insertNews returns null if duplicate, data object if inserted
        if (result) {
          insertedCount++;
        } else {
          duplicateCount++;
        }
      } catch (error) {
        // Log unexpected errors (not duplicate-related)
        console.error('Error inserting news item:', error);
      }
    }
    
    console.log(`News updated: ${insertedCount} new items stored, ${duplicateCount} duplicates skipped (${rssNews.length} RSS, ${twitterNews.length} Twitter)`);
    
    // Prune old articles after inserting new ones
    await pruneOldNews();
    
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

/**
 * Generate daily article (runs once per day)
 */
async function runDailyArticleGeneration() {
  try {
    console.log('📝 Generating daily articles...');
    await generateDailyArticles();
    console.log('✅ Daily articles generated successfully');
  } catch (error) {
    console.error('❌ Error generating daily articles:', error);
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
  console.log(`- Daily Articles: every ${DAILY_ARTICLE_INTERVAL / 1000}s (24 hours)`);
  console.log(`- Weekly Newsletter: every ${WEEKLY_NEWSLETTER_INTERVAL / 1000}s (7 days)`);
  console.log(`- Monthly Reports: daily check (generates on 1st of month)`);
  console.log(`- Prediction Evaluation: every ${PREDICTION_EVALUATION_INTERVAL / 1000}s (24 hours)`);
  
  // Initial refresh on boot (include Twitter on first load)
  refreshBlueRate().catch(console.error);
  refreshNews(true).catch(console.error); // Include Twitter on startup
  
  // Generate daily article on startup (if not already generated today)
  runDailyArticleGeneration().catch(console.error);
  
  // Evaluate predictions on startup (to catch up on any missed evaluations)
  evaluatePredictions().catch(console.error);
  
  // Check if it's the 1st of the month and generate previous month's report
  const now = new Date();
  if (now.getDate() === 1) {
    generatePreviousMonthReport().catch(console.error);
  }
  
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
  
  // Schedule daily article generation (once per 24 hours, at midnight)
  // Calculate time until next midnight
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;
  
  // Generate first article after midnight delay
  setTimeout(() => {
    runDailyArticleGeneration().catch(console.error);
    // Then schedule for every 24 hours
    setInterval(() => {
      runDailyArticleGeneration().catch(console.error);
    }, DAILY_ARTICLE_INTERVAL);
  }, msUntilMidnight);
  
  // Schedule weekly newsletter (every Monday at 9 AM Bolivia time)
  // Calculate time until next Monday 9 AM
  const nextMonday = new Date();
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7; // Days until next Monday
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0); // 9 AM Bolivia time
  const msUntilMonday = nextMonday - now;
  
  setTimeout(() => {
    sendWeeklyNewsletter().catch(console.error);
    // Then schedule for every 7 days
    setInterval(() => {
      sendWeeklyNewsletter().catch(console.error);
    }, WEEKLY_NEWSLETTER_INTERVAL);
  }, msUntilMonday);
  
  // Schedule monthly report generation (check daily if it's the 1st)
  setInterval(() => {
    const checkDate = new Date();
    if (checkDate.getDate() === 1 && checkDate.getHours() === 0) {
      generatePreviousMonthReport().catch(console.error);
    }
  }, MONTHLY_REPORT_INTERVAL);
  
  // Schedule prediction evaluation (daily at 2 AM to avoid peak times)
  // Calculate time until next 2 AM
  const next2AM = new Date();
  if (next2AM.getHours() >= 2) {
    next2AM.setDate(next2AM.getDate() + 1);
  }
  next2AM.setHours(2, 0, 0, 0);
  const msUntil2AM = next2AM - now;
  
  setTimeout(() => {
    evaluatePredictions().catch(console.error);
    // Then schedule for every 24 hours
    setInterval(() => {
      evaluatePredictions().catch(console.error);
    }, PREDICTION_EVALUATION_INTERVAL);
  }, msUntil2AM);
}

