// API Base URL configuration
// NO CORS NEEDED: Uses Vercel proxy (vercel.json rewrites /api/* to Railway)
// This makes all requests same-origin, eliminating CORS issues entirely

let API_BASE = '';

// In production (Vercel): Use relative URLs - Vercel proxy handles /api/* routes
// In development: Vite proxy handles /api/* routes (see vite.config.js)
// This means ALL requests are same-origin = NO CORS needed!

if (typeof window !== 'undefined') {
  const isProduction = !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // Production: Use relative URLs (empty string = same origin)
    // Vercel's vercel.json rewrite will proxy /api/* to Railway
    API_BASE = '';
  } else {
    // Development: Use relative URLs (Vite proxy handles it)
    // See vite.config.js for proxy configuration
    API_BASE = '';
  }
} else {
  // SSR fallback - use relative URL
  API_BASE = '';
}

// Log for debugging
if (import.meta.env.DEV) {
  console.log('[Chat API] Using relative URLs (no CORS needed) - API_BASE:', API_BASE || '(same origin)');
}

/**
 * Initialize anonymous session
 */
export async function initializeSession() {
  try {
    const response = await fetch(`${API_BASE}/api/chat/session`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to initialize session';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const apiUrl = API_BASE || window.location.origin;
      throw new Error(`Application failed to respond. Please check your connection and try again.`);
    }
    throw error;
  }
}

/**
 * Get session token from cookie (client-side helper)
 */
export function getSessionToken() {
  // Cookie is HTTP-only, so we can't read it directly
  // The backend will read it from the cookie
  // For API calls, we rely on credentials: 'include'
  return null; // Token is in HTTP-only cookie
}

/**
 * Create a new message
 */
export async function createMessage(content, category, locationHint, parentId = null) {
  try {
    const response = await fetch(`${API_BASE}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        content: content.trim(),
        category: category || 'general',
        location_hint: locationHint || null,
        parent_id: parentId || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create message');
    }

    const result = await response.json();
    // Return the message object directly
    return { message: result.message || result };
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Application failed to respond. Please check your connection and try again.');
    }
    throw error;
  }
}

/**
 * Get messages with filters
 */
export async function getMessages(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.location_hint) params.append('location_hint', filters.location_hint);
  if (filters.min_rate) params.append('min_rate', filters.min_rate);
  if (filters.max_rate) params.append('max_rate', filters.max_rate);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.before) params.append('before', filters.before);
  if (filters.after) params.append('after', filters.after);
  if (filters.search) params.append('search', filters.search);

  try {
    const response = await fetch(`${API_BASE}/api/chat/messages?${params.toString()}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Application failed to respond. Please check your connection and try again.');
    }
    throw error;
  }
}

/**
 * Get latest messages (for real-time updates)
 */
export async function getLatestMessages(after, limit = 20) {
  const params = new URLSearchParams();
  if (after) params.append('after', after);
  params.append('limit', limit);

  const response = await fetch(`${API_BASE}/api/chat/messages/latest?${params.toString()}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch latest messages');
  }

  return response.json();
}

/**
 * Like/unlike a message
 */
export async function toggleLike(messageId, action = 'like') {
  const response = await fetch(`${API_BASE}/api/chat/messages/${messageId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ action })
  });

  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }

  return response.json();
}

/**
 * Flag a message
 */
export async function flagMessage(messageId, reason = 'other') {
  const response = await fetch(`${API_BASE}/api/chat/messages/${messageId}/flag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ reason })
  });

  if (!response.ok) {
    throw new Error('Failed to flag message');
  }

  return response.json();
}

/**
 * Get chat statistics
 */
export async function getChatStats() {
  const response = await fetch(`${API_BASE}/api/chat/stats`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
