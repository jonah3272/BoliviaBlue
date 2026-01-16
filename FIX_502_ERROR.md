# Fix 502 Bad Gateway Error

## 🚨 Current Issue

You're getting **502 Bad Gateway** errors for:
- `/api/chat/session`
- `/api/chat/messages`

This means **Vercel proxy can't reach Railway backend**.

## 🔍 Quick Diagnosis

### Test 1: Is Railway Actually Running?

```bash
curl https://boliviablue-production.up.railway.app/api/health
```

**Expected:** `{"ok":true,...}`

**If this fails:**
- Railway is down → Go to Railway dashboard and restart service
- Railway is restarting → Wait 2-3 minutes

**If this works:**
- Railway is up → Issue is with Vercel proxy configuration

### Test 2: Is Vercel Proxy Working?

```bash
curl https://www.boliviablue.com/api/health
```

**Expected:** Same response as Test 1

**If this fails:**
- Vercel proxy isn't forwarding correctly
- Check `vercel.json` configuration

## ✅ Fixes

### Fix 1: Railway Service is Down

**Symptoms:** Direct Railway URL doesn't work

**Steps:**
1. **Railway Dashboard** → Your service
2. Check status:
   - 🔴 **Red/Crashed** → Click "Restart"
   - 🟡 **Yellow/Starting** → Wait 2-3 minutes
   - 🟢 **Green** → Service is up (check logs)
3. **View Logs** → Look for errors
4. **Restart service** if needed

### Fix 2: Vercel Proxy Configuration

**Symptoms:** Railway works directly but 502 through Vercel

**Check `vercel.json`:**
```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://boliviablue-production.up.railway.app/api/:path*"
  }]
}
```

**Verify:**
1. Railway URL is correct (no typos)
2. URL matches your actual Railway service
3. No extra slashes or characters

**If Railway URL changed:**
1. Update `vercel.json` with new URL
2. Commit and push
3. Vercel will auto-redeploy

### Fix 3: Railway Custom Domain

If you set up a custom domain in Railway (e.g., `api.boliviablue.com`):

**Update `vercel.json`:**
```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://api.boliviablue.com/api/:path*"
  }]
}
```

**Then:**
1. Commit and push
2. Wait for Vercel to redeploy
3. Test again

### Fix 4: Vercel Function Timeout

**Symptoms:** Requests work sometimes but fail with 502

**Possible causes:**
- Railway takes too long to respond
- Vercel function timeout (10s default)

**Check Railway logs:**
- Look for slow queries
- Check Supabase connection speed
- Verify no blocking operations

### Fix 5: Clear Vercel Cache

Sometimes Vercel caches proxy rules:

1. **Vercel Dashboard** → Your project
2. **Deployments** → Latest deployment
3. Click **"..."** → **"Redeploy"**
4. Wait for redeploy to complete

## 🧪 Testing After Fix

### Test 1: Railway Direct
```bash
curl https://boliviablue-production.up.railway.app/api/health
```

### Test 2: Vercel Proxy
```bash
curl https://www.boliviablue.com/api/health
```

### Test 3: Browser Console
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**All three should return:** `{ok: true, ...}`

## 📋 Checklist

- [ ] Railway service is running (green status)
- [ ] Railway health endpoint works directly
- [ ] `vercel.json` has correct Railway URL
- [ ] No typos in Railway URL
- [ ] Vercel has been redeployed after changes
- [ ] Browser cache cleared (hard refresh)
- [ ] Railway logs show no errors
- [ ] Vercel logs show no proxy errors

## 🆘 Still Not Working?

### Check Railway Logs

1. **Railway Dashboard** → Your service → **View Logs**
2. Try to send a message
3. Check if request appears in logs:
   - ✅ **Request appears** → Railway is receiving, check for errors
   - ❌ **No request** → Vercel proxy isn't forwarding

### Check Vercel Function Logs

1. **Vercel Dashboard** → Your project → **Deployments**
2. Click latest deployment → **Functions** tab
3. Look for proxy/rewrite errors

### Verify Railway URL

1. **Railway Dashboard** → Your service → **Settings**
2. Check **"Public Domain"** or **"Custom Domain"**
3. Make sure `vercel.json` matches this URL exactly

## Alternative: Use Railway Custom Domain Directly

If Vercel proxy keeps failing, you can use Railway custom domain directly:

1. **Set up custom domain** in Railway: `api.boliviablue.com`
2. **Update frontend** to use custom domain (set `VITE_API_URL`)
3. **Configure CORS** on Railway backend for `www.boliviablue.com`

This bypasses Vercel proxy entirely.
