# 🗄️ MCP Database Setup - Newsletter & Monthly Reports

**Date:** January 2025  
**MCP Server:** Supabase MCP (Connected)  
**Project:** `rhwuncdxjlzmsgiprdkz`

---

## 📋 **TABLES TO CREATE VIA MCP**

You have an MCP Supabase server connection. Use it to execute these SQL migrations:

### **1. Newsletter Subscribers Table**

**SQL File:** `backend/supabase-newsletter.sql`

**What it creates:**
- `newsletter_subscribers` table with all required columns
- Indexes for email, language, active status, verification token
- Row Level Security (RLS) policies
- Auto-update trigger for `updated_at`

**MCP Command:**
Use your MCP Supabase tool to execute the SQL from `backend/supabase-newsletter.sql`

**Full SQL:**
```sql
-- Newsletter Subscribers Table for Supabase
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  source TEXT,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_language ON newsletter_subscribers(language);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_verification_token ON newsletter_subscribers(verification_token);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (subscribe)
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public to read their own subscription (by email)
CREATE POLICY "Public can read own subscription"
  ON newsletter_subscribers
  FOR SELECT
  USING (true);

-- Policy: Allow public to update (unsubscribe, verify)
CREATE POLICY "Public can update own subscription"
  ON newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();
```

---

### **2. Monthly Reports Table**

**SQL File:** `backend/supabase-monthly-reports.sql`

**What it creates:**
- `monthly_reports` table with comprehensive data fields
- Indexes for month/year, language, slug, published_at
- Row Level Security (RLS) policies
- Auto-update trigger for `updated_at`

**MCP Command:**
Use your MCP Supabase tool to execute the SQL from `backend/supabase-monthly-reports.sql`

**Full SQL:**
```sql
-- Monthly Market Reports Table for Supabase
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  average_buy_rate NUMERIC(10, 4),
  average_sell_rate NUMERIC(10, 4),
  highest_buy_rate NUMERIC(10, 4),
  highest_sell_rate NUMERIC(10, 4),
  lowest_buy_rate NUMERIC(10, 4),
  lowest_sell_rate NUMERIC(10, 4),
  volatility NUMERIC(10, 4),
  key_events TEXT[],
  trend_analysis TEXT,
  predictions TEXT,
  chart_data JSONB,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year, language)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_reports_month_year ON monthly_reports(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_language ON monthly_reports(language);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_slug ON monthly_reports(slug);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_published_at ON monthly_reports(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public read access for monthly reports"
  ON monthly_reports
  FOR SELECT
  USING (true);

-- Policy: Allow backend to insert/update reports
CREATE POLICY "Backend can manage monthly reports"
  ON monthly_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monthly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_reports_updated_at();
```

---

## ✅ **VERIFICATION AFTER MCP EXECUTION**

After executing both SQL files via MCP, verify the tables exist:

### **Check Newsletter Table:**
```sql
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;
```

### **Check Monthly Reports Table:**
```sql
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'monthly_reports'
ORDER BY ordinal_position;
```

### **Check Indexes:**
```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('newsletter_subscribers', 'monthly_reports');
```

### **Check RLS Policies:**
```sql
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('newsletter_subscribers', 'monthly_reports');
```

---

## 🎯 **NEXT STEPS AFTER MCP SETUP**

Once both tables are created via MCP:

1. ✅ **Test Newsletter Subscription**
   - Go to homepage
   - Use newsletter signup form
   - Verify subscription saved to database

2. ✅ **Test Monthly Report Generation**
   - Backend will auto-generate on 1st of month
   - Or manually trigger: `node -e "import('./backend/monthlyReportGenerator.js').then(m => m.generateMonthlyReport(12, 2024, 'es'))"`

3. ✅ **Test API Endpoints**
   - `POST /api/newsletter/subscribe` - Should work
   - `GET /api/monthly-reports` - Should return empty array (no reports yet)
   - `GET /api/monthly-reports/12/2024` - Should return 404 (no report yet)

4. ✅ **Verify Email Sending**
   - Test newsletter subscription
   - Check that weekly newsletter sends correctly

---

## 📊 **EXPECTED RESULTS**

After MCP execution, you should have:

- ✅ `newsletter_subscribers` table with 11 columns
- ✅ `monthly_reports` table with 18 columns
- ✅ 4 indexes on newsletter table
- ✅ 4 indexes on monthly reports table
- ✅ RLS enabled on both tables
- ✅ 3 RLS policies on newsletter table
- ✅ 2 RLS policies on monthly reports table
- ✅ Auto-update triggers on both tables

---

## 🔍 **TROUBLESHOOTING**

### **If MCP Execution Fails:**

1. **Check MCP Connection:**
   - Verify MCP server is connected
   - Check project reference: `rhwuncdxjlzmsgiprdkz`

2. **Manual Alternative:**
   - Copy SQL from files
   - Paste into Supabase SQL Editor
   - Execute manually

3. **Verify Permissions:**
   - Ensure MCP has proper database permissions
   - Check service role key is configured

---

## ✅ **STATUS CHECKLIST**

- [ ] Newsletter table created via MCP
- [ ] Monthly reports table created via MCP
- [ ] Indexes verified
- [ ] RLS policies verified
- [ ] Triggers verified
- [ ] Test newsletter subscription
- [ ] Test monthly report generation
- [ ] Verify API endpoints work

---

**Note:** The MCP server connection allows direct database operations without manual SQL execution in Supabase dashboard. This is the fastest way to set up the tables!

