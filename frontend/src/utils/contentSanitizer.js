/**
 * Sanitize content - remove emails, phone numbers, etc.
 */
export function sanitizeContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content;

  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email removed]');

  // Remove phone numbers (7+ digits)
  sanitized = sanitized.replace(/\b\d{7,}\b/g, '[phone removed]');

  // Remove URLs (but keep domain names mentioned in text)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[link removed]');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate content length
 */
export function validateContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  const trimmed = content.trim();

  if (trimmed.length < 10) {
    return { valid: false, error: 'Content must be at least 10 characters' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Content must be less than 1000 characters' };
  }

  return { valid: true };
}
