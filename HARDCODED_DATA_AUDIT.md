# Hardcoded Data Audit

## Summary
Found **hardcoded official exchange rates** in the backend that should be fetched from the Banco Central de Bolivia (BCB) API.

## Issues Found

### 1. Backend: Official Rate Client (`backend/officialRateClient.js`)

**Location:** Lines 71-74 and 126-133

**Problem:** The official exchange rate is hardcoded instead of being parsed from BCB's API response.

**Current Code:**
```javascript
// Line 71-74: Hardcoded rates returned regardless of API response
return {
  buy: 6.96, // Official buy rate (banks sell USD)
  sell: 6.86 // Official sell rate (banks buy USD)
};

// Line 126-133: Static fallback also hardcoded
export function getStaticOfficialRate() {
  return {
    source: 'static',
    official_buy: 6.96,
    official_sell: 6.86,
    updated_at_iso: new Date().toISOString()
  };
}
```

**Impact:**
- Official rates always show 6.96/6.86 BOB per USD
- If BCB changes the official rate, the site won't reflect it
- The API call to BCB is made but the response is ignored

**Recommendation:**
- Parse the actual BCB API response to extract real rates
- Keep the hardcoded values only as a last-resort fallback if parsing fails
- Add logging to track when hardcoded fallback is used

## What's NOT Hardcoded (Good!)

✅ **Blue Market Rates** - Fetched from Binance P2P API  
✅ **News Articles** - Scraped from RSS feeds and Twitter  
✅ **Sentiment Analysis** - Uses OpenAI GPT-4o-mini (with keyword fallback)  
✅ **Historical Data** - All stored in Supabase database  
✅ **Frontend Components** - All fetch from API endpoints  

## Test Files
- Test files contain mock data (this is expected and correct)
- Mock data is only used in test files, not in production code

## Next Steps

1. **Parse BCB API Response** - Implement actual parsing of BCB's API response
2. **Add Fallback Chain** - Try BCB → exchangerate-api → static hardcoded (last resort)
3. **Add Monitoring** - Log when hardcoded fallback is used
4. **Verify BCB API** - Check if BCB's API actually provides rate data or if it's truly static

