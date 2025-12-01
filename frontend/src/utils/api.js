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
  
  const { data, error } = await supabase
    .from('rates')
    .select(selectFields)
    .gte('t', startDate.toISOString())
    .order('t', { ascending: true });
  
  if (error) {
    logger.error('Error fetching history from Supabase:', error);
    throw new Error(`Failed to fetch history: ${error.message}`);
  }
  
  let points = (data || []).map(point => {
    // Map currency-specific fields to generic buy/sell/mid for chart compatibility
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
  
  // Downsample for ALL range if we have too many points (>200)
  // This improves chart performance while maintaining data accuracy
  if (range === 'ALL' && points.length > 200) {
    const step = Math.ceil(points.length / 200);
    points = points.filter((_, index) => index % step === 0);
    logger.log(`Downsampled ALL range from ${data.length} to ${points.length} points`);
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

