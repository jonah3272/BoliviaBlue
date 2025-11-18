import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the blogArticles.js file
const blogArticlesPath = join(__dirname, '..', 'frontend', 'src', 'data', 'blogArticles.js');
const fileContent = readFileSync(blogArticlesPath, 'utf-8');

// Extract articles using regex (simple approach)
// This extracts the article objects from the exported arrays
const articlesEsMatch = fileContent.match(/export const articlesEs = \[([\s\S]*?)\];/);
const articlesEnMatch = fileContent.match(/export const articlesEn = \[([\s\S]*?)\];/);

if (!articlesEsMatch || !articlesEnMatch) {
  console.error('Could not find articles in file');
  process.exit(1);
}

// Parse articles (simplified - we'll extract key fields)
function extractArticle(articleText) {
  const slugMatch = articleText.match(/slug:\s*["']([^"']+)["']/);
  const titleMatch = articleText.match(/title:\s*["']([^"']+)["']/);
  const excerptMatch = articleText.match(/excerpt:\s*["']([^"']]+)["']/);
  const dateMatch = articleText.match(/date:\s*["']([^"']+)["']/);
  const readTimeMatch = articleText.match(/readTime:\s*["']?(\d+)\s*min["']?/);
  const featuredMatch = articleText.match(/featured:\s*(true|false)/);
  const categoryMatch = articleText.match(/category:\s*["']([^"']+)["']/);
  const authorMatch = articleText.match(/author:\s*["']([^"']+)["']/);
  
  // Extract content - everything between content: ` and closing `
  const contentMatch = articleText.match(/content:\s*`([\s\S]*?)`\s*,/);
  
  return {
    slug: slugMatch?.[1],
    title: titleMatch?.[1],
    excerpt: excerptMatch?.[1],
    date: dateMatch?.[1],
    readTime: readTimeMatch?.[1],
    featured: featuredMatch?.[1] === 'true',
    category: categoryMatch?.[1],
    author: authorMatch?.[1],
    content: contentMatch?.[1] || ''
  };
}

// Split articles (simple approach - split by },)
const articlesEsText = articlesEsMatch[1];
const articlesEnText = articlesEnMatch[1];

// Articles that already exist in Supabase
const existingSlugs = [
  'comprar-vender-dolares-bolivia-guia-seguridad',
  'buy-sell-dollars-bolivia-safety-guide',
  'comprar-vender-bolivianos-guia-seguridad',
  'buy-sell-bolivianos-safety-guide',
  'guia-comprar-dolares-binance-p2p' // Already added
];

// Extract all articles
const articlesEs = [];
const articlesEn = [];

// Simple parsing - split by }, and extract each article
const esMatches = articlesEsText.matchAll(/\{\s*id:\s*\d+,[\s\S]*?\},/g);
for (const match of esMatches) {
  const article = extractArticle(match[0]);
  if (article.slug && !existingSlugs.includes(article.slug)) {
    articlesEs.push(article);
  }
}

const enMatches = articlesEnText.matchAll(/\{\s*id:\s*\d+,[\s\S]*?\},/g);
for (const match of enMatches) {
  const article = extractArticle(match[0]);
  if (article.slug && !existingSlugs.includes(article.slug)) {
    articlesEn.push(article);
  }
}

console.log(`Found ${articlesEs.length} missing Spanish articles`);
console.log(`Found ${articlesEn.length} missing English articles`);

// Generate SQL for each article
function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

console.log('\n=== SQL INSERT STATEMENTS ===\n');

articlesEs.forEach(article => {
  if (!article.slug || !article.title) return;
  
  const sql = `INSERT INTO blog_articles (slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at)
VALUES (
  '${article.slug}',
  'es',
  '${escapeSQL(article.title)}',
  '${escapeSQL(article.excerpt)}',
  '${escapeSQL(article.content)}',
  'html',
  '${escapeSQL(article.author || 'Equipo Bolivia Blue')}',
  '${escapeSQL(article.category)}',
  ${article.featured},
  ${article.readTime ? parseInt(article.readTime) : 'NULL'},
  '${article.date || new Date().toISOString().split('T')[0]}'
)
ON CONFLICT (slug, language) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  updated_at = NOW();`;
  
  console.log(`-- Article: ${article.title}`);
  console.log(sql);
  console.log('');
});

articlesEn.forEach(article => {
  if (!article.slug || !article.title) return;
  
  const sql = `INSERT INTO blog_articles (slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at)
VALUES (
  '${article.slug}',
  'en',
  '${escapeSQL(article.title)}',
  '${escapeSQL(article.excerpt)}',
  '${escapeSQL(article.content)}',
  'html',
  '${escapeSQL(article.author || 'Bolivia Blue Team')}',
  '${escapeSQL(article.category)}',
  ${article.featured},
  ${article.readTime ? parseInt(article.readTime) : 'NULL'},
  '${article.date || new Date().toISOString().split('T')[0]}'
)
ON CONFLICT (slug, language) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  updated_at = NOW();`;
  
  console.log(`-- Article: ${article.title}`);
  console.log(sql);
  console.log('');
});

console.log('\n=== END SQL ===');



