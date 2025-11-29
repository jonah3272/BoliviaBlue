# 🔧 White Screen Fix - Start Here

Your mobile phone is showing a **white screen** when visiting `boliviablue.com`. This guide will help you fix it quickly.

## 🚨 Quick Diagnosis (2 minutes)

### Step 1: Is the site down completely?

Open these links in **any browser** (desktop or mobile):

1. **Main site:** https://boliviablue.com
2. **Backend health:** https://boliviablue-production.up.railway.app/api/health

**Result:**
- ❌ **Both don't work** → Site is down (deployment issue) → [Go to Fix #1](#fix-1-site-is-completely-down)
- ⚠️ **Main works on desktop, not mobile** → Mobile issue → [Go to Fix #2](#fix-2-mobile-specific-issue)
- ✅ **Both work everywhere** → Cache issue → [Go to Fix #3](#fix-3-cache-issue)

---

## Fix #1: Site is Completely Down

Your deployment services (Vercel or Railway) are not working.

### Check Vercel (Frontend)
1. Go to https://vercel.com/dashboard
2. Find "Bolivia Blue" project
3. Look at the latest deployment:
   - ❌ **Red X** = Build failed
   - ⚠️ **Warning** = Issues
   - ✅ **Green check** = OK (skip to Railway)

**If Vercel failed:**
- Click the failed deployment
- Read the error message
- Common fixes:
  - Missing env var: Add `VITE_API_URL=https://boliviablue-production.up.railway.app`
  - Build timeout: Click "Redeploy" button
  - Out of memory: Simplify build or upgrade plan

### Check Railway (Backend)
1. Go to https://railway.app/dashboard
2. Find "Bolivia Blue" service
3. Check the status indicator:
   - 🔴 **Red/Crashed** = Service is down
   - 🟡 **Yellow/Starting** = Restarting
   - 🟢 **Green/Running** = OK

**If Railway crashed:**
- Click the service → "View Logs"
- Look for red error messages
- Common fixes:
  - Missing Supabase vars: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  - Port error: Set `PORT=3000`
  - Out of memory: Restart service or upgrade plan

### Quick Fix Command

From your computer terminal:

```bash
# Test backend health
node check-backend.js

# If that passes, the problem is in Vercel (frontend)
# If that fails, the problem is in Railway (backend)
```

---

## Fix #2: Mobile-Specific Issue

The site works on desktop but shows white screen on mobile.

### Step 1: Clear Mobile Cache

**iPhone:**
1. Open **Settings**
2. Scroll to **Safari**
3. Tap **Clear History and Website Data**
4. Confirm

**Android Chrome:**
1. Open **Chrome** app
2. Tap **⋮** (three dots)
3. Go to **Settings** → **Privacy**
4. Tap **Clear browsing data**
5. Select "Cached images and files"
6. Tap **Clear data**

### Step 2: Test in Private Mode

This rules out cache/cookie issues:

- **iPhone Safari:** Tap tabs icon → Private
- **Android Chrome:** Tap ⋮ → New incognito tab

Visit: https://boliviablue.com

**Still white?** → Continue to Step 3

### Step 3: Check for JavaScript Errors

I've added error handling that will show friendly error messages instead of white screen.

**Deploy the fixes:**

```bash
cd "C:\Users\jonah\OneDrive\Documents\GitHub\Bolivia Blue Con Paz"
git add .
git commit -m "Add mobile error handling"
git push origin main
```

Wait 3-5 minutes for Vercel to rebuild.

### Step 4: Use Diagnostic Page

After deploying, visit from your phone:

```
https://boliviablue.com/test.html
```

This page will show:
- ✅ Green = Working
- ❌ Red = Problem

If backend test fails → Railway issue (Fix #1)
If browser tests fail → Mobile browser issue

---

## Fix #3: Cache Issue

Everything works but you're seeing old/cached version.

### Clear Everything (Nuclear Option)

**iPhone:**
```
Settings → Safari → Clear History and Website Data
```

Then also:
```
Settings → Safari → Advanced → Website Data → Remove All
```

**Android:**
```
Chrome → Settings → Privacy → Clear browsing data
Select ALL items → Clear data
```

### Force Refresh

- **Desktop:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Mobile:** Clear cache (above) then close browser completely and reopen

---

## 🛠️ Automated Checks

I've created diagnostic tools for you:

### 1. Backend Health Check (Local)

From your computer terminal:

```bash
node check-backend.js
```

This will test all backend endpoints and show exactly what's working/broken.

### 2. Web Diagnostic Page (Mobile)

Visit from your phone: **https://boliviablue.com/test.html**

Shows:
- Device info (screen size, browser, etc.)
- Backend connectivity
- Browser feature support
- Exact error messages

### 3. Error Boundaries (Automatic)

I've added error handling to the React app. Instead of white screen, you'll now see:
- Friendly error message
- "Refresh Page" button
- Error details (in development mode)

---

## 📋 Full Checklist

If you want a systematic approach, see: **WHITE_SCREEN_CHECKLIST.md**

It includes:
- Phase 1: Initial diagnosis
- Phase 2: Check deployment services
- Phase 3: DNS/domain issues
- Phase 4: Mobile-specific debugging
- Phase 5: Deploy fixes & test
- Phase 6: Advanced debugging

---

## 📚 Additional Resources

- **MOBILE_WHITE_SCREEN_FIX.md** - Comprehensive troubleshooting guide (technical)
- **WHITE_SCREEN_FIX_SUMMARY.md** - Executive summary of the issue
- **WHITE_SCREEN_CHECKLIST.md** - Step-by-step checklist

---

## 🆘 Still Stuck?

If none of the above works, I need this information:

### 1. Vercel Status
Go to https://vercel.com/dashboard
- Latest deployment: ✅ Success / ❌ Failed / ⚠️ Warning
- If failed, copy/paste the error message

### 2. Railway Status
Go to https://railway.app/dashboard
- Service status: 🟢 Running / 🔴 Crashed / 🟡 Starting
- If crashed, copy/paste last 20 lines of logs

### 3. Backend Test
From terminal, run: `node check-backend.js`
- Copy/paste the full output

### 4. Mobile Test
Visit from phone: https://boliviablue.com/test.html
- Screenshot the page
- Or copy/paste what each test shows (✅ OK / ❌ Error)

### 5. What You See
- Completely white screen?
- Loading spinner that never stops?
- Error message? (what does it say?)
- Browser console errors? (how to check below)

**Check console on mobile:**
- Safari iOS: Settings → Safari → Advanced → Enable "Web Inspector", then connect to Mac
- Chrome Android: Visit `chrome://inspect` from desktop Chrome while phone is connected via USB

---

## ✅ Success Criteria

The issue is fixed when:

- [x] https://boliviablue.com loads on desktop
- [x] https://boliviablue.com loads on mobile
- [x] Exchange rate displays correctly
- [x] Charts render properly
- [x] Navigation works
- [x] Site loads in mobile private/incognito mode

---

## 🚀 Deploy the Fixes

To deploy the error handling and diagnostic tools I've created:

```bash
# Navigate to project directory
cd "C:\Users\jonah\OneDrive\Documents\GitHub\Bolivia Blue Con Paz"

# Check what changed
git status

# Add all changes
git add frontend/src/main.jsx
git add frontend/public/test.html
git add check-backend.js
git add *.md

# Commit
git commit -m "Add comprehensive mobile white screen diagnostics and fixes"

# Push (triggers Vercel rebuild)
git push origin main
```

**Wait 3-5 minutes** for Vercel to rebuild, then:

1. Clear mobile cache
2. Test: https://boliviablue.com/test.html
3. Test: https://boliviablue.com

---

**Last Updated:** November 29, 2025  
**Priority:** 🔥 HIGH - Site appears down  
**Estimated Fix Time:** 5-30 minutes

