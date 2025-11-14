import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL files and extract article data
function parseSQLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const articles = [];
  
  // Extract INSERT statements
  const insertRegex = /INSERT INTO blog_articles\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\)/gs;
  let match;
  
  while ((match = insertRegex.exec(content)) !== null) {
    const values = match[1];
    // Parse the values - this is a simplified parser
    // For production, you might want to use a proper SQL parser
    const valueRegex = /'([^']*(?:''[^']*)*)'|(\d+\.?\d*)|(true|false)|(NOW\(\))/g;
    const parsedValues = [];
    let currentValue = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < values.length; i++) {
      const char = values[i];
      const nextChar = values[i + 1];
      
      if (!inQuotes && (char === "'" || char === '"')) {
        inQuotes = true;
        quoteChar = char;
        currentValue = '';
      } else if (inQuotes && char === quoteChar && nextChar === quoteChar) {
        // Escaped quote
        currentValue += char + nextChar;
        i++; // Skip next char
      } else if (inQuotes && char === quoteChar) {
        // End of quoted string
        parsedValues.push(currentValue);
        currentValue = '';
        inQuotes = false;
        // Skip comma and whitespace
        while (i + 1 < values.length && (values[i + 1] === ',' || values[i + 1].trim() === '')) {
          i++;
        }
      } else if (inQuotes) {
        currentValue += char;
      } else if (char === ',' && !inQuotes) {
        // End of value
        if (currentValue.trim()) {
          const trimmed = currentValue.trim();
          if (trimmed === 'NOW()') {
            parsedValues.push(new Date().toISOString());
          } else if (trimmed === 'true' || trimmed === 'false') {
            parsedValues.push(trimmed === 'true');
          } else if (!isNaN(trimmed)) {
            parsedValues.push(parseInt(trimmed) || parseFloat(trimmed));
          } else {
            parsedValues.push(trimmed);
          }
        }
        currentValue = '';
        // Skip whitespace
        while (i + 1 < values.length && values[i + 1].trim() === '') {
          i++;
        }
      } else if (!inQuotes && char.trim()) {
        currentValue += char;
      }
    }
    
    // Add last value
    if (currentValue.trim()) {
      const trimmed = currentValue.trim();
      if (trimmed === 'NOW()') {
        parsedValues.push(new Date().toISOString());
      } else if (trimmed === 'true' || trimmed === 'false') {
        parsedValues.push(trimmed === 'true');
      } else if (!isNaN(trimmed)) {
        parsedValues.push(parseInt(trimmed) || parseFloat(trimmed));
      } else {
        parsedValues.push(trimmed);
      }
    }
    
    // Map to article object (order: slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at)
    if (parsedValues.length >= 11) {
      articles.push({
        slug: parsedValues[0],
        language: parsedValues[1],
        title: parsedValues[2],
        excerpt: parsedValues[3],
        content: parsedValues[4],
        content_format: parsedValues[5] || 'html',
        author: parsedValues[6] || 'Bolivia Blue con Paz',
        category: parsedValues[7],
        featured: parsedValues[8] || false,
        read_time: parsedValues[9] || null,
        published_at: parsedValues[10] || new Date().toISOString()
      });
    }
  }
  
  return articles;
}

// Better approach: Read the SQL and extract using regex more carefully
async function addArticlesFromSQL(filePath) {
  console.log(`\n📄 Reading ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split by INSERT statements
  const insertStatements = content.split(/INSERT INTO blog_articles/).filter(s => s.trim());
  
  for (const statement of insertStatements) {
    // Extract values more carefully
    const valuesMatch = statement.match(/VALUES\s*\(([\s\S]+?)\)\s*ON CONFLICT/);
    if (!valuesMatch) continue;
    
    const valuesStr = valuesMatch[1];
    
    // Parse values - handle multi-line strings
    const values = [];
    let current = '';
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];
      
      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        current += char;
        continue;
      }
      
      if (char === "'" && !escapeNext) {
        if (inString && valuesStr[i + 1] === "'") {
          // Escaped quote
          current += "''";
          i++; // Skip next quote
          continue;
        }
        inString = !inString;
        if (!inString) {
          // End of string
          values.push(current);
          current = '';
          // Skip to next value
          while (i + 1 < valuesStr.length && (valuesStr[i + 1] === ',' || valuesStr[i + 1].trim() === '' || valuesStr[i + 1] === '\n')) {
            i++;
          }
        }
        continue;
      }
      
      if (inString) {
        current += char;
      } else if (char === ',' && current.trim()) {
        // End of non-string value
        const trimmed = current.trim();
        if (trimmed === 'NOW()') {
          values.push(new Date().toISOString());
        } else if (trimmed === 'true') {
          values.push(true);
        } else if (trimmed === 'false') {
          values.push(false);
        } else if (!isNaN(trimmed)) {
          values.push(parseInt(trimmed) || parseFloat(trimmed));
        } else {
          values.push(trimmed);
        }
        current = '';
        // Skip whitespace
        while (i + 1 < valuesStr.length && (valuesStr[i + 1] === ' ' || valuesStr[i + 1] === '\n' || valuesStr[i + 1] === '\t')) {
          i++;
        }
      } else if (char.trim()) {
        current += char;
      }
    }
    
    // Add last value
    if (current.trim()) {
      const trimmed = current.trim();
      if (trimmed === 'NOW()') {
        values.push(new Date().toISOString());
      } else if (trimmed === 'true') {
        values.push(true);
      } else if (trimmed === 'false') {
        values.push(false);
      } else if (!isNaN(trimmed)) {
        values.push(parseInt(trimmed) || parseFloat(trimmed));
      } else {
        values.push(trimmed);
      }
    }
    
    // Map to article (order: slug, language, title, excerpt, content, content_format, author, category, featured, read_time, published_at)
    if (values.length >= 11) {
      const article = {
        slug: values[0],
        language: values[1],
        title: values[2],
        excerpt: values[3],
        content: values[4],
        content_format: values[5] || 'html',
        author: values[6] || 'Bolivia Blue con Paz',
        category: values[7],
        featured: values[8] !== undefined ? values[8] : false,
        read_time: values[9] || null,
        published_at: values[10] || new Date().toISOString()
      };
      
      console.log(`\n📝 Adding article: ${article.title} (${article.language})`);
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('blog_articles')
        .upsert(article, {
          onConflict: 'slug,language',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error(`❌ Error adding article:`, error.message);
      } else {
        console.log(`✅ Successfully added: ${article.title}`);
      }
    } else {
      console.warn(`⚠️  Skipping article - not enough values (${values.length})`);
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Adding blog articles to Supabase...\n');
  
  const files = [
    path.join(__dirname, 'supabase-airtm-guide-article.sql'),
    path.join(__dirname, 'supabase-reddit-bolivia-blue-article.sql')
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      await addArticlesFromSQL(file);
    } else {
      console.warn(`⚠️  File not found: ${file}`);
    }
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);

