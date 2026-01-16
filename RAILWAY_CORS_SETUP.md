# Railway CORS Setup Guide

## Quick Setup Steps

### Step 1: Add Custom Domain in Railway (RECOMMENDED)

This is the **most likely solution** to fix CORS issues:

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Select your **BoliviaBlue** project
3. Click on your backend service
4. Go to **Settings** tab
5. Scroll to **"Custom Domain"** section
6. Click **"Add Custom Domain"**
7. Enter: `api.boliviablue.com` (or `api.www.boliviablue.com`)
8. Railway will provide DNS records to add
9. Add the DNS records to your domain provider (wherever `boliviablue.com` is hosted)
10. Wait for DNS propagation (5-30 minutes)

### Step 2: Update Frontend Environment Variable

Once custom domain is set up, update Vercel environment variable:

**Vercel Dashboard → Your Project → Settings → Environment Variables:**

```
VITE_API_URL=https://api.boliviablue.com
```

(Replace with your actual custom domain)

### Step 3: Update Backend CORS Origins

The backend already includes `https://www.boliviablue.com` in allowed origins, but verify in `backend/server.js`:

```javascript
const allowedOrigins = [
  'https://www.boliviablue.com',
  'https://boliviablue.com',
  // ... other origins
];
```

### Step 4: Redeploy Both Services

1. **Railway**: Should auto-redeploy when custom domain is added
2. **Vercel**: Trigger a new deployment after updating `VITE_API_URL`

---

## Alternative: Use Railway Public Domain

If custom domain doesn't work, try using Railway's public domain with proper CORS:

1. Keep using `https://boliviablue-production.up.railway.app`
2. Ensure Railway environment variable `ORIGIN` is set:
   ```
   ORIGIN=https://www.boliviablue.com
   ```
3. Contact Railway support if OPTIONS requests still don't work

---

## Testing

After setup, test with:

```bash
# Test OPTIONS preflight
curl -i -X OPTIONS https://api.boliviablue.com/api/chat/messages \
  -H 'Origin: https://www.boliviablue.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'

# Should return:
# Access-Control-Allow-Origin: https://www.boliviablue.com
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

---

## Railway Support Contact

If custom domain doesn't fix it:
1. Go to Railway Dashboard → Help → Support
2. Explain: "OPTIONS preflight requests are not reaching my Express application"
3. Ask: "Can you check if Railway's proxy is blocking or intercepting OPTIONS requests?"
4. Reference: CORS preflight failure with credentials
