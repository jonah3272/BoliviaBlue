import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { 
  getLatestRate, 
  getRatesInRange, 
  getAllRates, 
  getTotalRatesCount,
  getRecentNews 
} from './db.js';
import { startScheduler, cache } from './scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.ORIGIN || '*';
const STALE_THRESHOLD = 45 * 60 * 1000; // 45 minutes

// Middleware - Allow all origins for CORS
app.use(cors({ 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve frontend static files in production
const frontendDist = join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const count = getTotalRatesCount.get();
  
  res.json({
    ok: cache.isHealthy,
    updated_at_iso: cache.lastUpdate ? cache.lastUpdate.toISOString() : null,
    history_points: count.count
  });
});

/**
 * Get current blue market rate
 */
app.get('/api/blue-rate', (req, res) => {
  try {
    // Try cache first for low latency
    if (cache.latestRate) {
      const isStale = Date.now() - new Date(cache.lastUpdate).getTime() > STALE_THRESHOLD;
      
      return res.json({
        ...cache.latestRate,
        is_stale: isStale
      });
    }
    
    // Fallback to database
    const dbRate = getLatestRate.get();
    
    if (!dbRate) {
      return res.status(503).json({
        error: 'No rate data available yet',
        message: 'Please wait for the first data refresh'
      });
    }
    
    const isStale = Date.now() - new Date(dbRate.t).getTime() > STALE_THRESHOLD;
    
    // Get yesterday's rate for daily change calculation
    const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const yesterdayRates = getRatesInRange.all(yesterdayStart);
    
    let buyChange = null;
    let sellChange = null;
    
    if (yesterdayRates.length > 0) {
      const yesterdayRate = yesterdayRates[0];
      buyChange = ((dbRate.buy - yesterdayRate.buy) / yesterdayRate.buy * 100).toFixed(2);
      sellChange = ((dbRate.sell - yesterdayRate.sell) / yesterdayRate.sell * 100).toFixed(2);
    }
    
    res.json({
      source: 'binance-p2p',
      buy_bob_per_usd: dbRate.buy,
      sell_bob_per_usd: dbRate.sell,
      official_buy: dbRate.official_buy,
      official_sell: dbRate.official_sell,
      buy_change_24h: buyChange,
      sell_change_24h: sellChange,
      updated_at_iso: dbRate.t,
      is_stale: isStale,
      sample_buy: [],
      sample_sell: []
    });
    
  } catch (error) {
    console.error('Error fetching blue rate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get historical blue market rates
 */
app.get('/api/blue-history', (req, res) => {
  try {
    const range = req.query.range || '1W';
    
    let stmt;
    let params = [];
    
    switch (range) {
      case '1D':
        stmt = getRatesInRange;
        params = [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()];
        break;
      case '1W':
        stmt = getRatesInRange;
        params = [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()];
        break;
      case '1M':
        stmt = getRatesInRange;
        params = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()];
        break;
      case '1Y':
        stmt = getRatesInRange;
        params = [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()];
        break;
      case 'ALL':
        stmt = getAllRates;
        break;
      default:
        return res.status(400).json({
          error: 'Invalid range',
          message: 'Range must be one of: 1D, 1W, 1M, 1Y, ALL'
        });
    }
    
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
    
    const points = rows.map(row => ({
      t: row.t,
      buy: row.buy,
      sell: row.sell,
      mid: row.mid,
      official_buy: row.official_buy,
      official_sell: row.official_sell,
      official_mid: row.official_mid
    }));
    
    res.json({
      range,
      points
    });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get recent news headlines
 */
app.get('/api/news', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let query = 'SELECT * FROM news';
    let params = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY published_at DESC LIMIT ?';
    params.push(limit);
    
    const rows = db.prepare(query).all(...params);
    
    const news = rows.map(row => ({
      id: row.id,
      source: row.source,
      url: row.url,
      title: row.title,
      published_at_iso: row.published_at,
      summary: row.summary,
      sentiment: row.sentiment,
      category: row.category
    }));
    
    res.json(news);
    
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

// Start scheduler
startScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`Bolivia Blue con Paz backend running on port ${PORT}`);
  console.log(`CORS origin: ${ORIGIN}`);
});

