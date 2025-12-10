import { asyncHandler, getOperationLog } from '../middleware/error-handler.js';
import { getFromCache, getRequestLog, CONFIG } from 'server-utilities';
import { createError } from '@sequential/error-handling';
import { formatResponse } from 'response-formatting';
import { createServiceFactory } from '@sequential/service-factory';

export function registerDebugRoutes(app, container) {
  const { getStateManager } = createServiceFactory(container);
  app.get('/api/logs', asyncHandler((req, res) => {
    const filter = req.query.filter;
    let parsedFilter = null;
    if (filter) {
      try {
        parsedFilter = JSON.parse(filter);
      } catch {
        parsedFilter = null;
      }
    }
    const logs = getRequestLog(parsedFilter);
    const MAX_LIMIT = 1000;
    let limit = req.query.limit ? parseInt(req.query.limit) : CONFIG.logs.defaultLogLimit;
    if (isNaN(limit) || limit < 1) limit = CONFIG.logs.defaultLogLimit;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    res.json(formatResponse({ logs: logs.slice(-limit) }));
  }));

  app.get('/api/operations-log', asyncHandler((req, res) => {
    const log = getOperationLog();
    const MAX_LIMIT = 1000;
    let limit = req.query.limit ? parseInt(req.query.limit) : CONFIG.logs.defaultLogLimit;
    if (isNaN(limit) || limit < 1) limit = CONFIG.logs.defaultLogLimit;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    res.json(formatResponse({ log: log.slice(-limit) }));
  }));

  app.get('/api/cache-status', asyncHandler((req, res) => {
    const cached = getFromCache('metrics');
    res.json(formatResponse({ hasMetricsCache: cached !== null, metricsCache: cached, cacheStatus: 'operational' }));
  }));

  app.post('/api/cache-clear', asyncHandler((req, res) => {
    res.json(formatResponse({ message: 'Cache would be cleared' }));
  }));

  app.get('/api/state/stats', asyncHandler((req, res) => {
    const stats = getStateManager().getCacheStats();
    res.json(formatResponse({ stats }));
  }));
}
