# 502 Bad Gateway Fix Guide

## 🚨 Problem

You're seeing `502 (Bad Gateway)` errors for all `/api/chat/*` requests. This means:
- ✅ Frontend is working (requests are being made)
- ✅ Vercel proxy is working (it's trying to forward requests)
- ❌ **Railway backend is either down or not responding**

## 🔍 Quick Diagnosis

### Step 1: Test Railway Directly

Open in browser or use curl:

```bash
# Test Railway health endpoint
curl https://boliviablue-production.up.railway.app/api/health
```

**Results:**
- ✅ **Returns JSON** → Railway is up, issue is with Vercel proxy
- ❌ **Connection refused / timeout** → Railway is down
- ❌ **502 / 503 error** → Railway is restarting or crashed

### Step 2: Check Railway Dashboard

1. Go to https://railway.app/dashboard
2. Select your **BoliviaBlue** project
3. Click on your backend service
4. Check status indicator:
   - 🟢 **Green (Running)** → Service is up
   - 🟡 **Yellow (Starting)** → Service is restarting (wait 1-2 minutes)
   - 🔴 **Red (Crashed)** → Service crashed (check logs)

### Step 3: Check Railway Logs

1. In Railway dashboard, click **"View Logs"**
2. Look for:
   - ❌ **Error messages** (red text)
   - ⚠️ **Warnings** (yellow text)
   - 🔄 **"Server starting..."** messages

**Common Issues:**

#### Issue 1: Service Crashed
```
Error: Cannot find module 'express'
Error: SUPABASE_URL is not defined
Error: Port 3000 is already in use
```

**Fix:** Check environment variables are set correctly

#### Issue 2: Service Restarting
```
🚀 SERVER STARTING...
✅ Server is ready to accept connections
```

**Fix:** Wait 1-2 minutes for service to fully start

#### Issue 3: Database Connection Failed
```
Error: Failed to connect to Supabase
Error: Invalid API key
```

**Fix:** Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

## ✅ Fixes

### Fix 1: Railway Service is Down

**Symptoms:** Railway dashboard shows red/crashed status

**Steps:**
1. Go to Railway dashboard → Your service
2. Click **"Restart"** button (if available)
3. Or click **"Deploy"** → **"Redeploy"**
4. Wait 2-3 minutes for service to start
5. Check logs for "✅ Server is ready"

### Fix 2: Missing Environment Variables

**Symptoms:** Logs show errors about missing variables

**Steps:**
1. Railway Dashboard → Your service → **"Variables"** tab
2. Verify these are set:
   ```
   PORT=3000
   SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
   SUPABASE_ANON_KEY=your_key_here
   SUPABASE_SERVICE_KEY=your_service_key_here
   ORIGIN=https://www.boliviablue.com
   ```
3. If any are missing, add them
4. Railway will auto-redeploy

### Fix 3: Service is Restarting

**Symptoms:** Railway shows yellow/starting status

**Steps:**
1. Wait 1-2 minutes
2. Refresh Railway dashboard
3. Check if status changed to green
4. Test again: `curl https://boliviablue-production.up.railway.app/api/health`

### Fix 4: Vercel Proxy Configuration

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
1. Railway URL is correct: `https://boliviablue-production.up.railway.app`
2. No typos in the URL
3. Railway service is actually running

**If Railway URL changed:**
1. Update `vercel.json` with new URL
2. Commit and push
3. Vercel will auto-redeploy

## 🧪 Testing Steps

### Test 1: Railway Direct Access
```bash
curl https://boliviablue-production.up.railway.app/api/health
```
**Expected:** `{"ok":true,"updated_at_iso":"..."}`

### Test 2: Vercel Proxy
```bash
curl https://www.boliviablue.com/api/health
```
**Expected:** Same response as Test 1

### Test 3: Frontend Request
Open browser console and run:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```
**Expected:** `{ok: true, ...}`

## 📋 Checklist

- [ ] Railway service status is **Green (Running)**
- [ ] Railway logs show **"✅ Server is ready"**
- [ ] Direct Railway URL works: `curl https://boliviablue-production.up.railway.app/api/health`
- [ ] All environment variables are set in Railway
- [ ] `vercel.json` has correct Railway URL
- [ ] Vercel has been redeployed after changes

## 🆘 Still Not Working?

If Railway is up but Vercel still shows 502:

1. **Check Vercel Logs:**
   - Vercel Dashboard → Your project → **"Deployments"**
   - Click latest deployment → **"Functions"** tab
   - Look for proxy errors

2. **Verify Railway URL:**
   - Railway Dashboard → Your service → **"Settings"**
   - Check **"Public Domain"** or **"Custom Domain"**
   - Make sure `vercel.json` matches this URL

3. **Contact Support:**
   - Railway: If service keeps crashing
   - Vercel: If proxy isn't working

## Quick Fix Command

If Railway is down, restart it:

1. Railway Dashboard → Your service
2. Click **"..."** menu → **"Restart"**
3. Wait 2-3 minutes
4. Test: `curl https://boliviablue-production.up.railway.app/api/health`
