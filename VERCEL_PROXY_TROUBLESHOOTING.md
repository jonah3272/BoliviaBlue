# Vercel Proxy Troubleshooting

## ✅ If Railway is Online But Getting 502 Errors

If Railway works directly but you get 502 through Vercel proxy, here's how to fix it:

## Quick Checks

### 1. Verify Railway URL in vercel.json

Make sure `vercel.json` has the correct Railway URL:

```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://boliviablue-production.up.railway.app/api/:path*"
  }]
}
```

**Check:**
- No typos in the URL
- URL matches your actual Railway service URL
- Railway service is actually running

### 2. Test Direct vs Proxy

**Direct Railway (should work):**
```bash
curl https://boliviablue-production.up.railway.app/api/health
```

**Through Vercel Proxy (should also work):**
```bash
curl https://www.boliviablue.com/api/health
```

If direct works but proxy doesn't → Vercel proxy issue

### 3. Check Vercel Deployment

1. Go to Vercel Dashboard → Your project
2. Check latest deployment:
   - ✅ Green = Success
   - ❌ Red = Failed (check logs)
3. If failed, redeploy

### 4. Clear Vercel Cache

Sometimes Vercel caches proxy rules. To clear:

1. Vercel Dashboard → Your project → Settings
2. Go to **"Deployments"** tab
3. Click **"..."** on latest deployment
4. Select **"Redeploy"**

## Common Issues

### Issue 1: Intermittent 502 Errors

**Cause:** Railway is restarting or under load

**Fix:**
- Wait 1-2 minutes
- Check Railway logs for restart messages
- Railway auto-restarts can cause temporary 502s

### Issue 2: Vercel Proxy Timeout

**Cause:** Railway takes too long to respond

**Fix:**
- Check Railway logs for slow queries
- Verify Supabase connection is fast
- Check Railway service isn't hitting resource limits

### Issue 3: Wrong Railway URL

**Cause:** `vercel.json` has outdated Railway URL

**Fix:**
1. Railway Dashboard → Your service → Settings
2. Check **"Public Domain"** or **"Custom Domain"**
3. Update `vercel.json` if different
4. Commit and push (Vercel auto-redeploys)

## Testing After Fix

1. **Test health endpoint:**
   ```bash
   curl https://www.boliviablue.com/api/health
   ```

2. **Test chat endpoint:**
   ```bash
   curl -X POST https://www.boliviablue.com/api/chat/messages \
     -H "Content-Type: application/json" \
     -H "Cookie: chat_session_token=test" \
     -d '{"content":"test message","category":"general"}'
   ```

3. **Test in browser:**
   - Open browser console
   - Try sending a message
   - Check Network tab for response

## If Still Not Working

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Your project → Deployments
   - Click latest deployment → Functions tab
   - Look for proxy errors

2. **Verify Railway is Actually Up:**
   - Railway Dashboard → Check service status
   - View logs for any errors
   - Test direct Railway URL

3. **Contact Support:**
   - Vercel: If proxy consistently fails
   - Railway: If service keeps restarting
