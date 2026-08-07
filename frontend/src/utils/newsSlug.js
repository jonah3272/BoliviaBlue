/**
 * Stable public paths for news items (aggregator articles).
 * Format: /noticias/{slugified-title}-{id}
 */

export function slugifyNewsTitle(title) {
  return String(title || 'noticia')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'noticia';
}

export function newsArticlePath(article) {
  if (!article?.id) return '/noticias';
  const slug = slugifyNewsTitle(article.title);
  return `/noticias/${slug}-${article.id}`;
}

/** Extract news id from a /noticias/:slugParam route param. */
export function newsIdFromSlugParam(param) {
  if (!param) return null;
  // UUID
  const uuid = param.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (uuid) return uuid[1];
  // Numeric or opaque id after last hyphen (min length 4)
  const m = String(param).match(/-([A-Za-z0-9_-]{4,})$/);
  return m ? m[1] : null;
}
