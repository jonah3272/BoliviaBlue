# 🚀 Deploy Anonymous Chat to Stage - Quick Guide

**Status:** ✅ Ready to Deploy

---

## 📋 Pre-Deployment Checklist

### 1. **Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. **Verify Database Migration**

The database migration was already applied via MCP. Verify in Supabase dashboard:
- ✅ `anonymous_messages` table exists
- ✅ `anonymous_likes` table exists
- ✅ `anonymous_sessions` table exists
- ✅ `moderation_queue` table exists
- ✅ All indexes created
- ✅ RLS policies enabled

### 3. **Environment Variables**

Ensure these are set in your deployment environment:

**Backend (.env):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
NODE_ENV=production
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🧪 Local Testing (Before Stage)

### Start Backend:
```bash
cd backend
npm run dev:supabase
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Test Routes:
- http://localhost:5173/chat
- http://localhost:5173/comunidad
- http://localhost:5173/comentarios

### Test Features:
1. ✅ Session initializes automatically
2. ✅ Can post messages
3. ✅ Messages appear in feed
4. ✅ Filters work
5. ✅ Like/unlike works
6. ✅ Real-time updates (polling)

---

## 🚀 Deploy to Stage

### Option 1: Railway (If using Railway)

```bash
# Commit changes
git add .
git commit -m "feat: Add anonymous chat system with security fixes"
git push origin main
```

Railway will auto-deploy.

### Option 2: Manual Deploy

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Backend:**
   - Ensure `cookie-parser` is in package.json ✅ (already added)
   - Deploy backend to your hosting service
   - Ensure environment variables are set

3. **Deploy Frontend:**
   - Upload `frontend/dist` to your hosting service
   - Or deploy via Vercel/Netlify

---

## ✅ Post-Deployment Verification

1. **Check Routes:**
   - Visit `https://your-domain.com/chat`
   - Visit `https://your-domain.com/comunidad`

2. **Test Functionality:**
   - Post a message
   - Check filters
   - Test like/unlike
   - Verify real-time updates

3. **Check Console:**
   - No errors in browser console
   - No errors in server logs

---

## 🐛 Troubleshooting

### Issue: "Session token required"
- **Fix:** Ensure cookies are enabled
- **Fix:** Check CORS settings allow credentials

### Issue: "Rate limit exceeded"
- **Fix:** This is expected behavior - wait and try again
- **Fix:** Check rate limit headers in response

### Issue: Messages not appearing
- **Fix:** Check database connection
- **Fix:** Verify RLS policies allow public read
- **Fix:** Check browser console for errors

---

## 📊 Monitoring

After deployment, monitor:
- API response times
- Error rates
- Rate limit hits
- Database query performance

---

**Ready to deploy!** 🚀
