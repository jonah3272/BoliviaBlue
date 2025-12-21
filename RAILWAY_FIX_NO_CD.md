# 🚨 CRITICAL FIX: Railway Can't Use `cd` Command

## Problem Found in Logs

Railway build logs show:
```
Container failed to start
The executable `cd` could not be found.
```

**Railway containers don't support `cd` in start commands!**

## Solution: Configure Railway Root Directory

Railway needs to be configured to run from the `backend/` directory directly.

### Step 1: Navigate to SERVICE Settings (NOT Project Settings)

**IMPORTANT:** You need SERVICE settings, not PROJECT settings!

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Click **"Architecture"** tab (top navigation) - OR close Project Settings
3. Find the **"BoliviaBlue"** service card (shows URL: boliviablue-production.up.railway.app)
4. **Click directly on the "BoliviaBlue" service card**
5. This opens the SERVICE view (different from Project view)
6. Click **"Settings"** tab in the SERVICE view
7. Now you should see service-specific settings

### Step 2: Set Root Directory

In SERVICE Settings:
1. Find **"Root Directory"** field (may also be called "Working Directory" or "Source Directory")
2. Set it to: `backend`
3. **Save**

### Step 3: Verify Start Command

After setting Root Directory:
- **Start Command** should be: `npm start` (NOT `cd backend && npm start`)
- Railway will automatically run from `backend/` directory

### Step 2: Verify Start Command

After setting Root Directory to `backend`:
- Railway will automatically change the working directory to `backend/`
- Start command should be: `npm start` (NOT `cd backend && npm start`)
- Railway will run `npm start` from within the `backend/` directory

### Step 3: Redeploy

1. After saving settings, Railway should auto-redeploy
2. If not, click **"Redeploy"** button
3. Wait 2-3 minutes
4. Check logs - should see:
   ```
   > bolivia-blue-backend@1.0.0 start
   > node server.js
   Bolivia Blue con Paz backend running on port 3000
   ```

## Why This Happens

Railway containers are minimal and don't include shell commands like `cd`. The start command runs directly, so you can't use shell operators like `&&` or `cd`.

**Solution:** Set Root Directory in Railway settings instead of using `cd` in commands.

## Alternative: Use Railway CLI

If dashboard doesn't work, use Railway CLI:

```bash
railway variables set RAILWAY_SERVICE_ROOT_DIR=backend
railway up
```

---

**This is the fix! Set Root Directory to `backend` in Railway dashboard settings, then the server will start correctly.**

