# Stage Environment Setup

This guide explains how to deploy the stage branch to `stage.boliviablue.com` with proper noindex settings to prevent Google indexing.

## Overview

The stage branch automatically:
- ✅ Adds `noindex, nofollow` meta tags when deployed to `stage.boliviablue.com`
- ✅ Updates canonical URLs to use `stage.boliviablue.com`
- ✅ Prevents search engine indexing

## Deployment Steps

### 1. Deploy Stage Branch

Deploy the `stage` branch to `stage.boliviablue.com` using your hosting platform (Vercel, Netlify, etc.).

### 2. Update robots.txt for Stage

**Important:** Copy `robots-stage.txt` to `robots.txt` during the build process for stage environment:

```bash
# In your build script or deployment platform:
cp frontend/public/robots-stage.txt frontend/public/robots.txt
```

Or configure your deployment platform to:
- Use `robots-stage.txt` as `robots.txt` for stage environment
- Set environment variable `VITE_ENV=stage`

### 3. Verify Noindex

After deployment, verify that:
1. Visit `https://stage.boliviablue.com`
2. View page source
3. Check for: `<meta name="robots" content="noindex, nofollow" />`
4. Check `robots.txt`: Should show `Disallow: /`

## How It Works

### Automatic Detection

The `PageMeta` component automatically detects stage environment by checking:
- `window.location.hostname === 'stage.boliviablue.com'`
- Hostname contains `'stage'`
- Environment variable `VITE_ENV === 'stage'`

### Files Modified

1. **`frontend/src/components/PageMeta.jsx`**
   - Auto-detects stage environment
   - Adds `noindex, nofollow` meta tag
   - Updates baseUrl to `stage.boliviablue.com`

2. **`frontend/index.html`**
   - Includes inline script to set noindex for stage
   - Fallback if React hasn't loaded yet

3. **`frontend/public/robots-stage.txt`**
   - Template robots.txt for stage (disallows all crawlers)
   - Should be copied to `robots.txt` during stage builds

## Testing

To test locally:
1. Add to `/etc/hosts`: `127.0.0.1 stage.boliviablue.com`
2. Run dev server
3. Visit `http://stage.boliviablue.com:5173`
4. Verify noindex meta tag appears

## Production vs Stage

| Feature | Production (main) | Stage (stage branch) |
|---------|------------------|---------------------|
| Domain | boliviablue.com | stage.boliviablue.com |
| Robots | index, follow | noindex, nofollow |
| robots.txt | Allow all | Disallow all |
| Canonical URLs | boliviablue.com | stage.boliviablue.com |
| Google Indexing | ✅ Allowed | ❌ Blocked |

## Notes

- Stage branch should be kept in sync with main for testing
- All changes to stage should eventually be merged to main
- Stage is for testing and preview only - never for production traffic

