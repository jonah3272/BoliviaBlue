/**
 * Backfill historical BRL and EUR rates by converting from USD rates
 * 
 * Formula:
 * - BOB/BRL = (BOB/USD) / (USD/BRL)
 * - BOB/EUR = (BOB/USD) / (USD/EUR)
 * 
 * Using approximate exchange rates:
 * - USD/BRL ≈ 5.0 (1 USD = ~5 BRL)
 * - USD/EUR ≈ 0.92 (1 USD = ~0.92 EUR)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Approximate exchange rates (these are reasonable averages)
// You can adjust these based on actual market rates
const USD_TO_BRL = 5.0;  // 1 USD = ~5 BRL
const USD_TO_EUR = 0.92; // 1 USD = ~0.92 EUR

async function backfillCurrencyRates() {
  console.log('Starting currency rate backfill...');
  
  try {
    // Fetch all records with USD rates but missing BRL/EUR rates (with pagination)
    let allRates = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: rates, error: fetchError } = await supabase
        .from('rates')
        .select('id, t, buy, sell, mid, buy_bob_per_brl, sell_bob_per_brl, mid_bob_per_brl, buy_bob_per_eur, sell_bob_per_eur, mid_bob_per_eur')
        .not('buy', 'is', null)
        .order('t', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (fetchError) {
        throw fetchError;
      }

      if (!rates || rates.length === 0) {
        hasMore = false;
      } else {
        allRates = allRates.concat(rates);
        hasMore = rates.length === pageSize;
        page++;
        console.log(`Fetched ${allRates.length} records so far...`);
      }
    }

    if (allRates.length === 0) {
      console.log('No rates found to backfill');
      return;
    }

    console.log(`Found ${allRates.length} total records to process`);
    const rates = allRates;

    let updated = 0;
    let skipped = 0;

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < rates.length; i += batchSize) {
      const batch = rates.slice(i, i + batchSize);
      
      for (const rate of batch) {
        // Skip if already has BRL/EUR data
        if (rate.buy_bob_per_brl !== null && rate.buy_bob_per_eur !== null) {
          skipped++;
          continue;
        }

        // Calculate BRL rates: BOB/BRL = (BOB/USD) / (USD/BRL)
        const buy_bob_per_brl = rate.buy ? (rate.buy / USD_TO_BRL).toFixed(4) : null;
        const sell_bob_per_brl = rate.sell ? (rate.sell / USD_TO_BRL).toFixed(4) : null;
        const mid_bob_per_brl = rate.mid ? (rate.mid / USD_TO_BRL).toFixed(4) : null;

        // Calculate EUR rates: BOB/EUR = (BOB/USD) / (USD/EUR)
        const buy_bob_per_eur = rate.buy ? (rate.buy / USD_TO_EUR).toFixed(4) : null;
        const sell_bob_per_eur = rate.sell ? (rate.sell / USD_TO_EUR).toFixed(4) : null;
        const mid_bob_per_eur = rate.mid ? (rate.mid / USD_TO_EUR).toFixed(4) : null;

        // Update the record
        const { data: updateData, error: updateError } = await supabase
          .from('rates')
          .update({
            buy_bob_per_brl: buy_bob_per_brl ? parseFloat(buy_bob_per_brl) : null,
            sell_bob_per_brl: sell_bob_per_brl ? parseFloat(sell_bob_per_brl) : null,
            mid_bob_per_brl: mid_bob_per_brl ? parseFloat(mid_bob_per_brl) : null,
            buy_bob_per_eur: buy_bob_per_eur ? parseFloat(buy_bob_per_eur) : null,
            sell_bob_per_eur: sell_bob_per_eur ? parseFloat(sell_bob_per_eur) : null,
            mid_bob_per_eur: mid_bob_per_eur ? parseFloat(mid_bob_per_eur) : null,
          })
          .eq('id', rate.id)
          .select();

        if (updateError) {
          console.error(`Error updating rate ${rate.id} at ${rate.t}:`, updateError);
        } else if (!updateData || updateData.length === 0) {
          console.error(`No rows updated for rate ${rate.id} at ${rate.t}`);
        } else {
          updated++;
          if (updated % 100 === 0) {
            console.log(`Updated ${updated} records...`);
          }
        }
      }
    }

    console.log(`\nBackfill complete!`);
    console.log(`- Updated: ${updated} records`);
    console.log(`- Skipped: ${skipped} records (already had data)`);
    console.log(`- Total processed: ${rates.length} records`);

  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillCurrencyRates()
  .then(() => {
    console.log('Backfill script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Backfill script failed:', error);
    process.exit(1);
  });

