# 🔧 Chat Connection Fix - Stage Deployment

## Issue: Connection Failed on Stage

**Problem:** Frontend can't connect to backend API in production/stage.

## ✅ Fixes Applied

### 1. **API URL Configuration** (Fixed)
- Changed from hardcoded `localhost:3000` to dynamic detection
- Uses `VITE_API_URL` env var if set
- Falls back to `window.location.origin` in production (same domain)
- Falls back to `localhost:3000` in development

### 2. **Better Error Handling** (Fixed)
- Added detailed error messages for connection failures
- Network errors now show helpful messages
- Error handling in session initialization

## 🔍 Troubleshooting Steps

### Check 1: Environment Variables

**Frontend (Vercel/Netlify/etc):**
```bash
# If backend is on different domain, set this:
VITE_API_URL=https://your-backend-url.railway.app
# OR if same domain:
# Leave VITE_API_URL unset (will use relative URLs)
```

**Backend (Railway/etc):**
```bash
# Make sure these are set:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ORIGIN=https://your-frontend-domain.com
```

### Check 2: CORS Configuration

Verify your frontend domain is in `allowedOrigins` in `backend/server.js`:
```javascript
const allowedOrigins = [
  'https://your-frontend-domain.com',
  'https://www.your-frontend-domain.com',
  // ... other domains
];
```

### Check 3: Backend is Running

Test backend health:
```bash
curl https://your-backend-url.railway.app/api/health
```

### Check 4: Browser Console

Check browser console for:
- CORS errors
- Network errors
- 404 errors
- 500 errors

## 🚀 Quick Fix for Stage

### Option A: Same Domain (Frontend + Backend together)
- No changes needed - relative URLs will work

### Option B: Different Domains
1. **Set Frontend Env Var:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

2. **Add Frontend Domain to Backend CORS:**
   - Add your frontend domain to `allowedOrigins` in `backend/server.js`
   - Redeploy backend

3. **Rebuild Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

## 🧪 Test Connection

Open browser console on `/chat` page and check:
1. No CORS errors
2. Session initializes (check Network tab for `/api/chat/session`)
3. Messages load (check Network tab for `/api/chat/messages`)

## 📝 Common Issues

### Issue: "Failed to fetch"
- **Cause:** Backend not running or wrong URL
- **Fix:** Check backend is deployed and URL is correct

### Issue: CORS error
- **Cause:** Frontend domain not in allowedOrigins
- **Fix:** Add domain to backend/server.js allowedOrigins

### Issue: 401 Unauthorized
- **Cause:** Cookie not being sent
- **Fix:** Check `credentials: 'include'` is set (already done)

### Issue: 404 Not Found
- **Cause:** Route not deployed or wrong path
- **Fix:** Verify backend has `/api/chat/*` routes

---

**Status:** ✅ Fixed - Ready to test
