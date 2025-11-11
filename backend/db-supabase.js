import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Insert a new rate record
 */
export async function insertRate(t, buy, sell, mid, official_buy, official_sell, official_mid) {
  const { data, error } = await supabase
    .from('rates')
    .insert({
      t,
      buy,
      sell,
      mid,
      official_buy,
      official_sell,
      official_mid
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert rate: ${error.message}`);
  }

  return data;
}

/**
 * Get the most recent rate
 */
export async function getLatestRate() {
  const { data, error } = await supabase
    .from('rates')
    .select('*')
    .order('t', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to get latest rate: ${error.message}`);
  }

  return data;
}

/**
 * Get rates within a time range
 */
export async function getRatesInRange(startDate) {
  const { data, error } = await supabase
    .from('rates')
    .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
    .gte('t', startDate)
    .order('t', { ascending: true });

  if (error) {
    throw new Error(`Failed to get rates in range: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all rates
 */
export async function getAllRates() {
  const { data, error } = await supabase
    .from('rates')
    .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
    .order('t', { ascending: true });

  if (error) {
    throw new Error(`Failed to get all rates: ${error.message}`);
  }

  return data || [];
}

/**
 * Get total count of rates
 */
export async function getTotalRatesCount() {
  const { count, error } = await supabase
    .from('rates')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to get rates count: ${error.message}`);
  }

  return { count: count || 0 };
}

/**
 * Insert a news item
 */
export async function insertNews(id, source, url, title, summary, published_at, sentiment) {
  const { data, error } = await supabase
    .from('news')
    .insert({
      id,
      source,
      url,
      title,
      summary,
      published_at,
      sentiment
    })
    .select()
    .single();

  // Ignore duplicate key errors (PGRST23P01 = unique constraint violation)
  if (error && error.code !== '23505') {
    throw new Error(`Failed to insert news: ${error.message}`);
  }

  return data;
}

/**
 * Get recent news items
 */
export async function getRecentNews(limit = 100) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get news: ${error.message}`);
  }

  return data || [];
}

export default supabase;

