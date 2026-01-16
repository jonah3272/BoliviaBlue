# Setup Checklist for CORS Fix

## ✅ What's Already Configured

- [x] CORS middleware properly configured in `backend/server.js`
- [x] `cors` package installed and configured
- [x] Raw HTTP server intercepting OPTIONS requests
- [x] Allowed origins include `https://www.boliviablue.com`
- [x] Credentials support enabled
- [x] Frontend configured to use `credentials: 'include'`

## 🔧 What You Need to Do

### Step 1: Railway Custom Domain (RECOMMENDED - Most Likely to Fix)

1. [ ] Go to Railway Dashboard: https://railway.app/dashboard
2. [ ] Select your **BoliviaBlue** project
3. [ ] Click on your backend service
4. [ ] Go to **Settings** → **Custom Domain**
5. [ ] Add custom domain: `api.boliviablue.com`
6. [ ] Copy DNS records provided by Railway
7. [ ] Add DNS records to your domain provider (where `boliviablue.com` is hosted)
8. [ ] Wait for DNS propagation (check with: `nslookup api.boliviablue.com`)
9. [ ] Verify SSL certificate is active (Railway auto-provisions)

### Step 2: Update Vercel Environment Variable

1. [ ] Go to Vercel Dashboard: https://vercel.com/dashboard
2. [ ] Select your **BoliviaBlue** project
3. [ ] Go to **Settings** → **Environment Variables**
4. [ ] Add/Update: `VITE_API_URL=https://api.boliviablue.com`
   - (Use your actual custom domain from Step 1)
5. [ ] Save and redeploy

### Step 3: Test CORS

1. [ ] Run test script: `bash test-cors.sh https://api.boliviablue.com`
2. [ ] Or test manually in browser console:
   ```javascript
   fetch('https://api.boliviablue.com/api/chat/messages', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ content: 'test', category: 'general' })
   })
   ```
3. [ ] Check browser Network tab for OPTIONS request
4. [ ] Verify response has `Access-Control-Allow-Origin` header

### Step 4: Verify Backend Logs

1. [ ] Go to Railway Dashboard → Your Service → Logs
2. [ ] Look for: `🔵 RAW HTTP OPTIONS INTERCEPT` or `🔴 REQUEST: OPTIONS`
3. [ ] If you see these logs, OPTIONS requests are reaching the server ✅
4. [ ] If you don't see these logs, Railway proxy is still blocking ❌

## 🚨 If Custom Domain Doesn't Work

### Option A: Contact Railway Support

1. [ ] Go to Railway Dashboard → Help → Support
2. [ ] Create ticket explaining:
   - "OPTIONS preflight requests are not reaching my Express application"
   - "No OPTIONS requests appear in logs"
   - "CORS errors in browser: 'No Access-Control-Allow-Origin header'"
3. [ ] Ask: "Can you check if Railway's proxy/gateway is blocking OPTIONS requests?"
4. [ ] Reference: This is preventing CORS preflight from working

### Option B: Use Reverse Proxy

1. [ ] Set up Cloudflare in front of Railway
2. [ ] Configure CORS at Cloudflare level
3. [ ] Point frontend to Cloudflare URL

### Option C: Alternative Deployment

Consider moving to:
- [ ] Vercel (if compatible)
- [ ] Render
- [ ] Fly.io
- [ ] DigitalOcean App Platform

## 📝 Environment Variables Checklist

### Railway (Backend)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_KEY` - Supabase service role key
- [ ] `ORIGIN` - Set to `https://www.boliviablue.com`
- [ ] `PORT` - Usually `3000` (Railway auto-sets)
- [ ] `NODE_ENV` - Set to `production`

### Vercel (Frontend)
- [ ] `VITE_API_URL` - Set to your Railway custom domain (e.g., `https://api.boliviablue.com`)

## 🧪 Testing Commands

```bash
# Test OPTIONS preflight
curl -i -X OPTIONS https://api.boliviablue.com/api/chat/messages \
  -H 'Origin: https://www.boliviablue.com' \
  -H 'Access-Control-Request-Method: POST'

# Test health endpoint
curl https://api.boliviablue.com/api/health

# Run automated test script
bash test-cors.sh https://api.boliviablue.com https://www.boliviablue.com
```

## ✅ Success Criteria

- [ ] OPTIONS requests appear in Railway logs
- [ ] Browser Network tab shows OPTIONS request with 200 status
- [ ] Response includes `Access-Control-Allow-Origin: https://www.boliviablue.com`
- [ ] POST requests to `/api/chat/messages` succeed
- [ ] No CORS errors in browser console
