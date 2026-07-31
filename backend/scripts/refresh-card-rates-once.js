/**
 * One-shot Visa/MC/Amex card FX refresh (requires card_rates table).
 * Usage: node scripts/refresh-card-rates-once.js
 */
import { refreshCardRates } from '../scheduler-supabase.js';

async function main() {
  console.log('[refresh-card-rates-once] Starting…');
  await refreshCardRates();
  console.log('[refresh-card-rates-once] Done.');
}

main().catch((err) => {
  console.error('[refresh-card-rates-once] Failed:', err);
  process.exit(1);
});
