# Daily Article Automation - Complete Setup Guide

## Overview

The daily article automation system automatically generates comprehensive, high-value articles every day about the Bolivia blue dollar market. Each article is 1500+ words and includes:

- Today's exchange rates (buy, sell, official)
- Market analysis and trends
- Latest news articles with analysis
- Historical context and comparisons
- Expert insights and predictions

## Files Created

1. **`backend/dailyArticleGenerator.js`** - Main article generation logic
2. **`backend/scheduler-supabase.js`** - Updated to include daily article generation

## How It Works

### Article Generation

The `generateDailyArticle()` function:

1. Fetches current exchange rates from the database
2. Gets yesterday's rates for comparison
3. Calculates weekly statistics (high, low, average)
4. Retrieves today's news articles
5. Generates comprehensive content in both Spanish and English
6. Saves articles to the `blog_articles` table in Supabase

### Scheduling

Articles are generated:
- Once on server startup (if not already generated today)
- Daily at midnight (00:00)
- Automatically updates if an article for today already exists

### Article Structure

Each article includes:

1. **Executive Summary** - Current rates and key metrics
2. **Current Market Situation** - Analysis of market conditions
3. **Price Analysis** - Comparison with yesterday and weekly trends
4. **News Analysis** - Today's relevant news with sentiment analysis
5. **Market Context** - Background on the blue dollar market
6. **Methodology** - How data is collected and calculated
7. **Practical Implications** - Guidance for buyers, sellers, and traders
8. **Outlook and Recommendations** - Market predictions and advice
9. **Disclaimer** - Legal and informational disclaimers
10. **Additional Resources** - Links to other pages on the site

## Database Requirements

The system uses the existing `blog_articles` table in Supabase. Make sure it exists:

```sql
-- Run this in Supabase SQL Editor if not already done
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('es', 'en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'html' CHECK (content_format IN ('html', 'markdown')),
  author TEXT NOT NULL DEFAULT 'Bolivia Blue con Paz',
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  read_time INTEGER,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Article URLs

Articles are accessible at:
- Spanish: `/blog/analisis-diario-YYYY-MM-DD`
- English: `/blog/analisis-diario-YYYY-MM-DD` (with language parameter)

## Content Quality

Each article is:
- **1500+ words** - Meets AdSense "high value content" requirements
- **Bilingual** - Available in both Spanish and English
- **Data-driven** - Includes real-time rates and statistics
- **News-integrated** - Incorporates today's relevant news
- **SEO-optimized** - Includes proper headings, structure, and keywords
- **User-focused** - Provides practical advice and insights

## Manual Generation

To manually generate articles (for testing):

```bash
cd backend
node dailyArticleGenerator.js
```

Or import and call in your code:

```javascript
import { generateDailyArticles } from './dailyArticleGenerator.js';

await generateDailyArticles();
```

## Troubleshooting

### Articles Not Generating

1. Check server logs for errors
2. Verify Supabase connection
3. Ensure `rates` and `news` tables have data
4. Check that `blog_articles` table exists

### Articles Missing Data

- Ensure rates are being collected (check scheduler)
- Verify news feed is working
- Check database for recent entries

### Duplicate Articles

The system automatically updates existing articles for the same date, so duplicates shouldn't occur. If they do, check the `slug` generation logic.

## Benefits for AdSense

1. **Fresh Content Daily** - Google loves regularly updated content
2. **High Word Count** - 1500+ words per article meets quality standards
3. **Original Content** - Each article is unique and data-driven
4. **User Value** - Provides real insights and analysis
5. **SEO Benefits** - Daily articles improve search rankings
6. **Engagement** - Keeps users coming back for daily updates

## Next Steps

1. Verify the scheduler is running
2. Check that articles are being generated daily
3. Monitor article quality and adjust content as needed
4. Consider adding more sections or analysis
5. Promote daily articles on the homepage

## Notes

- Articles are generated in both languages automatically
- Content is HTML-formatted for easy display
- Articles include internal links to other pages
- Each article has a unique slug based on the date
- Old articles are preserved for historical reference

