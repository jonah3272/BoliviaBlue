# Supabase Blog Articles Setup Guide

## Overview

Blog articles are now stored in Supabase instead of local files. This provides:
- ✅ **Cloud storage** - Articles stored in PostgreSQL
- ✅ **Unique IDs** - Each article has a UUID
- ✅ **Rich formatting** - HTML or Markdown content support
- ✅ **Easy management** - Add/edit articles via Supabase dashboard
- ✅ **Multi-language** - Support for Spanish and English

## Step 1: Create the Table in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the sidebar
4. Copy and paste the contents of `backend/supabase-blog-articles.sql`
5. Click **"Run"** to execute the SQL

This will create:
- `blog_articles` table with all necessary columns
- Indexes for performance
- Row Level Security (RLS) policies for public read access
- Automatic `updated_at` timestamp trigger

## Step 2: Add Your First Article

### Via Supabase Dashboard:

1. Go to **"Table Editor"** in Supabase
2. Select the `blog_articles` table
3. Click **"Insert row"**
4. Fill in the fields:

**Required Fields:**
- `slug`: Unique URL-friendly identifier (e.g., "guia-comprar-dolares-binance-p2p")
- `language`: Either "es" or "en"
- `title`: Article title
- `excerpt`: Short description (used in listings)
- `content`: Full article content (HTML or Markdown)
- `content_format`: "html" or "markdown" (default: "html")
- `author`: Author name (default: "Bolivia Blue con Paz")
- `category`: Article category (e.g., "Guía", "Análisis", "Noticias")

**Optional Fields:**
- `featured`: true/false (for featured articles)
- `read_time`: Reading time in minutes (e.g., 5)
- `published_at`: Publication date (defaults to now)

### Example Article (Spanish):

```json
{
  "slug": "guia-comprar-dolares-binance-p2p",
  "language": "es",
  "title": "Guía Completa: Cómo Comprar Dólares en Binance P2P",
  "excerpt": "Aprende paso a paso cómo comprar dólares usando Binance P2P en Bolivia de forma segura y eficiente.",
  "content": "<h2>Introducción</h2><p>Binance P2P es una plataforma...</p>",
  "content_format": "html",
  "author": "Bolivia Blue con Paz",
  "category": "Guía",
  "featured": true,
  "read_time": 8
}
```

## Step 3: Content Formatting

### HTML Format (Recommended)

Use HTML tags for rich formatting:

```html
<h2>Sección Principal</h2>
<p>Párrafo con <strong>texto en negrita</strong> y <em>cursiva</em>.</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<blockquote>Una cita importante</blockquote>
<a href="https://example.com">Enlace</a>
```

### Markdown Format

If you prefer Markdown, set `content_format` to "markdown":

```markdown
## Sección Principal

Párrafo con **texto en negrita** y *cursiva*.

- Item 1
- Item 2

> Una cita importante

[Enlace](https://example.com)
```

## Step 4: Frontend Configuration

Make sure your frontend has Supabase credentials in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Blog page will automatically:
- Fetch articles from Supabase
- Fall back to local articles if Supabase is unavailable
- Display articles with proper formatting
- Support both HTML and Markdown content

## Step 5: Verify It Works

1. Start your frontend: `npm run dev` (in frontend folder)
2. Navigate to `/blog`
3. You should see articles loaded from Supabase
4. Click on an article to view the full content with formatting

## Content Formatting Tips

The blog uses Tailwind's `prose` classes for beautiful typography:

- **Headings**: Automatically styled (h1, h2, h3, etc.)
- **Paragraphs**: Proper spacing and line height
- **Lists**: Styled bullet points and numbered lists
- **Links**: Blue color with hover underline
- **Blockquotes**: Left border with background color
- **Code**: Syntax highlighting ready
- **Images**: Rounded corners with shadow
- **Dark mode**: All styles adapt automatically

## Migration from Local Files

If you have existing articles in `frontend/src/data/blogArticles.js`:

1. Export them to Supabase using the format above
2. Each article needs a unique `slug`
3. Set `language` to "es" or "en"
4. Convert content to HTML if needed
5. Set `featured: true` for articles you want to highlight

## Troubleshooting

**Articles not showing?**
- Check Supabase credentials in `.env`
- Verify RLS policies allow public read access
- Check browser console for errors

**Formatting not working?**
- Ensure `content_format` is set correctly
- For HTML, use proper HTML tags
- For Markdown, ensure content is valid Markdown

**Unique ID issues?**
- Supabase automatically generates UUIDs for `id`
- Each article must have a unique `slug` per language
- Use `slug` for URLs, `id` for internal references

