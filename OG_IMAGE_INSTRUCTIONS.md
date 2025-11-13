# OG Image Creation Instructions

## Current Status
✅ OG image is configured at: `https://boliviablue.com/og-image.webp`
✅ File exists: `frontend/public/og-image.webp`

## How to Update/Create the OG Image

### Option 1: Use the HTML Template (Recommended)
1. Open `frontend/public/og-image-template.html` in a browser
2. Take a screenshot at 1200x630 pixels
3. Save as `og-image.webp` or `og-image.png`
4. Place in `frontend/public/` folder

### Option 2: Use Online Tools
1. **Canva** (https://www.canva.com):
   - Create custom design: 1200x630px
   - Add your branding
   - Download as PNG/WebP
   - Place in `frontend/public/`

2. **Figma**:
   - Create frame: 1200x630px
   - Design your OG image
   - Export as PNG/WebP

### Option 3: Use Command Line (if you have Node.js)
```bash
# Install puppeteer
npm install -g puppeteer

# Use a script to convert HTML to image
# Or use online services like:
# - https://htmlcsstoimage.com
# - https://www.screenshotapi.net
```

### Image Requirements:
- **Size:** 1200x630 pixels (exact)
- **Format:** PNG or WebP
- **File Size:** Under 1MB (ideally 200-500KB)
- **Content Should Include:**
  - Site name: "Bolivia Blue con Paz"
  - Key message: "Bolivia Blue Rate" or "Real-Time Exchange Rate"
  - Visual branding (colors matching your site)
  - Current rate (optional, but would require dynamic generation)

### Testing Your OG Image:
1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
   - Enter your URL
   - Preview how it will look

3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
   - Enter your URL
   - See preview

### Dynamic OG Images (Advanced)
If you want to show the current exchange rate in the image, you'll need:
- Server-side image generation (using libraries like `sharp`, `canvas`, or `puppeteer`)
- API endpoint that generates the image on-demand
- Cache the generated image for performance

For now, a static branded image is recommended and sufficient for SEO.

