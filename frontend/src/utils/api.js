import { supabase } from './supabase';

/**
 * Fetch current blue market rate directly from Supabase
 */
export async function fetchBlueRate() {
  // Get the latest rate
  const { data, error } = await supabase
    .from('rates')
    .select('*')
    .order('t', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching rate from Supabase:', error);
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
    .single();
  
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
  
  const { data, error } = await supabase
    .from('rates')
    .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
    .gte('t', startDate.toISOString())
    .order('t', { ascending: true });
  
  if (error) {
    console.error('Error fetching history from Supabase:', error);
    throw new Error(`Failed to fetch history: ${error.message}`);
  }
  
  return {
    range,
    points: data || []
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
    console.error('Error fetching news from Supabase:', error);
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
    console.error('Error fetching tweets from Supabase:', error);
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
    console.error('Error fetching health from Supabase:', error);
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

