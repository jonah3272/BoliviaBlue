# Local Development Guide

This guide explains how to run the application locally **without affecting your production Supabase database**.

## Quick Start

1. **Create local environment file:**
   ```bash
   cd backend
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` and set:**
   ```env
   LOCAL_MODE=true
   ```
   This prevents any writes to Supabase.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the backend:**
   ```bash
   npm run dev:backend
   ```

5. **In another terminal, start the frontend:**
   ```bash
   npm run dev:frontend
   ```

6. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## How Local Mode Works

When `LOCAL_MODE=true`:
- ✅ **Reads from Supabase**: If you provide Supabase credentials, you can still read production data
- ❌ **No writes to Supabase**: All `insertRate()` and `insertNews()` calls are skipped
- ✅ **Scheduler still runs**: Data is fetched and cached in memory, but not persisted
- ✅ **API works**: Endpoints return cached data or read-only Supabase data

## Environment Options

### Option 1: No Supabase (Mock Data Only)
```env
LOCAL_MODE=true
# Leave SUPABASE_URL and SUPABASE_ANON_KEY empty
```
- API uses in-memory cache only
- No database reads or writes
- Good for testing UI changes

### Option 2: Read-Only Production Supabase
```env
LOCAL_MODE=true
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```
- Reads from production database
- No writes (protected by LOCAL_MODE)
- Good for testing with real data

### Option 3: Separate Test Supabase Project
```env
LOCAL_MODE=false  # or remove it
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_KEY=your-test-service-key
```
- Full read/write access to test database
- Production database is safe
- Good for testing database operations

## Verifying Local Mode

When you start the backend, you should see:
```
🔧 LOCAL MODE: Running in read-only mode. No data will be written to Supabase.
✅ Supabase client created for read-only access
```

Or if no credentials:
```
🔧 LOCAL MODE: Running in read-only mode. No data will be written to Supabase.
⚠️  No Supabase credentials provided. API will use cached/mock data only.
```

## Testing Changes

1. Make your code changes
2. The backend will auto-reload (if using `npm run dev:backend`)
3. The frontend will auto-reload (if using `npm run dev:frontend`)
4. Test your changes without worrying about production data

## Production Deployment

When deploying to Railway/Vercel:
- **Do NOT** set `LOCAL_MODE=true` in production
- Use production Supabase credentials
- The scheduler will write data normally

## Troubleshooting

**Backend won't start:**
- Check that `.env.local` exists in the `backend/` directory
- Verify `LOCAL_MODE=true` is set

**No data showing:**
- If using Option 1 (no Supabase), data will only appear after the scheduler runs
- Check backend logs for scheduler activity
- Wait 15 minutes for first rate refresh

**Want to test writes:**
- Create a separate Supabase project for testing
- Use Option 3 configuration
- Set `LOCAL_MODE=false` or remove it

