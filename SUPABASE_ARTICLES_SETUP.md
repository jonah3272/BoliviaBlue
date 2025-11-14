# 📝 Adding Blog Articles to Supabase

## ✅ **Articles Ready**

Two comprehensive articles have been created:

1. **Airtm Guide** - For foreigners sending money to Bolivia
   - Spanish: `guia-airtm-enviar-dinero-bolivia-extranjeros`
   - English: `airtm-guide-send-money-bolivia-foreigners`

2. **Reddit Article** - Targeting "bolivia blue reddit" searches
   - Spanish: `bolivia-blue-rate-reddit-discusiones-comunidad`
   - English: `bolivia-blue-rate-reddit-discussions-community`

## 🚀 **How to Add to Supabase**

### Option 1: SQL Editor (Recommended - Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of:
   - `backend/supabase-airtm-guide-article.sql`
   - `backend/supabase-reddit-bolivia-blue-article.sql`
4. Run each SQL script
5. Verify articles appear in `blog_articles` table

### Option 2: Using MCP Server (If Available)

If you have an MCP server configured for Supabase, you can use it to execute the SQL files directly.

### Option 3: Manual Insert via Dashboard

1. Go to **Table Editor** → `blog_articles`
2. Click **Insert row**
3. Fill in fields manually using the SQL files as reference

## ✅ **Verification**

After adding, verify:
- Articles appear at `/blog`
- Spanish articles accessible at `/blog/[spanish-slug]`
- English articles accessible at `/blog/[english-slug]`
- Social share buttons work
- Referral links are correct

## 📋 **Article Details**

### Airtm Guide
- **Category**: Guía / Guide
- **Featured**: Yes
- **Read Time**: 12 minutes
- **Target**: Foreigners wanting to send money to Bolivia

### Reddit Article
- **Category**: Análisis / Analysis
- **Featured**: Yes
- **Read Time**: 8 minutes
- **Target**: People searching "bolivia blue reddit"

---

**Note**: Both articles include internal links, referral links, and are optimized for SEO!

