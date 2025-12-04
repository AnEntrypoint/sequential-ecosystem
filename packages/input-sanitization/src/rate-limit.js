import rateLimit from 'express-rate-limit';
import { CONFIG } from '../../server-utilities/src/index.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';

const wsConnectionMap = new Map();

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

export function createWebSocketRateLimiter() {
  setInterval(() => {
    const now = Date.now();
    wsConnectionMap.forEach((connections, ip) => {
      const validConnections = connections.filter(c => c.ws.readyState === 1);
      if (validConnections.length === 0) {
        wsConnectionMap.delete(ip);
      } else {
        wsConnectionMap.set(ip, validConnections);
      }
    });
  }, CONFIG.rateLimit.websocket.cleanupIntervalMs);
}

export function checkWebSocketRateLimit(ip) {
  if (!wsConnectionMap.has(ip)) {
    wsConnectionMap.set(ip, []);
  }

  const connections = wsConnectionMap.get(ip);

  return {
    ip,
    isAllowed: () => connections.length < CONFIG.rateLimit.websocket.maxConnectionsPerIp,
    getRemainingConnections: () => Math.max(0, CONFIG.rateLimit.websocket.maxConnectionsPerIp - connections.length),
    add: (ws) => {
      const connections = wsConnectionMap.get(ip);
      if (connections.length >= CONFIG.rateLimit.websocket.maxConnectionsPerIp) {
        return false;
      }
      connections.push({ ws, timestamp: Date.now() });
      return true;
    },
    remove: (ws) => {
      const connections = wsConnectionMap.get(ip);
      const index = connections.findIndex(c => c.ws === ws);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) wsConnectionMap.delete(ip);
      }
    }
  };
}
