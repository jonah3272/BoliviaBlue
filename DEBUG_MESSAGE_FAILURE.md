# Debug Message Sending Failure

## 🔍 Step-by-Step Debugging

If messages are still failing on boliviablue.com, follow these steps:

### Step 1: Check Browser Console

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Try to send a message
4. Look for error messages - note the exact error

### Step 2: Check Network Tab

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Try to send a message
4. Find the `/api/chat/messages` request
5. Check:
   - **Request URL**: Should be `https://www.boliviablue.com/api/chat/messages` (relative)
   - **Status Code**: What status code? (200, 400, 500, 502, etc.)
   - **Response**: Click on the request → **Response** tab → What does it say?

### Step 3: Test Vercel Proxy

Test if Vercel proxy is working:

```bash
curl -X POST https://www.boliviablue.com/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: chat_session_token=test" \
  -d '{"content":"test message","category":"general"}'
```

**Expected:**
- If proxy works: Should forward to Railway and get response
- If proxy fails: 502 Bad Gateway or connection error

### Step 4: Test Railway Directly

Test if Railway is working:

```bash
curl -X POST https://boliviablue-production.up.railway.app/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: chat_session_token=test" \
  -d '{"content":"test message","category":"general"}'
```

**Expected:**
- If Railway works: Should return message or error (but not 502)
- If Railway fails: 502 or connection error

### Step 5: Check Railway Logs

1. **Railway Dashboard** → Your service → **View Logs**
2. Try to send a message
3. Check if request appears in logs:
   - ✅ **Request appears** → Railway is receiving requests
   - ❌ **No request** → Vercel proxy isn't forwarding

### Step 6: Check Vercel Logs

1. **Vercel Dashboard** → Your project → **Deployments**
2. Click latest deployment → **Functions** tab
3. Look for proxy errors

## Common Issues & Fixes

### Issue 1: 502 Bad Gateway

**Symptom:** Network tab shows 502 status

**Causes:**
- Railway is down/restarting
- Vercel proxy can't reach Railway
- Railway URL in vercel.json is wrong

**Fix:**
1. Check Railway is running (green status)
2. Test Railway directly (Step 4 above)
3. Verify `vercel.json` has correct Railway URL

### Issue 2: 401 Unauthorized

**Symptom:** Network tab shows 401 status, error says "Session token required"

**Cause:** Session cookie not being sent

**Fix:**
1. Check browser has cookies enabled
2. Verify `credentials: 'include'` is in fetch request
3. Check if session was initialized (should see session in console)

### Issue 3: 400 Bad Request

**Symptom:** Network tab shows 400 status

**Causes:**
- Message content too short/long
- Invalid category
- Missing required fields

**Fix:**
1. Check response body for specific error message
2. Verify message content is 10-1000 characters
3. Check category is valid

### Issue 4: 500 Internal Server Error

**Symptom:** Network tab shows 500 status

**Cause:** Backend error (database, validation, etc.)

**Fix:**
1. Check Railway logs for error details
2. Verify Supabase connection is working
3. Check environment variables are set

### Issue 5: CORS Error

**Symptom:** Console shows CORS error

**Cause:** Frontend still using Railway URL directly

**Fix:**
1. Check Network tab - request should go to `www.boliviablue.com/api/*`
2. If it goes to Railway directly, frontend hasn't been redeployed
3. Force Vercel redeploy (see FRONTEND_DEPLOY_CHECK.md)

### Issue 6: "Failed to fetch" / Network Error

**Symptom:** Console shows "Failed to fetch" or "NetworkError"

**Causes:**
- Vercel proxy not working
- Network connectivity issue
- Request blocked by browser

**Fix:**
1. Test Vercel proxy (Step 3 above)
2. Check browser console for specific error
3. Try in different browser/incognito mode

## Quick Diagnostic Script

Run this in browser console to test:

```javascript
// Test 1: Check API_BASE
console.log('API_BASE:', window.location.origin);

// Test 2: Test session endpoint
fetch('/api/chat/session', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(d => console.log('Session OK:', d))
  .catch(e => console.error('Session FAILED:', e));

// Test 3: Test message endpoint
fetch('/api/chat/messages', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'test message 1234567890', category: 'general' })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Message OK:', d))
  .catch(e => console.error('Message FAILED:', e));
```

## What to Share for Help

If still not working, share:

1. **Browser Console errors** (screenshot or copy/paste)
2. **Network tab details**:
   - Request URL
   - Status code
   - Response body
3. **Railway logs** (last 20 lines when you try to send)
4. **Vercel deployment status** (green/red)
5. **Results of diagnostic script** above
