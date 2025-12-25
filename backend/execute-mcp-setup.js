/**
 * Execute Newsletter and Monthly Reports Database Setup
 * Uses Supabase client directly (equivalent to MCP execution)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read SQL files
const newsletterSQL = readFileSync(join(__dirname, 'supabase-newsletter.sql'), 'utf-8');
const monthlyReportsSQL = readFileSync(join(__dirname, 'supabase-monthly-reports.sql'), 'utf-8');

async function executeSQL(sql, description) {
  console.log(`\n📋 Executing: ${description}`);
  console.log('-'.repeat(60));
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        // Use Supabase RPC to execute SQL (if available) or use direct query
        // Note: Supabase client doesn't support raw SQL directly
        // We'll need to use the REST API or execute via Supabase dashboard
        console.log(`⚠️  Note: Direct SQL execution via client is limited.`);
        console.log(`   Please use MCP Supabase server or Supabase SQL Editor.`);
        break;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    if (successCount > 0) {
      console.log(`✅ ${successCount} statements executed successfully`);
    }
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} statements failed`);
    }
  } catch (error) {
    console.error(`❌ Failed to execute ${description}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Newsletter & Monthly Reports Database Setup');
  console.log('='.repeat(60));
  console.log(`\n📡 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${supabaseServiceKey ? 'Service Role Key' : 'Anon Key'}\n`);

  console.log('⚠️  IMPORTANT: Supabase JavaScript client does not support raw SQL execution.');
  console.log('   Please use one of these methods:\n');
  console.log('   1. MCP Supabase Server (Recommended)');
  console.log('      - Use MCP tool to execute: backend/supabase-newsletter.sql');
  console.log('      - Use MCP tool to execute: backend/supabase-monthly-reports.sql\n');
  console.log('   2. Supabase SQL Editor');
  console.log('      - Go to Supabase Dashboard → SQL Editor');
  console.log('      - Copy and paste SQL from the files\n');
  console.log('   3. Supabase CLI');
  console.log('      - Use: supabase db execute < sql-file\n');

  console.log('📋 SQL Files Ready:');
  console.log('   ✅ backend/supabase-newsletter.sql');
  console.log('   ✅ backend/supabase-monthly-reports.sql\n');

  console.log('💡 To use MCP:');
  console.log('   Execute SQL migration: backend/supabase-newsletter.sql');
  console.log('   Execute SQL migration: backend/supabase-monthly-reports.sql\n');
}

main().catch(console.error);

