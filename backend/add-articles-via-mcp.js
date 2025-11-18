import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the blogArticles.js file and extract articles
const blogArticlesPath = join(__dirname, '..', 'frontend', 'src', 'data', 'blogArticles.js');

async function getArticles() {
  const module = await import(`file://${blogArticlesPath.replace(/\\/g, '/')}`);
  return {
    es: module.articlesEs || [],
    en: module.articlesEn || []
  };
}

const existingSlugs = [
  'comprar-vender-dolares-bolivia-guia-seguridad',
  'buy-sell-dollars-bolivia-safety-guide',
  'comprar-vender-bolivianos-guia-seguridad',
  'buy-sell-bolivianos-safety-guide',
  'guia-comprar-dolares-binance-p2p'
];

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function generateSQL(article, language) {
  const content = escapeSQL(article.content);
  const title = escapeSQL(article.title);
  const excerpt = escapeSQL(article.excerpt);
  const author = escapeSQL(article.author || (language === 'es' ? 'Equipo Bolivia Blue' : 'Bolivia Blue Team'));
  const category = escapeSQL(article.category);
  
  return `INSERT INTO blog_articles (slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at)
VALUES (
  '${article.slug}',
  '${language}',
  '${title}',
  '${excerpt}',
  '${content}',
  'html',
  '${author}',
  '${category}',
  ${article.featured || false},
  ${article.readTime ? parseInt(article.readTime) : 'NULL'},
  '${article.date || new Date().toISOString().split('T')[0]}'
)
ON CONFLICT (slug, language) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  updated_at = NOW();`;
}

async function main() {
  console.log('📚 Extracting articles from blogArticles.js...\n');
  
  const { es: articlesEs, en: articlesEn } = await getArticles();
  
  const missingEs = articlesEs.filter(a => a.slug && !existingSlugs.includes(a.slug));
  const missingEn = articlesEn.filter(a => a.slug && !existingSlugs.includes(a.slug));

  console.log(`Found ${missingEs.length} missing Spanish articles`);
  console.log(`Found ${missingEn.length} missing English articles\n`);

  // Generate SQL for each article
  const allArticles = [
    ...missingEs.map(a => ({ article: a, language: 'es' })),
    ...missingEn.map(a => ({ article: a, language: 'en' }))
  ];

  console.log('Generated SQL for all articles. Use MCP Supabase apply_migration to add them.\n');
  console.log('Articles to add:');
  allArticles.forEach(({ article, language }) => {
    console.log(`  - ${article.slug} (${language})`);
  });

  // Write SQL to file for manual execution or MCP
  const sqlStatements = allArticles.map(({ article, language }) => 
    generateSQL(article, language)
  ).join('\n\n');

  const sqlFilePath = join(__dirname, 'add-missing-articles.sql');
  const fullSQL = `-- Add missing local fallback articles to Supabase
-- Generated automatically from blogArticles.js

${sqlStatements}
`;

  const fs = await import('fs');
  fs.writeFileSync(sqlFilePath, fullSQL, 'utf-8');
  console.log(`\n✅ SQL file written to: ${sqlFilePath}`);
  console.log(`\nYou can now use MCP Supabase apply_migration to execute this SQL.`);
}

main().catch(console.error);

