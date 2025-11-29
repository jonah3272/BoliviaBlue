# White Screen Troubleshooting Checklist

Use this checklist to systematically diagnose and fix the mobile white screen issue.

## Phase 1: Initial Diagnosis ⚠️

- [ ] **Test main site:** https://boliviablue.com
  - Works? ✅ / Doesn't work? ❌
  
- [ ] **Test backend directly:** https://boliviablue-production.up.railway.app/api/health
  - Works? ✅ / Doesn't work? ❌
  
- [ ] **Test Vercel preview:** https://bolivia-blue-con-paz.vercel.app
  - Works? ✅ / Doesn't work? ❌

**If NONE work:** Site is completely down → Go to Phase 2
**If SOME work:** DNS/domain issue → Go to Phase 3
**If ALL work on desktop but not mobile:** Mobile-specific issue → Go to Phase 4

---

## Phase 2: Check Deployment Services 🔍

### Vercel Check
- [ ] Go to https://vercel.com/dashboard
- [ ] Find "Bolivia Blue" project
- [ ] Check latest deployment status:
  - [ ] ✅ Green checkmark (Success)
  - [ ] ❌ Red X (Failed) → Click to view build logs
  - [ ] ⚠️ Warning (Partial success)

**If build failed:**
- [ ] Read error message in build logs
- [ ] Common issues:
  - [ ] Missing environment variable: `VITE_API_URL`
  - [ ] Build timeout (increase timeout in settings)
  - [ ] Out of memory (simplify build or upgrade plan)
  - [ ] Node version mismatch

### Railway Check
- [ ] Go to https://railway.app/dashboard
- [ ] Find "Bolivia Blue" service
- [ ] Check service status:
  - [ ] 🟢 Running (Healthy)
  - [ ] 🟡 Starting (Restarting)
  - [ ] 🔴 Crashed (Down)

**If service crashed:**
- [ ] Click service → View Logs (last 50 lines)
- [ ] Common issues:
  - [ ] Missing `SUPABASE_URL` or `SUPABASE_ANON_KEY`
  - [ ] Database connection error
  - [ ] Port binding error
  - [ ] Out of memory

### Environment Variables Check

**Vercel:**
- [ ] `VITE_API_URL` is set to: `https://boliviablue-production.up.railway.app`

**Railway:**
- [ ] `PORT` = `3000`
- [ ] `ORIGIN` = `https://boliviablue.com` or `https://bolivia-blue-con-paz.vercel.app`
- [ ] `SUPABASE_URL` = `https://rhwuncdxjlzmsgiprdkz.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = (long JWT token)
- [ ] `BLUE_SAMPLE_SIZE` = `20`
- [ ] `NEWS_SOURCES` = (RSS feed URLs)

---

## Phase 3: DNS/Domain Issues 🌐

- [ ] Check domain registrar (where you bought boliviablue.com)
- [ ] Verify DNS records:
  - [ ] A record or CNAME pointing to Vercel
  - [ ] TTL (Time To Live) reasonable (300-3600 seconds)
  
- [ ] Check Vercel domain settings:
  - [ ] Domain added to project
  - [ ] SSL certificate issued
  - [ ] Domain status: Active

**Test DNS:**
```bash
nslookup boliviablue.com
# Should return Vercel's IP addresses
```

---

## Phase 4: Mobile-Specific Issues 📱

### If site works on desktop but not mobile:

- [ ] **Clear mobile cache:**
  - iPhone: Settings → Safari → Clear History and Website Data
  - Android Chrome: Settings → Privacy → Clear browsing data
  
- [ ] **Test in private/incognito mode** (rules out cache)

- [ ] **Try different mobile browsers:**
  - [ ] Safari (iOS)
  - [ ] Chrome (iOS/Android)
  - [ ] Firefox (iOS/Android)

- [ ] **Test on different networks:**
  - [ ] WiFi
  - [ ] Mobile data (4G/5G)

- [ ] **Check mobile browser console** (if possible):
  - Safari iOS: Settings → Safari → Advanced → Web Inspector
  - Chrome Android: Connect to desktop Chrome DevTools

---

## Phase 5: Deploy Fixes & Test 🚀

### Deploy Error Handling Updates

- [ ] Open terminal in project directory
- [ ] Run:
  ```bash
  cd "C:\Users\jonah\OneDrive\Documents\GitHub\Bolivia Blue Con Paz"
  git add .
  git commit -m "Add mobile error handling and diagnostics"
  git push origin main
  ```

- [ ] Wait for Vercel to rebuild (2-5 minutes)
- [ ] Check Vercel dashboard shows ✅ success

### Test Diagnostic Page

- [ ] Visit: https://boliviablue.com/test.html
- [ ] Check all tests pass:
  - [ ] Device info detected correctly
  - [ ] Backend API: ✅ OK
  - [ ] Blue Rate: ✅ Shows rate
  - [ ] Browser features: ✅ Available

**If test page shows errors:**
- Copy the error messages
- Check which specific test failed
- Address that issue first

### Test Main Application

- [ ] **Clear cache again** (important after deploy!)
- [ ] Visit: https://boliviablue.com
- [ ] Expected result:
  - [ ] ✅ Site loads normally
  - [ ] ✅ Exchange rate displays
  - [ ] ✅ Charts render
  - [ ] ✅ Navigation works

**If still white screen but error boundary is working:**
- You should now see a friendly error message instead of blank white
- Check the error details (in dev mode)
- Report specific error message

---

## Phase 6: Advanced Debugging 🛠️

### If everything above checked out but still issues:

- [ ] **Check Railway logs live:**
  ```bash
  # If you have Railway CLI installed
  railway logs
  ```

- [ ] **Test API endpoints manually:**
  ```bash
  curl https://boliviablue-production.up.railway.app/api/health
  curl https://boliviablue-production.up.railway.app/api/blue-rate
  ```

- [ ] **Check Supabase:**
  - [ ] Go to Supabase dashboard
  - [ ] Verify database is active
  - [ ] Check if tables exist: `rates`, `news`
  - [ ] Try manual query: `SELECT COUNT(*) FROM rates;`

- [ ] **Check for CORS issues:**
  - Open browser DevTools → Network tab
  - Look for red CORS errors
  - Verify Railway `ORIGIN` env var matches Vercel URL

### Enable Mobile Debug Console (Temporary)

If you need to see errors on mobile, add this to `frontend/index.html` before `</body>`:

```html
<!-- TEMPORARY: Remove after debugging -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

This will add a mobile debugging console you can access by tapping the icon.

---

## Final Checklist ✅

Before marking as "RESOLVED":

- [ ] Vercel deployment: ✅ Success
- [ ] Railway service: 🟢 Running
- [ ] Backend health endpoint responds: ✅
- [ ] Test page works: ✅
- [ ] Main site loads on desktop: ✅
- [ ] Main site loads on mobile: ✅
- [ ] Main site loads in mobile incognito: ✅
- [ ] Exchange rates display correctly: ✅
- [ ] Charts render properly: ✅
- [ ] No console errors: ✅

---

## 📝 Notes & Observations

Use this space to write down what you find:

**Vercel Status:**


**Railway Status:**


**Error Messages:**


**What Fixed It:**


**Date Resolved:**


---

**Need Help?** If stuck after going through this checklist, provide:
1. Which phase you're stuck on
2. Vercel deployment status (success/failed)
3. Railway service status (running/crashed)
4. Any error messages from logs or test page

