# Force Vercel to Rebuild After Removing VITE_API_URL

## 🚨 Problem

You removed `VITE_API_URL` from Vercel, but the site is still using `api.boliviablue.com` because:
- The old build still has the old value baked in
- Vercel doesn't auto-rebuild when you remove env vars
- You need to manually trigger a redeploy

## ✅ Solution: Force Redeploy

### Option 1: Redeploy from Vercel Dashboard (Easiest)

1. **Vercel Dashboard** → Your project
2. Go to **"Deployments"** tab
3. Find the **latest deployment**
4. Click the **"..."** (three dots) menu
5. Click **"Redeploy"**
6. Wait for build to complete (2-5 minutes)

### Option 2: Push Empty Commit (Alternative)

If Option 1 doesn't work, trigger a redeploy by pushing a commit:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy after removing VITE_API_URL"
git push origin main
```

Then merge to stage:
```bash
git checkout stage
git merge main
git push origin stage
```

### Step 3: Verify Environment Variables Are Gone

Before redeploy completes, double-check:
1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Make sure `VITE_API_URL` is **NOT** in the list
3. If it's still there, delete it

### Step 4: After Redeploy Completes

1. **Clear browser cache:**
   - **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or: Ctrl+Shift+Delete → Clear cached images and files

2. **Open Console** (F12) and check:
   - Should see: `[Chat API] Using API_BASE: (relative - Vercel proxy)`
   - Should NOT see: `[Chat API] Using API_BASE: https://api.boliviablue.com`

3. **Check Network tab:**
   - Requests should go to: `www.boliviablue.com/api/...`
   - Should NOT go to: `api.boliviablue.com`

4. **Try sending a message:**
   - Should work now (or at least not get DNS errors)

## Expected Timeline

- **Redeploy**: 2-5 minutes
- **DNS cache clear**: Immediate (after hard refresh)
- **Total**: ~5 minutes

## If It Still Doesn't Work

If after redeploy you still see `api.boliviablue.com`:

1. **Check Vercel build logs:**
   - Go to deployment → **"Build Logs"**
   - Search for `VITE_API_URL`
   - Should NOT appear in build logs

2. **Check browser console:**
   - Look for `[Chat API] Using API_BASE:` log
   - If it still shows `api.boliviablue.com`, the build is still cached

3. **Try incognito/private window:**
   - This bypasses browser cache
   - If it works in incognito, it's a browser cache issue
