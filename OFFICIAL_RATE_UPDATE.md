# Official Exchange Rate Integration

## Summary

Added official exchange rate tracking alongside the blue market rate, as requested. The system now displays both rates side by side and calculates the spread (difference) between them.

## Changes Made

### Backend

1. **New File: `backend/officialRateClient.js`**
   - Fetches official exchange rate from Banco Central de Bolivia (BCB)
   - Falls back to exchangerate-api.com if BCB is unavailable
   - Uses static rate (6.86-6.96 BOB/USD) as ultimate fallback
   - Bolivia's official rate is government-controlled and rarely changes

2. **Updated: `backend/db.js`**
   - Added columns: `official_buy`, `official_sell`, `official_mid`
   - Updated all queries to include official rates

3. **Updated: `backend/scheduler.js`**
   - Now fetches both blue and official rates in parallel
   - Runs every 15 minutes (as requested)
   - Stores both rates in database for historical tracking

4. **Updated: `backend/server.js`**
   - API endpoints now return both blue and official rates
   - `/api/blue-rate` includes official_buy and official_sell
   - `/api/blue-history` includes historical official rates

### Frontend

1. **Updated: `frontend/src/components/RateCards.jsx`**
   - Now displays **4 cards total**: Blue Buy, Blue Sell, Official Buy, Official Sell
   - Shows spread percentage on blue rate cards (e.g., +45.3%)
   - Displays spread indicator banner showing % difference
   - Official cards styled with gray borders to differentiate

2. **Updated: `frontend/src/components/BlueChart.jsx`**
   - Chart now shows **4 lines**:
     - Blue Buy (solid green)
     - Blue Sell (solid red)
     - Official Buy (dashed gray)
     - Official Sell (dashed light gray)
   - Tooltip groups blue vs official rates
   - Legend shows all 4 rates clearly

3. **Updated: `frontend/src/components/About.jsx`**
   - Added explanation of both rate types
   - Clarified BCB official rate source
   - Explained what the spread indicates (market pressure, scarcity, devaluation expectations)

## Data Sources

### Blue Market Rate (Mercado Paralelo)
- **Source**: Binance P2P API (USDT/BOB)
- **Method**: Median of 20 buy and sell offers
- **Updates**: Every 15 minutes
- **Represents**: Informal market rate

### Official Rate (Tipo de Cambio Oficial)
- **Primary Source**: Banco Central de Bolivia (BCB)
- **Fallback**: exchangerate-api.com
- **Static Fallback**: 6.96 buy / 6.86 sell BOB per USD
- **Updates**: Every 15 minutes (though it rarely changes)
- **Represents**: Government-controlled rate used by banks

## Key Features

### Spread Calculation
The spread shows the percentage premium of the blue market over official rate:

```
Spread = ((Blue Rate - Official Rate) / Official Rate) × 100
```

Example:
- Official Buy: 6.96 BOB/USD
- Blue Buy: 10.05 BOB/USD
- Spread: +44.4%

This indicates strong market pressure and informal demand for USD.

### Database Schema

```sql
CREATE TABLE rates (
  id INTEGER PRIMARY KEY,
  t TEXT NOT NULL,                 -- timestamp
  buy REAL NOT NULL,                -- blue buy rate
  sell REAL NOT NULL,               -- blue sell rate
  mid REAL NOT NULL,                -- blue mid rate
  official_buy REAL,                -- official buy rate
  official_sell REAL,               -- official sell rate
  official_mid REAL,                -- official mid rate
  created_at INTEGER
);
```

### API Response Example

```json
{
  "source": "binance-p2p",
  "buy_bob_per_usd": 10.05,
  "sell_bob_per_usd": 9.96,
  "official_buy": 6.96,
  "official_sell": 6.86,
  "updated_at_iso": "2025-11-11T16:00:00Z",
  "is_stale": false
}
```

## Restart Instructions

The servers are already running. To apply the new code:

### Option 1: Close and Restart
1. Close both PowerShell windows (backend and frontend)
2. From project root:
```powershell
npm run dev
```

### Option 2: Manual Restart
Backend window:
```powershell
# Press Ctrl+C to stop
npm run dev
```

Frontend window:
```powershell
# Press Ctrl+C to stop
npm run dev
```

## What You'll See

1. **Two Sets of Rate Cards**:
   - Top: "Mercado Paralelo (Dólar Blue) - Binance P2P"
   - Bottom: "Tipo de Cambio Oficial - Banco Central de Bolivia"

2. **Spread Indicator**: 
   - Yellow banner showing percentage difference
   - Example: "Compra: +44.4% | Venta: +45.2%"

3. **Chart with 4 Lines**:
   - Solid lines = Blue market rates
   - Dashed lines = Official rates
   - Clear visual of the gap between markets

4. **Percentage Badges**:
   - Small red badges on blue rate cards showing +XX%
   - Quick visual indicator of market premium

## Testing

Once restarted, verify:

1. Backend logs show: `Refreshing blue rate and official rate...`
2. Backend logs show: `Official rate: Buy 6.96, Sell 6.86`
3. Frontend shows 4 rate cards (2 blue, 2 official)
4. Chart displays 4 lines
5. Spread indicator appears below rate cards

## Notes

- Bolivia's official rate has been relatively stable at ~6.86-6.96 for extended periods
- Large spreads (>30%) indicate significant market pressure and dollar scarcity
- The official rate is government policy; the blue rate reflects market reality
- Both rates update every 15 minutes as requested

---

**Status**: ✅ Complete and ready to test
**Date**: November 11, 2025

