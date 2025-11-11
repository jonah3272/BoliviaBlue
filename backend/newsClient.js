import fetch from 'node-fetch';
import crypto from 'crypto';

const NEWS_FETCH_TIMEOUT = 15000;

/**
 * Generate a unique ID from URL
 */
function generateId(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 16);
}

/**
 * Simple sentiment classifier based on keywords
 * @param {string} text - Text to analyze
 * @returns {string} "up", "down", or "neutral"
 */
function classifySentiment(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Keywords that suggest price increase (dollar strengthening, boliviano weakening)
  const upKeywords = [
    'sube', 'incremento', 'aumenta', 'alza', 'dispara', 'escasez',
    'deprecia', 'devalu', 'crisis', 'inflacion', 'mercado paralelo',
    'dolar blue', 'tipo de cambio sube'
  ];
  
  // Keywords that suggest price decrease (dollar weakening, boliviano strengthening)
  const downKeywords = [
    'baja', 'disminuye', 'cae', 'desciende', 'estabiliza', 'controla',
    'normaliza', 'reservas', 'fortalece', 'recupera'
  ];
  
  let upScore = 0;
  let downScore = 0;
  
  for (const keyword of upKeywords) {
    if (lowerText.includes(keyword)) upScore++;
  }
  
  for (const keyword of downKeywords) {
    if (lowerText.includes(keyword)) downScore++;
  }
  
  if (upScore > downScore) return 'up';
  if (downScore > upScore) return 'down';
  return 'neutral';
}

/**
 * Parse RSS feed
 * @param {string} xml - RSS XML content
 * @param {string} source - Source name
 * @returns {Array} Array of news items
 */
function parseRSS(xml, source) {
  const items = [];
  
  // Basic regex-based RSS parsing (lightweight alternative to XML parser)
  const itemRegex = /<item>(.*?)<\/item>/gs;
  const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s;
  const linkRegex = /<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s;
  const descRegex = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s;
  
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = titleRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);
    const dateMatch = pubDateRegex.exec(itemXml);
    
    if (titleMatch && linkMatch) {
      const title = titleMatch[1].trim();
      const url = linkMatch[1].trim();
      const summary = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : '';
      const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();
      
      items.push({
        id: generateId(url),
        source,
        url,
        title,
        summary,
        published_at_iso: pubDate,
        sentiment: classifySentiment(title + ' ' + summary)
      });
    }
  }
  
  return items;
}

/**
 * Fetch news from a single source
 * @param {string} sourceUrl - RSS feed URL
 * @returns {Promise<Array>} Array of news items
 */
async function fetchSource(sourceUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NEWS_FETCH_TIMEOUT);
    
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoliviaBlueBot/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    
    // Extract source name from URL
    const sourceMatch = sourceUrl.match(/\/\/(.*?)\//);
    const sourceName = sourceMatch ? sourceMatch[1].replace('www.', '') : 'unknown';
    
    // Parse based on content type
    if (contentType.includes('xml') || contentType.includes('rss') || text.includes('<rss')) {
      return parseRSS(text, sourceName);
    }
    
    return [];
    
  } catch (error) {
    console.warn(`Failed to fetch news from ${sourceUrl}:`, error.message);
    return [];
  }
}

/**
 * Check if news item is relevant to Bolivia economy and Rodrigo Paz
 * @param {string} title - News title
 * @param {string} summary - News summary
 * @returns {boolean} True if relevant
 */
function isRelevantToBolivia(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  
  // Must mention Bolivia or be about Rodrigo Paz
  const boliviaKeywords = [
    'bolivia',
    'boliviano',
    'bolivianos',
    'rodrigo paz',
    'presidente paz',
    'paz',
    'bcb',
    'banco central de bolivia',
    'la paz',
    'santa cruz',
    'cochabamba'
  ];
  
  const hasBoliviaReference = boliviaKeywords.some(keyword => text.includes(keyword));
  
  if (!hasBoliviaReference) {
    return false;
  }
  
  // Must be related to economy, dollar, or exchange rate
  const economicKeywords = [
    'dolar',
    'dólar',
    'dollar',
    'divisa',
    'tipo de cambio',
    'cambio',
    'economia',
    'economía',
    'moneda',
    'reserva',
    'inflacion',
    'inflación',
    'devaluacion',
    'devaluación',
    'mercado',
    'precio',
    'comercio',
    'export',
    'import',
    'bcb',
    'banco central',
    'politica economica',
    'política económica',
    'escasez',
    'paralelo',
    'blue',
    'usdt',
    'cripto'
  ];
  
  const hasEconomicTopic = economicKeywords.some(keyword => text.includes(keyword));
  
  // Always include if mentions Rodrigo Paz
  const mentionsPaz = text.includes('rodrigo paz') || text.includes('presidente paz');
  
  return hasEconomicTopic || mentionsPaz;
}

/**
 * Fetch and parse news from multiple sources
 * @param {string[]} sources - Array of RSS feed URLs
 * @returns {Promise<Array>} Combined array of news items filtered for Bolivia
 */
export async function fetchNews(sources) {
  if (!sources || sources.length === 0) {
    return [];
  }
  
  console.log(`Fetching news from ${sources.length} sources...`);
  
  // Fetch all sources in parallel
  const results = await Promise.all(
    sources.map(source => fetchSource(source))
  );
  
  // Flatten, filter for Bolivia relevance, and sort by date
  const allNews = results.flat();
  const boliviaNews = allNews.filter(item => 
    isRelevantToBolivia(item.title, item.summary || '')
  );
  
  boliviaNews.sort((a, b) => new Date(b.published_at_iso) - new Date(a.published_at_iso));
  
  console.log(`Fetched ${allNews.length} news items, ${boliviaNews.length} relevant to Bolivia`);
  
  return boliviaNews;
}

