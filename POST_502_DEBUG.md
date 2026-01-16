# Debug POST 502 Errors

## 🚨 Issue: 502 on POST /api/chat/messages

Railway is running fine, but POST requests get 502. This is likely a **Vercel proxy timeout** or **POST body forwarding issue**.

## 🔍 What to Check Right Now

### Step 1: Check Railway Logs (CRITICAL)

1. **Railway Dashboard** → Your service → **View Logs**
2. Keep logs open
3. **Try sending a message** from the website
4. **Look for these log entries:**
   - `📨 POST /api/chat/messages - Request received`
   - `✅ Message created in Xms`
   - `✅ Sending response in Xms total`

**What this tells us:**
- ✅ **See `📨 POST`** → Request reached Railway (Vercel proxy works)
- ❌ **Don't see `📨 POST`** → Request never reached Railway (Vercel proxy issue)
- ⚠️ **See `📨 POST` but no `✅`** → Railway processing but timing out

### Step 2: Check Browser Console

1. Open **DevTools** (F12) → **Console** tab
2. Try sending a message
3. Look for:
   - `[Chat API] Creating message:` - Shows the request
   - `[Chat API] Response received:` - Shows the response (or error)

### Step 3: Check Network Tab

1. Open **DevTools** (F12) → **Network** tab
2. Try sending a message
3. Find the `/api/chat/messages` request
4. Check:
   - **Status**: 502?
   - **Request URL**: Should be `www.boliviablue.com/api/chat/messages`
   - **Request Method**: POST
   - **Request Payload**: Should show your message content
   - **Response**: Click → **Response** tab → What does it say?

## 🎯 Most Likely Causes

### Cause 1: Vercel Proxy Timeout

**Symptom:** Request reaches Railway but takes > 10 seconds

**Fix:** Railway queries are slow (Supabase)

**Solution:**
- Check Railway logs for slow queries
- Optimize Supabase queries
- Add database indexes

### Cause 2: Vercel Proxy Not Forwarding POST Body

**Symptom:** Request reaches Railway but body is empty

**Fix:** Vercel rewrite might not handle POST correctly

**Solution:**
- Check Railway logs - does it show the request body?
- Try using Vercel serverless function instead of rewrite

### Cause 3: Request Never Reaches Railway

**Symptom:** No `📨 POST` in Railway logs

**Fix:** Vercel proxy is blocking/failing before reaching Railway

**Solution:**
- Check Vercel function logs
- Verify `vercel.json` rewrite is correct
- Try direct Railway URL (bypass Vercel)

## ✅ Quick Test

Test if POST works directly to Railway (bypassing Vercel):

**In browser console:**
```javascript
fetch('https://boliviablue-production.up.railway.app/api/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    content: 'test message 1234567890', 
    category: 'general' 
  })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

**If this works:**
- Railway is fine
- Issue is with Vercel proxy

**If this fails:**
- Railway has an issue
- Check Railway logs for errors

## 🔧 Potential Fixes

### Fix 1: Use Vercel Serverless Function

Instead of rewrite, use a serverless function:

Create `api/chat/messages.js`:
```javascript
export default async function handler(req, res) {
  const response = await fetch('https://boliviablue-production.up.railway.app/api/chat/messages', {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.status(response.status).json(data);
}
```

### Fix 2: Increase Vercel Timeout

Vercel rewrites have a default timeout. Check Vercel dashboard for timeout settings.

### Fix 3: Optimize Backend

If Railway logs show slow queries:
- Add database indexes
- Optimize Supabase queries
- Cache frequently accessed data

## 📋 What to Share

After checking logs, share:

1. **Railway logs:** Do you see `📨 POST`?
2. **Browser console:** What errors appear?
3. **Network tab:** Status code and response body
4. **Timing:** How long does the request take?

This will help identify if it's:
- Vercel proxy issue (no logs in Railway)
- Railway timeout (logs appear but slow)
- Request body issue (logs show empty body)
