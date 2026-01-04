#!/bin/bash
# Verification script for AdSense exclusion on /noticias page
# 
# This script uses curl to verify that AdSense scripts are NOT loaded on /noticias
# 
# Usage:
#   chmod +x frontend/scripts/verify-adsense-exclusion.sh
#   ./frontend/scripts/verify-adsense-exclusion.sh

BASE_URL="${1:-https://boliviablue.com}"

echo "🧪 Verifying AdSense exclusion on /noticias page..."
echo "📍 Testing: ${BASE_URL}/noticias"
echo ""

# Fetch the page HTML
HTML=$(curl -s "${BASE_URL}/noticias")

# Check for AdSense script
if echo "$HTML" | grep -qi "adsbygoogle"; then
  echo "❌ FAIL: AdSense script found in HTML!"
  echo "   This should NOT happen - /noticias should be excluded from AdSense"
  echo ""
  echo "   Found matches:"
  echo "$HTML" | grep -i "adsbygoogle" | head -5
  exit 1
else
  echo "✅ PASS: No AdSense script found in HTML"
fi

# Check for data-adsense-block attribute (indicates blocking)
if echo "$HTML" | grep -qi "data-adsense-block"; then
  echo "✅ PASS: data-adsense-block attribute found (ads are blocked)"
else
  echo "⚠️  WARNING: data-adsense-block attribute not found in initial HTML"
  echo "   (This is OK - blocking happens at runtime via JavaScript)"
fi

# Verify homepage still has ads (control test)
echo ""
echo "🔍 Control test: Verifying homepage can still load ads..."
HOME_HTML=$(curl -s "${BASE_URL}/")

if echo "$HOME_HTML" | grep -qi "adsenseLoader\|adsense-loader"; then
  echo "✅ PASS: AdSense loader present on homepage"
else
  echo "⚠️  WARNING: AdSense loader not found in homepage HTML"
  echo "   (This may be OK if loader is dynamically imported)"
fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "📝 Note: This test checks static HTML. For full verification:"
echo "   1. Open ${BASE_URL}/noticias in browser"
echo "   2. Open DevTools Console"
echo "   3. Look for: '[AdSense] Route excluded: /noticias'"
echo "   4. Check Network tab - should NOT see adsbygoogle.js"
echo "   5. Check DOM - should NOT find <script src*=\"adsbygoogle\">"

exit 0

