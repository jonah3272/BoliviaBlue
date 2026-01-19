# Check DNS Propagation for api.boliviablue.com

## 🚨 Current Status

Railway shows "Validating domain ownership" - this means DNS hasn't propagated yet or Railway hasn't detected it.

## ✅ How to Check DNS Propagation

### Method 1: Browser Console Test

**In browser console (F12):**
```javascript
fetch('https://api.boliviablue.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ DNS propagated! Railway works!', d))
  .catch(e => console.error('❌ DNS not ready yet:', e.message));
```

**If it works:** DNS is propagated, Railway just needs to detect it
**If it fails:** DNS hasn't propagated yet, wait longer

### Method 2: Command Line (if you have access)

**Windows PowerShell:**
```powershell
nslookup api.boliviablue.com
```

**Should show:**
```
Name:    api.boliviablue.com
Address: [some IP address]
```

**Or should show CNAME pointing to:**
```
f6fq38ru.up.railway.app
```

### Method 3: Online DNS Checker

Use an online tool:
- https://dnschecker.org
- Enter: `api.boliviablue.com`
- Check if it resolves to Railway's domain

## ⏰ Expected Timeline

- **Usually:** 5-30 minutes
- **Sometimes:** Up to 1 hour
- **Rarely:** Up to 24 hours

## 🔍 What to Check

### 1. Verify DNS Record is Correct

**In your domain provider's DNS settings:**
- Type: `CNAME`
- Name/Host: `api`
- Value/Target: `f6fq38ru.up.railway.app` (or `f6fq38ru.up.railway.app.` with trailing dot)
- TTL: `Automatic` or `3600`

**Common mistakes:**
- ❌ Name is `www` instead of `api`
- ❌ Value has wrong domain
- ❌ Missing trailing dot (usually OK, but some providers need it)

### 2. Wait for Propagation

After adding DNS record:
- Wait 5-30 minutes
- Railway will automatically detect it
- Status will change from "Validating" to "Active" or "Ready"

### 3. Check Railway Service Status

**Railway Dashboard** → Your service

**Look for:**
- Service status: Should be "Online" (not "Initializing")
- If "Initializing" → Wait for it to finish

## ✅ Once Railway Validates

After Railway shows domain as "Active":

1. **Set Vercel Environment Variable:**
   - Vercel → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://api.boliviablue.com`
   - Set for **Production**

2. **Redeploy Vercel:**
   - Deployments → Latest → "..." → Redeploy

3. **Test:**
   - Clear browser cache (Ctrl+Shift+R)
   - Console should show: `[Chat API] Using API_BASE: https://api.boliviablue.com`
   - Try sending a message

## 🚨 If DNS Doesn't Propagate After 1 Hour

1. **Double-check DNS record** in your domain provider
2. **Verify no typos** in the CNAME value
3. **Check if domain provider has DNS propagation delays**
4. **Try removing and re-adding the DNS record**
