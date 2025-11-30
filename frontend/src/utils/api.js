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
  
  // For ALL range, fetch all data using cursor-based pagination to avoid any limits
  let points = [];
  
  if (range === 'ALL') {
    // Fetch all data in batches using cursor-based pagination (more reliable than offset)
    const batchSize = 1000; // Supabase recommended batch size
    let lastTimestamp = startDate.toISOString();
    let hasMore = true;
    let batchCount = 0;
    
    logger.log(`[fetchBlueHistory] Starting cursor-based pagination for ALL range...`);
    
    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('rates')
        .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
        .gte('t', lastTimestamp)
        .order('t', { ascending: true })
        .limit(batchSize);
      
      if (error) {
        logger.error('Error fetching history batch from Supabase:', error);
        throw new Error(`Failed to fetch history: ${error.message}`);
      }
      
      if (!batch || batch.length === 0) {
        hasMore = false;
        break;
      }
      
      // Add batch to points (skip first point if it's the same as lastTimestamp to avoid duplicates)
      const pointsToAdd = batchCount === 0 
        ? batch 
        : batch.slice(1); // Skip first point on subsequent batches (it's the cursor)
      
      points = points.concat(pointsToAdd);
      batchCount++;
      
      logger.log(`[fetchBlueHistory] Batch ${batchCount}: ${batch.length} points (${pointsToAdd.length} new, total: ${points.length})`);
      
      // Check if we got fewer than batchSize - means we're done
      if (batch.length < batchSize) {
        hasMore = false;
      } else {
        // Update cursor to the last timestamp from this batch
        lastTimestamp = batch[batch.length - 1].t;
      }
    }
    
    logger.log(`[fetchBlueHistory] Pagination complete: ${points.length} total points in ${batchCount} batches`);
  } else {
    // For other ranges, use normal query with appropriate limit
    const { data, error } = await supabase
      .from('rates')
      .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
      .gte('t', startDate.toISOString())
      .order('t', { ascending: true });
    
    if (error) {
      logger.error('Error fetching history from Supabase:', error);
      throw new Error(`Failed to fetch history: ${error.message}`);
    }
    
    points = data || [];
  }
  
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
  
  // For ALL range, intelligently downsample to show representative markers
  // Goal: Show overall trend with ~50-100 key points, not every single data point
  if (range === 'ALL' && points.length > 0) {
    const originalPointCount = points.length; // Store original count for logging
    const targetPoints = 80; // Show ~80 representative markers for good trend visibility
    const downsampled = [];
    
    // Always include first point (start of data)
    downsampled.push(points[0]);
    
    if (points.length > 1) {
      // Calculate step size for even sampling
      const step = Math.max(1, Math.floor(points.length / targetPoints));
      
      // Sample points evenly across the range to show trend
      for (let i = step; i < points.length - step; i += step) {
        downsampled.push(points[i]);
      }
      
      // Always include last point (most recent data)
      const lastPoint = points[points.length - 1];
      const lastDate = new Date(lastPoint.t);
      
      // Remove last sampled point if it's too close to the actual last point
      if (downsampled.length > 1) {
        const existingLast = downsampled[downsampled.length - 1];
        const existingLastDate = new Date(existingLast.t);
        const daysDiff = (lastDate - existingLastDate) / (1000 * 60 * 60 * 24);
        
        // If existing last point is less than 0.5 days from actual last, replace it
        if (daysDiff < 0.5) {
          downsampled.pop();
        }
      }
      
      // Always add the actual last point
      downsampled.push(lastPoint);
      
      points = downsampled;
      logger.log(`[Downsampling] ALL range: ${originalPointCount} points → ${points.length} representative markers`);
      logger.log(`[Downsampling] Date range: ${new Date(points[0].t).toLocaleDateString()} to ${new Date(points[points.length - 1].t).toLocaleDateString()}`);
    }
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

