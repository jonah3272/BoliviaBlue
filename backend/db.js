import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'blue.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    t TEXT NOT NULL,
    buy REAL NOT NULL,
    sell REAL NOT NULL,
    mid REAL NOT NULL,
    official_buy REAL,
    official_sell REAL,
    official_mid REAL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_rates_t ON rates(t DESC);

  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    published_at TEXT NOT NULL,
    sentiment TEXT DEFAULT 'neutral',
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
`);

export const insertRate = db.prepare(`
  INSERT INTO rates (t, buy, sell, mid, official_buy, official_sell, official_mid) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export const getLatestRate = db.prepare(`
  SELECT * FROM rates ORDER BY t DESC LIMIT 1
`);

export const getRatesInRange = db.prepare(`
  SELECT t, buy, sell, mid, official_buy, official_sell, official_mid FROM rates 
  WHERE datetime(t) >= datetime(?)
  ORDER BY t ASC
`);

export const getAllRates = db.prepare(`
  SELECT t, buy, sell, mid, official_buy, official_sell, official_mid FROM rates 
  ORDER BY t ASC
`);

export const getTotalRatesCount = db.prepare(`
  SELECT COUNT(*) as count FROM rates
`);

export const insertNews = db.prepare(`
  INSERT OR IGNORE INTO news (id, source, url, title, summary, published_at, sentiment)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export const getRecentNews = db.prepare(`
  SELECT * FROM news 
  ORDER BY published_at DESC 
  LIMIT ?
`);

export default db;

