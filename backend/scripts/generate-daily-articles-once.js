/** Compatibility command. Publishes a completed-day evidence report, insert-only. */
import { generateDailyArticles } from '../dailyArticleGenerator.js';
generateDailyArticles().then(result => {
  console.log(`[daily-evidence] ${result.status}: ${result.report.url}`);
}).catch(error => {
  console.error(`[daily-evidence] Failed: ${error.message}`);
  process.exitCode = 1;
});
