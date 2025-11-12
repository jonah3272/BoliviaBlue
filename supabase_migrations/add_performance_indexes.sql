-- Performance optimization indexes for Bolivia Blue con Paz
-- These indexes improve query performance for common database operations

-- Indexes for rates table queries
-- Used for: fetchBlueRate(), fetchBlueHistory()

-- Index on timestamp for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_rates_t_desc ON rates(t DESC);

-- Index on timestamp for range queries (gte, lte)
CREATE INDEX IF NOT EXISTS idx_rates_t_asc ON rates(t ASC);

-- Composite index for common query pattern: order by t, filter by date range
CREATE INDEX IF NOT EXISTS idx_rates_t_composite ON rates(t DESC, buy, sell, mid);

-- Indexes for news table queries
-- Used for: fetchNews(), fetchTweets(), getRecentNews()

-- Index on published_at for ordering (most common query)
CREATE INDEX IF NOT EXISTS idx_news_published_at_desc ON news(published_at DESC);

-- Index on type for filtering articles vs tweets
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);

-- Index on category for filtering by category
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

-- Composite index for common query: type + published_at (for fetchNews, fetchTweets)
CREATE INDEX IF NOT EXISTS idx_news_type_published_at ON news(type, published_at DESC);

-- Composite index for category filtering: category + published_at
CREATE INDEX IF NOT EXISTS idx_news_category_published_at ON news(category, published_at DESC);

-- Index on URL for duplicate checking (used in insertNews)
CREATE INDEX IF NOT EXISTS idx_news_url ON news(url);

-- Index on sentiment for sentiment analysis queries
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news(sentiment);

-- Composite index for sentiment analysis: sentiment + published_at (for daily sentiment calculation)
CREATE INDEX IF NOT EXISTS idx_news_sentiment_published_at ON news(sentiment, published_at DESC);

-- Index on source for filtering by source
CREATE INDEX IF NOT EXISTS idx_news_source ON news(source);

-- Note: These indexes will slightly slow down INSERT operations but significantly speed up SELECT queries
-- Given that reads are much more frequent than writes, this is a good trade-off

