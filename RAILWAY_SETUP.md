# Railway + Supabase Setup Guide

## 🚀 Your Supabase Database is Ready!

The following tables have been created and indexed:
- **rates**: stores exchange rate history (blue and official)
- **news**: stores curated news articles with categories

## 🔑 Add These Environment Variables to Railway:

### 1. Go to Railway Dashboard
https://railway.app/dashboard

### 2. Select your BoliviaBlue project

### 3. Click "Variables" tab

### 4. Add these environment variables:

```bash
PORT=3000
ORIGIN=https://bolivia-blue-con-paz.vercel.app

BLUE_SAMPLE_SIZE=20

NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss,https://www.la-razon.com/rss,https://www.lostiempos.com/rss,https://www.opinion.com.bo/rss,https://eju.tv/feed/

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3VuY2R4amx6bXNnaXByZGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDM4OTYsImV4cCI6MjA3MzcxOTg5Nn0.3jvar_teSXL2NtV7WEA3yQofFxLc_ZeewfpLyTBksAY
```

### 5. Railway will automatically redeploy

Once the redeploy completes, your backend will:
- ✅ Store all rate data persistently in Supabase
- ✅ Fetch and cache news articles with categories
- ✅ Survive all future redeploys without data loss
- ✅ Build up historical chart data over time

## 🧪 Test Your Setup

After Railway redeploys, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/health
   ```

2. **Current Rate:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/blue-rate
   ```

3. **History:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/blue-history?range=1W
   ```

4. **News:**
   ```bash
   curl https://boliviablue-production.up.railway.app/api/news
   ```

## ✅ Vercel Frontend Configuration

Make sure your Vercel environment variable is set:

```bash
VITE_API_URL=https://boliviablue-production.up.railway.app
```

## 📊 Database Schema

### rates table:
```sql
- id (uuid, primary key)
- t (timestamp) - when the rate was captured
- buy (real) - blue market buy rate
- sell (real) - blue market sell rate
- mid (real) - blue market mid rate
- official_buy (real, nullable)
- official_sell (real, nullable)
- official_mid (real, nullable)
- created_at (timestamp)
```

### news table:
```sql
- id (text, primary key)
- source (text)
- url (text, unique)
- title (text)
- summary (text, nullable)
- published_at (timestamp)
- sentiment (text) - 'up', 'down', or 'neutral'
- category (text) - 'currency', 'economy', 'politics', etc.
- created_at (timestamp)
```

## 🔄 Data Collection

Your backend will:
- Collect exchange rates every **15 minutes**
- Fetch news articles every **30 minutes**
- Store everything persistently in Supabase
- Accumulate historical data for better charts

## 🎉 You're All Set!

Once Railway redeploys with the Supabase variables, your app will have **permanent data storage** and the charts will improve over time as data accumulates!

