# 🚀 Complete Setup Guide - Bolivia Blue con Paz

**Last Updated:** January 2025  
**Status:** All features implemented, ready for setup

---

## 📋 Overview

This guide covers setting up all the new features:
- ✅ Rate Alerts (email notifications)
- ✅ Daily Article Automation (1500+ word articles)
- ✅ Database tables (Supabase)
- ✅ Environment variables

---

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Rate Alerts Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the sidebar
4. Copy and paste the contents of `backend/supabase-rate-alerts.sql`
5. Click **"Run"** to execute

**What this creates:**
- `rate_alerts` table for storing user alerts
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update triggers

### 1.2 Create Blog Articles Table

1. Still in Supabase SQL Editor
2. Copy and paste the contents of `backend/supabase-blog-articles.sql`
3. Click **"Run"** to execute

**What this creates:**
- `blog_articles` table for daily articles
- Indexes for performance
- RLS policies for public read access
- Auto-update triggers

### 1.3 Verify Tables

Run this query to verify both tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rate_alerts', 'blog_articles');
```

You should see both tables listed.

---

## 🔑 Step 2: Environment Variables

### 2.1 Backend Environment Variables

Add these to your `backend/.env` file:

```env
# Existing variables (if not already set)
PORT=3000
ORIGIN=http://localhost:5173
BLUE_SAMPLE_SIZE=20
NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss,https://www.la-razon.com/rss,https://www.lostiempos.com/rss,https://www.opinion.com.bo/rss,https://eju.tv/feed/

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3VuY2R4amx6bXNnaXByZGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDM4OTYsImV4cCI6MjA3MzcxOTg5Nn0.3jvar_teSXL2NtV7WEA3yQofFxLc_ZeewfpLyTBksAY

# EmailJS Configuration (for Rate Alerts)
# Get these from Step 3 below
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
EMAILJS_PUBLIC_KEY=your_public_key_here

# Base URL for unsubscribe links
BASE_URL=https://boliviablue.com
# For local development, use: BASE_URL=http://localhost:5173
```

### 2.2 Railway Environment Variables (Production)

If deploying to Railway, add these in the Railway dashboard:

1. Go to https://railway.app/dashboard
2. Select your BoliviaBlue project
3. Click **"Variables"** tab
4. Add all the variables from Step 2.1 above

### 2.3 Vercel Environment Variables (Frontend)

If deploying to Vercel, add this:

```env
VITE_API_URL=https://boliviablue-production.up.railway.app
```

---

## 📧 Step 3: EmailJS Setup (Rate Alerts)

EmailJS is free (200 emails/month) and easy to set up.

### 3.1 Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click **"Sign Up"** (free tier is sufficient)
3. Create an account

### 3.2 Create Email Service

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest setup)
   - **Outlook**
   - **Custom SMTP**
4. Follow the setup instructions
5. **Copy your Service ID** (e.g., `service_abc123`)

### 3.3 Create Email Template

1. Go to **"Email Templates"** in EmailJS
2. Click **"Create New Template"**
3. Name it: "Bolivia Blue Rate Alert"
4. Use this template:

**Subject:**
```
🔔 Bolivia Blue Rate Alert - {{rate_type}} Rate {{direction}} {{threshold}} BOB
```

**Body (HTML):**
```html
<h2>🔔 Tu Alerta de Tipo de Cambio</h2>

<p>El tipo de cambio <strong>{{rate_type}}</strong> {{direction}} a <strong>{{current_rate}} BOB</strong>.</p>

<p><strong>Tu umbral:</strong> {{threshold}} BOB</p>
<p><strong>Tasa actual:</strong> {{current_rate}} BOB</p>

<p>Visita <a href="{{site_url}}">{{site_url}}</a> para ver más detalles.</p>

<hr>
<p style="font-size: 12px; color: #666;">
  <a href="{{unsubscribe_url}}">Cancelar esta alerta</a>
</p>
```

**Note:** The `{{direction}}` variable will be "subió" (went up) or "bajó" (went down).

**Template Variables:**
- `{{to_email}}` - User's email (auto-filled)
- `{{rate_type}}` - "Compra" or "Venta"
- `{{current_rate}}` - Current rate (e.g., "10.50")
- `{{threshold}}` - Alert threshold (e.g., "10.00")
- `{{direction}}` - "subió" (went up) or "bajó" (went down)
- `{{unsubscribe_url}}` - Link to unsubscribe
- `{{site_url}}` - Your site URL
- `{{date}}` - Current date

5. **Copy your Template ID** (e.g., `template_xyz789`)

### 3.4 Get Public Key

1. Go to **"Account"** → **"General"** in EmailJS
2. **Copy your Public Key** (e.g., `abc123xyz789`)

### 3.5 Add to Environment Variables

Update your `backend/.env` with the EmailJS credentials:

```env
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=abc123xyz789
```

---

## ✅ Step 4: Verify Setup

### 4.1 Test Database Connection

1. Start your backend:
   ```bash
   cd backend
   npm run dev:supabase
   ```

2. Check logs for:
   ```
   Using Supabase database at https://rhwuncdxjlzmsgiprdkz.supabase.co
   ```

### 4.2 Test Rate Alerts

1. Go to your homepage: http://localhost:5173
2. Scroll to the Rate Alerts section
3. Fill out the form:
   - Enter your email
   - Choose alert type (Buy/Sell/Both)
   - Set threshold (e.g., current rate ± 0.10)
   - Choose direction (Above/Below)
   - Click "Create Alert"

4. Check Supabase:
   - Go to Supabase dashboard
   - Check `rate_alerts` table
   - You should see your alert

5. Wait for next rate update (15 minutes) or manually trigger by setting threshold very close to current rate

6. Check your email for notification

### 4.3 Test Daily Article Generation

1. **Manual test:**
   ```bash
   cd backend
   node test-article-generator.js
   ```

2. **Check Supabase:**
   - Go to Supabase dashboard
   - Check `blog_articles` table
   - You should see new articles with today's date

3. **Check logs:**
   - Look for: `✅ Daily articles generated successfully`

### 4.4 Verify Scheduler

Check backend logs for:
```
Refreshing blue rate and official rate...
Scheduling daily article generation...
Alert checker running...
```

---

## 🎯 Step 5: Production Deployment

### 5.1 Railway (Backend)

1. Ensure all environment variables are set in Railway dashboard
2. Railway will auto-deploy on push to main
3. Check Railway logs for successful startup

### 5.2 Vercel (Frontend)

1. Ensure `VITE_API_URL` is set in Vercel dashboard
2. Vercel will auto-deploy on push to main
3. Check Vercel logs for successful build

---

## 📊 Monitoring

### Check Active Alerts

```sql
SELECT * FROM rate_alerts WHERE is_active = true;
```

### Check Daily Articles

```sql
SELECT title, published_at, language 
FROM blog_articles 
ORDER BY published_at DESC 
LIMIT 10;
```

### Check Rate Updates

```sql
SELECT COUNT(*) as total_rates, 
       MAX(t) as latest_rate 
FROM rates;
```

---

## 🔧 Troubleshooting

### Rate Alerts Not Working

1. **Check Supabase table exists:**
   ```sql
   SELECT * FROM rate_alerts LIMIT 1;
   ```

2. **Check environment variables:**
   - Verify `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` are set
   - Check backend logs for EmailJS errors

3. **Check alert checker:**
   - Look for `checkAlerts()` in backend logs
   - Verify alerts are being checked every 15 minutes

### Daily Articles Not Generating

1. **Check database connection:**
   - Verify Supabase credentials in `.env`
   - Check backend logs for connection errors

2. **Check data availability:**
   ```sql
   SELECT COUNT(*) FROM rates;
   SELECT COUNT(*) FROM news;
   ```
   - Need at least some rates and news for articles

3. **Manual test:**
   ```bash
   cd backend
   node test-article-generator.js
   ```

### EmailJS Not Sending

1. **Check EmailJS dashboard:**
   - Go to EmailJS → Logs
   - Look for failed sends

2. **Verify template variables:**
   - Ensure all variables in template match what's being sent
   - Check template ID is correct

3. **Check free tier limits:**
   - Free tier: 200 emails/month
   - Check usage in EmailJS dashboard

---

## ✅ Setup Checklist

### Database
- [ ] `rate_alerts` table created in Supabase
- [ ] `blog_articles` table created in Supabase
- [ ] Tables verified with test queries

### Environment Variables
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_ANON_KEY` set
- [ ] `EMAILJS_SERVICE_ID` set
- [ ] `EMAILJS_TEMPLATE_ID` set
- [ ] `EMAILJS_PUBLIC_KEY` set
- [ ] `BASE_URL` set

### EmailJS
- [ ] EmailJS account created
- [ ] Email service configured
- [ ] Email template created
- [ ] Template variables verified

### Testing
- [ ] Rate alert created successfully
- [ ] Test email received
- [ ] Unsubscribe link works
- [ ] Daily article generated manually
- [ ] Scheduler running correctly

### Production
- [ ] Railway environment variables set
- [ ] Vercel environment variables set
- [ ] Production deployment successful
- [ ] Production alerts working
- [ ] Production articles generating

---

## 🎉 You're All Set!

Once you complete these steps:

✅ **Rate Alerts** will send email notifications when thresholds are met  
✅ **Daily Articles** will generate automatically every day at midnight  
✅ **Database** will store all data persistently  
✅ **Production** will have all features working

---

## 📚 Additional Resources

- **Rate Alerts Setup:** `RATE_ALERTS_SETUP.md`
- **Daily Article Automation:** `DAILY_ARTICLE_AUTOMATION.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Railway Setup:** `RAILWAY_SETUP.md`
- **Quick Start:** `QUICK_START.md`

---

## 🆘 Need Help?

If you encounter issues:

1. Check backend logs for error messages
2. Verify all environment variables are set correctly
3. Check Supabase dashboard for database errors
4. Check EmailJS dashboard for email sending errors
5. Review the troubleshooting section above

---

**Last Updated:** January 2025  
**All features are production-ready!** 🚀

