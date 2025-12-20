/**
 * Get the API base URL
 * In development, uses proxy (relative URL)
 * In production, uses environment variable or defaults to Railway backend
 */
export function getApiUrl() {
  // In development, Vite proxy handles /api routes
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, use environment variable or default to Railway
  const apiUrl = import.meta.env.VITE_API_URL || 'https://boliviablue-production.up.railway.app';
  return apiUrl;
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

