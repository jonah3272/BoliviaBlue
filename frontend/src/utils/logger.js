/**
 * Production-safe logging utility
 * Logs only in development, silent in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
    // In production, you could send to error tracking service (Sentry, etc.)
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  }
};

// For critical errors that should always be logged
export const logCritical = (...args) => {
  console.error('[CRITICAL]', ...args);
  // Send to error tracking service
};

export default logger;

