import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Article data - extracted from SQL files
const articles = [
  // Airtm Guide - Spanish
  {
    slug: 'guia-airtm-enviar-dinero-bolivia-extranjeros',
    language: 'es',
    title: 'Guía Completa: Cómo Enviar Dinero a Bolivia desde el Extranjero con Airtm',
    excerpt: 'Aprende cómo enviar dinero a Bolivia desde cualquier país usando Airtm. Guía paso a paso para extranjeros: crear cuenta, depositar desde tu banco, y hacer intercambios con bolivianos de forma segura.',
    content: readFileSync(join(__dirname, 'supabase-airtm-guide-article.sql'), 'utf-8')
      .match(/VALUES\s*\([^)]+'guia-airtm-enviar-dinero-bolivia-extranjeros'[^)]+\)/s)?.[0]
      ?.match(/'([^']*(?:''[^']*)*)'/g)?.[4]?.replace(/''/g, "'")?.slice(1, -1) || '',
    content_format: 'html',
    author: 'Bolivia Blue con Paz',
    category: 'Guía',
    featured: true,
    read_time: 12,
    published_at: new Date().toISOString()
  },
  // Airtm Guide - English
  {
    slug: 'airtm-guide-send-money-bolivia-foreigners',
    language: 'en',
    title: 'Complete Guide: How to Send Money to Bolivia from Abroad Using Airtm',
    excerpt: 'Learn how to send money to Bolivia from any country using Airtm. Step-by-step guide for foreigners: create account, deposit from your bank, and trade with Bolivians safely.',
    content: readFileSync(join(__dirname, 'supabase-airtm-guide-article.sql'), 'utf-8')
      .split("'airtm-guide-send-money-bolivia-foreigners'")[1]
      ?.match(/VALUES\s*\([^)]+\)/s)?.[0]
      ?.match(/'([^']*(?:''[^']*)*)'/g)?.[4]?.replace(/''/g, "'")?.slice(1, -1) || '',
    content_format: 'html',
    author: 'Bolivia Blue with Paz',
    category: 'Guide',
    featured: true,
    read_time: 12,
    published_at: new Date().toISOString()
  },
  // Reddit Article - Spanish
  {
    slug: 'bolivia-blue-rate-reddit-discusiones-comunidad',
    language: 'es',
    title: 'Bolivia Blue Rate en Reddit: Discusiones y Experiencias de la Comunidad',
    excerpt: 'Descubre qué dice Reddit sobre el bolivia blue rate. Agregamos las mejores discusiones de r/BOLIVIA, experiencias reales de usuarios, y consejos prácticos sobre el tipo de cambio del dólar blue en Bolivia.',
    content: readFileSync(join(__dirname, 'supabase-reddit-bolivia-blue-article.sql'), 'utf-8')
      .match(/VALUES\s*\([^)]+'bolivia-blue-rate-reddit-discusiones-comunidad'[^)]+\)/s)?.[0]
      ?.match(/'([^']*(?:''[^']*)*)'/g)?.[4]?.replace(/''/g, "'")?.slice(1, -1) || '',
    content_format: 'html',
    author: 'Bolivia Blue con Paz',
    category: 'Análisis',
    featured: true,
    read_time: 8,
    published_at: new Date().toISOString()
  },
  // Reddit Article - English
  {
    slug: 'bolivia-blue-rate-reddit-discussions-community',
    language: 'en',
    title: 'Bolivia Blue Rate on Reddit: Community Discussions and Experiences',
    excerpt: 'Discover what Reddit says about bolivia blue rate. We aggregate the best discussions from r/BOLIVIA, real user experiences, and practical advice about the blue dollar exchange rate in Bolivia.',
    content: readFileSync(join(__dirname, 'supabase-reddit-bolivia-blue-article.sql'), 'utf-8')
      .split("'bolivia-blue-rate-reddit-discussions-community'")[1]
      ?.match(/VALUES\s*\([^)]+\)/s)?.[0]
      ?.match(/'([^']*(?:''[^']*)*)'/g)?.[4]?.replace(/''/g, "'")?.slice(1, -1) || '',
    content_format: 'html',
    author: 'Bolivia Blue with Paz',
    category: 'Analysis',
    featured: true,
    read_time: 8,
    published_at: new Date().toISOString()
  }
];

async function addArticles() {
  console.log('🚀 Adding blog articles to Supabase...\n');
  
  for (const article of articles) {
    // Read content from SQL file properly
    const sqlFile = article.slug.includes('airtm') 
      ? join(__dirname, 'supabase-airtm-guide-article.sql')
      : join(__dirname, 'supabase-reddit-bolivia-blue-article.sql');
    
    const sqlContent = readFileSync(sqlFile, 'utf-8');
    
    // Extract content between the article slug and the next field
    const slugPattern = `'${article.slug}'`;
    const slugIndex = sqlContent.indexOf(slugPattern);
    
    if (slugIndex === -1) {
      console.warn(`⚠️  Could not find slug ${article.slug} in SQL file`);
      continue;
    }
    
    // Find the content field (4th field after slug: slug, language, title, excerpt, content)
    // Look for the pattern: 'slug', 'language', 'title', 'excerpt', 'CONTENT'
    const afterSlug = sqlContent.substring(slugIndex);
    const valuesMatch = afterSlug.match(/VALUES\s*\(/);
    if (!valuesMatch) continue;
    
    const valuesStart = afterSlug.indexOf('VALUES') + 6;
    let currentPos = valuesStart;
    let fieldCount = 0;
    let inString = false;
    let currentField = '';
    let contentField = '';
    
    // Parse until we get to the 5th field (content)
    for (let i = currentPos; i < afterSlug.length && fieldCount < 5; i++) {
      const char = afterSlug[i];
      
      if (char === "'" && afterSlug[i - 1] !== '\\') {
        if (inString && afterSlug[i + 1] === "'") {
          // Escaped quote
          currentField += "''";
          i++;
          continue;
        }
        inString = !inString;
        if (!inString) {
          fieldCount++;
          if (fieldCount === 5) {
            contentField = currentField;
            break;
          }
          currentField = '';
          // Skip comma and whitespace
          while (i + 1 < afterSlug.length && (afterSlug[i + 1] === ',' || afterSlug[i + 1].trim() === '')) {
            i++;
          }
        }
        continue;
      }
      
      if (inString) {
        currentField += char;
      }
    }
    
    if (contentField) {
      article.content = contentField.replace(/''/g, "'");
    }
    
    console.log(`📝 Adding: ${article.title} (${article.language})`);
    
    const { data, error } = await supabase
      .from('blog_articles')
      .upsert(article, {
        onConflict: 'slug,language'
      })
      .select();
    
    if (error) {
      console.error(`❌ Error:`, error.message);
    } else {
      console.log(`✅ Success!`);
    }
  }
  
  console.log('\n✨ Done!');
}

// Better approach: Use a simpler method - read the SQL and extract content manually
// For now, let's use a direct approach with the content we know
async function addArticlesDirect() {
  console.log('🚀 Adding blog articles to Supabase...\n');
  console.log('⚠️  Note: This script requires manual content extraction from SQL files.');
  console.log('💡 For now, please run the SQL files directly in Supabase SQL Editor.\n');
  console.log('📄 Files to run:');
  console.log('   1. backend/supabase-airtm-guide-article.sql');
  console.log('   2. backend/supabase-reddit-bolivia-blue-article.sql\n');
}

addArticlesDirect().catch(console.error);

