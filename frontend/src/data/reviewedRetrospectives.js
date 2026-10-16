import { RETROSPECTIVE_RELEASES } from './retrospectiveReleases.js';

// Compare timestamp values without discarding PostgreSQL microseconds. PostgREST
// and SQL snapshots may use T/space or equivalent explicit UTC offsets.
function exactTimestamp(value) {
  const match = typeof value === 'string' && value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::?\d{2})?)$/);
  if (!match) return null;
  const local = `${match[1]}T${match[2]}`;
  const calendar = Date.parse(local + 'Z');
  if (!Number.isFinite(calendar) || new Date(calendar).toISOString().slice(0, 19) !== local) return null;
  let offset = match[4];
  if (/^[+-]\d{2}$/.test(offset)) offset += ':00';
  else if (/^[+-]\d{4}$/.test(offset)) offset = offset.slice(0, 3) + ':' + offset.slice(3);
  const seconds = Date.parse(local + offset);
  return Number.isFinite(seconds) ? `${seconds}:${(match[3] || '').padEnd(6, '0')}` : null;
}

// No slug-only exception. Only explicitly reviewed, exact live payloads qualify.
// Existing columns carry the state; no schema, category or provenance is invented.
export function reviewedRetrospective(article, { releases = RETROSPECTIVE_RELEASES, now = Date.now() } = {}) {
  if (!article) return null;
  const release = releases.find((item) => item.state === 'reviewed' && item.id === article.id && item.slug === article.slug && item.language === article.language);
  if (!release) return null;
  for (const [key, value] of Object.entries(release.fields)) {
    if (key === 'published_at' || key === 'created_at') {
      const actual = exactTimestamp(article[key]);
      if (actual === null || actual !== exactTimestamp(value)) return null;
    } else if (article[key] !== value) return null;
  }
  const revised = Date.parse(article.updated_at);
  const prepared = Date.parse(release.preparedAt);
  if (!Number.isFinite(prepared) || !Number.isFinite(now) || !Number.isFinite(revised) || revised < prepared || revised > now) return null;
  return { ...release, revisedAt: new Date(revised).toISOString() };
}

export function reviewedRetrospectiveIds(language, releases = RETROSPECTIVE_RELEASES) {
  return releases.filter((item) => item.state === 'reviewed' && item.language === language).map((item) => item.id);
}

export function retrospectiveRevisionLabel(review, language = 'es') {
  if (!review) return '';
  const formatted = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-BO', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23', timeZone: 'America/La_Paz',
  }).format(new Date(review.revisedAt));
  return `${language === 'en' ? 'Retrospective revised' : 'Retrospectiva revisada'}: ${formatted} (Bolivia, UTC−4)`;
}

export function retrospectiveLocalePaths(review) {
  return review ? { es: `/blog/${review.slug}`, en: `/blog/${review.slug}?lang=en` } : null;
}

export function retrospectiveNotice(review, language = 'es') {
  return review ? {
    ...review.notice, path: review.evidencePath,
    label: language === 'en' ? 'Download the dated observations and calculations' : 'Descargar las observaciones y los cálculos de estas fechas',
    revision: retrospectiveRevisionLabel(review, language),
  } : null;
}

export function isDiscoverableBlogArticle(article) {
  if (!article || typeof article.slug !== 'string' || article.category === 'daily-evidence') return false;
  return !article.slug.startsWith('analisis-diario-') || Boolean(reviewedRetrospective(article));
}
