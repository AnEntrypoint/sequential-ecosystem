import rateLimit from 'express-rate-limit';
import { nowISO } from '@sequentialos/timestamp-utilities';

export function createRateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Limit: ${maxRequests} per ${windowMs}ms`,
      details: { retryAfter: windowMs / 1000 },
      timestamp: nowISO()
    },
    standardHeaders: false,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs}ms`,
        details: { retryAfter: windowMs / 1000 },
        timestamp: nowISO()
      });
    }
  });
}

export function createCustomRateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  const RATE_LIMIT_MAP = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of RATE_LIMIT_MAP.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        RATE_LIMIT_MAP.delete(ip);
      } else {
        RATE_LIMIT_MAP.set(ip, valid);
      }
    }
  }, Math.max(windowMs / 2, 30000));

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();

    if (!RATE_LIMIT_MAP.has(ip)) {
      RATE_LIMIT_MAP.set(ip, []);
    }

    const timestamps = RATE_LIMIT_MAP.get(ip);
    const recentRequests = timestamps.filter(t => now - t < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs}ms`,
        details: { retryAfter: windowMs / 1000 },
        timestamp: nowISO()
      });
    }

    recentRequests.push(now);
    RATE_LIMIT_MAP.set(ip, recentRequests);
    next();
  };
}
