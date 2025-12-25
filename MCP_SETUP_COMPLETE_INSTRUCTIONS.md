# 🗄️ MCP Database Setup - Complete Instructions

**Date:** January 2025  
**Status:** ✅ Ready for MCP Execution

---

## 🚀 **QUICK START - USE MCP SERVER**

You have an MCP Supabase server connection configured. Use it to execute these SQL migrations:

### **Step 1: Newsletter Subscribers Table**

**MCP Command:**
```
Execute SQL migration: backend/supabase-newsletter.sql
```

**Or via MCP tool:**
- Tool: `mcp_supabase_apply_migration` (or similar)
- File: `backend/supabase-newsletter.sql`
- Description: "Create newsletter_subscribers table"

**What it creates:**
- ✅ `newsletter_subscribers` table (11 columns)
- ✅ 4 performance indexes
- ✅ Row Level Security (RLS) enabled
- ✅ 3 RLS policies
- ✅ Auto-update trigger

---

### **Step 2: Monthly Reports Table**

**MCP Command:**
```
Execute SQL migration: backend/supabase-monthly-reports.sql
```

**Or via MCP tool:**
- Tool: `mcp_supabase_apply_migration` (or similar)
- File: `backend/supabase-monthly-reports.sql`
- Description: "Create monthly_reports table"

**What it creates:**
- ✅ `monthly_reports` table (18 columns)
- ✅ 4 performance indexes
- ✅ Row Level Security (RLS) enabled
- ✅ 2 RLS policies
- ✅ Auto-update trigger

---

## 📋 **SQL FILES LOCATION**

Both SQL files are ready in your project:

1. **Newsletter Table:** `backend/supabase-newsletter.sql`
2. **Monthly Reports Table:** `backend/supabase-monthly-reports.sql`

---

## ✅ **VERIFICATION AFTER MCP EXECUTION**

After executing both SQL files via MCP, verify the setup:

### **Check Tables Exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('newsletter_subscribers', 'monthly_reports');
```

**Expected:** 2 rows

### **Check Newsletter Table Structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;
```

**Expected:** 11 columns

### **Check Monthly Reports Table Structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'monthly_reports'
ORDER BY ordinal_position;
```

**Expected:** 18 columns

### **Check Indexes:**
```sql
SELECT tablename, indexname
FROM pg_indexes 
WHERE tablename IN ('newsletter_subscribers', 'monthly_reports');
```

**Expected:** 8 indexes (4 per table)

### **Check RLS Policies:**
```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('newsletter_subscribers', 'monthly_reports');
```

**Expected:** 5 policies (3 for newsletter, 2 for monthly reports)

---

## 🎯 **AFTER MCP SETUP COMPLETE**

Once both tables are created via MCP:

### **1. Test Newsletter Subscription**
```bash
# Start backend
cd backend
npm run dev:supabase

# Test subscription via homepage or API
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","language":"es","source":"homepage"}'
```

### **2. Test Monthly Report Generation**
```bash
# Generate a test report (for December 2024)
cd backend
node -e "import('./monthlyReportGenerator.js').then(m => m.generateMonthlyReport(12, 2024, 'es'))"
```

### **3. Verify API Endpoints**
- ✅ `POST /api/newsletter/subscribe` - Should work
- ✅ `POST /api/newsletter/unsubscribe` - Should work
- ✅ `GET /api/monthly-reports` - Should return empty array (no reports yet)
- ✅ `GET /api/monthly-reports/12/2024` - Should return 404 (no report yet)

---

## 📊 **EXPECTED DATABASE STRUCTURE**

### **newsletter_subscribers Table:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | Unique email address |
| language | TEXT | 'es' or 'en' |
| subscribed_at | TIMESTAMPTZ | Subscription date |
| unsubscribed_at | TIMESTAMPTZ | Unsubscribe date (nullable) |
| is_active | BOOLEAN | Active status |
| source | TEXT | Subscription source |
| verification_token | TEXT | Email verification token |
| verified_at | TIMESTAMPTZ | Verification date |
| last_email_sent_at | TIMESTAMPTZ | Last newsletter sent |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### **monthly_reports Table:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| month | INTEGER | Month (1-12) |
| year | INTEGER | Year |
| language | TEXT | 'es' or 'en' |
| slug | TEXT | URL slug |
| title | TEXT | Report title |
| excerpt | TEXT | Report summary |
| content | TEXT | HTML content |
| average_buy_rate | NUMERIC | Average buy rate |
| average_sell_rate | NUMERIC | Average sell rate |
| highest_buy_rate | NUMERIC | Highest buy rate |
| highest_sell_rate | NUMERIC | Highest sell rate |
| lowest_buy_rate | NUMERIC | Lowest buy rate |
| lowest_sell_rate | NUMERIC | Lowest sell rate |
| volatility | NUMERIC | Volatility measure |
| key_events | TEXT[] | Array of key events |
| trend_analysis | TEXT | Trend analysis |
| predictions | TEXT | Next month predictions |
| chart_data | JSONB | Chart data points |
| published_at | TIMESTAMPTZ | Publication date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

## 🔍 **TROUBLESHOOTING**

### **If MCP Execution Fails:**

1. **Check MCP Connection:**
   - Verify MCP server is connected
   - Check project reference: `rhwuncdxjlzmsgiprdkz`
   - Verify MCP tools are available

2. **Alternative: Supabase SQL Editor:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to SQL Editor
   - Copy SQL from `backend/supabase-newsletter.sql`
   - Paste and execute
   - Repeat for `backend/supabase-monthly-reports.sql`

3. **Check Permissions:**
   - Ensure MCP has database write permissions
   - Verify service role key is configured

---

## ✅ **COMPLETION CHECKLIST**

- [ ] Newsletter table created via MCP
- [ ] Monthly reports table created via MCP
- [ ] All indexes created (8 total)
- [ ] RLS policies verified (5 total)
- [ ] Triggers verified (2 total)
- [ ] Test newsletter subscription
- [ ] Test monthly report generation
- [ ] Verify API endpoints work
- [ ] Test email sending

---

## 🎉 **READY TO GO!**

Once MCP execution is complete, your newsletter and monthly reports systems will be fully operational!

**Next Steps:**
1. ✅ Tables created via MCP
2. ✅ Test newsletter subscription
3. ✅ Generate first monthly report
4. ✅ Verify everything works

---

**MCP Server Connection:** ✅ Configured  
**SQL Files:** ✅ Ready  
**Status:** 🚀 Ready for Execution

