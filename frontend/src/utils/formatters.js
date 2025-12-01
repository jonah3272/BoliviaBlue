/**
 * Format a number to appropriate decimal places based on currency
 * @param {number} value - The rate value to format
 * @param {string} currency - Currency code (USD, BRL, EUR)
 * @returns {string} Formatted rate string
 */
export function formatRate(value, currency = 'USD') {
  if (value === null || value === undefined) return currency === 'BRL' ? '0.000' : '0.00';
  const num = Number(value);
  // BRL rates are smaller, so show 3 decimal places (thousandths) for better precision
  // USD and EUR show 2 decimal places (hundredths)
  return currency === 'BRL' ? num.toFixed(3) : num.toFixed(2);
}

/**
 * Format ISO timestamp to relative time
 */
/**
 * Clean article text by removing HTML tags, URLs, and HTML attributes
 * This function removes all HTML markup including partial tags like "a href="
 */
function cleanHTML(text) {
  if (!text) return '';
  
  // Remove complete HTML tags first
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove partial HTML tags and attributes (e.g., "a href=", "href='", etc.)
  cleaned = cleaned.replace(/<[^>]*$/g, ''); // Incomplete opening tag at end
  cleaned = cleaned.replace(/^[^<]*>/g, ''); // Incomplete closing tag at start
  cleaned = cleaned.replace(/href\s*=\s*["'][^"']*["']/gi, ''); // href="..." or href='...'
  cleaned = cleaned.replace(/href\s*=\s*[^\s>]+/gi, ''); // href=... without quotes
  cleaned = cleaned.replace(/a\s+href\s*=/gi, ''); // "a href=" pattern
  cleaned = cleaned.replace(/<a\s+[^>]*>/gi, ''); // <a ...> tags
  cleaned = cleaned.replace(/<\/a>/gi, ''); // </a> closing tags
  
  // Remove URL patterns (http/https URLs)
  cleaned = cleaned.replace(/https?:\/\/[^\s<>"']+/g, '');
  
  // Remove common HTML entities but decode them first
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');
  cleaned = cleaned.replace(/&amp;/gi, '&');
  cleaned = cleaned.replace(/&lt;/gi, '<');
  cleaned = cleaned.replace(/&gt;/gi, '>');
  cleaned = cleaned.replace(/&quot;/gi, '"');
  cleaned = cleaned.replace(/&#39;/gi, "'");
  cleaned = cleaned.replace(/&[a-z]+;/gi, ''); // Remove any remaining entities
  
  // Remove any remaining HTML-like patterns
  cleaned = cleaned.replace(/<[^>]*$/g, ''); // Incomplete tags
  cleaned = cleaned.replace(/[<>]/g, ''); // Any remaining angle brackets
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Clean article summary by removing HTML tags and URLs
 * Returns empty string if result is blank or only contains HTML/URLs
 */
export function cleanSummary(text) {
  if (!text) return '';
  
  const cleaned = cleanHTML(text);
  
  // Return empty string if cleaned result is blank or only contains special characters
  if (!cleaned || cleaned.length === 0 || /^[\s\-\.]+$/.test(cleaned)) {
    return '';
  }
  
  return cleaned;
}

/**
 * Clean article title by removing HTML tags and URLs
 * Similar to cleanSummary but always returns a string (never empty)
 */
export function cleanTitle(text) {
  if (!text) return '';
  
  const cleaned = cleanHTML(text);
  
  // Return cleaned text, or fallback to original if cleaning removed everything
  return cleaned || text.replace(/<[^>]*>/g, '').trim() || '';
}

export function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'hace unos segundos';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} d`;
  
  return date.toLocaleDateString('es-BO');
}

/**
 * Format ISO timestamp to La Paz timezone
 */
export function formatDateTime(isoString) {
  const date = new Date(isoString);
  
  return date.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if timestamp is stale (> 45 minutes old)
 */
export function isStale(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const minutes = Math.floor((now - date) / 60000);
  
  return minutes > 45;
}

