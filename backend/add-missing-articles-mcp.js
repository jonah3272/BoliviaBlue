import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set');
  console.error('Looking for: VITE_SUPABASE_URL, SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and evaluate the blogArticles.js file
const blogArticlesPath = join(__dirname, '..', 'frontend', 'src', 'data', 'blogArticles.js');
const fileContent = readFileSync(blogArticlesPath, 'utf-8');

// Extract articles by evaluating the file (simplified - we'll import the actual module)
// Since it's ES modules, we need to handle it differently
async function getArticles() {
  try {
    // Use dynamic import
    const module = await import(`file://${blogArticlesPath}`);
    return {
      es: module.articlesEs || [],
      en: module.articlesEn || []
    };
  } catch (err) {
    console.error('Error importing articles:', err);
    return { es: [], en: [] };
  }
}

const existingSlugs = [
  'comprar-vender-dolares-bolivia-guia-seguridad',
  'buy-sell-dollars-bolivia-safety-guide',
  'comprar-vender-bolivianos-guia-seguridad',
  'buy-sell-bolivianos-safety-guide',
  'guia-comprar-dolares-binance-p2p'
];

async function addArticle(article, language) {
  if (existingSlugs.includes(article.slug)) {
    console.log(`⏭️  Skipping ${article.slug} (already exists)`);
    return { success: true, skipped: true };
  }

  const articleData = {
    slug: article.slug,
    language: language,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    content_format: 'html',
    author: article.author || (language === 'es' ? 'Equipo Bolivia Blue' : 'Bolivia Blue Team'),
    category: article.category,
    featured: article.featured || false,
    read_time: article.readTime ? parseInt(article.readTime) : null,
    published_at: article.date || new Date().toISOString()
  };

  console.log(`📝 Adding: ${article.title.substring(0, 50)}... (${language})`);
  
  const { data, error } = await supabase
    .from('blog_articles')
    .upsert(articleData, {
      onConflict: 'slug,language'
    })
    .select();

  if (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  } else {
    console.log(`✅ Success!`);
    return { success: true };
  }
}

async function main() {
  console.log('🚀 Adding missing articles to Supabase via MCP...\n');

  const { es: articlesEs, en: articlesEn } = await getArticles();
  
  const missingEs = articlesEs.filter(a => a.slug && !existingSlugs.includes(a.slug));
  const missingEn = articlesEn.filter(a => a.slug && !existingSlugs.includes(a.slug));

  console.log(`Found ${missingEs.length} missing Spanish articles`);
  console.log(`Found ${missingEn.length} missing English articles\n`);

  let successCount = 0;
  let errorCount = 0;

  // Add Spanish articles
  for (const article of missingEs) {
    const result = await addArticle(article, 'es');
    if (result.success && !result.skipped) successCount++;
    else if (!result.success) errorCount++;
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Add English articles
  for (const article of missingEn) {
    const result = await addArticle(article, 'en');
    if (result.success && !result.skipped) successCount++;
    else if (!result.success) errorCount++;
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Done!`);
  console.log(`✅ Successfully added: ${successCount} articles`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} articles`);
  }
}

main().catch(console.error);



