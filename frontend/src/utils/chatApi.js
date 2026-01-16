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
  const url = `${API_BASE}/api/chat/messages`;
  const requestBody = {
    content: content.trim(),
    category: category || 'general',
    location_hint: locationHint || null,
    parent_id: parentId || null
  };

  // Log request for debugging (always log to help debug 502 errors)
  console.log('[Chat API] Creating message:', { 
    url, 
    body: requestBody,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    // Log response for debugging (always log)
    console.log('[Chat API] Response received:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create message';
      const status = response.status;
      
      // Log detailed error info
      console.error('[Chat API] Error response:', {
        status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
        console.error('[Chat API] Error JSON:', error);
      } catch (e) {
        // If response isn't JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error('[Chat API] Error text:', errorText);
        } catch (textError) {
          // Can't read response at all
          if (status === 502) {
            errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
          } else if (status === 504) {
            errorMessage = 'Request timed out. Please try again.';
          } else {
            errorMessage = `Server error (${status}). Please try again.`;
          }
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // Return the message object directly
    return { message: result.message || result };
  } catch (error) {
    console.error('[Chat API] Request failed:', {
      url,
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    // More specific error messages based on error type
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      // Check if it's a 502 specifically
      if (error.message.includes('502') || url.includes('boliviablue.com')) {
        throw new Error('Server is temporarily unavailable (502). The backend may be restarting. Please try again in a moment.');
      }
      throw new Error('Cannot connect to server. Please check your internet connection and try again.');
    }
    
    // If error already has a message, use it
    if (error.message && !error.message.includes('Failed to fetch')) {
      throw error;
    }
    
    throw new Error('Application failed to respond. Please try again.');
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
