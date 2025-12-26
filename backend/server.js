import express from 'express';
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
  deactivateAlert,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getMonthlyReport,
  getAllMonthlyReports
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

// Middleware - Allow multiple origins (define BEFORE OPTIONS handlers)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bolivia-blue-con-paz.vercel.app',
  'https://boliviablueconpaz.vercel.app',
  'https://boliviablue.com',
  'https://www.boliviablue.com',
  ORIGIN
].filter(Boolean);

// CRITICAL: CORS middleware - MUST be ABSOLUTE FIRST, before ANYTHING else
// This MUST be the very first middleware - nothing can come before it
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;
    
    // Handle OPTIONS preflight requests - MUST return immediately
    if (req.method === 'OPTIONS') {
      console.log(`🚨 OPTIONS PREFLIGHT: ${req.path} | Origin: ${origin || 'none'} | Time: ${new Date().toISOString()}`);
      
      // Build headers object
      // CRITICAL: When credentials are included, Access-Control-Allow-Origin cannot be '*'
      // It must be the specific origin
      const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Max-Age': '86400'
      };
      
      if (origin) {
        // When origin is present, use it (required for credentials)
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      } else {
        // No origin header (unlikely in browser, but handle it)
        headers['Access-Control-Allow-Origin'] = '*';
      }
      
      // Set headers using ALL methods to ensure they're set
      Object.keys(headers).forEach(key => {
        res.header(key, headers[key]);
        res.setHeader(key, headers[key]);
      });
      
      console.log(`✅ OPTIONS: Headers set, returning 200`);
      console.log(`   Headers:`, headers);
      
      // CRITICAL: Use writeHead to ensure headers are set, then end immediately
      try {
        res.writeHead(200, headers);
        res.end();
      } catch (writeError) {
        console.error('❌ Error writing OPTIONS response:', writeError);
        // Fallback: try status and send
        res.status(200);
        Object.keys(headers).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        res.end();
      }
      return; // Don't call next()
    }
  
  // For all other requests (GET, POST, etc.), set CORS headers
  if (origin) {
    // Always set the origin header if present
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    
    next();
  } catch (error) {
    console.error('❌ CORS middleware error:', error);
    // Even on error, try to set CORS headers
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    next();
  }
});


// Security Headers - Helmet (after CORS middleware)
// Configure Helmet to NOT interfere with CORS headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://pagead2.googlesyndication.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.binance.com", "https://p2p.binance.com", "https://boliviablue-production.up.railway.app"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for charts/ads
  crossOriginResourcePolicy: false, // Disable to allow CORS
  crossOriginOpenerPolicy: false, // Disable to allow CORS
}));

// Rate Limiting (OPTIONS are handled by catch-all middleware above)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for OPTIONS requests
});

// Apply rate limiting to API routes (but OPTIONS are already handled above)
app.use('/api/', apiLimiter);

// CORS is now handled entirely by our custom middleware above
// No cors library needed - it was causing conflicts

app.use(express.json());

// Serve frontend static files in production
const frontendDist = join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

/**
 * Test endpoint to verify OPTIONS handler is working
 */
app.get('/api/test-cors', (req, res) => {
  // Explicit CORS headers
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  res.json({
    message: 'CORS test endpoint',
    timestamp: new Date().toISOString(),
    optionsHandler: 'Should be working if you see this',
    origin: origin || 'none'
  });
});

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
 * OPTIONS handler for /api/alerts
 */
app.options('/api/alerts', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🚨 OPTIONS /api/alerts | Origin: ${origin || 'none'}`);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  res.writeHead(200, headers);
  res.end();
});

/**
 * Create a new rate alert
 * CORS headers are set by our custom middleware
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
 * OPTIONS handler for /api/alerts/unsubscribe
 */
app.options('/api/alerts/unsubscribe', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🚨 OPTIONS /api/alerts/unsubscribe | Origin: ${origin || 'none'}`);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  res.writeHead(200, headers);
  res.end();
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

/**
 * OPTIONS handler for /api/newsletter/subscribe
 */
app.options('/api/newsletter/subscribe', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🚨 OPTIONS /api/newsletter/subscribe | Origin: ${origin || 'none'}`);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  res.writeHead(200, headers);
  res.end();
});

/**
 * Subscribe to newsletter
 */
app.post('/api/newsletter/subscribe', async (req, res) => {
  // Explicitly set CORS headers on this route as backup
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  try {
    const { email, language = 'es', source = 'homepage' } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    const subscription = await subscribeToNewsletter(email, language, source);

    res.json({
      success: true,
      message: language === 'es' 
        ? '¡Suscripción exitosa! Revisa tu correo para confirmar.'
        : 'Subscription successful! Check your email to confirm.',
      subscription: {
        email: subscription.email,
        language: subscription.language
      }
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    
    // Handle duplicate email
    if (error.message && error.message.includes('duplicate') || error.message.includes('unique')) {
      return res.status(409).json({
        error: 'Already subscribed',
        message: 'This email is already subscribed to the newsletter'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * OPTIONS handler for /api/newsletter/unsubscribe
 */
app.options('/api/newsletter/unsubscribe', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🚨 OPTIONS /api/newsletter/unsubscribe | Origin: ${origin || 'none'}`);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  res.writeHead(200, headers);
  res.end();
});

/**
 * Unsubscribe from newsletter
 */
app.post('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }

    const result = await unsubscribeFromNewsletter(email);

    if (!result) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Email not found in newsletter subscribers'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get monthly report
 */
app.get('/api/monthly-reports/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    const { lang = 'es' } = req.query;

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        error: 'Invalid month',
        message: 'Month must be between 1 and 12'
      });
    }

    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({
        error: 'Invalid year',
        message: 'Year must be a valid year'
      });
    }

    const report = await getMonthlyReport(monthNum, yearNum, lang);

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: `Monthly report for ${month}/${year} not found`
      });
    }

    res.json(report);

  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get all monthly reports
 */
app.get('/api/monthly-reports', async (req, res) => {
  try {
    const { lang = 'es', limit = 12 } = req.query;

    const reports = await getAllMonthlyReports(lang, parseInt(limit, 10));

    res.json({
      success: true,
      reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Error fetching monthly reports:', error);
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

