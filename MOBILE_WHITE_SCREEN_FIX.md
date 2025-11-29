# Mobile White Screen Fix Guide

## 🚨 Current Issue

Your phone is showing a white screen when visiting `boliviablue.com`. Based on diagnostics, the site is currently **unreachable** (connection refused), which means it's not a rendering issue but a deployment/hosting issue.

## 🔍 Root Cause

The site appears to be **down or not properly deployed**. This could be due to:

1. **Vercel deployment failure** - Frontend not building or serving correctly
2. **Railway backend down** - Backend service stopped or crashed
3. **DNS/Domain issues** - Domain not pointing to the right location
4. **Environment variables missing** - Causing build or runtime failures

## ✅ Immediate Fixes to Try

### 1. Check Vercel Deployment Status

Go to your Vercel dashboard: https://vercel.com/dashboard

- Check if the latest deployment succeeded (green checkmark)
- Look for any failed builds (red X)
- If failed, check the build logs for errors

**Common Vercel Issues:**
- Missing environment variables
- Build timeout
- Out of memory during build
- Node version mismatch

### 2. Check Railway Backend Status

Go to your Railway dashboard: https://railway.app/dashboard

- Check if the backend service is running (green status)
- Look at recent logs for errors
- Verify the service didn't crash

**Common Railway Issues:**
- Missing Supabase environment variables
- Database connection failures
- Port binding issues
- Memory/CPU limits exceeded

### 3. Verify Environment Variables

**Vercel (Frontend):**
```bash
VITE_API_URL=https://boliviablue-production.up.railway.app
```

**Railway (Backend):**
```bash
PORT=3000
ORIGIN=https://bolivia-blue-con-paz.vercel.app
SUPABASE_URL=https://rhwuncdxjlzmsgiprdkz.supabase.co
SUPABASE_ANON_KEY=[your-key-here]
BLUE_SAMPLE_SIZE=20
NEWS_SOURCES=[rss-feeds]
```

### 4. Test Backend Directly

Open your browser or use curl to test the Railway backend directly:

```bash
# Test if backend is alive
curl https://boliviablue-production.up.railway.app/api/health

# Should return something like:
# {"ok":true,"updated_at_iso":"2025-11-29T...","history_points":123}
```

If this fails, your Railway backend is down.

### 5. Rebuild and Redeploy

**Option A: Trigger Redeploy on Vercel**
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

**Option B: Push a small change to trigger rebuild**
```bash
# From your local repository
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### 6. Check Domain Configuration

Verify your domain is pointing to Vercel:

1. Go to your domain registrar
2. Check DNS records for `boliviablue.com`
3. Should have:
   - CNAME or A record pointing to Vercel
   - Properly configured at both domain and Vercel sides

## 🛠️ Mobile-Specific Issues (If Site Works on Desktop)

If the site works on desktop but not on mobile, these are additional things to check:

### JavaScript Errors on Mobile

Add error boundary to catch mobile-specific JS errors:

```javascript
// Add to src/main.jsx
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### Mobile Safari Issues

Mobile Safari has stricter rules:

1. **CSP (Content Security Policy)** might block scripts
2. **CORS issues** might be more visible
3. **Service Worker** might cause caching issues

**Quick Fix for Service Worker Cache:**
- Open phone Settings > Safari > Clear History and Website Data
- Or use Chrome mobile > Settings > Privacy > Clear browsing data

### Viewport Meta Tag

Your viewport is already correct, but verify it didn't get removed:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Add Mobile Debugging

Create a temporary debug version to see errors on mobile:

Add to `frontend/index.html` before closing `</body>`:

```html
<!-- Mobile Debug Console -->
<script>
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    const style = document.createElement('style');
    style.textContent = `
      #mobile-debug {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0,0,0,0.9);
        color: #0f0;
        font-family: monospace;
        font-size: 10px;
        padding: 10px;
        z-index: 999999;
        border-top: 2px solid #0f0;
      }
    `;
    document.head.appendChild(style);
    
    const debug = document.createElement('div');
    debug.id = 'mobile-debug';
    debug.innerHTML = '<strong>Debug Console:</strong><br>';
    document.body.appendChild(debug);
    
    const log = (msg) => {
      debug.innerHTML += msg + '<br>';
      debug.scrollTop = debug.scrollHeight;
    };
    
    window.onerror = (msg, url, line, col, error) => {
      log(`ERROR: ${msg} at ${url}:${line}:${col}`);
      return false;
    };
    
    console.error = (function(oldError) {
      return function() {
        log('ERROR: ' + Array.from(arguments).join(' '));
        oldError.apply(console, arguments);
      };
    })(console.error);
    
    log('Debug console loaded');
    log('User Agent: ' + navigator.userAgent);
    log('Screen: ' + window.screen.width + 'x' + window.screen.height);
  }
</script>
```

## 🎯 Step-by-Step Troubleshooting

Follow these steps in order:

### Step 1: Test if site is up at all
```bash
curl -I https://boliviablue.com
```

If you get a connection error, proceed to Step 2.

### Step 2: Check Vercel Dashboard
- Go to https://vercel.com/dashboard
- Look for failed deployments
- Check build logs
- Verify domain is connected

### Step 3: Check Railway Dashboard  
- Go to https://railway.app/dashboard
- Verify service is running
- Check logs for errors
- Test health endpoint directly

### Step 4: Verify DNS
```bash
# Check DNS resolution
nslookup boliviablue.com
dig boliviablue.com
```

### Step 5: Clear Mobile Cache
- iPhone: Settings > Safari > Clear History and Website Data
- Android Chrome: Settings > Privacy > Clear browsing data

### Step 6: Try in incognito/private mode on mobile
This rules out cache/cookie issues.

## 🔧 Quick Emergency Fixes

### If Vercel Build is Failing

Add this to `frontend/vite.config.js`:

```javascript
export default defineConfig({
  // ... existing config
  build: {
    // Increase memory for build
    chunkSizeWarningLimit: 2000,
    // Simpler minification if terser fails
    minify: 'esbuild',
  }
});
```

### If Railway Backend Crashed

Check Railway logs and look for:
- `ECONNREFUSED` - Can't connect to Supabase
- `Out of memory` - Increase Railway plan
- `Port already in use` - Railway restart issue

### Emergency Static Fallback

If all else fails, create a simple holding page:

1. Create `frontend/public/maintenance.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Bolivia Blue - Maintenance</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
    }
    h1 { font-size: 2.5em; margin: 0 0 20px; }
    p { font-size: 1.2em; line-height: 1.6; }
    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 30px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Mantenimiento</h1>
    <div class="spinner"></div>
    <p>Bolivia Blue está en mantenimiento. Volveremos pronto.</p>
    <p style="font-size: 0.9em; margin-top: 30px;">
      Por favor, regrese en unos minutos.
    </p>
  </div>
  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
```

## 📱 Testing Mobile After Fixes

After implementing fixes:

1. **Clear mobile cache** (important!)
2. **Test in incognito/private mode** first
3. **Check different mobile browsers** (Safari, Chrome, Firefox)
4. **Test on mobile data** vs WiFi (sometimes ISP caching)
5. **Check developer tools** if available:
   - Safari iOS: Settings > Safari > Advanced > Web Inspector
   - Chrome Android: Connect to desktop Chrome DevTools

## 📞 Still Not Working?

If none of the above works:

1. Share the **Vercel build logs** (copy/paste errors)
2. Share the **Railway runtime logs** (last 50 lines)
3. Share what you see when visiting:
   - https://boliviablue.com directly
   - https://bolivia-blue-con-paz.vercel.app (your Vercel subdomain)
   - https://boliviablue-production.up.railway.app/api/health (backend directly)

## ✅ Checklist

Before considering it fixed, verify:

- [ ] Vercel deployment shows green checkmark
- [ ] Railway backend is running (green status)
- [ ] Backend health endpoint responds: `/api/health`
- [ ] Site loads on desktop browser
- [ ] Site loads on mobile browser
- [ ] Site loads in incognito/private mode on mobile
- [ ] No console errors in browser DevTools
- [ ] Charts and data are loading correctly

---

**Last Updated:** November 29, 2025

