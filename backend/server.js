import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { 
  getLatestRate, 
  getRatesInRange, 
  getAllRates, 
  getTotalRatesCount,
  getRecentNews,
  createAlert,
  deactivateAlert
} from './db-supabase.js';
import { startScheduler, cache } from './scheduler-supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
// Use specific domain in production, allow localhost for development
const ORIGIN = process.env.ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://boliviablue.com' : '*');
const STALE_THRESHOLD = 45 * 60 * 1000; // 45 minutes

// Security Headers - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://pagead2.googlesyndication.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.binance.com", "https://p2p.binance.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for charts/ads
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Middleware - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bolivia-blue-con-paz.vercel.app',
  'https://boliviablueconpaz.vercel.app',
  'https://boliviablue.com',
  ORIGIN
].filter(Boolean);

// Only allow wildcard in development
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In production, only allow specific origins
    if (process.env.NODE_ENV === 'production' && ORIGIN !== '*') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow all or specific origins
      if (allowedOrigins.includes(origin) || ORIGIN === '*') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
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
      sentiment: row.sentiment,
      sentiment_strength: row.sentiment_strength,
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

/**
 * Create a new rate alert
 */
app.post('/api/alerts', async (req, res) => {
  try {
    const { email, alert_type, threshold, direction } = req.body;

    // Validation
    if (!email || !alert_type || !threshold || !direction) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, alert_type, threshold, and direction are required'
      });
    }

    if (!['buy', 'sell', 'both'].includes(alert_type)) {
      return res.status(400).json({
        error: 'Invalid alert_type',
        message: 'alert_type must be "buy", "sell", or "both"'
      });
    }

    if (!['above', 'below'].includes(direction)) {
      return res.status(400).json({
        error: 'Invalid direction',
        message: 'direction must be "above" or "below"'
      });
    }

    if (isNaN(threshold) || threshold <= 0) {
      return res.status(400).json({
        error: 'Invalid threshold',
        message: 'threshold must be a positive number'
      });
    }

    const alert = await createAlert(email, alert_type, parseFloat(threshold), direction);

    res.json({
      success: true,
      alert: {
        id: alert.id,
        email: alert.email,
        alert_type: alert.alert_type,
        threshold: alert.threshold,
        direction: alert.direction
      }
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Unsubscribe from alerts
 */
app.post('/api/alerts/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Unsubscribe token is required'
      });
    }

    const alert = await deactivateAlert(token);

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found',
        message: 'Invalid unsubscribe token'
      });
    }

    res.json({
      success: true,
      message: 'Alert unsubscribed successfully'
    });

  } catch (error) {
    console.error('Error unsubscribing:', error);
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

// Start server - Listen on 0.0.0.0 for Railway compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bolivia Blue con Paz backend running on port ${PORT}`);
  console.log(`Using Supabase database at ${process.env.SUPABASE_URL}`);
  console.log(`CORS configured for multiple origins including: ${allowedOrigins.join(', ')}`);
});

