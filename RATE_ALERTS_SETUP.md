# 🔔 Rate Alerts Setup Guide

**Status:** ✅ Implementation Complete  
**Next Step:** Configure EmailJS

---

## ✅ What's Been Implemented

### 1. **Database Table** ✅
- SQL schema created: `backend/supabase-rate-alerts.sql`
- Table: `rate_alerts` with all necessary fields
- Indexes for performance
- Row Level Security (RLS) configured

### 2. **Backend API** ✅
- `POST /api/alerts` - Create new alert
- `POST /api/alerts/unsubscribe` - Unsubscribe from alerts
- Alert checker job that runs every 15 minutes
- EmailJS integration ready

### 3. **Frontend Components** ✅
- `RateAlertForm` component - Beautiful form on homepage
- `Unsubscribe` page - For canceling alerts
- Integrated into homepage

### 4. **Scheduler Integration** ✅
- Alert checker runs automatically after each rate update
- Checks all active alerts
- Sends emails when thresholds are met

---

## 📋 Setup Instructions

### **Step 1: Create Supabase Table**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the sidebar
4. Copy and paste the contents of `backend/supabase-rate-alerts.sql`
5. Click **"Run"** to execute

This creates the `rate_alerts` table with:
- Email storage
- Alert preferences (type, threshold, direction)
- Unsubscribe tokens
- Trigger tracking

---

### **Step 2: Set Up EmailJS (Free Tier)**

EmailJS is a free email service (200 emails/month free). Here's how to set it up:

#### **2.1 Create EmailJS Account**

1. Go to https://www.emailjs.com/
2. Click **"Sign Up"** (free)
3. Create an account

#### **2.2 Create Email Service**

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest)
   - **Outlook**
   - **Custom SMTP**
4. Follow the setup instructions
5. **Copy your Service ID** (e.g., `service_abc123`)

#### **2.3 Create Email Template**

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Use this template:

**Subject:**
```
Bolivia Blue Rate Alert - {{rate_type}} Rate {{direction}} {{threshold}} BOB
```

**Body (HTML):**
```html
<h2>🔔 Tu Alerta de Tipo de Cambio</h2>

<p>El tipo de cambio <strong>{{rate_type}}</strong> ha {{direction}} a <strong>{{current_rate}} BOB</strong>.</p>

<p><strong>Tu umbral:</strong> {{threshold}} BOB</p>
<p><strong>Tasa actual:</strong> {{current_rate}} BOB</p>

<p>Visita <a href="{{site_url}}">{{site_url}}</a> para ver más detalles.</p>

<hr>
<p style="font-size: 12px; color: #666;">
  <a href="{{unsubscribe_url}}">Cancelar esta alerta</a>
</p>
```

4. **Copy your Template ID** (e.g., `template_xyz789`)

#### **2.4 Get Public Key**

1. Go to **"Account"** → **"General"**
2. **Copy your Public Key** (e.g., `abc123xyz789`)

---

### **Step 3: Add Environment Variables**

Add these to your `backend/.env` file:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=abc123xyz789

# Base URL for unsubscribe links
BASE_URL=https://boliviablue.com
```

**For local development:**
```env
BASE_URL=http://localhost:5173
```

---

### **Step 4: Test the Setup**

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Go to your homepage** (http://localhost:5173)

3. **Fill out the alert form:**
   - Enter your email
   - Choose alert type (Buy/Sell)
   - Set threshold
   - Choose direction (Above/Below)
   - Click "Create Alert"

4. **Check Supabase:**
   - Go to Supabase dashboard
   - Check `rate_alerts` table
   - You should see your alert

5. **Test alert trigger:**
   - Wait for next rate update (15 minutes)
   - Or manually trigger by setting a threshold very close to current rate
   - Check your email for notification

---

## 🎯 How It Works

### **User Flow:**

1. **User creates alert** → Stored in Supabase
2. **Every 15 minutes:**
   - Backend fetches new rate
   - Checks all active alerts
   - If threshold met → Sends email
   - Marks alert as triggered

### **Email Template Variables:**

- `{{to_email}}` - User's email
- `{{rate_type}}` - "Compra" or "Venta"
- `{{current_rate}}` - Current rate (e.g., "8.50")
- `{{threshold}}` - Alert threshold (e.g., "8.50")
- `{{direction}}` - "subió" or "bajó"
- `{{unsubscribe_url}}` - Link to unsubscribe
- `{{site_url}}` - Your site URL

---

## 🔧 Troubleshooting

### **Alerts not being created:**
- Check Supabase table exists
- Check RLS policies allow inserts
- Check backend logs for errors

### **Emails not sending:**
- Verify EmailJS credentials in `.env`
- Check EmailJS dashboard for errors
- Verify email template variables match
- Check backend logs: `checkAlerts()` function

### **Alerts not triggering:**
- Verify alert is active in Supabase
- Check if threshold logic is correct
- Verify rate updates are happening
- Check backend logs for alert check results

---

## 📊 Monitoring

### **Check Active Alerts:**
```sql
SELECT * FROM rate_alerts WHERE is_active = true;
```

### **Check Triggered Alerts:**
```sql
SELECT * FROM rate_alerts WHERE triggered_at IS NOT NULL;
```

### **Alert Statistics:**
```sql
SELECT 
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE is_active = true) as active_alerts,
  COUNT(*) FILTER (WHERE triggered_at IS NOT NULL) as triggered_alerts
FROM rate_alerts;
```

---

## 🚀 Next Steps

After setup is complete:

1. ✅ Test with your own email
2. ✅ Monitor EmailJS usage (200/month free)
3. ✅ Consider upgrading if you exceed free tier
4. ✅ Add more email templates (Spanish/English)
5. ✅ Consider SMS alerts (Twilio - paid)

---

## 💡 Optional Enhancements

### **1. Multiple Language Email Templates**
- Create separate templates for Spanish/English
- Detect user language from alert

### **2. SMS Alerts**
- Integrate Twilio for SMS notifications
- More expensive but higher engagement

### **3. Alert History**
- Show users their alert history
- Allow reactivating alerts

### **4. Rate Predictions**
- "Alert me when rate is predicted to hit X"
- Based on trend analysis

---

## ✅ Setup Checklist

- [ ] Supabase table created
- [ ] EmailJS account created
- [ ] Email service configured
- [ ] Email template created
- [ ] Environment variables added
- [ ] Test alert created
- [ ] Test email received
- [ ] Unsubscribe link tested

---

**Once you complete these steps, rate alerts will be fully functional!** 🎉

