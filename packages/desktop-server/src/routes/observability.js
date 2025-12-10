import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from 'response-formatting';
import os from 'os';

export function registerObservabilityRoutes(app, container, metricsCollector) {
  app.get('/api/observability/health', asyncHandler(async (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    res.json(formatResponse({
      status: 'healthy',
      uptime,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      cpu: {
        cores: os.cpus().length,
        loadAvg: os.loadavg()
      }
    }));
  }));

  app.get('/api/observability/metrics', asyncHandler(async (req, res) => {
    res.json(formatResponse({
      summary: metricsCollector.getSummary(),
      slowEndpoints: metricsCollector.getSlowEndpoints(10),
      topErrors: metricsCollector.getTopErrors(10),
      recentMetrics: metricsCollector.getMetrics().slice(-20)
    }));
  }));

  app.get('/api/observability/metrics/endpoint/:endpoint', asyncHandler(async (req, res) => {
    const metrics = metricsCollector.getMetrics({ path: `/${req.params.endpoint}` });
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / (metrics.length || 1);
    const errorCount = metrics.filter(m => m.error).length;

    res.json(formatResponse({
      endpoint: req.params.endpoint,
      totalRequests: metrics.length,
      avgDuration: Math.round(avgDuration),
      errorCount,
      errorRate: ((errorCount / (metrics.length || 1)) * 100).toFixed(2) + '%',
      recentRequests: metrics.slice(-10)
    }));
  }));

  app.get('/api/observability/state', asyncHandler(async (req, res) => {
    const stateManager = container.safeResolve('StateManager');

    if (!stateManager) {
      return res.status(503).json(formatResponse(null, { error: 'StateManager not available' }));
    }

    const state = {
      storeCount: stateManager.cache?.size || 0,
      maxCacheSize: stateManager.maxCacheSize,
      cacheTTL: stateManager.cacheTTL
    };

    res.json(formatResponse(state));
  }));

  app.get('/api/observability/state/keys', asyncHandler(async (req, res) => {
    const stateManager = container.safeResolve('StateManager');

    if (!stateManager) {
      return res.status(503).json(formatResponse(null, { error: 'StateManager not available' }));
    }

    const keys = Array.from(stateManager.cache?.keys() || []).slice(0, 100);
    res.json(formatResponse({ keys, total: stateManager.cache?.size || 0 }));
  }));

  app.get('/api/observability/state/:key/:subkey', asyncHandler(async (req, res) => {
    const stateManager = container.safeResolve('StateManager');

    if (!stateManager) {
      return res.status(503).json(formatResponse(null, { error: 'StateManager not available' }));
    }

    const key = `${req.params.key}:${req.params.subkey}`;
    const value = await stateManager.get(req.params.key, req.params.subkey);

    res.json(formatResponse({ key, value }));
  }));

  app.get('/api/observability/tasks', asyncHandler(async (req, res) => {
    const taskService = container.safeResolve('TaskService');

    if (!taskService) {
      return res.status(503).json(formatResponse(null, { error: 'TaskService not available' }));
    }

    const activeTasks = taskService.getActiveTasks() || [];
    res.json(formatResponse({
      active: activeTasks.length,
      tasks: activeTasks.map(t => ({
        name: t.name,
        status: t.status,
        startTime: t.startTime,
        duration: Date.now() - t.startTime
      }))
    }));
  }));

  app.get('/api/observability/profiling', asyncHandler(async (req, res) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json(formatResponse({
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUtilization: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2) + '%',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      },
      uptime: {
        seconds: Math.round(uptime),
        formatted: formatUptime(uptime)
      },
      nodejs: {
        version: process.version,
        pid: process.pid,
        platform: process.platform,
        arch: process.arch
      },
      system: {
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024) + 'MB',
        loadAvg: os.loadavg()
      }
    }));
  }));

  app.delete('/api/observability/metrics/reset', asyncHandler(async (req, res) => {
    metricsCollector.clear();
    res.json(formatResponse({ status: 'metrics cleared' }));
  }));
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}
