/**
 * correlation.js - Correlation ID tracking
 *
 * Manages request correlation IDs across async context
 */

import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const correlationIdStorage = new AsyncLocalStorage();

export const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  correlationIdStorage.run(correlationId, () => {
    next();
  });
};

export const getCorrelationId = () => {
  return correlationIdStorage.getStore();
};
