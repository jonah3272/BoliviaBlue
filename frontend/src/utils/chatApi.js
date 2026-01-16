// API Base URL configuration
// Priority: 1. VITE_API_URL env var, 2. Relative URL (same origin), 3. Localhost fallback
let API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  // In production, if frontend and backend are on same domain, use relative URLs
  // Otherwise, detect from window location
  if (typeof window !== 'undefined') {
    // Check if we're in production (not localhost)
    const isProduction = !window.location.hostname.includes('localhost');
    
    if (isProduction) {
      // Use same origin (assumes frontend and backend are on same domain)
      // If they're on different domains, set VITE_API_URL env var
      API_BASE = window.location.origin;
    } else {
      // Development: use localhost
      API_BASE = 'http://localhost:3000';
    }
  } else {
    // SSR fallback
    API_BASE = 'http://localhost:3000';
  }
}

// Log for debugging (only in dev)
if (import.meta.env.DEV) {
  console.log('[Chat API] Using API_BASE:', API_BASE);
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
      throw new Error(`Cannot connect to server. Please check that the backend is running at ${API_BASE}`);
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

  const response = await fetch(`${API_BASE}/api/chat/messages?${params.toString()}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
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
