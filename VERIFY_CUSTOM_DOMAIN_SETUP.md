# Verify Custom Domain Setup - Step by Step

## 🚨 Current Issue

Requests are still going to `www.boliviablue.com/api/...` instead of `api.boliviablue.com`, which means the frontend isn't using the custom domain.

## ✅ Step-by-Step Verification

### Step 1: Check Railway Domain Validation

**Railway Dashboard** → Your service → **Settings** → **Networking**

**Look for:**
- `api.boliviablue.com` status
- Should say **"Active"** or **"Ready"** (not "Validating")

**If still "Validating":**
- Wait longer (can take up to 30 minutes)
- Check DNS propagation: `nslookup api.boliviablue.com`

### Step 2: Test Railway Custom Domain Directly

**In browser console (F12):**
```javascript
fetch('https://api.boliviablue.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Railway custom domain works!', d))
  .catch(e => console.error('❌ Railway custom domain failed:', e));
```

**If this fails:**
- Railway domain validation isn't complete yet
- Or DNS hasn't propagated
- Wait and try again

**If this works:**
- Railway custom domain is ready
- Proceed to Step 3

### Step 3: Verify Vercel Environment Variable

**Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

**Check:**
- `VITE_API_URL` exists
- Value is: `https://api.boliviablue.com`
- Environment is: **Production** (or **All**)

**If missing or wrong:**
1. Add/Edit: `VITE_API_URL` = `https://api.boliviablue.com`
2. Make sure it's set for **Production**
3. Save

### Step 4: Force Vercel Redeploy

**Vercel Dashboard** → **Deployments** tab

1. Find latest deployment
2. Click **"..."** menu
3. Click **"Redeploy"**
4. Wait for build to complete (2-5 minutes)

**OR trigger via git:**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with VITE_API_URL"
git push origin main
```

### Step 5: Clear Browser Cache and Test

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Or clear cache**: Ctrl+Shift+Delete → Clear cached images and files
3. **Open Console** (F12)
4. **Check log**: Should see `[Chat API] Using API_BASE: https://api.boliviablue.com`
5. **Try sending a message**

## Expected Results

**Before (current state):**
- Console: `[Chat API] Using API_BASE: (relative - Vercel proxy)`
- Requests: `www.boliviablue.com/api/...` → 502 errors

**After (correct setup):**
- Console: `[Chat API] Using API_BASE: https://api.boliviablue.com`
- Requests: `api.boliviablue.com/api/...` → Should work!

## Troubleshooting

### If Railway domain test fails:
- Wait for DNS propagation (check with `nslookup api.boliviablue.com`)
- Verify DNS record is correct in your domain provider
- Check Railway shows domain as "Active"

### If Vercel still uses relative URLs:
- Verify `VITE_API_URL` is set in Vercel
- Make sure it's set for **Production** environment
- Force redeploy (Step 4)
- Clear browser cache

### If still getting 502 after using custom domain:
- Check Railway logs for errors
- Verify Railway service is running
- Test Railway health endpoint directly
