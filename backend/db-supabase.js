import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Check for local mode (read-only, no writes to Supabase)
export const LOCAL_MODE = process.env.LOCAL_MODE === 'true';

// Initialize Supabase client (optional in local mode)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (LOCAL_MODE) {
  console.log('🔧 LOCAL MODE: Running in read-only mode. No data will be written to Supabase.');
  if (supabaseUrl && supabaseKey) {
    // Still create client for reads if credentials are provided
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created for read-only access');
  } else {
    console.log('⚠️  No Supabase credentials provided. API will use cached/mock data only.');
  }
} else {
  // Production mode - Supabase is required
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    console.error('Or set LOCAL_MODE=true to run in local development mode');
    process.exit(1);
  }
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

/**
 * Insert a new rate record
 */
export async function insertRate(t, buy, sell, mid, official_buy, official_sell, official_mid, buy_bob_per_brl = null, sell_bob_per_brl = null, mid_bob_per_brl = null, buy_bob_per_eur = null, sell_bob_per_eur = null, mid_bob_per_eur = null) {
  // Skip writes in local mode
  if (LOCAL_MODE) {
    console.log(`[LOCAL MODE] Skipping rate insert: ${buy}/${sell} BOB at ${t}`);
    return null;
  }

  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('rates')
    .insert({
      t,
      buy,
      sell,
      mid,
      official_buy,
      official_sell,
      official_mid,
      buy_bob_per_brl,
      sell_bob_per_brl,
      mid_bob_per_brl,
      buy_bob_per_eur,
      sell_bob_per_eur,
      mid_bob_per_eur
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
  if (!supabase) {
    return null; // Return null if no Supabase client (local mode without credentials)
  }

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
  if (!supabase) {
    return []; // Return empty array if no Supabase client
  }

  // Use pagination to ensure we get all data (Supabase default limit is 1000 rows)
  // For 30 days of 15-min intervals = ~2880 points, so pagination is needed
  const batchSize = 1000;
  let allData = [];
  let lastTimestamp = null;
  let hasMore = true;
  
  while (hasMore) {
    let query = supabase
      .from('rates')
      .select('t, buy, sell, mid, official_buy, official_sell, official_mid')
      .gte('t', startDate)
      .order('t', { ascending: true })
      .limit(batchSize);
    
    // After first batch, use greater-than to avoid re-fetching the last record
    if (lastTimestamp) {
      query = query.gt('t', lastTimestamp);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get rates in range: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }
    
    // Add all points from this batch
    allData = allData.concat(data);
    
    // Check if we got fewer than batchSize - means we're done
    if (data.length < batchSize) {
      hasMore = false;
    } else {
      // Update cursor to the last timestamp from this batch
      lastTimestamp = data[data.length - 1].t;
    }
  }

  return allData;
}

/**
 * Get all rates
 */
export async function getAllRates() {
  if (!supabase) {
    return []; // Return empty array if no Supabase client
  }

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
  if (!supabase) {
    return { count: 0 }; // Return 0 if no Supabase client
  }

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
 * Uses upsert with conflict resolution on URL to prevent duplicates
 */
export async function insertNews(id, source, url, title, summary, published_at, sentiment, category = 'general', type = 'article', sentiment_strength = null) {
  // Skip writes in local mode
  if (LOCAL_MODE) {
    console.log(`[LOCAL MODE] Skipping news insert: ${title.substring(0, 50)}...`);
    return null;
  }

  if (!supabase) {
    return null; // Return null if no Supabase client
  }

  // First check if URL already exists to avoid unnecessary upsert
  const { data: existing } = await supabase
    .from('news')
    .select('id')
    .eq('url', url)
    .maybeSingle();

  // If URL already exists, skip insertion (prevent duplicate)
  if (existing) {
    return null; // Return null to indicate duplicate was skipped
  }

  // Build insert object, only include sentiment_strength if provided
  const insertData = {
    id,
    source,
    url,
    title,
    summary,
    published_at,
    sentiment,
    category,
    type
  };
  
  // Only add sentiment_strength if it's provided (not null/undefined)
  if (sentiment_strength !== null && sentiment_strength !== undefined) {
    insertData.sentiment_strength = sentiment_strength;
  }

  // Insert new article
  const { data, error } = await supabase
    .from('news')
    .insert(insertData)
    .select()
    .single();

  // Handle errors (including race conditions where URL was inserted between check and insert)
  if (error) {
    // Ignore duplicate key errors (23505 = unique constraint violation)
    // This can happen in race conditions where multiple processes try to insert the same URL
    if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
      return null; // Duplicate detected, skip silently
    }
    throw new Error(`Failed to insert news: ${error.message}`);
  }

  return data;
}

/**
 * Get recent news items
 */
export async function getRecentNews(limit = 100) {
  if (!supabase) {
    return []; // Return empty array if no Supabase client
  }

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

/**
 * Create a new rate alert
 */
export async function createAlert(email, alertType, threshold, direction) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Unsubscribe token will be generated by the database default value (gen_random_uuid()::text)
  // We don't need to provide it in the insert

  const { data, error } = await supabase
    .from('rate_alerts')
    .insert({
      email,
      alert_type: alertType,
      threshold,
      direction,
      is_active: true
      // unsubscribe_token is auto-generated by database default
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return data;
}

/**
 * Get active alerts that should be checked
 */
export async function getActiveAlerts() {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('rate_alerts')
      .select('*')
      .eq('is_active', true)
      .is('triggered_at', null); // Only get alerts that haven't been triggered yet

    if (error) {
      // If table doesn't exist, return empty array instead of throwing
      if (error.message && error.message.includes('could not find the table')) {
        console.warn('⚠️  rate_alerts table does not exist. Run backend/supabase-rate-alerts.sql in Supabase SQL Editor to create it.');
        return [];
      }
      throw new Error(`Failed to get active alerts: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    // Gracefully handle any errors (e.g., table doesn't exist)
    console.error('Error fetching active alerts:', error.message);
    return [];
  }
}

/**
 * Mark an alert as triggered
 */
export async function markAlertTriggered(alertId) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('rate_alerts')
    .update({ triggered_at: new Date().toISOString() })
    .eq('id', alertId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark alert as triggered: ${error.message}`);
  }

  return data;
}

/**
 * Deactivate an alert (unsubscribe)
 */
export async function deactivateAlert(unsubscribeToken) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('rate_alerts')
    .update({ is_active: false })
    .eq('unsubscribe_token', unsubscribeToken)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate alert: ${error.message}`);
  }

  return data;
}

/**
 * Newsletter Subscription Functions
 */

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email, language = 'es', source = 'homepage') {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert({
      email: email.toLowerCase().trim(),
      language,
      source,
      verification_token: verificationToken,
      is_active: true,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null
    }, {
      onConflict: 'email',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to subscribe: ${error.message}`);
  }

  return { ...data, verification_token: verificationToken };
}

/**
 * Get active newsletter subscribers
 */
export async function getActiveNewsletterSubscribers(language = null) {
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .is('unsubscribed_at', null);

  if (language) {
    query = query.eq('language', language);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return [];
  }

  return data || [];
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString()
    })
    .eq('email', email.toLowerCase().trim())
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unsubscribe: ${error.message}`);
  }

  return data;
}

/**
 * Update last email sent timestamp
 */
export async function updateNewsletterLastSent(email) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      last_email_sent_at: new Date().toISOString()
    })
    .eq('email', email.toLowerCase().trim())
    .select()
    .single();

  if (error) {
    console.error('Error updating last sent timestamp:', error);
    return null;
  }

  return data;
}

/**
 * Monthly Report Functions
 */

/**
 * Get or create monthly report
 */
export async function getMonthlyReport(month, year, language = 'es') {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .eq('language', language)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to get monthly report: ${error.message}`);
  }

  return data;
}

/**
 * Save monthly report
 */
export async function saveMonthlyReport(reportData) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('monthly_reports')
    .upsert(reportData, {
      onConflict: 'month,year,language'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save monthly report: ${error.message}`);
  }

  return data;
}

/**
 * Get all monthly reports
 */
export async function getAllMonthlyReports(language = 'es', limit = 12) {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('language', language)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching monthly reports:', error);
    return [];
  }

  return data || [];
}

export default supabase;

