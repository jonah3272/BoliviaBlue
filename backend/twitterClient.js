import fetch from 'node-fetch';
import crypto from 'crypto';
import { analyzeSentimentAI } from './sentimentAnalyzer.js';
import { categorizeArticle } from './newsClient.js';
import { getRatesInRange } from './db-supabase.js';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_TIMEOUT = 15000;

/**
 * Generate a unique ID from tweet URL
 */
function generateId(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 16);
}

/**
 * Get price change data from the last 6 hours AND 24 hours for sentiment analysis
 * @returns {Promise<Object|null>} Price change data or null if unavailable
 */
async function getPriceChangeData() {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Fetch both 6h and 24h data
    const [rates6h, rates24h] = await Promise.all([
      getRatesInRange(sixHoursAgo),
      getRatesInRange(twentyFourHoursAgo)
    ]);
    
    if (!rates6h || rates6h.length === 0) {
      return null;
    }
    
    // Calculate 6-hour changes
    const firstRate6h = rates6h[0];
    const lastRate = rates6h[rates6h.length - 1];
    const price6hAgo = firstRate6h.mid || ((firstRate6h.buy + firstRate6h.sell) / 2);
    const currentPrice = lastRate.mid || ((lastRate.buy + lastRate.sell) / 2);
    const priceChange6h = ((currentPrice - price6hAgo) / price6hAgo) * 100;
    
    // Calculate 24-hour changes (daily)
    let priceChange24h = null;
    let price24hAgo = null;
    if (rates24h && rates24h.length > 0) {
      const firstRate24h = rates24h[0];
      price24hAgo = firstRate24h.mid || ((firstRate24h.buy + firstRate24h.sell) / 2);
      priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;
    }
    
    // Determine trends
    let trend6h = 'stable';
    if (priceChange6h > 0.1) {
      trend6h = 'rising';
    } else if (priceChange6h < -0.1) {
      trend6h = 'falling';
    }
    
    let trend24h = 'stable';
    if (priceChange24h !== null) {
      if (priceChange24h > 0.1) {
        trend24h = 'rising';
      } else if (priceChange24h < -0.1) {
        trend24h = 'falling';
      }
    }
    
    // Calculate volatility (standard deviation of price changes) for 6h period
    let volatility = 0;
    if (rates6h.length > 1) {
      const prices = rates6h.map(r => r.mid || ((r.buy + r.sell) / 2));
      const changes = [];
      for (let i = 1; i < prices.length; i++) {
        changes.push(Math.abs((prices[i] - prices[i-1]) / prices[i-1] * 100));
      }
      if (changes.length > 0) {
        const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
        const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changes.length;
        volatility = Math.sqrt(variance);
      }
    }
    
    return {
      priceChange6h: parseFloat(priceChange6h.toFixed(2)),
      priceChange24h: priceChange24h !== null ? parseFloat(priceChange24h.toFixed(2)) : null,
      trend6h,
      trend24h,
      volatility: parseFloat(volatility.toFixed(2)),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      price6hAgo: parseFloat(price6hAgo.toFixed(2)),
      price24hAgo: price24hAgo !== null ? parseFloat(price24hAgo.toFixed(2)) : null
    };
  } catch (error) {
    console.warn('Failed to get price change data for sentiment analysis:', error.message);
    return null;
  }
}

/**
 * Fetch recent tweets from Twitter/X about Bolivia economy and Rodrigo Paz
 * @returns {Promise<Array>} Array of news items from Twitter
 */
export async function fetchTwitterNews() {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn('No TWITTER_BEARER_TOKEN found, skipping Twitter integration');
    return [];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TWITTER_TIMEOUT);

    // Search queries for Bolivia economy and Rodrigo Paz - MORE SPECIFIC
    const queries = [
      '(bolivia OR boliviano) (dolar OR dólar OR "tipo de cambio" OR "mercado paralelo" OR "blue") lang:es -is:retweet',
      '"rodrigo paz" (dolar OR dólar OR economia OR economía OR bolivia) lang:es -is:retweet',
      'bolivia ("banco central" OR BCB) (dolar OR dólar OR reservas) lang:es -is:retweet',
      '(bolivia OR boliviano) (inflacion OR inflación OR crisis OR escasez) (dolar OR dólar) lang:es -is:retweet'
    ];

    const allTweets = [];

    for (const query of queries) {
      try {
        // Use Twitter API v2 recent search endpoint
        const searchParams = new URLSearchParams({
          query: query,
          max_results: '10', // Get 10 tweets per query
          'tweet.fields': 'created_at,author_id,public_metrics',
          'user.fields': 'username,name,verified',
          'expansions': 'author_id'
        });

        const response = await fetch(
          `https://api.twitter.com/2/tweets/search/recent?${searchParams}`,
          {
            headers: {
              'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
              'User-Agent': 'BoliviaBlueBot/1.0'
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Twitter API rate limit reached');
            break;
          }
          throw new Error(`Twitter API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const users = data.includes?.users || [];
          const userMap = Object.fromEntries(users.map(u => [u.id, u]));

          for (const tweet of data.data) {
            const user = userMap[tweet.author_id];
            const tweetUrl = `https://twitter.com/${user?.username || 'unknown'}/status/${tweet.id}`;
            
            // Only include tweets with significant engagement (retweets + likes > 5)
            const engagement = (tweet.public_metrics?.retweet_count || 0) + 
                             (tweet.public_metrics?.like_count || 0);
            
            if (engagement >= 5 || user?.verified) {
              allTweets.push({
                id: generateId(tweetUrl),
                source: 'twitter.com',
                url: tweetUrl,
                title: `${user?.name || 'Usuario'} (@${user?.username || 'unknown'})`,
                summary: tweet.text.substring(0, 200),
                published_at_iso: tweet.created_at,
                author: user?.username || 'unknown',
                verified: user?.verified || false,
                engagement: engagement
              });
            }
          }
        }

        // Small delay between queries to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.warn(`Twitter search failed for query "${query}":`, error.message);
      }
    }

    clearTimeout(timeout);

    // Remove duplicates and analyze sentiment
    const uniqueTweets = Array.from(
      new Map(allTweets.map(tweet => [tweet.url, tweet])).values()
    );

    // Fetch price change data once to use for all tweets
    const priceData = await getPriceChangeData();
    
    const processedTweets = [];
    for (const tweet of uniqueTweets) {
      // Twitter queries are already currency-focused, so use AI for better accuracy
      // But tweets are shorter, so they're cheaper to analyze
      // Include price change data for smarter analysis
      const sentimentResult = await analyzeSentimentAI(tweet.title, tweet.summary, priceData);
      // Handle both old format (string) and new format (object)
      const sentiment = typeof sentimentResult === 'string' 
        ? sentimentResult 
        : sentimentResult.direction;
      const sentimentStrength = typeof sentimentResult === 'object' && sentimentResult.strength !== undefined
        ? sentimentResult.strength
        : null;
      const category = categorizeArticle(tweet.title, tweet.summary);
      
      processedTweets.push({
        ...tweet,
        sentiment,
        sentiment_strength: sentimentStrength,
        category
      });

      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Fetched ${processedTweets.length} relevant tweets from Twitter`);
    return processedTweets.slice(0, 20); // Return top 20

  } catch (error) {
    console.error('Failed to fetch Twitter news:', error.message);
    return [];
  }
}

export default fetchTwitterNews;

