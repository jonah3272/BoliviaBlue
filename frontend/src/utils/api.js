import { supabase } from './supabase';
import logger from './logger';

/**
 * Retry wrapper for API calls
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 */
async function retryWithDelay(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      logger.warn(`Retry attempt ${i + 1}/${retries} failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
    }
  }
}

/**
 * Fetch current blue market rate directly from Supabase with retry logic
 */
export async function fetchBlueRate() {
  return retryWithDelay(async () => {
    // Get the latest rate
    const { data, error } = await supabase
      .from('rates')
      .select('*')
      .order('t', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      logger.error('Error fetching rate from Supabase:', error);
      throw new Error(`Failed to fetch rate: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No rate data available');
    }
    
    // Get yesterday's rate for daily change calculation
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: yesterdayData } = await supabase
      .from('rates')
      .select('buy, sell')
      .lte('t', oneDayAgo)
      .order('t', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    let buyChange = null;
    let sellChange = null;
    
    if (yesterdayData) {
      buyChange = ((data.buy - yesterdayData.buy) / yesterdayData.buy * 100).toFixed(2);
      sellChange = ((data.sell - yesterdayData.sell) / yesterdayData.sell * 100).toFixed(2);
    }
    
    // Format response to match expected structure
    return {
      source: 'binance-p2p',
      buy_bob_per_usd: data.buy,
      sell_bob_per_usd: data.sell,
      mid_bob_per_usd: data.mid,
      official_buy: data.official_buy,
      official_sell: data.official_sell,
      official_mid: data.official_mid,
      updated_at_iso: data.t,
      buy_change_24h: buyChange,
      sell_change_24h: sellChange,
      sample_buy: [],
      sample_sell: []
    };
  });
}

/**
 * Fetch historical blue market rates directly from Supabase
 * @param {string} range - Time range: 1D, 1W, 1M, 1Y, ALL
 */
export async function fetchBlueHistory(range = '1W') {
  let startDate;
  const now = new Date();
  
  switch (range) {
    case '1D':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '1W':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'ALL':
    default:
      startDate = new Date(0); // Beginning of time
  }
  
  // For ALL range, we need to fetch all rows - Supabase default limit is 1000
  // Use a large limit or fetch in batches if needed
  let query = supabase
    .from('rates')
    .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
    .gte('t', startDate.toISOString())
    .order('t', { ascending: true });
  
  // Remove any default limit for ALL range to get all data
  if (range === 'ALL') {
    query = query.limit(10000); // Set explicit high limit for ALL range
  }
  
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching history from Supabase:', error);
    throw new Error(`Failed to fetch history: ${error.message}`);
  }
  
  let points = data || [];
  
  // Log what we actually got and verify we have recent data
  if (range === 'ALL' && points.length > 0) {
    const firstDate = new Date(points[0].t);
    const lastDate = new Date(points[points.length - 1].t);
    const now = new Date();
    const daysSinceLast = (now - lastDate) / (1000 * 60 * 60 * 24);
    
    logger.log(`[fetchBlueHistory] ALL range fetched: ${points.length} points`);
    logger.log(`[fetchBlueHistory] Date range: ${firstDate.toISOString()} to ${lastDate.toISOString()}`);
    logger.log(`[fetchBlueHistory] Days since last data point: ${daysSinceLast.toFixed(1)}`);
    
    // Warn if we're missing recent data (more than 2 days old)
    if (daysSinceLast > 2) {
      logger.warn(`[fetchBlueHistory] WARNING: Last data point is ${daysSinceLast.toFixed(1)} days old. Data might be incomplete!`);
    }
    
    // Verify we have data through today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDataDay = new Date(lastDate);
    lastDataDay.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastDataDay) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      logger.warn(`[fetchBlueHistory] WARNING: Missing ${daysDiff} days of recent data. Expected data through today, but last point is from ${lastDate.toLocaleDateString()}`);
    }
  }
  
  // For ALL range, show all data points for datasets under 3000 points
  // Modern browsers can handle this many points without performance issues
  // Only downsample if we have more than 3000 points
  if (range === 'ALL' && points.length > 3000) {
    const targetPoints = 1000; // Downsample to 1000 points max
    const step = Math.floor(points.length / targetPoints);
    const downsampled = [];
    
    // Always include first point
    downsampled.push(points[0]);
    
    // Sample points evenly across the entire range
    for (let i = step; i < points.length - 1; i += step) {
      downsampled.push(points[i]);
    }
    
    // CRITICAL: Always include last point to ensure full date range is visible
    // This ensures we show data through Nov 30, not just Nov 17
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      const lastDate = new Date(lastPoint.t);
      // Remove any existing last point that might be close
      if (downsampled.length > 0) {
        const existingLast = downsampled[downsampled.length - 1];
        const existingLastDate = new Date(existingLast.t);
        // If the existing last point is more than 1 day before the actual last point, replace it
        const daysDiff = (lastDate - existingLastDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1) {
          downsampled.pop(); // Remove the old last point
        }
      }
      // Always add the actual last point
      downsampled.push(lastPoint);
      logger.log(`[Downsampling] Ensured last point included: ${lastDate.toISOString()}`);
    }
    
    points = downsampled;
    logger.log(`Downsampled ALL range from ${data.length} to ${points.length} points`);
    logger.log(`Date range: ${points[0]?.t} to ${points[points.length - 1]?.t}`);
  } else if (range === 'ALL') {
    // For datasets under 3000 points, use ALL points - no downsampling
    logger.log(`ALL range: Using all ${points.length} points (no downsampling)`);
    logger.log(`Date range: ${points[0]?.t} to ${points[points.length - 1]?.t}`);
  }
  
  return {
    range,
    points
  };
}

/**
 * Fetch recent news articles directly from Supabase (excludes tweets)
 * @param {string} category - Optional category filter
 * @param {number} limit - Number of articles to fetch
 */
export async function fetchNews(category = null, limit = 10) {
  let query = supabase
    .from('news')
    .select('*')
    .eq('type', 'article') // Only articles, not tweets
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching news from Supabase:', error);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
  
  // Format response to match expected structure
  return (data || []).map(item => ({
    id: item.id,
    source: item.source,
    url: item.url,
    title: item.title,
    summary: item.summary,
    published_at_iso: item.published_at,
    sentiment: item.sentiment,
    category: item.category,
    type: item.type
  }));
}

/**
 * Fetch recent tweets from Supabase
 * @param {number} limit - Number of tweets to fetch
 */
export async function fetchTweets(limit = 20) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('type', 'tweet')
    .order('published_at', { ascending: false})
    .limit(limit);
  
  if (error) {
    logger.error('Error fetching tweets from Supabase:', error);
    throw new Error(`Failed to fetch tweets: ${error.message}`);
  }
  
  // Format response to match expected structure
  return (data || []).map(item => ({
    id: item.id,
    source: item.source,
    url: item.url,
    title: item.title,
    summary: item.summary,
    published_at_iso: item.published_at,
    sentiment: item.sentiment,
    category: item.category,
    type: item.type
  }));
}

/**
 * Fetch health status from Supabase
 */
export async function fetchHealth() {
  const { count, error } = await supabase
    .from('rates')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    logger.error('Error fetching health from Supabase:', error);
    return {
      ok: false,
      error: error.message
    };
  }
  
  // Get latest rate timestamp
  const { data: latestRate } = await supabase
    .from('rates')
    .select('t')
    .order('t', { ascending: false })
    .limit(1)
    .single();
  
  return {
    ok: true,
    updated_at_iso: latestRate?.t || null,
    history_points: count || 0
  };
}

