import { supabase } from './db-supabase.js';
import crypto from 'crypto';

/**
 * Hash session token for secure storage
 */
function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Extract rate from message content
 */
export function extractRate(content) {
  // Match patterns like "10.50", "10,50", "10.5 BOB/USD", etc.
  const ratePattern = /(\d+[.,]\d+)\s*(?:BOB\/USD|bob\/usd|por\s+usd)?/i;
  const match = content.match(ratePattern);
  if (match) {
    const rate = parseFloat(match[1].replace(',', '.'));
    // Validate rate is reasonable (5-20 BOB/USD)
    if (rate >= 5 && rate <= 20) {
      return rate;
    }
  }
  return null;
}

/**
 * Generate anonymous username
 */
export function generateAnonymousUsername() {
  const adjectives = ['Usuario', 'Anonimo', 'Visitante', 'Miembro'];
  const randomNum = Math.floor(Math.random() * 10000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${randomNum}`;
}

/**
 * Initialize or get session
 */
export async function initializeSession(sessionToken) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const sessionTokenHash = hashSessionToken(sessionToken);
  const username = generateAnonymousUsername();

  // Check if session exists
  const { data: existingSession } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .eq('session_token_hash', sessionTokenHash)
    .single();

  if (existingSession) {
    // Update last activity
    await supabase
      .from('anonymous_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token_hash', sessionTokenHash);

    return {
      session_token_hash: sessionTokenHash,
      anonymous_username: username, // Return new username each time for anonymity
      expires_at: existingSession.expires_at
    };
  }

  // Create new session
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const { data, error } = await supabase
    .from('anonymous_sessions')
    .insert({
      session_token_hash: sessionTokenHash,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      message_count: 0,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return {
    session_token_hash: sessionTokenHash,
    anonymous_username: username,
    expires_at: data.expires_at
  };
}

/**
 * Create a new message
 */
export async function createMessage(content, category, locationHint, sessionToken, parentId = null) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const sessionTokenHash = hashSessionToken(sessionToken);
  const username = generateAnonymousUsername();
  const rateMentioned = extractRate(content);

  // Check rate limits
  const { data: session } = await supabase
    .from('anonymous_sessions')
    .select('message_count, expires_at')
    .eq('session_token_hash', sessionTokenHash)
    .single();

  if (session) {
    // Check hourly limit (10 messages/hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count: recentCount } = await supabase
      .from('anonymous_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_token_hash', sessionTokenHash)
      .gte('created_at', oneHourAgo.toISOString());

    if (recentCount >= 10) {
      throw new Error('Rate limit exceeded: 10 messages per hour');
    }

    // Check daily limit (50 messages/day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count: dailyCount } = await supabase
      .from('anonymous_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_token_hash', sessionTokenHash)
      .gte('created_at', oneDayAgo.toISOString());

    if (dailyCount >= 50) {
      throw new Error('Rate limit exceeded: 50 messages per day');
    }
  }

  // Insert message
  const { data, error } = await supabase
    .from('anonymous_messages')
    .insert({
      content: content.trim(),
      anonymous_username: username,
      session_token_hash: sessionTokenHash,
      category: category || 'general',
      location_hint: locationHint || null,
      rate_mentioned: rateMentioned,
      parent_id: parentId || null,
      is_approved: true,
      is_deleted: false,
      likes: 0
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create message: ${error.message}`);
  }

  // Update session message count
  if (session) {
    await supabase
      .from('anonymous_sessions')
      .update({ 
        message_count: session.message_count + 1,
        last_activity: new Date().toISOString()
      })
      .eq('session_token_hash', sessionTokenHash);
  }

  return data;
}

/**
 * Get messages with filters
 */
export async function getMessages(filters = {}) {
  if (!supabase) {
    return { messages: [], total: 0, has_more: false };
  }

  const {
    category,
    location_hint,
    min_rate,
    max_rate,
    sort = 'newest',
    time_period,
    limit = 50,
    before,
    after,
    search
  } = filters;

  let query = supabase
    .from('anonymous_messages')
    .select('*', { count: 'exact' })
    .eq('is_approved', true)
    .eq('is_deleted', false)
    .is('parent_id', null); // Only top-level messages (replies fetched separately)

  // Apply time period filter (Reddit-style)
  if (time_period) {
    const now = new Date();
    let timeThreshold;
    
    switch (time_period) {
      case 'hour':
        timeThreshold = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
        break;
      case 'today':
        timeThreshold = new Date(now.setHours(0, 0, 0, 0)); // Today
        break;
      case 'week':
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'month':
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'year':
        timeThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // Last year
        break;
      case 'all':
      default:
        timeThreshold = null; // All time
    }
    
    if (timeThreshold) {
      query = query.gte('created_at', timeThreshold.toISOString());
    }
  }

  // Apply filters
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (location_hint && location_hint !== 'all') {
    query = query.eq('location_hint', location_hint);
  }

  if (min_rate !== undefined) {
    query = query.gte('rate_mentioned', min_rate);
  }

  if (max_rate !== undefined) {
    query = query.lte('rate_mentioned', max_rate);
  }

  if (before) {
    query = query.lt('created_at', before);
  }

  if (after) {
    query = query.gt('created_at', after);
  }

  // Full-text search
  if (search) {
    query = query.textSearch('content', search, {
      type: 'websearch',
      config: 'spanish'
    });
  }

  // Sort - Support Reddit-style sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sort === 'top' || sort === 'top_all') {
    // Sort by likes (descending), then by created_at (descending) as tiebreaker
    query = query.order('likes', { ascending: false });
    // Note: Supabase doesn't support multiple orderBy easily, so we'll sort in memory if needed
  } else if (sort === 'top_today') {
    // Top posts from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString())
               .order('likes', { ascending: false });
  } else if (sort === 'top_week') {
    // Top posts from this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query = query.gte('created_at', weekAgo.toISOString())
               .order('likes', { ascending: false });
  } else if (sort === 'top_month') {
    // Top posts from this month
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    query = query.gte('created_at', monthAgo.toISOString())
               .order('likes', { ascending: false });
  } else {
    // Default to newest
    query = query.order('created_at', { ascending: false });
  }

  // Limit
  query = query.limit(Math.min(limit, 200));

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  // For 'top' sorts, we need to sort by likes then by date (Supabase limitation)
  let sortedData = data || [];
  if (sort === 'top' || sort === 'top_all') {
    sortedData = sortedData.sort((a, b) => {
      // Sort by likes (descending), then by created_at (descending) as tiebreaker
      if (b.likes !== a.likes) {
        return (b.likes || 0) - (a.likes || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  // Fetch replies and reply counts for each message
  const messagesWithReplies = await Promise.all((sortedData || []).map(async (message) => {
    // Get replies
    const { data: replies } = await supabase
      .from('anonymous_messages')
      .select('*')
      .eq('parent_id', message.id)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    
    // Get reply count
    const { count: replyCount } = await supabase
      .from('anonymous_messages')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', message.id)
      .eq('is_approved', true)
      .eq('is_deleted', false);
    
    return {
      ...message,
      replies: replies || [],
      reply_count: replyCount || 0
    };
  }));

  return {
    messages: messagesWithReplies,
    total: count || 0,
    has_more: (sortedData || []).length === limit
  };
}

/**
 * Get latest messages (for real-time updates)
 */
export async function getLatestMessages(after, limit = 20) {
  if (!supabase) {
    return { messages: [], count: 0 };
  }

  let query = supabase
    .from('anonymous_messages')
    .select('*')
    .eq('is_approved', true)
    .eq('is_deleted', false)
    .is('parent_id', null) // Only top-level messages
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 50));

  if (after) {
    query = query.gt('created_at', after);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get latest messages: ${error.message}`);
  }

  return {
    messages: data || [],
    count: (data || []).length,
    latest_timestamp: data && data.length > 0 ? data[0].created_at : after
  };
}

/**
 * Like/unlike a message
 */
export async function toggleLike(messageId, sessionToken, action) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const sessionTokenHash = hashSessionToken(sessionToken);

  if (action === 'like') {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('anonymous_likes')
      .select('*')
      .eq('message_id', messageId)
      .eq('session_token_hash', sessionTokenHash)
      .single();

    if (existingLike) {
      return { likes: 0, has_user_liked: true }; // Already liked
    }

    // Add like
    const { error: likeError } = await supabase
      .from('anonymous_likes')
      .insert({
        message_id: messageId,
        session_token_hash: sessionTokenHash
      });

    if (likeError) {
      throw new Error(`Failed to like message: ${likeError.message}`);
    }

    // Update message like count
    const { data: message } = await supabase
      .from('anonymous_messages')
      .select('likes')
      .eq('id', messageId)
      .single();

    const newLikes = (message?.likes || 0) + 1;

    const { error: updateError } = await supabase
      .from('anonymous_messages')
      .update({ likes: newLikes })
      .eq('id', messageId);

    if (updateError) {
      throw new Error(`Failed to update like count: ${updateError.message}`);
    }

    return { likes: newLikes, has_user_liked: true };
  } else {
    // Unlike
    const { error: unlikeError } = await supabase
      .from('anonymous_likes')
      .delete()
      .eq('message_id', messageId)
      .eq('session_token_hash', sessionTokenHash);

    if (unlikeError) {
      throw new Error(`Failed to unlike message: ${unlikeError.message}`);
    }

    // Update message like count
    const { data: message } = await supabase
      .from('anonymous_messages')
      .select('likes')
      .eq('id', messageId)
      .single();

    const newLikes = Math.max(0, (message?.likes || 0) - 1);

    const { error: updateError } = await supabase
      .from('anonymous_messages')
      .update({ likes: newLikes })
      .eq('id', messageId);

    if (updateError) {
      throw new Error(`Failed to update like count: ${updateError.message}`);
    }

    return { likes: newLikes, has_user_liked: false };
  }
}

/**
 * Check if user has liked a message
 */
export async function hasUserLiked(messageId, sessionToken) {
  if (!supabase || !sessionToken) {
    return false;
  }

  const sessionTokenHash = hashSessionToken(sessionToken);

  const { data } = await supabase
    .from('anonymous_likes')
    .select('*')
    .eq('message_id', messageId)
    .eq('session_token_hash', sessionTokenHash)
    .single();

  return !!data;
}

/**
 * Flag a message for moderation
 */
export async function flagMessage(messageId, sessionToken, reason) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const sessionTokenHash = hashSessionToken(sessionToken);

  // Check flag rate limit (5 flags per day)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count: flagCount } = await supabase
    .from('moderation_queue')
    .select('*', { count: 'exact', head: true })
    .eq('flagged_by_session_hash', sessionTokenHash)
    .gte('created_at', oneDayAgo.toISOString());

  if (flagCount >= 5) {
    throw new Error('Rate limit exceeded: 5 flags per day');
  }

  // Check if already flagged by this session
  const { data: existingFlag } = await supabase
    .from('moderation_queue')
    .select('*')
    .eq('message_id', messageId)
    .eq('flagged_by_session_hash', sessionTokenHash)
    .eq('status', 'pending')
    .single();

  if (existingFlag) {
    return { success: true, message: 'Message already flagged' };
  }

  // Create flag
  const { error } = await supabase
    .from('moderation_queue')
    .insert({
      message_id: messageId,
      flagged_by_session_hash: sessionTokenHash,
      reason: reason || 'other',
      status: 'pending'
    });

  if (error) {
    throw new Error(`Failed to flag message: ${error.message}`);
  }

  // Check if message should be auto-hidden (3+ flags)
  const { count: totalFlags } = await supabase
    .from('moderation_queue')
    .select('*', { count: 'exact', head: true })
    .eq('message_id', messageId)
    .eq('status', 'pending');

  if (totalFlags >= 3) {
    // Auto-hide message
    await supabase
      .from('anonymous_messages')
      .update({ is_approved: false })
      .eq('id', messageId);
  }

  return { success: true, message: 'Content flagged for review' };
}

/**
 * Get chat statistics
 */
export async function getChatStats() {
  if (!supabase) {
    return {
      total_messages: 0,
      categories: {},
      locations: {},
      rate_range: { min: 0, max: 0, average: 0 }
    };
  }

  // Total messages
  const { count: total } = await supabase
    .from('anonymous_messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
    .eq('is_deleted', false);

  // Category counts
  const { data: categoryData } = await supabase
    .from('anonymous_messages')
    .select('category')
    .eq('is_approved', true)
    .eq('is_deleted', false);

  const categories = {};
  categoryData?.forEach(msg => {
    categories[msg.category] = (categories[msg.category] || 0) + 1;
  });

  // Location counts
  const { data: locationData } = await supabase
    .from('anonymous_messages')
    .select('location_hint')
    .eq('is_approved', true)
    .eq('is_deleted', false)
    .not('location_hint', 'is', null);

  const locations = {};
  locationData?.forEach(msg => {
    const loc = msg.location_hint || 'Other';
    locations[loc] = (locations[loc] || 0) + 1;
  });

  // Rate range
  const { data: rateData } = await supabase
    .from('anonymous_messages')
    .select('rate_mentioned')
    .eq('is_approved', true)
    .eq('is_deleted', false)
    .not('rate_mentioned', 'is', null);

  const rates = rateData?.map(r => r.rate_mentioned).filter(r => r !== null) || [];
  const rateRange = rates.length > 0 ? {
    min: Math.min(...rates),
    max: Math.max(...rates),
    average: rates.reduce((a, b) => a + b, 0) / rates.length
  } : { min: 0, max: 0, average: 0 };

  return {
    total_messages: total || 0,
    categories,
    locations,
    rate_range: rateRange
  };
}
