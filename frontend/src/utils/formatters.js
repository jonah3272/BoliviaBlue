/**
 * Format a number to 2 decimal places
 */
export function formatRate(value) {
  return Number(value).toFixed(2);
}

/**
 * Format ISO timestamp to relative time
 */
/**
 * Clean article summary by removing HTML tags and URLs
 */
export function cleanSummary(text) {
  if (!text) return '';
  
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove URL patterns (http/https URLs)
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  
  // Remove common HTML entities
  cleaned = cleaned.replace(/&[a-z]+;/gi, '');
  
  // Remove href="..." patterns
  cleaned = cleaned.replace(/href=["'][^"']*["']/gi, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
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

