import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { articlesEs, articlesEn } from '../frontend/src/data/blogArticles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Articles that are already in Supabase (the new ones we just added)
const existingSlugs = [
  'comprar-vender-dolares-bolivia-guia-seguridad',
  'buy-sell-dollars-bolivia-safety-guide',
  'comprar-vender-bolivianos-guia-seguridad',
  'buy-sell-bolivianos-safety-guide'
];

// Filter out articles that already exist
const missingArticlesEs = articlesEs.filter(a => !existingSlugs.includes(a.slug));
const missingArticlesEn = articlesEn.filter(a => !existingSlugs.includes(a.slug));

async function addArticle(article, language) {
  const articleData = {
    slug: article.slug,
    language: language,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content.replace(/'/g, "''"), // Escape single quotes for SQL
    content_format: 'html',
    author: article.author || 'Bolivia Blue con Paz',
    category: article.category,
    featured: article.featured || false,
    read_time: article.readTime ? parseInt(article.readTime) : null,
    published_at: article.date || new Date().toISOString()
  };

  console.log(`📝 Adding: ${article.title} (${language})`);
  
  const { data, error } = await supabase
    .from('blog_articles')
    .upsert(articleData, {
      onConflict: 'slug,language'
    })
    .select();

  if (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  } else {
    console.log(`✅ Success!`);
    return true;
  }
}

async function main() {
  console.log('🚀 Migrating local articles to Supabase...\n');
  console.log(`Found ${missingArticlesEs.length} missing Spanish articles`);
  console.log(`Found ${missingArticlesEn.length} missing English articles\n`);

  let successCount = 0;
  let errorCount = 0;

  // Add Spanish articles
  for (const article of missingArticlesEs) {
    const success = await addArticle(article, 'es');
    if (success) successCount++;
    else errorCount++;
  }

  // Add English articles
  for (const article of missingArticlesEn) {
    const success = await addArticle(article, 'en');
    if (success) successCount++;
    else errorCount++;
  }

  console.log(`\n✨ Done!`);
  console.log(`✅ Successfully added: ${successCount} articles`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} articles`);
  }
}

main().catch(console.error);



