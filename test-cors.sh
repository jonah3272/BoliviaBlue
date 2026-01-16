#!/bin/bash

# CORS Test Script
# Tests if OPTIONS preflight requests are working

echo "🧪 Testing CORS Configuration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${1:-https://boliviablue-production.up.railway.app}"
FRONTEND_ORIGIN="${2:-https://www.boliviablue.com}"
ENDPOINT="${3:-/api/chat/messages}"

echo "Backend URL: $BACKEND_URL"
echo "Frontend Origin: $FRONTEND_ORIGIN"
echo "Endpoint: $ENDPOINT"
echo ""

# Test 1: OPTIONS Preflight Request
echo "📋 Test 1: OPTIONS Preflight Request"
echo "-----------------------------------"
RESPONSE=$(curl -s -i -X OPTIONS "$BACKEND_URL$ENDPOINT" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

echo "$RESPONSE"
echo ""

# Check for CORS headers
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo -e "${GREEN}✅ CORS headers found!${NC}"
  
  # Extract and display CORS headers
  echo ""
  echo "CORS Headers:"
  echo "$RESPONSE" | grep -i "access-control" | sed 's/^/  /'
  
  # Check if origin matches
  ALLOWED_ORIGIN=$(echo "$RESPONSE" | grep -i "access-control-allow-origin" | cut -d' ' -f2 | tr -d '\r')
  if [ "$ALLOWED_ORIGIN" = "$FRONTEND_ORIGIN" ] || [ "$ALLOWED_ORIGIN" = "*" ]; then
    echo -e "${GREEN}✅ Origin allowed correctly${NC}"
  else
    echo -e "${YELLOW}⚠️  Origin mismatch: Expected '$FRONTEND_ORIGIN', got '$ALLOWED_ORIGIN'${NC}"
  fi
else
  echo -e "${RED}❌ No CORS headers found!${NC}"
  echo -e "${RED}   This means OPTIONS requests are not being handled correctly.${NC}"
  echo -e "${RED}   Railway's proxy may be blocking or not forwarding OPTIONS requests.${NC}"
fi

echo ""
echo ""

# Test 2: Regular GET Request
echo "📋 Test 2: Regular GET Request (to verify server is up)"
echo "-----------------------------------"
GET_RESPONSE=$(curl -s -i "$BACKEND_URL/api/health" \
  -H "Origin: $FRONTEND_ORIGIN")

HTTP_CODE=$(echo "$GET_RESPONSE" | head -n 1 | cut -d' ' -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Server is responding (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Server returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo "================================"
echo "Test complete!"
echo ""
echo "If OPTIONS test failed, try:"
echo "1. Set up Railway custom domain (see RAILWAY_CORS_SETUP.md)"
echo "2. Contact Railway support"
echo "3. Check Railway dashboard for proxy settings"
