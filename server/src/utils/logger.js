/**
 * Simple structured logger utility.
 * In production, swap for winston/pino if needed.
 */
const logger = {
  info: (message, meta = {}) => {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },

  warn: (message, meta = {}) => {
    console.warn(
      JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },

  error: (message, meta = {}) => {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        ...(meta instanceof Error
          ? { error: meta.message, stack: meta.stack }
          : meta),
      })
    );
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          timestamp: new Date().toISOString(),
          message,
          ...meta,
        })
      );
    }
  },
};

module.exports = logger;
