# Frontend Deployment Check

## 🚨 "Application failed to respond" Errors

If you're seeing "Application failed to respond" errors, the frontend might not be using the latest code with relative URLs.

## Quick Fix: Force Vercel Redeploy

### Step 1: Verify Code is Pushed

Make sure all changes are pushed to GitHub:

```bash
git status
git push origin main
```

### Step 2: Check Vercel Deployment

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **BoliviaBlue** project
3. Check **"Deployments"** tab
4. Look for the latest deployment:
   - ✅ **Green checkmark** = Deployed successfully
   - ⏳ **In progress** = Still deploying (wait)
   - ❌ **Red X** = Failed (check logs)

### Step 3: Force Redeploy (if needed)

If the latest deployment is old or failed:

1. Vercel Dashboard → Your project → **"Deployments"**
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**
4. Wait 2-3 minutes for deployment to complete

### Step 4: Clear Browser Cache

After redeploy, clear your browser cache:

1. **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
2. **Or**: Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Step 5: Test

After redeploy and cache clear:

1. Open browser console (F12)
2. Go to **Network** tab
3. Try to send a message
4. Check what URL the request goes to:
   - ✅ Should be: `https://www.boliviablue.com/api/chat/messages` (relative)
   - ❌ Should NOT be: `https://boliviablue-production.up.railway.app/api/chat/messages` (direct)

## Verify Frontend is Using Relative URLs

### Check Browser Console

Open browser console and run:

```javascript
// Should show empty string or same origin
console.log('API_BASE:', window.location.origin);
```

### Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try to send a message
3. Look at the request URL:
   - ✅ **Correct**: `www.boliviablue.com/api/chat/messages`
   - ❌ **Wrong**: `boliviablue-production.up.railway.app/api/chat/messages`

If it's using the Railway URL directly, the frontend hasn't been redeployed with the new code.

## Verify Vercel Proxy is Working

Test if Vercel proxy is forwarding requests:

```bash
# This should return Railway backend response
curl https://www.boliviablue.com/api/health
```

**Expected response:**
```json
{"ok":true,"updated_at_iso":"..."}
```

If this fails, Vercel proxy isn't working. Check `vercel.json` configuration.

## Common Issues

### Issue 1: Frontend Not Redeployed

**Symptom:** Still using Railway URL directly

**Fix:** Force Vercel redeploy (see Step 3 above)

### Issue 2: Vercel Proxy Not Working

**Symptom:** Requests to `www.boliviablue.com/api/*` return 502

**Fix:**
1. Check `vercel.json` has correct rewrite rule
2. Verify Railway URL is correct
3. Check Railway is actually running

### Issue 3: Browser Cache

**Symptom:** Old JavaScript code still running

**Fix:** Clear browser cache (see Step 4 above)

### Issue 4: VITE_API_URL Still Set

**Symptom:** Frontend using Railway URL even after redeploy

**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Find `VITE_API_URL`
3. **Delete it** or set to empty string
4. Redeploy

## Testing Checklist

- [ ] Code is pushed to GitHub
- [ ] Vercel deployment is successful (green checkmark)
- [ ] Latest deployment is recent (within last hour)
- [ ] Browser cache cleared
- [ ] Network tab shows relative URLs (`www.boliviablue.com/api/*`)
- [ ] Direct Railway URL works: `curl https://boliviablue-production.up.railway.app/api/health`
- [ ] Vercel proxy works: `curl https://www.boliviablue.com/api/health`
- [ ] No `VITE_API_URL` in Vercel environment variables

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → Latest → Functions tab
   - Look for proxy errors

2. **Check Railway Logs:**
   - Railway Dashboard → Your service → View Logs
   - Look for incoming requests

3. **Test Direct Railway:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/health
   ```
   If this fails, Railway is the issue, not Vercel.
