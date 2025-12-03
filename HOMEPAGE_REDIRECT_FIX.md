# Fix: Homepage Showing as Redirect in Google Search Console

## Problem
Google Search Console is reporting that `https://boliviablue.com/` is a redirect, preventing it from being indexed.

## Possible Causes

1. **Trailing Slash Redirect**: Vercel might be redirecting `/` to `/` (self-redirect)
2. **www Redirect Rule**: The redirect rule might be incorrectly configured
3. **React Router Issue**: Client-side routing might be causing redirect detection
4. **Vercel Configuration**: Rewrites vs Redirects conflict

## Solution

### Step 1: Verify Current Configuration

Check your `vercel.json` - the redirect should ONLY match `www.boliviablue.com`, not `boliviablue.com`.

### Step 2: Test the Homepage

1. Visit `https://boliviablue.com/` directly in a browser
2. Open browser DevTools → Network tab
3. Check the response:
   - Should be **200 OK** (not 301/302)
   - Should NOT have a `Location` header
   - Should serve the actual HTML content

### Step 3: Check Google Search Console Details

In Google Search Console:
1. Go to **URL Inspection**
2. Enter `https://boliviablue.com/`
3. Click **Test Live URL**
4. Check what it says:
   - **"Redirect detected"** - Shows where it redirects to
   - **"Page is not indexed"** - Different issue

### Step 4: Fix the Redirect Rule

The redirect rule in `vercel.json` has been updated to be more specific:

```json
{
  "source": "/(.*)",
  "has": [
    {
      "type": "host",
      "value": "www.boliviablue.com"
    }
  ],
  "destination": "https://boliviablue.com/$1",
  "permanent": true,
  "statusCode": 301
}
```

This should ONLY redirect when the host is `www.boliviablue.com`.

### Step 5: Deploy and Test

1. Deploy the updated `vercel.json`
2. Wait 5-10 minutes for deployment
3. Test `https://boliviablue.com/` again
4. Check response headers - should be 200 OK

### Step 6: Request Re-indexing

After confirming the homepage returns 200 OK:
1. Go to Google Search Console → URL Inspection
2. Enter `https://boliviablue.com/`
3. Click **Request Indexing**

## Alternative: If Redirect Persists

If Google still sees a redirect after fixing `vercel.json`, it might be:

### Option A: Trailing Slash Issue
Vercel might be redirecting `/` to `/` (self-redirect). Check if you need to add:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Option B: Remove Redirect Rule Temporarily
If the redirect rule is causing issues, temporarily remove it:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Then handle www redirect at DNS level or in your domain settings.

### Option C: Check Vercel Domain Settings
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Check if there's a redirect configured there
3. Ensure `boliviablue.com` is the primary domain
4. Set `www.boliviablue.com` to redirect (if needed)

## Verification Checklist

After deploying:

- [ ] `https://boliviablue.com/` returns 200 OK (not 301/302)
- [ ] No `Location` header in response
- [ ] Homepage loads correctly in browser
- [ ] Google Search Console URL Inspection shows "URL is on Google" or "Request indexing available"
- [ ] No redirect detected in GSC

## Expected Timeline

- **Immediate**: After deployment, homepage should return 200 OK
- **5-10 minutes**: Vercel CDN cache clears
- **24-48 hours**: Google re-crawls and updates status
- **3-7 days**: Homepage gets indexed

## If Problem Persists

1. **Screenshot** the Google Search Console error message
2. **Check** browser DevTools Network tab when visiting homepage
3. **Test** with curl: `curl -I https://boliviablue.com/`
4. **Verify** no other redirects are configured (DNS, domain registrar, etc.)

---

**Most Common Fix**: The redirect rule was too broad. The updated `vercel.json` should fix this.

