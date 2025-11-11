import fetch from 'node-fetch';
import crypto from 'crypto';
import { analyzeSentimentAI } from './sentimentAnalyzer.js';
import { categorizeArticle } from './newsClient.js';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_TIMEOUT = 15000;

/**
 * Generate a unique ID from tweet URL
 */
function generateId(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 16);
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

    // Search queries for Bolivia economy and Rodrigo Paz
    const queries = [
      'bolivia dolar OR boliviano OR "tipo de cambio" lang:es -is:retweet',
      '"rodrigo paz" bolivia lang:es -is:retweet',
      'bolivia economia OR economic lang:es -is:retweet',
      'bolivia "banco central" OR BCB lang:es -is:retweet'
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

    const processedTweets = [];
    for (const tweet of uniqueTweets) {
      const sentiment = await analyzeSentimentAI(tweet.title, tweet.summary);
      const category = categorizeArticle(tweet.title, tweet.summary);
      
      processedTweets.push({
        ...tweet,
        sentiment,
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

