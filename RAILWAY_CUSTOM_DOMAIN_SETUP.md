# Railway Custom Domain Setup - Fix 502 Errors

## 🚨 Problem

Vercel rewrites **don't reliably forward POST requests** to Railway. This is why you're getting 502 errors - Vercel proxy fails before reaching Railway.

## ✅ Solution: Use Railway Custom Domain

Set up `api.boliviablue.com` so frontend calls Railway directly (bypasses Vercel).

## Step 1: Add Custom Domain in Railway

1. **Railway Dashboard** → Your service → **Settings** tab
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"** or **"Generate Domain"**
4. Enter: `api.boliviablue.com`
5. Railway will show DNS records you need to add

**Important:** Railway will show you:
- **Type:** CNAME (or A record)
- **Name:** `api` (or `api.boliviablue.com`)
- **Value:** Railway's domain (something like `xxx.up.railway.app`)

## Step 2: Add DNS Records to Your Domain Provider

1. Go to your domain provider (where `boliviablue.com` is registered)
2. Find **DNS Management** or **DNS Settings**
3. Add a **CNAME record**:
   - **Name/Host:** `api`
   - **Value/Target:** The Railway domain they provided
   - **TTL:** 3600 (or default)

**Example:**
```
Type: CNAME
Name: api
Value: xyz123.up.railway.app
TTL: 3600
```

## Step 3: Wait for DNS Propagation

- **Usually:** 5-30 minutes
- **Sometimes:** Up to 24 hours
- **Check:** Use `nslookup api.boliviablue.com` or `dig api.boliviablue.com`

## Step 4: Verify Railway Custom Domain Works

After DNS propagates:

```bash
curl https://api.boliviablue.com/api/health
```

Should return: `{"ok":true,...}`

## Step 5: Update Frontend to Use Custom Domain

**Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

Add:
```
VITE_API_URL=https://api.boliviablue.com
```

**Important:** Make sure this is set for **Production** environment.

## Step 6: Verify Backend CORS Allows Frontend

Make sure `backend/server.js` includes your frontend domain in `allowedOrigins`:

```javascript
const allowedOrigins = [
  'https://www.boliviablue.com',
  'https://boliviablue.com',
  // ... other origins
];
```

## Step 7: Redeploy

1. **Vercel** - Should auto-redeploy when you add env var
2. **Railway** - Should auto-redeploy when custom domain is added

## Step 8: Test

After redeploy:
1. **Clear browser cache** (Ctrl+Shift+R)
2. **Open Console** (F12)
3. Should see: `[Chat API] Using API_BASE: https://api.boliviablue.com`
4. **Try sending a message** - should work now!

## Why This Works

- ✅ **No Vercel proxy** - Direct connection to Railway
- ✅ **POST requests work** - No proxy limitations
- ✅ **CORS configured** - Backend allows your frontend origin
- ✅ **Same domain family** - `api.boliviablue.com` and `www.boliviablue.com` are related

## Troubleshooting

### DNS Not Propagating

1. Check DNS records are correct
2. Wait longer (up to 24 hours)
3. Use `nslookup api.boliviablue.com` to check

### Still Getting CORS Errors

1. Check `backend/server.js` - make sure `www.boliviablue.com` is in `allowedOrigins`
2. Restart Railway service
3. Check Railway logs for CORS errors

### Still Getting 502 Errors

1. Check Railway is running (Railway Dashboard)
2. Test direct Railway URL: `https://boliviablue-production.up.railway.app/api/health`
3. Check Railway logs for errors
