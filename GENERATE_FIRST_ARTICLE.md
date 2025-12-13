# 📝 Generate Your First Daily Article

## The Problem

The daily article generator hasn't run yet, so there are no auto-generated articles in the blog section.

## ✅ Quick Fix: Generate Article Now

### Option 1: Manual Generation (Recommended)

1. **Make sure your backend is running:**
   ```bash
   cd backend
   npm run dev:supabase
   ```

2. **In a new terminal, run the test script:**
   ```bash
   cd backend
   node test-article-generator.js
   ```

   This will:
   - Generate articles for today in both Spanish and English
   - Save them to the `blog_articles` table
   - Show you the results

3. **Check the blog page:**
   - Go to: http://localhost:5173/blog
   - You should now see the daily article!

### Option 2: Wait for Automatic Generation

The scheduler will automatically generate articles:
- **On backend startup** (if not already generated today)
- **Every day at midnight**

If your backend is running, check the logs for:
```
📝 Generating daily articles...
✅ Daily articles generated successfully
```

---

## 🔍 Verify Articles Were Created

### Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **"Table Editor"** → **"blog_articles"**
4. Look for articles with slug like: `analisis-diario-2025-01-XX`

### Check via SQL

Run this query in Supabase SQL Editor:

```sql
SELECT slug, title, language, published_at 
FROM blog_articles 
WHERE slug LIKE 'analisis-diario-%' 
ORDER BY published_at DESC 
LIMIT 10;
```

You should see articles with today's date.

---

## 🐛 Troubleshooting

### "Supabase client not initialized"

**Fix:** Make sure your `backend/.env` has:
```env
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=your_key_here
```

### "No rates found" or "No news found"

**Fix:** The article generator needs:
- At least some rates in the `rates` table
- At least some news in the `news` table

Check if your scheduler is running and collecting data.

### Articles not showing on blog page

**Check:**
1. Open browser console (F12)
2. Look for errors when loading `/blog`
3. Check if `fetchBlogArticles` is being called
4. Verify Supabase connection in frontend

### Backend not running

**Fix:**
```bash
cd backend
npm run dev:supabase
```

Make sure you see:
```
Using Supabase database at https://rhwuncdxjlzmsgiprdkz.supabase.co
```

---

## 📋 Expected Article Format

Daily articles will have:
- **Slug:** `analisis-diario-YYYY-MM-DD` (e.g., `analisis-diario-2025-01-20`)
- **Title:** "Análisis Diario del Dólar Blue - [Date]" (Spanish) or "Daily Blue Dollar Analysis - [Date]" (English)
- **Category:** "Análisis Diario" or "Daily Analysis"
- **Content:** 1500+ words with rates, news, analysis
- **Language:** Both `es` and `en` versions

---

## ✅ After Generating

Once articles are generated:

1. **Check blog page:** http://localhost:5173/blog
2. **Articles should appear** in the "All Articles" section
3. **Click an article** to view full content
4. **Verify content** includes:
   - Current exchange rates
   - Market analysis
   - News summaries
   - Historical trends

---

## 🚀 Production

In production (Railway/Vercel):

1. **Articles generate automatically** at midnight
2. **Check Railway logs** for generation messages
3. **Verify in Supabase** that articles are being created daily

---

**Once you generate the first article, it will appear in your blog section!** 🎉



