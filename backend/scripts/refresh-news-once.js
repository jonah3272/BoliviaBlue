/**
 * One-shot RSS news pull + sentiment for free hosting (GitHub Actions).
 * Writes to Supabase; frontend already reads news from there.
 *
 * Required env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)
 *   NEWS_SOURCES (comma-separated RSS URLs)
 *
 * Optional:
 *   OPENAI_API_KEY — AI sentiment; without it, keyword fallback is used
 */
import { refreshNews } from '../scheduler-supabase.js';

async function main() {
  console.log('[refresh-news-once] Starting RSS news + sentiment…');
  await refreshNews(false);
  console.log('[refresh-news-once] Done.');
}

main().catch((err) => {
  console.error('[refresh-news-once] Failed:', err);
  process.exit(1);
});
