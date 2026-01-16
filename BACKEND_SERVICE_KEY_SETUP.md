# 🔑 Backend Service Key Setup

## Issue: Like Functionality Not Working

The backend needs the **Supabase Service Role Key** to bypass Row Level Security (RLS) for operations like updating like counts.

## Current Status

- ✅ Backend is running on port 3000
- ✅ RLS policies are correctly configured
- ⚠️ Backend is using `SUPABASE_ANON_KEY` (subject to RLS)
- ❌ Need `SUPABASE_SERVICE_KEY` for full access

## How to Get Service Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rhwuncdxjlzmsgiprdkz`
3. Go to **Settings** → **API**
4. Find **"service_role"** key (NOT the "anon" key)
5. Copy the key

## Add to Backend .env

Edit `backend/.env` and add:

```env
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Important:** Keep the service key secret! Never commit it to git.

## Restart Backend

After adding the service key:

```powershell
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
node server.js
```

## Verify It Works

1. The backend will use `SUPABASE_SERVICE_KEY` if available
2. Falls back to `SUPABASE_ANON_KEY` if service key not set
3. Service key bypasses RLS, allowing all operations

## Alternative: Test with Current Setup

The RLS policies should allow likes even with anon key. If likes still don't work:
1. Check backend console for error messages
2. Verify the error message shows what's failing
3. The error handling I added will show specific RLS errors

---

**Note:** For production, always use the service key for backend operations.
