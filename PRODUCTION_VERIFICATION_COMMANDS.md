# 🔍 Production Verification Commands

**Purpose:** Verify noindex implementation after deployment  
**Site:** boliviablue.com

---

## ✅ Quick Verification (All-in-One)

```bash
# Verify all 6 noindex pages in one command
for url in "dolar-blue-la-paz" "dolar-blue-santa-cruz" "dolar-blue-cochabamba" "euro-a-boliviano" "real-a-boliviano" "unsubscribe"; do
  echo "Checking https://boliviablue.com/$url"
  curl -s "https://boliviablue.com/$url" | grep -i "robots" | grep -i "noindex" || echo "❌ FAIL: No noindex tag found"
done
```

**Expected Output:**
```
Checking https://boliviablue.com/dolar-blue-la-paz
<meta name="robots" content="noindex, nofollow" />
Checking https://boliviablue.com/dolar-blue-santa-cruz
<meta name="robots" content="noindex, nofollow" />
...
```

---

## 📋 Detailed Verification

### 1. Verify Noindex Meta Tags

```bash
# Test each page individually
curl -s https://boliviablue.com/dolar-blue-la-paz | grep -o '<meta name="robots"[^>]*>'
curl -s https://boliviablue.com/dolar-blue-santa-cruz | grep -o '<meta name="robots"[^>]*>'
curl -s https://boliviablue.com/dolar-blue-cochabamba | grep -o '<meta name="robots"[^>]*>'
curl -s https://boliviablue.com/euro-a-boliviano | grep -o '<meta name="robots"[^>]*>'
curl -s https://boliviablue.com/real-a-boliviano | grep -o '<meta name="robots"[^>]*>'
curl -s https://boliviablue.com/unsubscribe | grep -o '<meta name="robots"[^>]*>'
```

**Expected:** Each command should return: `<meta name="robots" content="noindex, nofollow" />`

---

### 2. Verify Sitemap Exclusions

```bash
# Check that removed pages are NOT in sitemap
curl -s https://boliviablue.com/sitemap.xml | grep -i "dolar-blue-la-paz" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
curl -s https://boliviablue.com/sitemap.xml | grep -i "dolar-blue-santa-cruz" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
curl -s https://boliviablue.com/sitemap.xml | grep -i "dolar-blue-cochabamba" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
curl -s https://boliviablue.com/sitemap.xml | grep -i "euro-a-boliviano" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
curl -s https://boliviablue.com/sitemap.xml | grep -i "real-a-boliviano" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
curl -s https://boliviablue.com/sitemap.xml | grep -i "unsubscribe" && echo "❌ FAIL: Found in sitemap" || echo "✅ PASS: Not in sitemap"
```

**Expected:** All commands should return "✅ PASS: Not in sitemap"

---

### 3. Verify Sitemap XML Validity

```bash
# Check if sitemap is valid XML
curl -s https://boliviablue.com/sitemap.xml | xmllint --noout - && echo "✅ PASS: Valid XML" || echo "❌ FAIL: Invalid XML"
```

**Expected:** `✅ PASS: Valid XML`

---

### 4. Verify Canonical Tags (Should Still Be Present)

```bash
# Canonical tags should still be present on noindex pages (this is correct)
curl -s https://boliviablue.com/dolar-blue-la-paz | grep -i "canonical"
```

**Expected:** `<link rel="canonical" href="https://boliviablue.com/dolar-blue-la-paz" />`

**Note:** Canonical + noindex is valid and recommended.

---

### 5. Verify Reviewer Path Pages (Should NOT Have Noindex)

```bash
# These pages should NOT have noindex
curl -s https://boliviablue.com/ | grep -i "robots" | grep -i "noindex" && echo "❌ FAIL: Homepage has noindex" || echo "✅ PASS: Homepage indexed"
curl -s https://boliviablue.com/acerca-de | grep -i "robots" | grep -i "noindex" && echo "❌ FAIL: About has noindex" || echo "✅ PASS: About indexed"
curl -s https://boliviablue.com/calculadora | grep -i "robots" | grep -i "noindex" && echo "❌ FAIL: Calculator has noindex" || echo "✅ PASS: Calculator indexed"
curl -s https://boliviablue.com/preguntas-frecuentes | grep -i "robots" | grep -i "noindex" && echo "❌ FAIL: FAQ has noindex" || echo "✅ PASS: FAQ indexed"
```

**Expected:** All should return "✅ PASS: [Page] indexed"

---

## 🎯 AdSense Reviewer Path Verification

Verify all 5 recommended pages are accessible and indexed:

```bash
# Check all 5 reviewer path pages
echo "=== Reviewer Path Pages ==="
for url in "" "acerca-de" "calculadora" "preguntas-frecuentes"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://boliviablue.com/$url")
  if [ "$status" = "200" ]; then
    echo "✅ https://boliviablue.com/$url - Accessible (HTTP $status)"
  else
    echo "❌ https://boliviablue.com/$url - Failed (HTTP $status)"
  fi
done

# Check blog listing
status=$(curl -s -o /dev/null -w "%{http_code}" "https://boliviablue.com/blog")
if [ "$status" = "200" ]; then
  echo "✅ https://boliviablue.com/blog - Accessible (HTTP $status)"
else
  echo "❌ https://boliviablue.com/blog - Failed (HTTP $status)"
fi
```

**Expected:** All pages return HTTP 200

---

## 📊 Summary Report Script

Run this to generate a complete verification report:

```bash
#!/bin/bash
echo "=== AdSense Noindex Verification Report ==="
echo ""
echo "1. NOINDEX PAGES:"
for url in "dolar-blue-la-paz" "dolar-blue-santa-cruz" "dolar-blue-cochabamba" "euro-a-boliviano" "real-a-boliviano" "unsubscribe"; do
  if curl -s "https://boliviablue.com/$url" | grep -qi "noindex"; then
    echo "  ✅ $url - Has noindex"
  else
    echo "  ❌ $url - MISSING noindex"
  fi
done

echo ""
echo "2. SITEMAP EXCLUSIONS:"
for url in "dolar-blue-la-paz" "dolar-blue-santa-cruz" "dolar-blue-cochabamba" "euro-a-boliviano" "real-a-boliviano" "unsubscribe"; do
  if curl -s "https://boliviablue.com/sitemap.xml" | grep -qi "$url"; then
    echo "  ❌ $url - STILL IN SITEMAP"
  else
    echo "  ✅ $url - Not in sitemap"
  fi
done

echo ""
echo "3. REVIEWER PATH PAGES:"
for url in "" "acerca-de" "calculadora" "preguntas-frecuentes"; do
  if curl -s "https://boliviablue.com/$url" | grep -qi "noindex"; then
    echo "  ❌ $url - HAS noindex (should be indexed)"
  else
    echo "  ✅ $url - Correctly indexed"
  fi
done

echo ""
echo "4. SITEMAP VALIDITY:"
if curl -s "https://boliviablue.com/sitemap.xml" | xmllint --noout - 2>/dev/null; then
  echo "  ✅ Sitemap is valid XML"
else
  echo "  ❌ Sitemap is invalid XML"
fi
```

Save as `verify-adsense.sh`, make executable (`chmod +x verify-adsense.sh`), and run: `./verify-adsense.sh`

---

## 🔧 Troubleshooting

### Issue: Noindex tag not found
**Possible Causes:**
1. Changes not deployed yet
2. Browser cache (use `curl` or incognito)
3. Build process not including changes

**Solution:**
- Verify files are committed and pushed
- Check deployment logs
- Clear CDN cache if using Vercel/Cloudflare

### Issue: Pages still in sitemap
**Possible Causes:**
1. Sitemap not regenerated
2. CDN cache

**Solution:**
- Verify `frontend/public/sitemap.xml` is updated
- Clear CDN cache
- Force sitemap regeneration

### Issue: Reviewer path pages have noindex
**Possible Causes:**
1. Stage environment (auto-noindex)
2. Accidental noindex prop

**Solution:**
- Check `PageMeta` component usage
- Verify not on stage domain
- Check `isStage` logic in `PageMeta.jsx`

---

**Last Updated:** January 2025

