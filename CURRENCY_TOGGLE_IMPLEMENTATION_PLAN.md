# Currency Toggle Implementation Plan

## Overview
Add a currency toggle (USD, BRL, EUR) to allow users to view blue rates for different currencies compared to Boliviano (BOB).

## Feasibility Check

### Binance P2P API Support
Binance P2P API supports:
- ✅ USDT/BOB (currently used)
- ✅ USDT/BRL (Brazilian Real)
- ✅ USDT/EUR (Euro)

**Calculation Method:**
- For BRL/BOB: We fetch USDT/BRL and USDT/BOB, then calculate `BOB/BRL = (USDT/BOB) / (USDT/BRL)`
- For EUR/BOB: We fetch USDT/EUR and USDT/BOB, then calculate `BOB/EUR = (USDT/BOB) / (USDT/EUR)`

**Note:** The rates will be displayed as "BOB per [Currency]" (e.g., "10.13 Bs per BRL" or "11.20 Bs per EUR")

## Implementation Steps

### 1. Backend Changes

#### A. Update `backend/p2pClient.js`
- Modify `fetchP2POffers()` to accept `fiat` parameter (currently hardcoded to 'BOB')
- Add function `getCurrentBlueRateForCurrency(fiat)` that:
  - Fetches USDT/[FIAT] rates from Binance P2P
  - Fetches USDT/BOB rates from Binance P2P
  - Calculates BOB/[FIAT] = (USDT/BOB) / (USDT/[FIAT])
  - Returns buy/sell rates in BOB per [FIAT]

#### B. Update Database Schema (if needed)
- Current `rates` table stores USD rates
- Options:
  1. Add columns: `buy_bob_per_brl`, `sell_bob_per_brl`, `buy_bob_per_eur`, `sell_bob_per_eur`
  2. OR create separate tables: `rates_brl`, `rates_eur`
  3. OR add `currency` column and store all currencies in same table

**Recommendation:** Option 1 (add columns) - simplest and maintains current structure

#### C. Update Rate Fetching Service
- Modify the service that calls `getCurrentBlueRate()` to also fetch BRL and EUR rates
- Store all three currencies in database

### 2. Frontend Changes

#### A. Create Currency Toggle Component
- New component: `CurrencyToggle.jsx`
- Three options: USD (default), BRL, EUR
- Place in Header next to LanguageToggle and ThemeToggle
- Store selection in localStorage and Context

#### B. Create Currency Context
- New context: `CurrencyContext.jsx`
- Provides: `{ currency: 'USD' | 'BRL' | 'EUR', setCurrency: function }`
- Wrap App with CurrencyProvider

#### C. Update API Functions
- Modify `frontend/src/utils/api.js`:
  - `fetchBlueRate(currency = 'USD')` - fetch rate for specific currency
  - `fetchBlueHistory(range, currency = 'USD')` - fetch history for specific currency

#### D. Update Components
- `BlueRateCards.jsx`: 
  - Use currency from context
  - Update labels from "per USD" to "per [Currency]"
  - Fetch and display rates for selected currency
  
- `BlueChart.jsx`:
  - Use currency from context
  - Fetch and display historical data for selected currency
  - Update Y-axis labels

- `CurrencyCalculator.jsx`:
  - Update to work with selected currency

### 3. Database Migration

#### Add columns to `rates` table:
```sql
ALTER TABLE rates 
ADD COLUMN buy_bob_per_brl DECIMAL(10,4),
ADD COLUMN sell_bob_per_brl DECIMAL(10,4),
ADD COLUMN buy_bob_per_eur DECIMAL(10,4),
ADD COLUMN sell_bob_per_eur DECIMAL(10,4);
```

### 4. Backend Service Updates

#### Update rate fetching cron job/service:
- Fetch USD rates (existing)
- Fetch BRL rates (new)
- Fetch EUR rates (new)
- Store all in database

## Testing Plan

1. Test Binance P2P API with BRL and EUR
2. Verify rate calculations are correct
3. Test currency toggle UI
4. Test graph updates when currency changes
5. Test rate cards update correctly
6. Test calculator with different currencies

## Deployment

- Push to `stage` branch (not main)
- Test on staging environment
- Verify all three currencies work correctly
- Then merge to main

## Potential Issues

1. **Binance P2P may not have sufficient liquidity for BRL/BOB or EUR/BOB**
   - Solution: Fallback to calculated rates or show "insufficient data"

2. **Rate calculation precision**
   - Solution: Use proper decimal handling, round to 4 decimal places

3. **Historical data**
   - We only have USD historical data
   - Solution: Calculate historical BRL/EUR rates from USD rates using historical USD/BRL and USD/EUR rates (from external API)

4. **Performance**
   - Fetching 3 currencies = 3x API calls
   - Solution: Cache results, fetch in parallel

## Next Steps

1. ✅ Create this plan
2. Test Binance P2P API with BRL and EUR
3. Implement backend changes
4. Implement frontend changes
5. Test thoroughly
6. Deploy to stage

