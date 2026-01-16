# Vercel + Railway Integration Guide

## ✅ You've Integrated Vercel into Railway!

This integration can help solve the CORS/proxy issues. Here's what to check:

## What This Integration Means

When you integrate Vercel into Railway, you typically:
1. **Connect the services** so they can communicate
2. **Set up environment variables** automatically
3. **Enable better proxy/routing** between services

## Next Steps

### Step 1: Check Railway Custom Domain

If Railway integration created a custom domain:

1. **Railway Dashboard** → Your service → **Settings**
2. Check **"Custom Domain"** or **"Public Domain"**
3. Note the domain (e.g., `api.boliviablue.com` or similar)

### Step 2: Update vercel.json (if custom domain exists)

If Railway has a custom domain, update `vercel.json`:

```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://YOUR_RAILWAY_CUSTOM_DOMAIN/api/:path*"
  }]
}
```

**OR** if Railway integration provides a different URL, use that.

### Step 3: Verify Environment Variables

Check if the integration auto-set environment variables:

**Vercel Dashboard → Settings → Environment Variables:**
- Check if `VITE_API_URL` was auto-added
- If it was, you might need to remove it (we're using relative URLs)

**Railway Dashboard → Variables:**
- Check if any Vercel-related variables were added
- Verify `ORIGIN` is set to `https://www.boliviablue.com`

### Step 4: Test the Integration

After integration, test:

1. **Test Railway directly:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/health
   ```

2. **Test through Vercel proxy:**
   ```bash
   curl https://www.boliviablue.com/api/health
   ```

3. **Check browser console:**
   - Open DevTools → Network tab
   - Try sending a message
   - Verify requests go to `www.boliviablue.com/api/*` (not Railway directly)

## Integration Benefits

✅ **Better communication** between Vercel and Railway
✅ **Automatic environment variable sync** (sometimes)
✅ **Improved proxy/routing** (sometimes)
✅ **Easier deployment coordination**

## Troubleshooting

### If Integration Broke Something

1. **Check Railway logs** for connection errors
2. **Check Vercel logs** for proxy errors
3. **Verify both services are running**
4. **Test direct Railway URL** to confirm it's still working

### If Still Getting 502 Errors

1. **Railway Dashboard** → Check service status (should be green)
2. **Vercel Dashboard** → Check latest deployment (should be successful)
3. **Test Railway directly** - if it works, issue is with Vercel proxy
4. **Check vercel.json** - make sure Railway URL is correct

### If Still Getting CORS Errors

1. **Verify frontend is using relative URLs** (check Network tab)
2. **Check Vercel proxy is working** (test `/api/health` endpoint)
3. **Remove `VITE_API_URL`** from Vercel environment variables
4. **Clear browser cache** and hard refresh

## Current Configuration Status

### ✅ What Should Work Now

- Frontend uses relative URLs (`/api/chat/messages`)
- Vercel proxy forwards to Railway
- No CORS needed (same-origin requests)
- Railway integration improves communication

### ⚠️ What to Verify

- Railway custom domain (if created)
- `vercel.json` has correct Railway URL
- No `VITE_API_URL` in Vercel env vars
- Both services are running and healthy

## Quick Test

After integration, test in browser console:

```javascript
// Should work without CORS errors
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected:** `{ok: true, ...}`

**If error:** Check Railway is running and Vercel proxy is configured correctly.
