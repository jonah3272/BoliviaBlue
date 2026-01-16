# Check Vercel Environment Variables - Fix Direct Railway Calls

## 🚨 Problem

Your console shows requests going directly to `https://boliviablue-production.up.railway.app` instead of using relative URLs (Vercel proxy).

This means `VITE_API_URL` is probably set in Vercel to the Railway URL.

## ✅ Fix: Remove VITE_API_URL from Vercel

### Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click your **BoliviaBlue** project
3. Go to **Settings** → **Environment Variables**
4. Look for: `VITE_API_URL`
5. **If it exists and is set to Railway URL** → **DELETE IT**

### Step 2: Verify It's Removed

After deleting:
- The variable should NOT appear in the list
- If it does appear, make sure it's empty or deleted

### Step 3: Redeploy

1. Vercel should auto-redeploy when you delete env vars
2. If not, go to **Deployments** → Click **"..."** on latest → **Redeploy**

### Step 4: Test

After redeploy:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Open Console** (F12)
4. **Look for:** `[Chat API] Using API_BASE: (relative - Vercel proxy)`
5. **Try sending a message**

## Expected Behavior

**Before (with VITE_API_URL set):**
- Console shows: `[Chat API] Using API_BASE: https://boliviablue-production.up.railway.app`
- Requests go directly to Railway → CORS errors

**After (VITE_API_URL removed):**
- Console shows: `[Chat API] Using API_BASE: (relative - Vercel proxy)`
- Requests go to `www.boliviablue.com/api/...` → Vercel proxies to Railway → No CORS

## Alternative: If You Want to Use Railway Custom Domain

If you set up `api.boliviablue.com` (Railway custom domain), then:

1. **Set VITE_API_URL** to: `https://api.boliviablue.com`
2. This bypasses Vercel proxy entirely
3. Make sure backend CORS allows `https://www.boliviablue.com`

But for now, **remove VITE_API_URL** to use the Vercel proxy approach.
