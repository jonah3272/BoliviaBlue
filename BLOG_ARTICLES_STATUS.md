# 📝 Blog Articles Status

## Current Status

### Local Fallback Articles
The local fallback data (`frontend/src/data/blogArticles.js`) contains articles that are used when Supabase is unavailable or empty.

**To check how many articles you have:**
1. If Supabase has articles → Those are shown (can be any number)
2. If Supabase is empty/unavailable → Local fallback articles are shown

### New Articles Created (Need to be Added to Supabase)

We created **2 new comprehensive articles**:

1. **Airtm Guide** (2 versions: Spanish + English)
   - Spanish: `guia-airtm-enviar-dinero-bolivia-extranjeros`
   - English: `airtm-guide-send-money-bolivia-foreigners`
   - **Status**: ✅ SQL files ready, need to add to Supabase

2. **Reddit Article** (2 versions: Spanish + English)
   - Spanish: `bolivia-blue-rate-reddit-discusiones-comunidad`
   - English: `bolivia-blue-rate-reddit-discussions-community`
   - **Status**: ✅ SQL files ready, need to add to Supabase

## Why You're Only Seeing 5 Articles

If you're only seeing 5 articles, it means:
- **Either**: Supabase has 5 articles and those are being displayed
- **Or**: Supabase is empty and the local fallback has 5 articles

## How to Add the New Articles

### Option 1: SQL Editor (Easiest)
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste contents of:
   - `backend/supabase-airtm-guide-article.sql`
   - `backend/supabase-reddit-bolivia-blue-article.sql`
3. Run each script
4. You should then see **7 articles** (5 existing + 2 new)

### Option 2: MCP Server
If you have MCP server access, use it to execute the SQL files.

## Expected Result

After adding the articles, you should have:
- **7 articles total** (if you had 5 before)
- **4 new article pages** (2 articles × 2 languages)
- All articles will be shareable with social buttons
- All articles will appear in the blog list

## Verification

After adding, check:
1. `/blog` - Should show all articles including new ones
2. `/blog/guia-airtm-enviar-dinero-bolivia-extranjeros` (Spanish Airtm)
3. `/blog/airtm-guide-send-money-bolivia-foreigners` (English Airtm)
4. `/blog/bolivia-blue-rate-reddit-discusiones-comunidad` (Spanish Reddit)
5. `/blog/bolivia-blue-rate-reddit-discussions-community` (English Reddit)

---

**Files Ready:**
- `backend/supabase-airtm-guide-article.sql`
- `backend/supabase-reddit-bolivia-blue-article.sql`
- `SUPABASE_ARTICLES_SETUP.md` (detailed instructions)

