/**
 * tool-rate-limiter.js
 *
 * Rate limiting for tool test endpoint
 */

import { formatResponse } from '@sequentialos/response-formatting';
import logger from '@sequentialos/sequential-logging';

export function createToolTestRateLimiter() {
  const toolTestLimiter = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const window = 60000;
    const maxRequests = 5;

    if (!toolTestLimiter.has(ip)) {
      toolTestLimiter.set(ip, []);
    }

    const requests = toolTestLimiter.get(ip).filter(timestamp => now - timestamp < window);
    toolTestLimiter.set(ip, requests);

    if (requests.length >= maxRequests) {
      logger.warn(`Rate limit exceeded for tool test endpoint from ${ip}`);
      return res.status(429).json(formatResponse(null, { error: 'Too many tool test requests. Max 5 per minute.' }));
    }

    requests.push(now);
    toolTestLimiter.set(ip, requests);
    next();
  };
}
