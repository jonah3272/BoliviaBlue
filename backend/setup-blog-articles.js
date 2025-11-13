/**
 * Setup script to verify and guide blog_articles table creation in Supabase
 * Run with: node setup-blog-articles.js
 * 
 * Note: Supabase doesn't allow arbitrary SQL execution through the JS client
 * for security reasons. This script will verify the setup and provide
 * the SQL to run manually in the Supabase Dashboard.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBlogArticlesTable() {
  console.log('🚀 Checking blog_articles table setup in Supabase...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  try {
    // Check if table exists
    console.log('📊 Checking if blog_articles table exists...');
    
    const { data, error } = await supabase
      .from('blog_articles')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        // Table doesn't exist
        console.log('❌ Table does not exist yet.\n');
        
        // Read and display SQL
        try {
          const sqlPath = join(__dirname, 'supabase-blog-articles.sql');
          const sql = readFileSync(sqlPath, 'utf-8');
          
          console.log('📋 SQL to create the table:');
          console.log('═'.repeat(70));
          console.log(sql);
          console.log('═'.repeat(70));
          
          console.log('\n💡 Next Steps:');
          console.log('1. Go to: https://supabase.com/dashboard');
          console.log('2. Select your project');
          console.log('3. Click "SQL Editor" in the sidebar');
          console.log('4. Click "New query"');
          console.log('5. Paste the SQL above');
          console.log('6. Click "Run" (or press Ctrl+Enter)');
          console.log('\n✨ After running the SQL, run this script again to verify!');
        } catch (e) {
          console.error('❌ Could not read SQL file:', e.message);
          console.log('Please check that backend/supabase-blog-articles.sql exists');
        }
      } else {
        console.error('❌ Error checking table:', error.message);
        console.error('Error code:', error.code);
      }
    } else {
      // Table exists - verify structure
      console.log('✅ blog_articles table exists!');
      
      // Try to get table structure by querying with specific columns
      console.log('\n🔍 Verifying table structure...');
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('blog_articles')
        .select('id, slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at, created_at, updated_at')
        .limit(1);
      
      if (sampleError) {
        console.log('⚠️  Warning: Some columns might be missing:', sampleError.message);
        console.log('Please verify the table structure matches the schema.');
      } else {
        console.log('✅ Table structure looks good!');
        
        // Count articles
        const { count, error: countError } = await supabase
          .from('blog_articles')
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`📝 Current articles in database: ${count || 0}`);
        }
      }
      
      console.log('\n✨ Setup complete! Your blog_articles table is ready.');
      console.log('💡 You can now add articles via:');
      console.log('   - Supabase Dashboard → Table Editor');
      console.log('   - Supabase API');
      console.log('   - Your application code');
    }

  } catch (err) {
    console.error('❌ Error checking blog_articles table:', err);
    console.log('\n📋 Manual setup required. Please run this SQL in Supabase Dashboard:');
    console.log('─'.repeat(70));
    try {
      const sqlPath = join(__dirname, 'supabase-blog-articles.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      console.log(sql);
    } catch (e) {
      console.log('Could not read SQL file. Please check backend/supabase-blog-articles.sql');
    }
    console.log('─'.repeat(70));
  }
}

// Run the setup
setupBlogArticlesTable()
  .then(() => {
    console.log('');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Setup check failed:', err);
    process.exit(1);
  });

