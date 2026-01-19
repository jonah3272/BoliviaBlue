/**
 * Get the API base URL
 * Priority: 1. VITE_API_URL env var, 2. Relative URL (Vercel proxy), 3. Fallback
 * Same pattern as chatApi.js to support Railway custom domain
 */
export function getApiUrl() {
  // Priority 1: Use VITE_API_URL if set (Railway custom domain)
  let API_BASE = import.meta.env.VITE_API_URL;

  if (!API_BASE) {
    // Priority 2: Use relative URLs (Vercel proxy)
    // This works for GET requests but may fail for POST (Vercel limitation)
    API_BASE = '';
    
    if (typeof window !== 'undefined') {
      const isProduction = !window.location.hostname.includes('localhost');
      
      if (isProduction) {
        // Production: Try relative URLs first (Vercel proxy)
        // If this fails, set VITE_API_URL to Railway custom domain
        API_BASE = '';
      } else {
        // Development: Use relative URLs (Vite proxy handles it)
        API_BASE = '';
      }
    }
  }

  // Log for debugging
  console.log('[API URL] Using API_BASE:', API_BASE || '(relative - Vercel proxy)');
  
  return API_BASE;
}

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint (e.g., '/api/alerts')
 * @returns {string} Full URL
 */
export function getApiEndpoint(endpoint) {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if baseUrl already ends with one
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

