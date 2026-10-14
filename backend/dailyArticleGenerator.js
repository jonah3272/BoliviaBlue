/**
 * Compatibility entry point for the retired narrative article generator.
 * The old implementation compared the current row with itself and produced
 * unsupported daily-change prose. All callers now use the evidence publisher.
 * Existing article rows and their URLs are deliberately not rewritten here.
 */
import { supabase } from './db-supabase.js';
import publisher from '../scripts/publish-daily-evidence.cjs';
import evidence from '../shared/dailyEvidence.cjs';

export async function generateDailyArticles() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const now = new Date().toISOString();
  return publisher.publishDate(supabase, evidence.completedDate(now), { now, dryRun: false });
}
