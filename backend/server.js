// IMMEDIATE STARTUP LOGGING - This should appear FIRST in Railway logs
console.log('🚀 SERVER STARTING...');
console.log('📅 Time:', new Date().toISOString());
console.log('📁 Working Directory:', process.cwd());
console.log('🔧 Node Version:', process.version);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'not set');

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'node:fs';
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
  getAllMonthlyReports,
  supabase
} from './db-supabase.js';
import {
  initializeSession,
  createMessage,
  getMessages,
  getLatestMessages,
  toggleLike,
  hasUserLiked,
  flagMessage,
  getChatStats
} from './db-chat.js';
import { startScheduler, cache } from './scheduler-supabase.js';

console.log('✅ Imports loaded successfully');

dotenv.config();
console.log('✅ Environment variables loaded');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
// Use specific domain in production, allow localhost for development
const ORIGIN = process.env.ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://boliviablue.com' : '*');
const STALE_THRESHOLD = 45 * 60 * 1000; // 45 minutes

// Middleware - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bolivia-blue-con-paz.vercel.app',
  'https://boliviablueconpaz.vercel.app',
  'https://boliviablue.com',
  'https://www.boliviablue.com',
  ORIGIN
].filter(Boolean);

// CRITICAL: CORS configuration - MUST be FIRST middleware, before ANYTHING else
// Based on Railway best practices: handle OPTIONS early with cors package
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log for debugging
      console.log(`⚠️ CORS: Blocked origin: ${origin}`);
      callback(null, true); // Allow all for now to debug
    }
  },
  credentials: true, // Required for credentials: 'include' in frontend
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie', 'x-session-token'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  preflightContinue: false, // Let cors handle preflight
  optionsSuccessStatus: 200
};

// CRITICAL: Handle OPTIONS requests FIRST with cors
app.options('*', cors(corsOptions));

// CRITICAL: Apply CORS to all routes - MUST be before any other middleware
app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  const method = req.method;
  const origin = req.headers.origin;
  console.log(`🔴 REQUEST: ${method} ${req.path} | Origin: ${origin || 'none'}`);
  
  if (method === 'OPTIONS') {
    console.log(`   ⚠️ OPTIONS REQUEST - should be handled by cors middleware`);
  }
  
  next();
});

// Request logging middleware - log requests (reduced verbosity for performance)
app.use((req, res, next) => {
  // Only log API requests, not static assets
  if (req.path.startsWith('/api/')) {
    console.log(`📥 ${req.method} ${req.path} | Origin: ${req.headers.origin || 'none'}`);
  }
  next();
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

// Rate Limiting (OPTIONS are handled by explicit handler above)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // CRITICAL: Always skip OPTIONS (CORS preflight) - must not be rate limited
    if (req.method === 'OPTIONS') {
      return true;
    }
    return false;
  }
});

// Apply rate limiting to API routes (but OPTIONS are already handled above)
app.use('/api/', apiLimiter);

// CORS is now handled by the cors package (configured above)

app.use(express.json());
app.use(cookieParser()); // For HTTP-only cookies

// Serve frontend static files in production (only if frontend exists)
// Note: Frontend is deployed on Vercel, so this is only for local development
const frontendDist = join(__dirname, '../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  console.log('⚠️ Frontend dist not found - skipping static file serving (frontend is on Vercel)');
}

/**
 * Test endpoint to verify OPTIONS handler is working
 * Test with: curl -X OPTIONS -H "Origin: https://www.boliviablue.com" -v https://boliviablue-production.up.railway.app/api/test-cors
 */
app.get('/api/test-cors', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🧪 TEST-CORS GET: Origin: ${origin || 'none'}`);
  
  res.json({
    message: 'CORS test endpoint',
    timestamp: new Date().toISOString(),
    origin: origin || 'none',
    headers: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
    }
  });
});

/**
 * Explicit OPTIONS handler for test endpoint to verify it works
 */
app.options('/api/test-cors', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🧪 TEST-CORS OPTIONS: Origin: ${origin || 'none'}`);
  
  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, x-session-token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
  
  console.log(`🧪 TEST-CORS OPTIONS: Sending headers:`, JSON.stringify(headers, null, 2));
  res.writeHead(200, headers);
  res.end();
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

/**
 * ========================================
 * ANONYMOUS CHAT API ENDPOINTS
 * ========================================
 */

// CORS is handled by the cors package middleware - no need for manual header setting


// Rate limiters for chat endpoints
const chatMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 messages per hour
  keyGenerator: (req) => {
    // Use session token from cookie or header
    return req.cookies?.chat_session_token || req.headers['x-session-token'] || req.ip;
  },
  message: 'Too many messages. Please wait before posting again.',
  standardHeaders: true,
  legacyHeaders: false
});

const chatDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 messages per day
  keyGenerator: (req) => {
    return req.cookies?.chat_session_token || req.headers['x-session-token'] || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CRITICAL: Explicit OPTIONS handlers for ALL chat endpoints
// These MUST be defined BEFORE the actual route handlers
const handleChatOptions = (req, res) => {
  const origin = req.headers.origin;
  console.log(`🔵 CHAT OPTIONS HANDLER: ${req.path} | Origin: ${origin || 'none'}`);
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, x-session-token');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  res.status(200).end();
};

// Register OPTIONS handlers for all chat routes BEFORE the actual handlers
app.options('/api/chat/session', handleChatOptions);
app.options('/api/chat/messages', handleChatOptions);
app.options('/api/chat/messages/latest', handleChatOptions);
app.options('/api/chat/messages/:id/like', handleChatOptions);
app.options('/api/chat/messages/:id/flag', handleChatOptions);
app.options('/api/chat/stats', handleChatOptions);

/**
 * Initialize anonymous session
 */
app.post('/api/chat/session', async (req, res) => {
  try {
    // Generate or get session token
    let sessionToken = req.cookies?.chat_session_token;
    
    if (!sessionToken) {
      // Generate new session token
      sessionToken = crypto.randomUUID();
    }

    // Initialize session
    const session = await initializeSession(sessionToken);

    // Set HTTP-only cookie (SECURITY FIX)
    res.cookie('chat_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      anonymous_username: session.anonymous_username,
      expires_at: session.expires_at
      // Note: session_token NOT returned in response body (security fix)
    });

  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Create a new message
 */
app.post('/api/chat/messages', chatMessageLimiter, chatDailyLimiter, async (req, res) => {
  const startTime = Date.now();
  console.log(`📨 POST /api/chat/messages - Request received at ${new Date().toISOString()}`);
  console.log(`   Body:`, JSON.stringify(req.body));
  console.log(`   Headers:`, { 
    'content-type': req.headers['content-type'],
    'origin': req.headers.origin,
    'cookie': req.cookies ? 'present' : 'missing'
  });
  
  try {
    const { content, category, location_hint, parent_id } = req.body;
    const sessionToken = req.cookies?.chat_session_token || req.headers['x-session-token'];
    console.log(`   Session token: ${sessionToken ? 'present' : 'missing'}`);

    if (!sessionToken) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Session token required'
      });
    }

    // Validation
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Content is required'
      });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10 || trimmedContent.length > 1000) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Content must be between 10 and 1000 characters'
      });
    }

    const allowedCategories = ['exchange-locations', 'street-rates', 'tips', 'binance-p2p', 'general'];
    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Category must be one of: ${allowedCategories.join(', ')}`
      });
    }

    // Validate parent_id if provided
    if (parent_id) {
      // Verify parent message exists
      const { data: parent } = await supabase
        .from('anonymous_messages')
        .select('id')
        .eq('id', parent_id)
        .eq('is_approved', true)
        .eq('is_deleted', false)
        .single();
      
      if (!parent) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Parent message not found'
        });
      }
    }

    // Create message
    console.log(`   Creating message...`);
    const createStartTime = Date.now();
    const message = await createMessage(trimmedContent, category || 'general', location_hint, sessionToken, parent_id);
    console.log(`   ✅ Message created in ${Date.now() - createStartTime}ms`);

    // Get rate limit info
    const remaining = res.get('X-RateLimit-Remaining') || '9';
    const reset = res.get('X-RateLimit-Reset') || Math.floor(Date.now() / 1000) + 3600;

    const response = {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        anonymous_username: message.anonymous_username,
        category: message.category,
        location_hint: message.location_hint,
        rate_mentioned: message.rate_mentioned,
        created_at: message.created_at,
        likes: message.likes,
        parent_id: message.parent_id,
        reply_count: 0,
        has_user_liked: false,
        replies: []
      }
    };
    
    console.log(`   ✅ Sending response in ${Date.now() - startTime}ms total`);
    res.json(response);

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`   ❌ Error after ${elapsed}ms:`, error.message);
    console.error(`   Stack:`, error.stack);
    
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        retry_after: 3600
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get messages feed
 */
app.get('/api/chat/messages', async (req, res) => {
  try {
    const {
      category,
      location_hint,
      min_rate,
      max_rate,
      sort = 'newest',
      limit = 50,
      before,
      after,
      search
    } = req.query;

    const sessionToken = req.cookies?.chat_session_token || req.headers['x-session-token'];

    const filters = {
      category,
      location_hint,
      min_rate: min_rate ? parseFloat(min_rate) : undefined,
      max_rate: max_rate ? parseFloat(max_rate) : undefined,
      sort,
      limit: Math.min(parseInt(limit, 10) || 50, 200),
      before,
      after,
      search
    };

    const result = await getMessages(filters);

    // Check which messages user has liked (including replies)
    const messagesWithLikes = await Promise.all(
      result.messages.map(async (msg) => {
        const hasLiked = sessionToken ? await hasUserLiked(msg.id, sessionToken) : false;
        
        // Check likes for replies too
        const repliesWithLikes = await Promise.all(
          (msg.replies || []).map(async (reply) => {
            const replyHasLiked = sessionToken ? await hasUserLiked(reply.id, sessionToken) : false;
            return {
              ...reply,
              has_user_liked: replyHasLiked
            };
          })
        );
        
        return {
          ...msg,
          has_user_liked: hasLiked,
          replies: repliesWithLikes
        };
      })
    );

    res.json({
      messages: messagesWithLikes,
      total: result.total,
      has_more: result.has_more,
      next_cursor: messagesWithLikes.length > 0 
        ? messagesWithLikes[messagesWithLikes.length - 1].created_at 
        : null
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get latest messages (for real-time updates)
 */
app.get('/api/chat/messages/latest', async (req, res) => {
  try {
    const { after, limit = 20 } = req.query;
    const sessionToken = req.cookies?.chat_session_token || req.headers['x-session-token'];

    const result = await getLatestMessages(after, parseInt(limit, 10) || 20);

    // Check which messages user has liked
    const messagesWithLikes = await Promise.all(
      result.messages.map(async (msg) => {
        const hasLiked = sessionToken ? await hasUserLiked(msg.id, sessionToken) : false;
        return {
          ...msg,
          has_user_liked: hasLiked
        };
      })
    );

    res.json({
      messages: messagesWithLikes,
      count: result.count,
      latest_timestamp: result.latest_timestamp
    });

  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Like/unlike a message
 */
app.post('/api/chat/messages/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'like' } = req.body;
    const sessionToken = req.cookies?.chat_session_token || req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Session token required'
      });
    }

    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Action must be "like" or "unlike"'
      });
    }

    const result = await toggleLike(id, sessionToken, action);

    res.json({
      success: true,
      likes: result.likes,
      has_user_liked: result.has_user_liked
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Flag a message for moderation
 */
app.post('/api/chat/messages/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'other' } = req.body;
    const sessionToken = req.cookies?.chat_session_token || req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Session token required'
      });
    }

    const allowedReasons = ['spam', 'inappropriate', 'off_topic', 'other'];
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Reason must be one of: ${allowedReasons.join(', ')}`
      });
    }

    const result = await flagMessage(id, sessionToken, reason);

    res.json(result);

  } catch (error) {
    console.error('Error flagging message:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        retry_after: 86400
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get chat statistics
 */
app.get('/api/chat/stats', async (req, res) => {
  try {
    const stats = await getChatStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Ensure CORS headers are still set on error response
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Serve frontend for all other routes (SPA fallback)
// Only if frontend dist exists (for local development)
// In production, frontend is on Vercel, so API-only requests should reach here
app.get('*', (req, res) => {
  // Only try to serve frontend if it exists (local dev)
  if (existsSync(frontendDist)) {
    res.sendFile(join(frontendDist, 'index.html'));
  } else {
    // Frontend is on Vercel - return 404 for non-API routes
    res.status(404).json({ error: 'Not found', message: 'API endpoint not found' });
  }
});

// Start scheduler
startScheduler();

// CRITICAL: Create raw HTTP server to intercept OPTIONS BEFORE Express
// This handles OPTIONS at the HTTP level, before Railway's proxy can interfere
import http from 'http';

const server = http.createServer((req, res) => {
  // Intercept OPTIONS requests at the lowest possible level
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    console.log(`🔵 RAW HTTP OPTIONS INTERCEPT: ${req.url} | Origin: ${origin || 'none'}`);
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.url}`);
    console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
    
    // Set CORS headers immediately
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, x-session-token');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    console.log(`✅ RAW HTTP OPTIONS: Headers set, sending 200`);
    console.log(`   Access-Control-Allow-Origin: ${res.getHeader('Access-Control-Allow-Origin')}`);
    
    res.writeHead(200);
    res.end();
    return; // Don't pass to Express
  }
  
  // For all other requests, pass to Express
  app(req, res);
});

// Start server - Listen on 0.0.0.0 for Railway compatibility
try {
  console.log(`🔌 Attempting to start server on port ${PORT}...`);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Bolivia Blue con Paz backend running on port ${PORT}`);
    console.log(`✅ Using Supabase database at ${process.env.SUPABASE_URL || 'NOT SET'}`);
    console.log(`✅ CORS configured for multiple origins including: ${allowedOrigins.join(', ')}`);
    console.log(`✅ Raw HTTP server intercepting OPTIONS requests before Express`);
    console.log(`✅ Server is ready to accept connections`);
  });
} catch (error) {
  console.error('❌ FATAL ERROR: Failed to start server');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

