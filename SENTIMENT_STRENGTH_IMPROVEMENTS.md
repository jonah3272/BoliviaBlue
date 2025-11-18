# Sentiment Strength Improvements

## Problem
The sentiment score was spiking to +50 with just 2 articles, which shouldn't be possible. The sentiment analyzer was only returning direction ("up", "down", "neutral") without considering how impactful each article actually is for the dollar exchange rate.

## Solution
Implemented a strength-based sentiment system that:
1. Analyzes how impactful each article is (0-100 strength score)
2. Weights articles by their strength, not just counts them
3. Caps scores based on number of articles to prevent extreme scores from few articles

## Changes Made

### 1. Backend: Sentiment Analyzer (`backend/sentimentAnalyzer.js`)
- **AI Analyzer**: Now returns `{direction: "up"|"down"|"neutral", strength: 0-100}`
  - Strength 0-30: Weak signal (minor mention, indirect impact)
  - Strength 31-60: Moderate signal (clear mention, some impact)
  - Strength 61-80: Strong signal (significant news, major impact)
  - Strength 81-100: Very strong signal (crisis, major policy change, extreme conditions)
- **Keyword Analyzer**: Also returns strength based on keyword intensity
  - Critical keywords (crisis, devaluación, BCB intervention) get higher strength
  - Multiple keyword matches boost strength

### 2. Database: Added `sentiment_strength` Column
- **Migration**: `supabase_migrations/add_sentiment_strength.sql`
  - Adds `sentiment_strength INTEGER` column to `news` table
  - Creates index for performance
- **Backward Compatible**: Existing articles without strength default to 50 (moderate)

### 3. Backend: Updated All Callers
- **`backend/newsClient.js`**: Handles new format, extracts direction and strength
- **`backend/twitterClient.js`**: Handles new format for tweets
- **`backend/scheduler-supabase.js`**: Passes sentiment_strength to database
- **`backend/db-supabase.js`**: `insertNews()` accepts and stores sentiment_strength
- **`backend/server.js`**: API returns sentiment_strength in response

### 4. Frontend: Strength-Weighted Calculation (`frontend/src/components/SentimentNewsCard.jsx`)
- **Uses sentiment_strength**: Articles are weighted by their strength (0-100), not just counted
- **Formula**: `weight = timeWeight × categoryWeight × (strength/100)`
- **Score Capping**: Maximum score scales with number of articles:
  - 1 article: max ±20
  - 2 articles: max ±30 (prevents +50 with 2 articles!)
  - 3 articles: max ±35
  - 4 articles: max ±40
  - 5+ articles: max ±50 (full range)
- **Additional Dampening**: 1-2 articles get extra dampening (60-75% of calculated score)

## Key Improvements

1. **Quality over Quantity**: A single high-impact article (strength 90) is weighted more than 3 low-impact articles (strength 30 each)

2. **Prevents Extreme Scores**: With the new capping system:
   - 2 articles with maximum strength (100 each) = max ±30 (not ±50)
   - Even with perfect conditions, 2 articles cannot reach +50

3. **Backward Compatible**: Articles without sentiment_strength default to 50 (moderate), so existing data continues to work

4. **Better Understanding**: The AI now analyzes not just direction but also impact, considering:
   - Direct exchange rate mentions
   - Economic policy announcements
   - Political stability/crises
   - Central bank actions
   - Foreign reserve changes
   - Market sentiment

## Testing

To test the new system:
1. Run the migration: Apply `supabase_migrations/add_sentiment_strength.sql` to your database
2. Wait for new articles: New articles will have sentiment_strength populated
3. Verify capping: With 2 articles, score should never exceed ±30

## Migration Required

**Important**: You must run the database migration before deploying:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS sentiment_strength INTEGER;

CREATE INDEX IF NOT EXISTS idx_news_sentiment_strength 
ON news(sentiment_strength) 
WHERE sentiment_strength IS NOT NULL;
```

Or use the migration file: `supabase_migrations/add_sentiment_strength.sql`


