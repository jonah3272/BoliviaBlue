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
 * @param {string} currency - Currency code: 'USD', 'BRL', or 'EUR' (default: 'USD')
 */
export async function fetchBlueRate(currency = 'USD') {
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
    
    // Determine which rate fields to use based on currency
    let buyRate, sellRate, midRate, buyField, sellField, midField;
    
    if (currency === 'USD') {
      buyRate = data.buy;
      sellRate = data.sell;
      midRate = data.mid;
      buyField = 'buy';
      sellField = 'sell';
      midField = 'mid';
    } else if (currency === 'BRL') {
      buyRate = data.buy_bob_per_brl;
      sellRate = data.sell_bob_per_brl;
      midRate = data.mid_bob_per_brl;
      buyField = 'buy_bob_per_brl';
      sellField = 'sell_bob_per_brl';
      midField = 'mid_bob_per_brl';
    } else if (currency === 'EUR') {
      buyRate = data.buy_bob_per_eur;
      sellRate = data.sell_bob_per_eur;
      midRate = data.mid_bob_per_eur;
      buyField = 'buy_bob_per_eur';
      sellField = 'sell_bob_per_eur';
      midField = 'mid_bob_per_eur';
    } else {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    
    // Check if rates are available for this currency
    if (buyRate === null || sellRate === null) {
      throw new Error(`Rate data not available for ${currency}. The backend may not have fetched this currency yet.`);
    }
    
    // Get yesterday's rate for daily change calculation
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: yesterdayData } = await supabase
      .from('rates')
      .select(`${buyField}, ${sellField}`)
      .lte('t', oneDayAgo)
      .order('t', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    let buyChange = null;
    let sellChange = null;
    
    if (yesterdayData && yesterdayData[buyField] && yesterdayData[sellField]) {
      const yesterdayBuy = yesterdayData[buyField];
      const yesterdaySell = yesterdayData[sellField];
      buyChange = ((buyRate - yesterdayBuy) / yesterdayBuy * 100).toFixed(2);
      sellChange = ((sellRate - yesterdaySell) / yesterdaySell * 100).toFixed(2);
    }
    
    // Format response to match expected structure (always use buy_bob_per_* naming for consistency)
    const response = {
      source: 'binance-p2p',
      updated_at_iso: data.t,
      buy_change_24h: buyChange,
      sell_change_24h: sellChange,
      sample_buy: [],
      sample_sell: [],
      currency: currency
    };
    
    // Add currency-specific fields
    if (currency === 'USD') {
      response.buy_bob_per_usd = buyRate;
      response.sell_bob_per_usd = sellRate;
      response.mid_bob_per_usd = midRate;
      response.official_buy = data.official_buy;
      response.official_sell = data.official_sell;
      response.official_mid = data.official_mid;
    } else if (currency === 'BRL') {
      response.buy_bob_per_brl = buyRate;
      response.sell_bob_per_brl = sellRate;
      response.mid_bob_per_brl = midRate;
    } else if (currency === 'EUR') {
      response.buy_bob_per_eur = buyRate;
      response.sell_bob_per_eur = sellRate;
      response.mid_bob_per_eur = midRate;
    }
    
    // Add generic fields for component compatibility
    response.buy = buyRate;
    response.sell = sellRate;
    response.mid = midRate;
    
    return response;
  });
}

/**
 * Fetch historical blue market rates directly from Supabase
 * @param {string} range - Time range: 1D, 1W, 1M, 1Y, ALL
 * @param {string} currency - Currency code: 'USD', 'BRL', or 'EUR' (default: 'USD')
 */
export async function fetchBlueHistory(range = '1W', currency = 'USD') {
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
  
  // Determine which fields to select based on currency
  let selectFields = 't, buy, sell, mid, official_buy, official_sell, official_mid';
  if (currency === 'BRL') {
    selectFields = 't, buy_bob_per_brl, sell_bob_per_brl, mid_bob_per_brl';
  } else if (currency === 'EUR') {
    selectFields = 't, buy_bob_per_eur, sell_bob_per_eur, mid_bob_per_eur';
  }
  
  let points = [];
  
  if (range === 'ALL') {
    // Fetch all data in batches using cursor-based pagination (more reliable than offset)
    const batchSize = 1000; // Supabase recommended batch size
    let lastTimestamp = null; // Start with null to get all records
    let hasMore = true;
    let batchCount = 0;
    
    logger.log(`[fetchBlueHistory] Starting cursor-based pagination for ALL range (currency: ${currency})...`);
    
    while (hasMore) {
      let query = supabase
        .from('rates')
        .select(selectFields)
        .order('t', { ascending: true })
        .limit(batchSize);
      
      // After first batch, use greater-than to avoid re-fetching the last record
      if (lastTimestamp) {
        query = query.gt('t', lastTimestamp);
      }
      
      const { data: batch, error } = await query;
      
      if (error) {
        logger.error('Error fetching history batch from Supabase:', error);
        throw new Error(`Failed to fetch history: ${error.message}`);
      }
      
      if (!batch || batch.length === 0) {
        hasMore = false;
        break;
      }
      
      // Add all points from this batch (no need to skip since we use .gt())
      points = points.concat(batch);
      batchCount++;
      
      const firstDate = new Date(batch[0].t);
      const lastDate = new Date(batch[batch.length - 1].t);
      logger.log(`[fetchBlueHistory] Batch ${batchCount}: ${batch.length} points (${firstDate.toISOString()} to ${lastDate.toISOString()}, total: ${points.length})`);
      
      // Check if we got fewer than batchSize - means we're done
      if (batch.length < batchSize) {
        hasMore = false;
        logger.log(`[fetchBlueHistory] Last batch (${batch.length} < ${batchSize}), pagination complete`);
      } else {
        // Update cursor to the last timestamp from this batch (use .gt() next time)
        lastTimestamp = batch[batch.length - 1].t;
        logger.log(`[fetchBlueHistory] Continuing pagination from timestamp: ${lastTimestamp}`);
      }
    }
    
    logger.log(`[fetchBlueHistory] Pagination complete: ${points.length} total points in ${batchCount} batches`);
    
    // Log what we actually got and verify we have recent data
    if (points.length > 0) {
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
  } else {
    // For other ranges, use normal query with appropriate limit
    const { data, error } = await supabase
      .from('rates')
      .select(selectFields)
      .gte('t', startDate.toISOString())
      .order('t', { ascending: true });
    
    if (error) {
      logger.error('Error fetching history from Supabase:', error);
      throw new Error(`Failed to fetch history: ${error.message}`);
    }
    
    points = data || [];
  }
  
  // Map currency-specific fields to generic buy/sell/mid for chart compatibility
  points = points.map(point => {
    if (currency === 'USD') {
      return {
        t: point.t,
        buy: point.buy,
        sell: point.sell,
        mid: point.mid,
        official_buy: point.official_buy,
        official_sell: point.official_sell,
        official_mid: point.official_mid
      };
    } else if (currency === 'BRL') {
      return {
        t: point.t,
        buy: point.buy_bob_per_brl,
        sell: point.sell_bob_per_brl,
        mid: point.mid_bob_per_brl
      };
    } else if (currency === 'EUR') {
      return {
        t: point.t,
        buy: point.buy_bob_per_eur,
        sell: point.sell_bob_per_eur,
        mid: point.mid_bob_per_eur
      };
    }
    return point;
  }).filter(point => point.buy !== null && point.sell !== null); // Filter out null rates
  
  // For ALL range, intelligently downsample to show representative markers
  // Goal: Show more data points for better granularity while maintaining performance
  if (range === 'ALL' && points.length > 0) {
    const originalPointCount = points.length; // Store original count for logging
    const targetPoints = 300; // Show ~300 points for better detail (was ~20)
    const downsampled = [];
    
    // If we have fewer points than target, use all points
    if (points.length <= targetPoints) {
      points = points; // No downsampling needed
      logger.log(`[Downsampling] ALL range: ${originalPointCount} points (no downsampling needed)`);
    } else {
      // Calculate step size for even sampling across the entire range
      const step = Math.max(1, Math.floor(points.length / targetPoints));
      
      // Always include first point
      downsampled.push(points[0]);
      
      // Sample points evenly across the range
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
        const hoursDiff = (lastDate - existingLastDate) / (1000 * 60 * 60);
        
        // If existing last point is less than 2 hours from actual last, replace it
        if (hoursDiff < 2) {
          downsampled.pop();
        }
      }
      
      // Always add the actual last point
      downsampled.push(lastPoint);
      
      points = downsampled;
      logger.log(`[Downsampling] ALL range: ${originalPointCount} points → ${points.length} markers`);
      logger.log(`[Downsampling] Date range: ${new Date(points[0].t).toLocaleDateString()} to ${new Date(points[points.length - 1].t).toLocaleDateString()}`);
    }
  }
  
  return {
    range,
    currency,
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

