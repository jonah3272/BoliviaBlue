# 📧 EmailJS Quick Setup Guide

## ✅ Step-by-Step Setup

### 1. Create Account
- Go to: https://www.emailjs.com/
- Sign up (free tier: 200 emails/month)

### 2. Create Email Service
- Dashboard → **"Email Services"** → **"Add New Service"**
- Choose: **Gmail** (easiest) or **Outlook**

**⚠️ IMPORTANT - Gmail Setup:**
1. When connecting Gmail, make sure to:
   - Grant **all requested permissions** (especially "Send email on your behalf")
   - Use a **Gmail account** (not Google Workspace)
   - If you see "insufficient authentication scopes" error:
     - Go to your Google Account: https://myaccount.google.com/permissions
     - Remove EmailJS access
     - Reconnect in EmailJS dashboard
     - Grant ALL permissions when prompted

**Alternative: Use Outlook (Easier)**
- If Gmail gives issues, use **Outlook** instead
- Outlook setup is simpler and more reliable
- Just connect your Microsoft account

- **Copy Service ID** (starts with `service_`)

### 3. Create Email Template
- Dashboard → **"Email Templates"** → **"Create New Template"**
- Name: `Bolivia Blue Rate Alert`

**Subject Line:**
```
🔔 Bolivia Blue Rate Alert - {{rate_type}} Rate {{direction}} {{threshold}} BOB
```

**Email Body (HTML):**
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

**Note:** The `{{direction}}` variable will be "subió" (went up) or "bajó" (went down) in Spanish.

**Important:** Make sure these template variables are added:
- `{{to_email}}` - User's email
- `{{rate_type}}` - "Compra" or "Venta"
- `{{current_rate}}` - Current rate (e.g., "10.50")
- `{{threshold}}` - Alert threshold (e.g., "10.00")
- `{{direction}}` - "subió" or "bajó"
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{site_url}}` - Your site URL

- **Copy Template ID** (starts with `template_`)

### 4. Get Public Key
- Dashboard → **"Account"** → **"General"**
- **Copy Public Key** (long alphanumeric string)

### 5. Add to Environment Variables

Add to `backend/.env`:

```env
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
EMAILJS_PUBLIC_KEY=your_public_key_here
BASE_URL=https://boliviablue.com
```

**For local testing:**
```env
BASE_URL=http://localhost:5173
```

### 6. Test It!

1. **Restart your backend:**
   ```bash
   cd backend
   npm run dev:supabase
   ```

2. **Create a test alert:**
   - Go to homepage
   - Fill out rate alert form
   - Set threshold very close to current rate
   - Submit

3. **Check EmailJS logs:**
   - Go to EmailJS dashboard → **"Logs"**
   - You should see email sends

4. **Check your email inbox**

---

## 🔍 Verification

### Check Backend Logs

When an alert triggers, you should see:
```
✅ Alert email sent to user@example.com for rate 10.50 BOB
```

If EmailJS is not configured, you'll see:
```
⚠️  EmailJS not configured. Skipping email send.
```

### Check EmailJS Dashboard

- Go to **"Logs"** tab
- You'll see all email sends (successful and failed)
- Free tier: 200 emails/month limit

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   # In backend directory
   cat .env | grep EMAILJS
   ```

2. **Verify template variables match:**
   - Code sends: `rate_type`, `current_rate`, `threshold`, `direction`, `unsubscribe_url`, `site_url`
   - Template must have: `{{rate_type}}`, `{{current_rate}}`, etc.

3. **Check EmailJS logs:**
   - Dashboard → Logs
   - Look for error messages

4. **Verify service is connected:**
   - Dashboard → Email Services
   - Make sure service shows "Connected"

### Template Variables Not Working

- Variable names are case-sensitive
- Use double curly braces: `{{variable_name}}`
- Make sure variable names match exactly what the code sends

### Free Tier Limits

- **200 emails/month** on free tier
- Check usage in EmailJS dashboard
- Upgrade if needed (paid plans available)

---

## 📝 Template Variable Reference

Here's what the backend sends:

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `to_email` | `user@example.com` | Recipient email |
| `rate_type` | `Compra` or `Venta` | Type of rate |
| `current_rate` | `10.50` | Current exchange rate |
| `threshold` | `10.00` | Alert threshold |
| `direction` | `subió` or `bajó` | Direction of change |
| `unsubscribe_url` | `https://boliviablue.com/unsubscribe?token=...` | Unsubscribe link |
| `site_url` | `https://boliviablue.com` | Your site URL |

---

## ✅ Quick Test

1. Set up EmailJS (steps 1-5 above)
2. Add credentials to `backend/.env`
3. Restart backend
4. Create test alert with threshold = current rate ± 0.01
5. Wait for next rate update (15 min) or manually trigger
6. Check email!

---

**That's it!** Once set up, alerts will automatically send emails when thresholds are met. 🎉

