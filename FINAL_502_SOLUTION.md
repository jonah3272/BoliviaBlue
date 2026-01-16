# Final 502 Solution - Use Railway Custom Domain

## 🚨 Current Situation

You're getting **502 errors** for all chat API endpoints:
- `/api/chat/session` → 502
- `/api/chat/messages` → 502  
- `/api/chat/stats` → 502

**Root Cause:** Vercel rewrites **don't reliably forward POST requests** to Railway.

## ✅ Solution: Use Railway Custom Domain Directly

Instead of using Vercel proxy (which doesn't work for POST), use Railway's custom domain directly.

### Step 1: Set Up Railway Custom Domain

1. **Railway Dashboard** → Your service → **Settings**
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `api.boliviablue.com`
5. Railway will provide DNS records (CNAME or A record)
6. Copy the DNS records

### Step 2: Add DNS Records

1. Go to your domain provider (where `boliviablue.com` is hosted)
2. Add the DNS records Railway provided
3. Wait 5-30 minutes for DNS propagation

### Step 3: Update Frontend to Use Custom Domain

**Vercel Dashboard → Settings → Environment Variables:**

Add:
```
VITE_API_URL=https://api.boliviablue.com
```

**Important:** This makes the frontend call Railway directly, bypassing Vercel proxy entirely.

### Step 4: Verify Backend CORS

Make sure `backend/server.js` includes your frontend domain:

```javascript
const allowedOrigins = [
  'https://www.boliviablue.com',
  'https://boliviablue.com',
  // ... other origins
];
```

### Step 5: Redeploy

1. **Railway** - Should auto-redeploy when custom domain is added
2. **Vercel** - Trigger redeploy after adding `VITE_API_URL`

## 🧪 Testing

After setup:

1. **Test Railway custom domain:**
   ```bash
   curl https://api.boliviablue.com/api/health
   ```

2. **Test in browser:**
   - Open DevTools → Console
   - Try sending a message
   - Should work without 502 errors

## Why This Works

- ✅ **No Vercel proxy** - Direct connection to Railway
- ✅ **POST requests work** - No proxy limitations
- ✅ **CORS configured** - Backend allows your frontend origin
- ✅ **Same domain family** - `api.boliviablue.com` and `www.boliviablue.com` are related

## Alternative: Keep Using Vercel Proxy (If Custom Domain Doesn't Work)

If you can't set up a custom domain, the only other option is to:

1. **Contact Vercel Support** - Ask why rewrites don't forward POST requests
2. **Use a different proxy** - Cloudflare, nginx, etc.
3. **Move backend to Vercel** - Convert to Vercel serverless functions

But the **custom domain approach is the simplest and most reliable**.
