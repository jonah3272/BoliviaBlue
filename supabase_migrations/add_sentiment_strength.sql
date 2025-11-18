-- Add sentiment_strength column to news table
-- This column stores the strength/intensity of sentiment (0-100) for each article
-- Higher values indicate more impactful news for the dollar exchange rate

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS sentiment_strength INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN news.sentiment_strength IS 'Sentiment strength/intensity (0-100). Higher values indicate more impactful news. NULL for articles without strength analysis.';

-- Create index for sentiment_strength to improve query performance
CREATE INDEX IF NOT EXISTS idx_news_sentiment_strength ON news(sentiment_strength) WHERE sentiment_strength IS NOT NULL;


