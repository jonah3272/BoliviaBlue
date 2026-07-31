/**
 * One-shot daily blog article generation for free hosting (GitHub Actions).
 * Writes ES + EN articles to Supabase blog_articles.
 *
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)
 */
import { generateDailyArticles } from '../dailyArticleGenerator.js';

async function main() {
  console.log('[generate-daily-articles] Starting…');
  await generateDailyArticles();
  console.log('[generate-daily-articles] Done.');
}

main().catch((err) => {
  console.error('[generate-daily-articles] Failed:', err);
  process.exit(1);
});
