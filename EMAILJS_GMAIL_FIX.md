# 🔧 Fixing Gmail "Insufficient Authentication Scopes" Error

## The Problem

You're seeing this error:
```
Gmail_API: Request had insufficient authentication scopes.
```

This means Gmail didn't grant EmailJS permission to send emails.

---

## ✅ Solution 1: Reconnect Gmail with Full Permissions

### Step 1: Remove Old Connection

1. Go to your Google Account: https://myaccount.google.com/permissions
2. Find **"EmailJS"** in the list of connected apps
3. Click **"Remove"** or **"Revoke Access"**

### Step 2: Reconnect in EmailJS

1. Go to EmailJS dashboard: https://dashboard.emailjs.com/
2. Go to **"Email Services"**
3. Find your Gmail service
4. Click **"Reconnect"** or **"Edit"**
5. Click **"Connect Account"** again
6. **IMPORTANT:** When Google asks for permissions:
   - ✅ Check **ALL boxes**
   - ✅ Especially "Send email on your behalf"
   - ✅ Click **"Allow"** for all permissions

### Step 3: Verify Connection

- In EmailJS, the service should show **"Connected"** status
- Test sending an email from EmailJS dashboard

---

## ✅ Solution 2: Use Outlook Instead (Recommended)

If Gmail continues to have issues, **Outlook is easier and more reliable:**

### Step 1: Create New Outlook Service

1. EmailJS dashboard → **"Email Services"** → **"Add New Service"**
2. Choose **"Outlook"**
3. Click **"Connect Account"**
4. Sign in with your Microsoft account
5. Grant permissions (usually just one click)

### Step 2: Update Your Template

- Use the same template (no changes needed)
- Outlook works the same way as Gmail

### Step 3: Update Environment Variables

Update `backend/.env` with the new Outlook Service ID:

```env
EMAILJS_SERVICE_ID=service_outlook_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
EMAILJS_PUBLIC_KEY=your_public_key_here
```

---

## ✅ Solution 3: Use Custom SMTP (Most Reliable)

If both Gmail and Outlook have issues, use Custom SMTP:

### Step 1: Get SMTP Credentials

**Option A: Gmail App Password**
1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords → Generate new app password
4. Copy the 16-character password

**Option B: Use a Different Email Provider**
- Many email providers offer SMTP (SendGrid, Mailgun, etc.)
- Some have free tiers

### Step 2: Configure in EmailJS

1. EmailJS → **"Email Services"** → **"Add New Service"**
2. Choose **"Custom SMTP"**
3. Enter SMTP settings:
   - **Gmail SMTP:**
     - Host: `smtp.gmail.com`
     - Port: `587`
     - Username: `your-email@gmail.com`
     - Password: `your-app-password` (16-char from Step 1)
     - Secure: `TLS`

### Step 3: Test Connection

- EmailJS will test the connection
- If successful, you're good to go!

---

## 🧪 Test Your Fix

### Quick Test

1. **Update your `.env` file** with the new Service ID (if you switched services)
2. **Restart your backend:**
   ```bash
   cd backend
   npm run dev:supabase
   ```
3. **Create a test alert** on your homepage
4. **Check EmailJS logs:**
   - Dashboard → **"Logs"**
   - Should see successful sends (no errors)

### Check Backend Logs

When an alert triggers, you should see:
```
✅ Alert email sent to user@example.com for rate 10.50 BOB
```

If you still see errors, check:
- EmailJS dashboard → Logs (for detailed error messages)
- Backend console (for connection issues)

---

## 📋 Quick Checklist

- [ ] Removed old Gmail connection from Google Account
- [ ] Reconnected Gmail in EmailJS with ALL permissions
- [ ] OR: Switched to Outlook service
- [ ] OR: Set up Custom SMTP
- [ ] Updated `EMAILJS_SERVICE_ID` in `backend/.env`
- [ ] Restarted backend server
- [ ] Tested with a real alert
- [ ] Verified email received

---

## 💡 Recommendation

**For easiest setup:** Use **Outlook** - it's simpler and more reliable than Gmail for EmailJS.

**For most control:** Use **Custom SMTP** with Gmail App Password - works 100% of the time.

---

## 🆘 Still Having Issues?

1. **Check EmailJS Logs:**
   - Dashboard → Logs
   - Look for specific error messages

2. **Verify Service Status:**
   - Dashboard → Email Services
   - Service should show "Connected"

3. **Test from EmailJS Dashboard:**
   - Go to your template
   - Click "Test" button
   - This tests the service directly

4. **Check Free Tier Limits:**
   - Free tier: 200 emails/month
   - Check usage in dashboard

---

**Once fixed, your rate alerts will work perfectly!** 🎉



