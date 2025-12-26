# 🔍 CORS Debugging Guide

**Issue:** Preflight requests returning 502, CORS headers not present

---

## 🐛 **CURRENT PROBLEM**

The network tab shows:
- **Preflight request:** Status `502` (Bad Gateway)
- **CORS error:** "No 'Access-Control-Allow-Origin' header is present"

A 502 means the server isn't responding to OPTIONS requests, OR Railway is blocking them.

---

## ✅ **WHAT WE'VE DONE**

1. ✅ Removed `cors` library entirely
2. ✅ Created custom CORS middleware (FIRST middleware)
3. ✅ Added explicit CORS headers to routes
4. ✅ Configured Helmet to not interfere
5. ✅ Using both `header()` and `setHeader()` methods

---

## 🔍 **DEBUGGING STEPS**

### **1. Check Railway Logs**

Check if the OPTIONS handler is being called:
- Look for: `🚨 OPTIONS PREFLIGHT: /api/newsletter/subscribe`
- Look for: `✅ OPTIONS: Returning 200 with CORS headers`

**If you DON'T see these logs:**
- The OPTIONS request isn't reaching the server
- Railway might be blocking OPTIONS requests
- Check Railway service configuration

### **2. Test OPTIONS Manually**

Use curl to test:
```bash
curl -X OPTIONS https://boliviablue-production.up.railway.app/api/newsletter/subscribe \
  -H "Origin: https://www.boliviablue.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected response:**
- Status: `200 OK`
- Headers: `Access-Control-Allow-Origin: https://www.boliviablue.com`
- Headers: `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

### **3. Check Railway Configuration**

Railway might need:
- **CORS headers in Railway settings**
- **Proxy configuration**
- **Environment variables**

---

## 🚨 **POSSIBLE RAILWAY ISSUE**

If preflight is getting 502, Railway might be:
1. **Blocking OPTIONS requests** before they reach your app
2. **Not forwarding OPTIONS** to your Express server
3. **Timeout on OPTIONS** requests

---

## 💡 **SOLUTION: Railway Proxy Headers**

Railway might need explicit CORS configuration. Check:
1. Railway Dashboard → Your Service → Settings
2. Look for "Headers" or "CORS" settings
3. Add CORS headers at Railway level

---

## 🔧 **ALTERNATIVE: Use Railway's Built-in CORS**

If Railway has CORS settings:
1. Enable CORS in Railway dashboard
2. Add `https://www.boliviablue.com` to allowed origins
3. Remove our custom CORS middleware (let Railway handle it)

---

## 📊 **NEXT STEPS**

1. **Check Railway logs** for OPTIONS handler execution
2. **Test OPTIONS manually** with curl
3. **Check Railway settings** for CORS/proxy configuration
4. **Consider Railway-level CORS** if available

---

**The 502 suggests Railway might be the issue, not our code!**

