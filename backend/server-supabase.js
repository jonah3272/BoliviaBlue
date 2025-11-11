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
} from './db-supabase.js';
import { startScheduler, cache } from './scheduler-supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.ORIGIN || '*';
const STALE_THRESHOLD = 45 * 60 * 1000; // 45 minutes

// Middleware
app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// Serve frontend static files in production
const frontendDist = join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const result = await getTotalRatesCount();
    
    res.json({
      ok: cache.isHealthy,
      updated_at_iso: cache.lastUpdate ? cache.lastUpdate.toISOString() : null,
      history_points: result.count
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * Get current blue market rate
 */
app.get('/api/blue-rate', async (req, res) => {
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
    const dbRate = await getLatestRate();
    
    if (!dbRate) {
      return res.status(503).json({
        error: 'No rate data available yet',
        message: 'Please wait for the first data refresh'
      });
    }
    
    const isStale = Date.now() - new Date(dbRate.t).getTime() > STALE_THRESHOLD;
    
    res.json({
      source: 'binance-p2p',
      buy_bob_per_usd: dbRate.buy,
      sell_bob_per_usd: dbRate.sell,
      official_buy: dbRate.official_buy,
      official_sell: dbRate.official_sell,
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
app.get('/api/blue-history', async (req, res) => {
  try {
    const range = req.query.range || '1W';
    
    let startDate;
    let rows;
    
    switch (range) {
      case '1D':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        rows = await getRatesInRange(startDate);
        break;
      case '1W':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        rows = await getRatesInRange(startDate);
        break;
      case '1M':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        rows = await getRatesInRange(startDate);
        break;
      case '1Y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        rows = await getRatesInRange(startDate);
        break;
      case 'ALL':
        rows = await getAllRates();
        break;
      default:
        return res.status(400).json({
          error: 'Invalid range',
          message: 'Range must be one of: 1D, 1W, 1M, 1Y, ALL'
        });
    }
    
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
app.get('/api/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const rows = await getRecentNews(limit);
    
    const news = rows.map(row => ({
      id: row.id,
      source: row.source,
      url: row.url,
      title: row.title,
      published_at_iso: row.published_at,
      summary: row.summary,
      sentiment: row.sentiment
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
  console.log(`Using Supabase database at ${process.env.SUPABASE_URL}`);
  console.log(`CORS origin: ${ORIGIN}`);
});

