import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and parse blogArticles.js
const blogArticlesPath = join(__dirname, '..', 'frontend', 'src', 'data', 'blogArticles.js');
const blogArticlesContent = readFileSync(blogArticlesPath, 'utf-8');

// Extract articles using eval (since it's a JS module)
const module = { exports: {} };
eval(blogArticlesContent.replace('export const', 'const').replace('export ', ''));

const articlesEs = eval('articlesEs');
const articlesEn = eval('articlesEn');

// Articles already in Supabase
const existingSlugs = [
  'comprar-vender-bolivianos-guia-seguridad',
  'comprar-vender-dolares-bolivia-guia-seguridad',
  'estrategias-proteger-ahorros-volatilidad',
  'guia-comprar-dolares-binance-p2p',
  'que-es-usdt-tether-guia-completa',
  'buy-sell-bolivianos-safety-guide',
  'buy-sell-dollars-bolivia-safety-guide'
];

// Find missing articles
const missingEs = articlesEs.filter(a => a.slug && !existingSlugs.includes(a.slug));
const missingEn = articlesEn.filter(a => a.slug && !existingSlugs.includes(a.slug));

console.log(`Found ${missingEs.length} missing Spanish articles`);
console.log(`Found ${missingEn.length} missing English articles\n`);

async function addArticle(article, language) {
  const articleData = {
    slug: article.slug,
    language: language,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content.trim(),
    content_format: 'html',
    author: article.author || (language === 'es' ? 'Equipo Bolivia Blue' : 'Bolivia Blue Team'),
    category: article.category,
    featured: article.featured || false,
    read_time: article.readTime ? parseInt(article.readTime) : null,
    published_at: article.date || new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from('blog_articles')
    .upsert(articleData, { onConflict: 'slug,language' })
    .select();

  if (error) {
    console.error(`❌ Error adding ${article.slug} (${language}):`, error.message);
    return false;
  } else {
    console.log(`✅ Added ${article.slug} (${language})`);
    return true;
  }
}

async function main() {
  console.log('📚 Adding missing articles to Supabase...\n');

  const allArticles = [
    ...missingEs.map(a => ({ article: a, language: 'es' })),
    ...missingEn.map(a => ({ article: a, language: 'en' }))
  ];

  let successCount = 0;
  let failCount = 0;

  for (const { article, language } of allArticles) {
    const success = await addArticle(article, language);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Successfully added: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
}

main().catch(console.error);



