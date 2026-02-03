const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Cok fazla deneme. 15 dakika sonra tekrar deneyin.'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for local development
    return process.env.NODE_ENV !== 'production';
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Higher limit for development
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Cok fazla istek. Lutfen bekleyin.'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for local development
    return process.env.NODE_ENV !== 'production';
  }
});

module.exports = { authLimiter, apiLimiter };
