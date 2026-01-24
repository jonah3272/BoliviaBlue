# Built-in Transfer Steps (Simplified)

## ✅ Good News: Built-in Transfer is Easiest!

With Supabase's built-in transfer tool, the project URL and API keys **usually stay the same**, which means **minimal changes needed**!

---

## 📋 Step-by-Step Process

### Step 1: Initiate Transfer

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your current project: `rhwuncdxjlzmsgiprdkz`
3. Go to **Settings** → **General**
4. Look for **"Transfer Project"** or **"Change Organization"**
5. Select your **free account** as the target organization
6. Confirm the transfer

### Step 2: Wait for Transfer (1-2 minutes)

- Transfer happens automatically
- Project URL stays the same: `https://rhwuncdxjlzmsgiprdkz.supabase.co`
- API keys **usually stay the same** ✅

### Step 3: Verify Credentials (Important!)

After transfer completes, check if credentials changed:

1. Go to **Settings** → **API** in the transferred project
2. Check:
   - **Project URL** - Should be same: `https://rhwuncdxjlzmsgiprdkz.supabase.co`
   - **Anon Key** - Compare with your current one
   - **Service Key** - Compare with your current one (if you use it)

### Step 4: Update Environment Variables (Only if changed)

**If credentials stayed the same:** ✅ **No action needed!** Everything will continue working.

**If credentials changed:** Update these locations:

#### Backend (Railway - Production)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Project → **Variables** tab
3. Update:
   - `SUPABASE_URL` (if changed)
   - `SUPABASE_ANON_KEY` (if changed)
   - `SUPABASE_SERVICE_KEY` (if changed and you use it)
4. Railway will auto-redeploy

#### Frontend (Vercel - Production)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Project → **Settings** → **Environment Variables**
3. Update:
   - `VITE_SUPABASE_URL` (if changed)
   - `VITE_SUPABASE_ANON_KEY` (if changed)
4. **Redeploy manually:**
   - Go to **Deployments**
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

### Step 5: Test Everything

After transfer (and any updates), verify:

1. **Backend Health Check:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/health
   ```
   Should return: `{"ok": true, ...}`

2. **Test API Endpoints:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/blue-rate
   curl https://boliviablue-production.up.railway.app/api/news
   ```

3. **Check Production Website:**
   - Visit your site
   - Verify rates display
   - Verify news loads
   - Check browser console for errors

4. **Verify Data in Supabase:**
   - Go to new Supabase dashboard (in your free account)
   - Check **Table Editor**
   - Verify all tables and data are present

### Step 6: Monitor (24-48 hours)

- [ ] Wait for next scheduler run (15 minutes)
- [ ] Verify new rate records are being inserted
- [ ] Check for any errors in logs
- [ ] Monitor Supabase dashboard for any issues

---

## ⚠️ Important Notes

### What Usually Happens
- ✅ Project URL stays the same
- ✅ API keys stay the same
- ✅ All data transfers automatically
- ✅ No code changes needed
- ✅ **No environment variable updates needed!**

### What to Watch For
- ⚠️ If transfer fails, you'll see an error message
- ⚠️ If credentials change, you'll need to update env vars
- ⚠️ Brief downtime (1-2 minutes) during transfer

### If Something Goes Wrong
- Check Supabase dashboard for error messages
- Verify you're logged into the correct account
- Check that target account has space (free tier allows 2 projects)
- Contact Supabase support if needed

---

## ✅ Quick Checklist

- [ ] Initiate transfer in Supabase Dashboard
- [ ] Wait 1-2 minutes for transfer to complete
- [ ] Verify credentials (check if they changed)
- [ ] Update environment variables **only if credentials changed**
- [ ] Test backend API endpoints
- [ ] Test production website
- [ ] Verify data in Supabase dashboard
- [ ] Monitor for 24-48 hours

---

## 🎯 Expected Outcome

**Most likely scenario:** Transfer completes, credentials stay the same, **no updates needed**, everything continues working! ✅

**Less likely scenario:** Credentials change, you update env vars in Railway/Vercel, redeploy, and everything works! ✅

---

## 🆘 Troubleshooting

### "Transfer not available"
- Check prerequisites (no GitHub integration, etc.)
- Make sure you're owner of source org
- Make sure you're member of target org

### "Credentials changed"
- Just update env vars as shown above
- Redeploy services
- Test everything

### "Data missing after transfer"
- Check Supabase dashboard
- Verify you're looking at the right project
- Contact Supabase support

---

**Good luck! The built-in transfer is usually seamless!** 🚀
