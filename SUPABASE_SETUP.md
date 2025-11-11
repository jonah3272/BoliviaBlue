# Supabase Integration Guide

## Overview

Bolivia Blue con Paz now supports **Supabase** as a cloud PostgreSQL database, replacing SQLite. This provides:

- ✅ **Cloud-hosted database** - No local database file
- ✅ **PostgreSQL** - More powerful than SQLite
- ✅ **Real-time capabilities** - Optional realtime subscriptions
- ✅ **Automatic backups** - Built-in by Supabase
- ✅ **Easy deployment** - No database file to manage
- ✅ **Scalable** - Handles multiple concurrent connections

## What's Been Done

### 1. Database Setup ✅
- Created `rates` table in Supabase
- Created `news` table in Supabase
- Added indexes for performance
- Configured Row Level Security (RLS) for public read access

### 2. Backend Integration ✅
- Created `db-supabase.js` - Supabase database client
- Created `server-supabase.js` - Express server using Supabase
- Created `scheduler-supabase.js` - Scheduler using Supabase
- Added `@supabase/supabase-js` dependency

### 3. Configuration ✅
- Your Supabase URL: `https://rhwuncdxjlzmsgiprdkz.supabase.co`
- Anon key configured in `env.example.txt`
- New npm scripts: `dev:supabase` and `start:supabase`

## Quick Start with Supabase

### Step 1: Install Supabase Client

```powershell
cd backend
npm install
```

### Step 2: Update Environment Variables

Add these to your `backend/.env` file:

```env
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3VuY2R4amx6bXNnaXByZGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDM4OTYsImV4cCI6MjA3MzcxOTg5Nn0.3jvar_teSXL2NtV7WEA3yQofFxLc_ZeewfpLyTBksAY
```

### Step 3: Start with Supabase

**Stop your current backend server** (Ctrl+C in the backend terminal), then:

```powershell
# From project root
cd backend
npm run dev:supabase
```

Or manually:

```powershell
cd backend
node --watch server-supabase.js
```

The frontend doesn't need any changes - the API interface is the same!

## Database Schema

### Rates Table

```sql
CREATE TABLE rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  t TIMESTAMPTZ NOT NULL,              -- Timestamp
  buy REAL NOT NULL,                   -- Blue market buy rate
  sell REAL NOT NULL,                  -- Blue market sell rate
  mid REAL NOT NULL,                   -- Blue market mid rate
  official_buy REAL,                   -- Official buy rate
  official_sell REAL,                  -- Official sell rate
  official_mid REAL,                   -- Official mid rate
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### News Table

```sql
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  sentiment TEXT DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Viewing Your Data

### Option 1: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" in the sidebar
4. View `rates` and `news` tables

### Option 2: SQL Editor

In the Supabase dashboard, go to SQL Editor and run:

```sql
-- View recent rates
SELECT * FROM rates ORDER BY t DESC LIMIT 10;

-- View recent news
SELECT * FROM news ORDER BY published_at DESC LIMIT 10;

-- Count total records
SELECT COUNT(*) FROM rates;
SELECT COUNT(*) FROM news;
```

## Migration from SQLite to Supabase

If you have existing SQLite data you want to migrate:

### Export from SQLite

```powershell
cd backend
node -e "
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('blue.db');

const rates = db.prepare('SELECT * FROM rates ORDER BY t').all();
const news = db.prepare('SELECT * FROM news ORDER BY published_at').all();

fs.writeFileSync('rates-export.json', JSON.stringify(rates, null, 2));
fs.writeFileSync('news-export.json', JSON.stringify(news, null, 2));

console.log('Exported', rates.length, 'rates and', news.length, 'news items');
"
```

### Import to Supabase

```powershell
node -e "
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const rates = JSON.parse(fs.readFileSync('rates-export.json'));
const news = JSON.parse(fs.readFileSync('news-export.json'));

// Import rates in batches
for (let i = 0; i < rates.length; i += 100) {
  const batch = rates.slice(i, i + 100);
  await supabase.from('rates').insert(batch);
  console.log('Imported', i + batch.length, '/', rates.length, 'rates');
}

// Import news in batches
for (let i = 0; i < news.length; i += 100) {
  const batch = news.slice(i, i + 100);
  await supabase.from('news').insert(batch);
  console.log('Imported', i + batch.length, '/', news.length, 'news items');
}

console.log('Migration complete!');
"
```

## Comparison: SQLite vs Supabase

| Feature | SQLite | Supabase |
|---------|--------|----------|
| **Storage** | Local file | Cloud PostgreSQL |
| **Concurrent writes** | Limited | Excellent |
| **Backups** | Manual | Automatic |
| **Deployment** | File to manage | Just env vars |
| **Real-time** | No | Yes (optional) |
| **Scalability** | Single machine | Highly scalable |
| **Cost** | Free | Free tier available |

## Production Deployment with Supabase

### Environment Variables

For production, use the **service role key** instead of anon key:

```env
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get the service key from:
1. Supabase Dashboard → Settings → API
2. Copy "service_role" key (not "anon" key)

### Updated Dockerfile

```dockerfile
# Multi-stage build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Use Supabase version
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server-supabase.js"]
```

### Deploy to Vercel / Cloudflare

With Supabase, you can easily deploy to serverless platforms:

1. **No database file to handle**
2. Set environment variables in platform dashboard
3. Deploy normally - Supabase handles the database

## Switching Between SQLite and Supabase

### Use SQLite (original)

```powershell
cd backend
npm run dev
```

### Use Supabase

```powershell
cd backend
npm run dev:supabase
```

Both versions have the same API, so the frontend works with either!

## Benefits You Get

### 1. **No More Database File Management**
- No need to backup `blue.db` manually
- No need to copy database file between deployments
- Automatic backups by Supabase

### 2. **Better for Multiple Instances**
- Can run multiple backend instances
- All share the same database
- Great for load balancing

### 3. **Query Your Data Easily**
- Use Supabase Dashboard
- Write SQL queries
- Export data as needed

### 4. **Real-time Subscriptions (Optional)**
You can add real-time updates to your frontend:

```javascript
// Example: Listen for new rates
supabase
  .from('rates')
  .on('INSERT', payload => {
    console.log('New rate:', payload.new);
  })
  .subscribe();
```

### 5. **Production-Ready**
- Supabase handles scaling
- Built-in connection pooling
- Automatic SSL/TLS

## Troubleshooting

### Error: "Missing Supabase credentials"

Make sure `backend/.env` has:
```env
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Error: "Failed to insert rate"

Check RLS policies in Supabase Dashboard:
1. Go to Authentication → Policies
2. Ensure "Allow service role to insert" policies exist

### No data appearing

1. Check backend logs for errors
2. Verify Supabase connection in dashboard
3. Check if tables exist: Table Editor → rates, news

## Next Steps

1. ✅ **Currently running SQLite** - Switch to Supabase with `npm run dev:supabase`
2. 🔄 **Test both versions** - Both work independently
3. 🚀 **Deploy with Supabase** - Easier than managing SQLite file
4. 📊 **Monitor in Dashboard** - View real-time data in Supabase UI

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Bolivia Blue Docs**: See README.md
- **Need help?** Check the logs when running with `npm run dev:supabase`

---

**Status**: ✅ Ready to use!  
**Your Supabase Project**: https://rhwuncdxjlzmsgiprdkz.supabase.co  
**Dashboard**: https://supabase.com/dashboard

