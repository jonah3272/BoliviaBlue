# 🗄️ MCP Database Setup Instructions

**Date:** January 2025  
**Status:** Ready for MCP Execution

---

## 📋 **DATABASE TABLES TO CREATE**

You have an MCP Supabase server connection configured. Use it to execute these SQL migrations:

### **1. Newsletter Subscribers Table**

**File:** `backend/supabase-newsletter.sql`

**What it creates:**
- `newsletter_subscribers` table
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update trigger

**MCP Command:**
Use the MCP Supabase tool to execute the SQL from `backend/supabase-newsletter.sql`

### **2. Monthly Reports Table**

**File:** `backend/supabase-monthly-reports.sql`

**What it creates:**
- `monthly_reports` table
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update trigger

**MCP Command:**
Use the MCP Supabase tool to execute the SQL from `backend/supabase-monthly-reports.sql`

---

## ✅ **VERIFICATION**

After executing both SQL files, verify the tables exist:

```sql
-- Check newsletter table
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletter_subscribers';

-- Check monthly reports table
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'monthly_reports';
```

---

## 🎯 **NEXT STEPS AFTER MCP SETUP**

1. ✅ Tables created via MCP
2. ✅ Test newsletter subscription
3. ✅ Test monthly report generation
4. ✅ Verify email sending works

---

**Note:** The MCP server connection allows direct database operations without manual SQL execution in Supabase dashboard.

