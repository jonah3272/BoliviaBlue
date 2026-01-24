# Supabase Transfer Quick Checklist

## ✅ What You Need to Do

### Step 1: Transfer the Project
- [ ] **Option A:** Use built-in transfer in Supabase Dashboard (Settings → General)
- [ ] **Option B:** Create new project in free account + migrate data (see full guide)

### Step 2: Get New Credentials (if changed)
- [ ] New Project URL: `https://xxxxx.supabase.co`
- [ ] New Anon Key: `eyJhbGc...`
- [ ] New Service Key: `eyJhbGc...` (Settings → API → service_role)

### Step 3: Update Environment Variables

#### Backend (Railway - Production)
- [ ] Go to [Railway Dashboard](https://railway.app/dashboard)
- [ ] Project → Variables tab
- [ ] Update `SUPABASE_URL`
- [ ] Update `SUPABASE_ANON_KEY`
- [ ] Update `SUPABASE_SERVICE_KEY` (if used)
- [ ] Wait for auto-redeploy

#### Frontend (Vercel - Production)
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Project → Settings → Environment Variables
- [ ] Update `VITE_SUPABASE_URL`
- [ ] Update `VITE_SUPABASE_ANON_KEY`
- [ ] Redeploy manually (Deployments → ... → Redeploy)

#### Local Development (Optional)
- [ ] Update `backend/.env`
- [ ] Update `frontend/.env`

### Step 4: Verify Everything Works
- [ ] Test: `curl https://boliviablue-production.up.railway.app/api/health`
- [ ] Check production website loads correctly
- [ ] Verify rates display
- [ ] Verify news loads
- [ ] Check Supabase dashboard shows all data

### Step 5: Monitor
- [ ] Wait 15 minutes for next scheduler run
- [ ] Verify new rate records are being inserted
- [ ] Check for any errors in logs

---

## ⚠️ Important Notes

1. **If using built-in transfer:** URL/keys might stay the same → **No updates needed!**
2. **If creating new project:** URL/keys will definitely change → **Must update all locations**
3. **Backup first:** Export database backup before starting (just in case)
4. **Downtime:** Expect 1-2 minutes (built-in) or 5-10 minutes (new project)

---

## 🆘 Quick Help

**Full guide:** See `SUPABASE_ACCOUNT_TRANSFER_GUIDE.md`

**If transfer fails:** Use Option 2 (create new project + migrate)

**If data missing:** Check backup was restored correctly

**If API errors:** Verify all environment variables are updated
