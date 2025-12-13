import express from 'express';
import { createRequestLogger } from '@sequentialos/server-utilities';
import { createRateLimitMiddleware } from '@sequentialos/input-sanitization';
import { securityHeaders } from './middleware/security-headers.js';
import { optionalAuth } from '../../zellous/server/auth-middleware.js';
import { responseFormatterMiddleware } from './middleware/response-formatter-middleware.js';

export function setupExpressMiddleware(app) {
  app.use(express.json({ limit: '50mb' }));
  app.use(securityHeaders);
}

export function setupCORS(app) {
  const corsConfig = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
    headers: (process.env.CORS_HEADERS || 'Content-Type,Authorization').split(','),
    maxAge: parseInt(process.env.CORS_MAX_AGE || '3600')
  };

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsConfig.origin);
    res.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsConfig.headers.join(', '));
    res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
}

export function setupRequestTracking(app) {
  app.use((req, res, next) => {
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.header('X-Request-ID', req.requestId);
    next();
  });
}

export function setupAPIMiddleware(app) {
  const rateLimitRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '100');
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

  app.use('/api/', createRequestLogger());
  app.use('/api/', createRateLimitMiddleware(rateLimitRequests, rateLimitWindow));
  app.use('/api/', optionalAuth);
  app.use('/api/', responseFormatterMiddleware);
}
