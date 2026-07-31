/**
 * One-shot blue + official rate refresh for free hosting (GitHub Actions).
 * Writes to Supabase; frontend already reads rates from there.
 *
 * Required env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY (preferred) or SUPABASE_ANON_KEY with insert rights
 */
import { refreshBlueRate } from '../scheduler-supabase.js';

async function main() {
  console.log('[refresh-rates-once] Starting…');
  await refreshBlueRate();
  console.log('[refresh-rates-once] Done.');
}

main().catch((err) => {
  console.error('[refresh-rates-once] Failed:', err);
  process.exit(1);
});
