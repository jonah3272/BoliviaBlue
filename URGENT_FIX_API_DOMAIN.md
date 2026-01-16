# URGENT: Fix API Domain Configuration

## 🚨 Current Problem

Your frontend is trying to call `https://api.boliviablue.com/api/chat/messages` but getting `ERR_NAME_NOT_RESOLVED` because:
- `api.boliviablue.com` DNS doesn't exist (not configured in Railway)
- `VITE_API_URL` is set to `https://api.boliviablue.com` in Vercel

## ✅ Solution: Remove VITE_API_URL (Use Vercel Proxy)

### Step 1: Delete VITE_API_URL from Vercel

1. **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL`
3. **DELETE IT** (or set it to empty)
4. Make sure it's completely removed from the list

### Step 2: Verify It's Gone

- The variable should NOT appear in the environment variables list
- If it still appears, click it and delete it

### Step 3: Redeploy

1. Vercel should auto-redeploy
2. If not: **Deployments** → Click **"..."** → **Redeploy**

### Step 4: Clear Browser Cache

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear cache: Ctrl+Shift+Delete → Clear cached images and files

### Step 5: Test

After redeploy:
1. Open **Console** (F12)
2. Look for: `[Chat API] Using API_BASE: (relative - Vercel proxy)`
3. Try sending a message
4. **Network tab** should show requests to `www.boliviablue.com/api/...` (NOT `api.boliviablue.com`)

## Expected Result

**Before (with VITE_API_URL set):**
- Console: `[Chat API] Using API_BASE: https://api.boliviablue.com`
- Requests: `https://api.boliviablue.com/api/...` → `ERR_NAME_NOT_RESOLVED`

**After (VITE_API_URL removed):**
- Console: `[Chat API] Using API_BASE: (relative - Vercel proxy)`
- Requests: `www.boliviablue.com/api/...` → Vercel proxies to Railway → Should work

## Alternative: If You Want to Use api.boliviablue.com

If you want to use the custom domain approach (bypasses Vercel):

1. **First, set up Railway custom domain:**
   - Railway Dashboard → Your service → Settings → Custom Domain
   - Add: `api.boliviablue.com`
   - Copy DNS records Railway provides
   - Add DNS records to your domain provider
   - Wait 5-30 minutes for DNS propagation

2. **Then, set VITE_API_URL:**
   - Vercel → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://api.boliviablue.com`

3. **Update backend CORS:**
   - Make sure `backend/server.js` allows `https://www.boliviablue.com` in `allowedOrigins`

**But for now, just DELETE VITE_API_URL** to use the simpler Vercel proxy approach.
