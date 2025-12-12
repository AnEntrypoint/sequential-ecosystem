import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse } from '@sequentialos/response-formatting';
import { HealthCollector, ProfilingCollector, EndpointMetricsCollector } from './observability-collectors.js';

const healthCollector = new HealthCollector();
const profilingCollector = new ProfilingCollector();
const endpointMetricsCollector = new EndpointMetricsCollector();

export function registerObservabilityRoutes(app, container, metricsCollector) {
  app.get('/api/observability/health', asyncHandler(async (req, res) => {
    res.json(formatResponse(healthCollector.collectBasicHealth()));
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
    const endpointMetrics = endpointMetricsCollector.collectEndpointMetrics(metrics, req.params.endpoint);
    res.json(formatResponse(endpointMetrics));
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
    res.json(formatResponse(profilingCollector.collectProfiling()));
  }));

  app.delete('/api/observability/metrics/reset', asyncHandler(async (req, res) => {
    metricsCollector.clear();
    res.json(formatResponse({ status: 'metrics cleared' }));
  }));
}
