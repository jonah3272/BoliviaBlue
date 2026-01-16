# Immediate 502 Fix - Step by Step

## 🚨 You're Getting 502 Errors

This means **Vercel proxy can't reach Railway**. Here's how to fix it RIGHT NOW:

## Step 1: Check Railway Status (30 seconds)

1. Go to: https://railway.app/dashboard
2. Click your **BoliviaBlue** project
3. Look at the service status:
   - 🟢 **Green** = Running (go to Step 2)
   - 🟡 **Yellow** = Starting (wait 2 minutes, then check again)
   - 🔴 **Red** = Crashed (click "Restart" button)

## Step 2: Test Railway Directly (30 seconds)

Open this URL in your browser:
```
https://boliviablue-production.up.railway.app/api/health
```

**What you should see:**
- ✅ `{"ok":true,...}` = Railway is working
- ❌ Error page / timeout = Railway is down

**If Railway is down:**
1. Railway Dashboard → Your service
2. Click **"Restart"** or **"Redeploy"**
3. Wait 2-3 minutes
4. Test the URL again

## Step 3: Check Railway Logs (1 minute)

1. Railway Dashboard → Your service → **"View Logs"**
2. Scroll to the bottom
3. Look for:
   - ❌ **Red error messages**
   - ⚠️ **"Failed to connect"** messages
   - 🔄 **"Server starting..."** (means it's restarting)

**Common errors:**
- `SUPABASE_URL is not defined` → Add environment variable
- `Port 3000 already in use` → Restart service
- `Cannot find module` → Service needs redeploy

## Step 4: Verify vercel.json (30 seconds)

Check that `vercel.json` has the correct Railway URL:

```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://boliviablue-production.up.railway.app/api/:path*"
  }]
}
```

**Verify:**
- URL matches your actual Railway service URL
- No typos
- No extra characters

## Step 5: Force Vercel Redeploy (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your **BoliviaBlue** project
3. Click **"Deployments"** tab
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**
6. Wait 2-3 minutes for deployment

## Step 6: Test Again

After redeploy, test in browser:

1. Open: https://www.boliviablue.com
2. Open DevTools (F12) → **Network** tab
3. Try to send a message
4. Check if 502 error is gone

## Alternative: Use Railway Custom Domain

If Vercel proxy keeps failing, use Railway custom domain directly:

### Option A: Set Up Custom Domain (5 minutes)

1. **Railway Dashboard** → Your service → **Settings**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter: `api.boliviablue.com`
5. Copy DNS records Railway provides
6. Add DNS records to your domain provider
7. Wait 5-30 minutes for DNS propagation

### Option B: Update Frontend to Use Custom Domain

Once custom domain is set up:

1. **Vercel Dashboard** → Settings → Environment Variables
2. Add: `VITE_API_URL=https://api.boliviablue.com`
3. **Remove** the rewrite from `vercel.json` (or keep it as fallback)
4. Redeploy Vercel

This bypasses Vercel proxy entirely.

## Quick Test Commands

Test these in your browser console (F12):

```javascript
// Test 1: Railway direct
fetch('https://boliviablue-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 2: Vercel proxy
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected:**
- Test 1 should work if Railway is up
- Test 2 should work if Vercel proxy is working

## Most Common Fix

**90% of the time, the fix is:**

1. Railway service crashed → **Restart it**
2. Railway is restarting → **Wait 2-3 minutes**
3. Missing environment variables → **Add them in Railway**

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check Railway URL is correct:**
   - Railway Dashboard → Settings → Public Domain
   - Make sure it matches `vercel.json`

2. **Check Vercel integration:**
   - Since you integrated Vercel into Railway
   - Check if integration changed the Railway URL
   - Check if integration created a custom domain

3. **Contact Support:**
   - Railway: If service keeps crashing
   - Vercel: If proxy consistently fails

## What to Check Right Now

1. ✅ Railway service status (green/yellow/red)
2. ✅ Railway health endpoint works directly
3. ✅ Railway logs show no errors
4. ✅ `vercel.json` has correct URL
5. ✅ Vercel has been redeployed

Start with Step 1 - check if Railway is actually running!
