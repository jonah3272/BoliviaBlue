# 📧 Zoho Mail Setup Guide

This guide explains how to set up Zoho Mail for sending email notifications (rate alerts) in Bolivia Blue con Paz.

## ✅ Overview

We've migrated from EmailJS to Zoho Mail for better reliability and control. Zoho Mail uses SMTP to send emails directly from your Zoho account.

---

## 📋 Prerequisites

1. **Zoho Account** - You need a Zoho account with email configured
2. **Domain Verified** - Your domain (`boliviablue.com`) must be verified in Zoho (already done ✅)
3. **App Password** - You'll need to generate an app-specific password for SMTP

---

## 🔧 Step-by-Step Setup

### Step 1: Generate Zoho App Password

1. **Log in to Zoho Mail:**
   - Go to: https://mail.zoho.com/
   - Sign in with your Zoho account

2. **Navigate to Security Settings:**
   - Click on your profile/account icon (top right)
   - Go to **"Settings"** → **"Security"**
   - Or go directly to: https://accounts.zoho.com/home#security/app-passwords

3. **Create App Password:**
   - Scroll down to **"App Passwords"** section
   - Click **"Generate New Password"**
   - Give it a name: `Bolivia Blue SMTP` or `Backend Email Service`
   - Click **"Generate"**
   - **IMPORTANT:** Copy the password immediately - you won't be able to see it again!
   - The password will look like: `AbCdEfGhIjKlMnOp` (16 characters)

### Step 2: Get Your Zoho Email Address

- Your Zoho email address (e.g., `contact@boliviablue.com` or `noreply@boliviablue.com`)
- This is the email address that will send the notifications

### Step 3: Configure Environment Variables

Add these variables to your `backend/.env` file:

```env
# Zoho Mail SMTP Configuration
ZOHO_EMAIL=your-email@boliviablue.com
ZOHO_APP_PASSWORD=your-app-password-here
ZOHO_FROM_EMAIL=your-email@boliviablue.com
ZOHO_FROM_NAME=Bolivia Blue con Paz

# Optional: Custom SMTP settings (usually not needed)
# ZOHO_SMTP_HOST=smtp.zoho.com
# ZOHO_SMTP_PORT=587

# Base URL for unsubscribe links
BASE_URL=https://boliviablue.com
```

**For local development:**
```env
BASE_URL=http://localhost:5173
```

### Step 4: Update Production Environment Variables

**If deploying to Railway:**
1. Go to Railway dashboard: https://railway.app/dashboard
2. Select your BoliviaBlue project
3. Click **"Variables"** tab
4. Add all the Zoho variables from Step 3

**If deploying to Vercel/other platforms:**
- Add the same environment variables in your platform's settings

---

## 🧪 Testing

### Test Email Connection

You can test the Zoho SMTP connection by running:

```bash
cd backend
node -e "import('./emailService.js').then(m => m.verifyConnection())"
```

You should see:
```
✅ Zoho SMTP connection verified
```

### Test Rate Alert

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev:supabase
   ```

2. **Create a test alert:**
   - Go to your homepage
   - Fill out the rate alert form
   - Set a threshold very close to the current rate (so it triggers immediately)
   - Submit the form

3. **Check backend logs:**
   - You should see: `✅ Alert email sent to your-email@example.com for rate X.XX BOB`

4. **Check your email inbox:**
   - You should receive a beautifully formatted HTML email with the alert

---

## 📧 Email Template

The rate alert emails include:
- ✅ Professional HTML design with gradient header
- ✅ Current rate display
- ✅ Threshold comparison
- ✅ Link to your website
- ✅ Unsubscribe link
- ✅ Mobile-responsive design

---

## 🔍 Troubleshooting

### "Zoho Mail not configured" Warning

**Problem:** You see this in logs:
```
⚠️  Zoho Mail not configured. Skipping email send.
```

**Solution:**
1. Check that `ZOHO_EMAIL` and `ZOHO_APP_PASSWORD` are set in `.env`
2. Make sure you're using the **App Password**, not your regular Zoho password
3. Restart your backend server after adding environment variables

### "Authentication failed" Error

**Problem:** SMTP authentication fails

**Solutions:**
1. **Verify App Password:**
   - Make sure you copied the full 16-character app password
   - App passwords are case-sensitive
   - Generate a new one if needed

2. **Check Email Address:**
   - Use the full email address (e.g., `contact@boliviablue.com`)
   - Make sure it matches your Zoho account

3. **Verify Domain:**
   - Ensure your domain is verified in Zoho
   - Check Zoho Mail admin panel

### "Connection timeout" Error

**Problem:** Can't connect to Zoho SMTP

**Solutions:**
1. **Check Firewall:**
   - Ensure port 587 (TLS) is not blocked
   - Some networks block SMTP ports

2. **Try Port 465 (SSL):**
   - Update `ZOHO_SMTP_PORT=465` in `.env`
   - The code will automatically use SSL for port 465

3. **Check Zoho Status:**
   - Visit: https://status.zoho.com/
   - Ensure Zoho Mail is operational

### Emails Not Arriving

**Problem:** Emails sent but not received

**Solutions:**
1. **Check Spam Folder:**
   - Zoho emails might go to spam initially
   - Mark as "Not Spam" to train filters

2. **Verify Email Address:**
   - Double-check the recipient email in the alert
   - Test with your own email first

3. **Check Zoho Sending Limits:**
   - Free Zoho accounts have sending limits
   - Check your account limits in Zoho dashboard

4. **Review Backend Logs:**
   - Look for error messages
   - Check if emails are actually being sent

---

## 📊 Monitoring

### Check Email Sends

Monitor email sending in your backend logs:
- Successful sends: `✅ Email sent to user@example.com: message-id`
- Failed sends: `❌ Error sending email to user@example.com: error-message`

### Rate Limits

Zoho Mail has sending limits based on your plan:
- **Free Plan:** Limited (check Zoho documentation)
- **Paid Plans:** Higher limits

For high-volume sending, consider:
- Upgrading Zoho plan
- Using a dedicated email service (SendGrid, Mailgun, etc.)

---

## 🔄 Migration from EmailJS

If you were previously using EmailJS:

1. ✅ **Code Updated:** `alertChecker.js` now uses Zoho Mail
2. ✅ **Email Service:** New `emailService.js` module created
3. ⚠️ **Environment Variables:** Remove old EmailJS variables:
   - `EMAILJS_SERVICE_ID` (no longer needed)
   - `EMAILJS_TEMPLATE_ID` (no longer needed)
   - `EMAILJS_PUBLIC_KEY` (no longer needed)
4. ✅ **Add Zoho Variables:** Add the new Zoho variables (see Step 3 above)

---

## 📝 Quick Reference

### Required Environment Variables

```env
ZOHO_EMAIL=your-email@boliviablue.com
ZOHO_APP_PASSWORD=your-16-char-app-password
ZOHO_FROM_EMAIL=your-email@boliviablue.com
ZOHO_FROM_NAME=Bolivia Blue con Paz
BASE_URL=https://boliviablue.com
```

### SMTP Settings (Default)

- **Host:** `smtp.zoho.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Security:** TLS (port 587) or SSL (port 465)
- **Authentication:** Required (email + app password)

### Test Command

```bash
cd backend
node -e "import('./emailService.js').then(m => m.verifyConnection())"
```

---

## ✅ Verification Checklist

- [ ] Zoho account created and domain verified
- [ ] App password generated and copied
- [ ] Environment variables added to `backend/.env`
- [ ] Environment variables added to production (Railway/Vercel)
- [ ] Backend restarted after adding variables
- [ ] SMTP connection verified (test command successful)
- [ ] Test alert created and email received
- [ ] Email formatting looks good
- [ ] Unsubscribe link works

---

## 🆘 Support

If you encounter issues:

1. **Check Backend Logs:** Look for error messages
2. **Verify Configuration:** Double-check all environment variables
3. **Test Connection:** Use the verification command above
4. **Zoho Support:** Contact Zoho support if SMTP issues persist

---

**Last Updated:** January 2025  
**Status:** ✅ Ready for Production

