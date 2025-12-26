/**
 * Get the API base URL
 * In development, uses proxy (relative URL)
 * In production, uses Vercel proxy (relative URL) to avoid CORS issues
 */
export function getApiUrl() {
  // In development, Vite proxy handles /api routes
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, use relative URL - Vercel will proxy /api/* to Railway
  // This avoids CORS entirely since requests are same-origin
  return '';
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

