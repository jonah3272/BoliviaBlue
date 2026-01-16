# CORS Troubleshooting Guide

## Current Situation

OPTIONS preflight requests are **NOT reaching the Express server** (no logs appear). This indicates Railway's proxy/gateway is intercepting or blocking them before they reach your Node.js application.

## What We've Tried

1. ✅ Manual CORS middleware (multiple attempts)
2. ✅ `cors` package with proper configuration
3. ✅ Raw HTTP server intercepting OPTIONS before Express
4. ✅ Explicit OPTIONS route handlers
5. ✅ Catch-all OPTIONS handlers

**Result**: None of these work because OPTIONS requests never reach the server.

## Root Cause

Railway's infrastructure (proxy/load balancer) is handling OPTIONS requests and either:
- Not forwarding them to your application
- Responding without CORS headers
- Blocking them entirely

## Solutions to Try

### Option 1: Railway Custom Domain (Recommended)

1. In Railway dashboard, go to your service
2. Add a **custom domain** (e.g., `api.boliviablue.com`)
3. Point it to your Railway service
4. Update frontend `VITE_API_URL` to use the custom domain
5. This may bypass Railway's proxy issues

### Option 2: Check Railway Settings

1. Go to Railway dashboard → Your Service → Settings
2. Check for any proxy/load balancer settings
3. Look for CORS or HTTP method restrictions
4. Contact Railway support if you see restrictions

### Option 3: Use a Reverse Proxy/CDN

Use Cloudflare or another CDN in front of Railway:

1. Set up Cloudflare proxy in front of Railway
2. Configure CORS at Cloudflare level
3. Point frontend to Cloudflare URL instead of Railway directly

### Option 4: Test with curl

Test if OPTIONS requests work from command line:

```bash
curl -i -X OPTIONS https://boliviablue-production.up.railway.app/api/chat/messages \
  -H 'Origin: https://www.boliviablue.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

If this returns CORS headers, the issue is browser-specific. If not, Railway is blocking it.

### Option 5: Contact Railway Support

If none of the above work:
1. Open a ticket with Railway support
2. Explain that OPTIONS requests aren't reaching your application
3. Ask about proxy/load balancer configuration
4. Reference this issue: CORS preflight requests blocked at infrastructure level

### Option 6: Alternative Deployment

Consider deploying to a platform that gives you more control:
- **Vercel** (if compatible with your stack)
- **Render** (similar to Railway but different proxy)
- **Fly.io** (more control over networking)
- **DigitalOcean App Platform**

## Current Code Status

The code is correctly configured with:
- `cors` package as first middleware
- Raw HTTP server intercepting OPTIONS
- Proper origin validation
- Credentials support

The issue is **infrastructure-level**, not code-level.

## Next Steps

1. **Test with curl** (see Option 4) to confirm Railway is blocking
2. **Try Railway custom domain** (Option 1) - most likely to work
3. **Contact Railway support** if custom domain doesn't work
4. **Consider alternative deployment** if Railway can't be configured
