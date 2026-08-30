// Logger utility that respects environment and log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Resolve the current log level dynamically each call (LOW-16).
// This allows toggling LOG_LEVEL in localStorage at runtime without a page reload.
const getLogLevel = () => {
  const storedLevel = localStorage.getItem('LOG_LEVEL');
  if (storedLevel !== null) {
    const parsed = parseInt(storedLevel, 10);
    if (!isNaN(parsed)) return parsed;
  }
  // In production, only show WARN and above
  return process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
};

const logger = {
  debug: (...args) => {
    if (getLogLevel() <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    if (getLogLevel() <= LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    if (getLogLevel() <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args) => {
    if (getLogLevel() <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);
    }
  },

  // Helper to check if debug logging is enabled
  isDebugEnabled: () => getLogLevel() <= LOG_LEVELS.DEBUG
};

// Expose LOG_LEVELS for programmatic control
logger.LOG_LEVELS = LOG_LEVELS;

export default logger;











