# Supabase Account Transfer Guide

## ✅ **Yes, You Can Transfer to Your Free Account!**

Transferring to a free account you own is fine, but you'll need to update environment variables in several places. Here's the complete guide:

---

## 🔄 Two Transfer Options

### Option 1: Built-in Project Transfer (Recommended)
Supabase supports transferring projects between accounts directly.

### Option 2: Create New Project + Migrate Data
Create a new project in your free account and migrate the database.

---

## 📋 Option 1: Built-in Project Transfer

### Prerequisites
- ✅ You must be the owner of the source organization
- ✅ You must be a member of the target organization (your free account)
- ❌ No active GitHub integration
- ❌ No project-scoped roles
- ❌ No log drains configured
- ❌ Target organization cannot be managed by Vercel Marketplace

### Steps

1. **Go to Supabase Dashboard**
   - Current project: `rhwuncdxjlzmsgiprdkz`
   - Go to **Settings** → **General**

2. **Initiate Transfer**
   - Look for **"Transfer Project"** or **"Change Organization"**
   - Select your free account as the target
   - Confirm the transfer

3. **Wait for Transfer**
   - May take 1-2 minutes
   - Project URL will stay the same: `https://rhwuncdxjlzmsgiprdkz.supabase.co`
   - **API keys will remain the same** ✅

4. **Update Environment Variables**
   - If URL/keys change, update all locations (see below)
   - If they stay the same, **no changes needed!** ✅

---

## 📋 Option 2: Create New Project + Migrate Data

If built-in transfer isn't available, create a new project and migrate:

### Step 1: Create New Project in Free Account

1. Log into your **free Supabase account**
2. Click **"New Project"**
3. Choose a name (e.g., "Bolivia Blue")
4. Select a region (same as current if possible)
5. Set password for database
6. Wait for project to be created (~2 minutes)

### Step 2: Get New Project Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (public key)
   - **Service Key** (secret key - Settings → API → service_role)

### Step 3: Export Data from Old Project

#### Method A: Dashboard Backup (Easiest)

1. In **old project** dashboard
2. Go to **Settings** → **Database**
3. Click **"Backup"** or **"Download Backup"**
4. Download the `.backup` file
5. **Note:** This includes all tables and data, but NOT:
   - Edge Functions
   - Auth settings
   - Realtime configuration
   - Database extensions

#### Method B: SQL Export (More Control)

1. In **old project** dashboard
2. Go to **SQL Editor**
3. Run this to export all data:
   ```sql
   -- Export rates
   COPY rates TO STDOUT WITH CSV HEADER;
   
   -- Export news
   COPY news TO STDOUT WITH CSV HEADER;
   
   -- Export other tables...
   ```

### Step 4: Import Data to New Project

#### Method A: Restore Dashboard Backup

1. In **new project** dashboard
2. Go to **Settings** → **Database**
3. Click **"Restore"** or **"Upload Backup"**
4. Upload the `.backup` file from Step 3
5. Wait for restore to complete

#### Method B: SQL Import

1. In **new project** dashboard
2. Go to **SQL Editor**
3. First, create all tables (run your migration files):
   - `backend/supabase-rate-alerts.sql`
   - Any other table creation scripts
4. Then import data using SQL INSERT statements

### Step 5: Recreate Database Objects

After importing data, you may need to recreate:

1. **Indexes** - Check your SQL migration files
2. **RLS Policies** - Recreate Row Level Security policies
3. **Functions** - Any database functions
4. **Triggers** - Any triggers you have

**Check these files for SQL to run:**
- `backend/supabase-rate-alerts.sql`
- `backend/supabase-newsletter.sql`
- `backend/supabase-blog-articles.sql`
- Any other `.sql` files in `backend/`

---

## 🔑 Update Environment Variables

After transfer (or if URL/keys changed), update these locations:

### 1. Backend Local Development

**File:** `backend/.env`

```env
SUPABASE_URL=https://NEW_PROJECT_URL.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_KEY=your-new-service-key
```

### 2. Backend Production (Railway)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your **BoliviaBlue** project
3. Go to **Variables** tab
4. Update:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (if used)

5. **Railway will auto-redeploy** after saving

### 3. Frontend Local Development

**File:** `frontend/.env`

```env
VITE_SUPABASE_URL=https://NEW_PROJECT_URL.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

### 4. Frontend Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **BoliviaBlue** project
3. Go to **Settings** → **Environment Variables**
4. Update:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. **Redeploy** after updating:
   - Go to **Deployments**
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

### 5. Update Example Files (Optional)

Update these for future reference:
- `backend/env.example.txt`
- `frontend/env.config.txt`

---

## ✅ Verification Checklist

After transfer, verify everything works:

### 1. Database Connection
```bash
# Test backend health endpoint
curl https://boliviablue-production.up.railway.app/api/health
```

Should return:
```json
{
  "ok": true,
  "updated_at_iso": "...",
  "history_points": 8081
}
```

### 2. API Endpoints
```bash
# Test rate endpoint
curl https://boliviablue-production.up.railway.app/api/blue-rate

# Test news endpoint
curl https://boliviablue-production.up.railway.app/api/news
```

### 3. Frontend
1. Visit your production site
2. Check browser console for errors
3. Verify:
   - ✅ Rates display correctly
   - ✅ News loads
   - ✅ Charts work
   - ✅ Chat/forum works (if applicable)

### 4. Data Integrity
1. Go to new Supabase dashboard
2. Check **Table Editor**
3. Verify:
   - ✅ `rates` table has ~8,081 records
   - ✅ `news` table has ~3,520 records
   - ✅ Other tables have expected data

### 5. Write Operations
1. Wait for next scheduler run (15 minutes)
2. Check that new rate records are being inserted
3. Verify in Supabase dashboard that new records appear

---

## ⚠️ Important Notes

### Downtime
- **Built-in transfer:** 1-2 minutes downtime
- **New project + migrate:** 5-10 minutes (depending on data size)

### Data Loss Prevention
- ✅ Export backup **before** starting transfer
- ✅ Test new project **before** deleting old one
- ✅ Keep old project for 1-2 weeks as backup

### API Keys
- If using **built-in transfer**, keys usually stay the same
- If creating **new project**, keys will definitely change
- **Update all locations** if keys change

### Billing
- Old account billing stops at end of cycle
- New account (free tier) starts immediately
- No prorated charges

---

## 🚨 Troubleshooting

### Issue: "Project transfer not available"
**Solution:** Use Option 2 (create new project + migrate)

### Issue: "Backup restore failed"
**Solution:** 
- Check backup file size (should be < 1 GB for free tier)
- Try SQL export/import instead
- Contact Supabase support if needed

### Issue: "Environment variables not updating"
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Redeploy services after updating env vars

### Issue: "RLS policies missing"
**Solution:**
- Recreate RLS policies from your SQL files
- Check `backend/supabase-*.sql` files for policy definitions

### Issue: "Data not appearing"
**Solution:**
- Check that backup was restored correctly
- Verify table names match exactly
- Check RLS policies allow reads

---

## 📋 Quick Reference: All Locations to Update

After transfer, update Supabase credentials in:

1. ✅ `backend/.env` (local)
2. ✅ Railway Dashboard → Variables (production backend)
3. ✅ `frontend/.env` (local)
4. ✅ Vercel Dashboard → Environment Variables (production frontend)
5. ⚠️ Any CI/CD pipelines
6. ⚠️ Any other services using Supabase

---

## ✅ Summary

**Yes, transferring to your free account is fine!**

**What you need to do:**
1. Transfer project (built-in) OR create new + migrate
2. Get new credentials (if changed)
3. Update environment variables in 4+ locations
4. Test everything
5. Monitor for 24-48 hours

**Estimated time:** 15-30 minutes

**Risk level:** Low (with proper backup)

---

## 🆘 Need Help?

If you run into issues:
1. Check Supabase dashboard logs
2. Check Railway/Vercel deployment logs
3. Verify all environment variables are updated
4. Test with a simple API call first

Good luck with the transfer! 🚀
