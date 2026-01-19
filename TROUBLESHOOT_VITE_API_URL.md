# Troubleshoot VITE_API_URL Not Working

## 🚨 Problem

Frontend is still using `www.boliviablue.com/api/...` instead of `api.boliviablue.com`, which means `VITE_API_URL` isn't being used.

## ✅ Step-by-Step Fix

### Step 1: Verify Environment Variable Name

**Vercel Dashboard** → Settings → Environment Variables

**Check:**
- Variable name is exactly: `VITE_API_URL` (not `VITE_API_UR1` or anything else)
- Value is exactly: `https://api.boliviablue.com` (no trailing slash)
- Environment is: **Production** (or **All**)

**Common mistakes:**
- ❌ `VITE_API_UR1` (typo - has "1" instead of "L")
- ❌ `VITE_API_URL_` (extra underscore)
- ❌ `API_URL` (missing `VITE_` prefix)
- ❌ Value has trailing slash: `https://api.boliviablue.com/`

### Step 2: Force Vercel Redeploy

**Vercel Dashboard** → Deployments → Latest → "..." → **Redeploy**

**OR trigger via git:**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with VITE_API_URL"
git push origin main
```

**Wait for deployment to complete** (2-5 minutes)

### Step 3: Clear Browser Cache Completely

**Option 1: Hard Refresh**
- Windows: Ctrl+Shift+R
- Mac: Cmd+Shift+R

**Option 2: Clear Cache**
- Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Select "Cached images and files"
- Clear data

**Option 3: Incognito/Private Window**
- Open site in incognito/private window
- This bypasses all cache

### Step 4: Check Console Log

**After clearing cache and redeploy:**

1. Open Console (F12)
2. Look for: `[Chat API] Using API_BASE: ...`

**Expected:**
- ✅ `[Chat API] Using API_BASE: https://api.boliviablue.com`

**If you still see:**
- ❌ `[Chat API] Using API_BASE: (relative - Vercel proxy)` → `VITE_API_URL` not set or not deployed

### Step 5: Verify Build Used Environment Variable

**Vercel Dashboard** → Latest Deployment → **Build Logs**

**Search for:** `VITE_API_URL`

**Should see:**
- Environment variable being used in build
- Or at least no errors about it

## 🔍 Debugging

### Check What Frontend Actually Sees

**In browser console (F12):**
```javascript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);
```

**Expected:**
- `VITE_API_URL: "https://api.boliviablue.com"`

**If undefined:**
- Environment variable not set correctly
- Or not set for Production environment
- Or Vercel hasn't redeployed yet

### Check Network Tab

**DevTools** → **Network** tab → Try sending a message

**Look at request URL:**
- ✅ Should be: `https://api.boliviablue.com/api/chat/messages`
- ❌ If still: `https://www.boliviablue.com/api/chat/messages` → Frontend not using env var

## 🎯 Most Common Issues

### Issue 1: Variable Name Typo
- **Symptom:** Console shows relative URLs
- **Fix:** Delete old variable, create new one with exact name `VITE_API_URL`

### Issue 2: Not Set for Production
- **Symptom:** Works in Preview but not Production
- **Fix:** Make sure environment is set to **Production** or **All**

### Issue 3: Vercel Not Redeployed
- **Symptom:** Variable is set but frontend still uses old code
- **Fix:** Force redeploy (Step 2)

### Issue 4: Browser Cache
- **Symptom:** Variable is set, redeployed, but still doesn't work
- **Fix:** Clear cache completely (Step 3)

## ✅ Quick Test

After fixing, test in console:
```javascript
fetch('https://api.boliviablue.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Railway custom domain works!', d))
  .catch(e => console.error('❌ Failed:', e));
```

If this works but frontend still uses relative URLs → Environment variable issue
