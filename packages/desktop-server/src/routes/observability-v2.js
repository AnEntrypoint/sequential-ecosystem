import { ExecutionTracer } from '@sequential/execution-tracer';
import { ToolCallTracer } from '@sequential/tool-call-tracer';
import { CustomMetrics } from '@sequential/custom-metrics';
import { StateTransitionLogger } from '@sequential/state-transition-logger';
import { StorageQueryTracer } from '@sequential/storage-query-tracer';
import { AlertEngine, AlertConditions } from '@sequential/alert-engine';
import { formatResponse } from '@sequential/response-formatting';

const tracer = new ExecutionTracer();
const toolTracer = new ToolCallTracer();
const customMetrics = new CustomMetrics();
const stateLogger = new StateTransitionLogger();
const storageTracer = new StorageQueryTracer();
const alertEngine = new AlertEngine();

const eventStream = [];
const maxEventStreamSize = 5000;

function broadcastEvent(type, data, severity = 'info') {
  const event = {
    timestamp: Date.now(),
    type,
    severity,
    data
  };
  eventStream.push(event);
  if (eventStream.length > maxEventStreamSize) eventStream.shift();
  return event;
}

function registerObservabilityV2Routes(app, container) {
  app.get('/api/observability/v2/traces', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const traces = tracer.getTraces(limit);
    res.json(formatResponse({ traces, count: traces.length }));
  });

  app.get('/api/observability/v2/traces/:traceId', (req, res) => {
    const trace = tracer.getTrace(req.params.traceId);
    if (!trace) return res.status(404).json(formatResponse({ error: 'Trace not found' }, { code: 'NOT_FOUND' }));
    res.json(formatResponse({ trace }));
  });

  app.get('/api/observability/v2/spans/:spanId', (req, res) => {
    const span = tracer.getSpan(req.params.spanId);
    if (!span) return res.status(404).json(formatResponse({ error: 'Span not found' }, { code: 'NOT_FOUND' }));
    res.json(formatResponse({ span: span.toJSON() }));
  });

  app.get('/api/observability/v2/tool-calls', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const calls = toolTracer.getRecent(limit);
    const stats = toolTracer.getStats();
    res.json(formatResponse({ calls, stats }));
  });

  app.get('/api/observability/v2/tool-calls/:toolName', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const calls = toolTracer.getCallsForTool(req.params.toolName, limit);
    res.json(formatResponse({ toolName: req.params.toolName, calls, count: calls.length }));
  });

  app.get('/api/observability/v2/tool-calls/app/:appId', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const calls = toolTracer.getCallsForApp(req.params.appId, limit);
    res.json(formatResponse({ appId: req.params.appId, calls, count: calls.length }));
  });

  app.get('/api/observability/v2/state-transitions', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const transitions = stateLogger.getRecent(limit);
    const stats = stateLogger.getStats();
    res.json(formatResponse({ transitions, stats }));
  });

  app.get('/api/observability/v2/state-transitions/:resourceId', (req, res) => {
    const transitions = stateLogger.getTransitionsForResource(req.params.resourceId);
    const durations = stateLogger.getStateDurations(req.params.resourceId);
    res.json(formatResponse({ resourceId: req.params.resourceId, transitions, durations }));
  });

  app.get('/api/observability/v2/state-transitions/:resourceId/path', (req, res) => {
    const path = stateLogger.getTransitionPath(req.params.resourceId);
    res.json(formatResponse({ resourceId: req.params.resourceId, path }));
  });

  app.get('/api/observability/v2/storage-queries', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const queries = storageTracer.getRecent(limit);
    const stats = storageTracer.getStats();
    res.json(formatResponse({ queries, stats }));
  });

  app.get('/api/observability/v2/storage-queries/slow', (req, res) => {
    const threshold = parseInt(req.query.threshold) || 100;
    const limit = parseInt(req.query.limit) || 50;
    const slowQueries = storageTracer.getSlowQueries(threshold, limit);
    res.json(formatResponse({ slowQueries, count: slowQueries.length, threshold }));
  });

  app.get('/api/observability/v2/custom-metrics', (req, res) => {
    const metrics = customMetrics.getAllMetrics();
    const summary = customMetrics.getSummary();
    res.json(formatResponse({ metrics, summary }));
  });

  app.get('/api/observability/v2/custom-metrics/:metricName', (req, res) => {
    const metric = customMetrics.getMetric(req.params.metricName);
    if (!metric) return res.status(404).json(formatResponse({ error: 'Metric not found' }, { code: 'NOT_FOUND' }));
    res.json(formatResponse({ metric }));
  });

  app.get('/api/observability/v2/custom-events', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const filterType = req.query.type || null;
    const events = customMetrics.getEvents(limit, filterType);
    res.json(formatResponse({ events, count: events.length }));
  });

  app.post('/api/observability/v2/custom-events', (req, res) => {
    const { eventType, data, labels } = req.body;
    const event = customMetrics.recordEvent(eventType, data, labels);
    broadcastEvent('metric:recorded', event, 'info');
    res.json(formatResponse({ event }, { code: 'CREATED' }));
  });

  app.get('/api/observability/v2/alerts', (req, res) => {
    const activeAlerts = alertEngine.getActiveAlerts();
    const rules = alertEngine.getAllRules();
    res.json(formatResponse({ alerts: activeAlerts, rules, activeCount: activeAlerts.length }));
  });

  app.post('/api/observability/v2/alerts/rules', (req, res) => {
    const { name, conditionType, params, actions = [] } = req.body;
    const condition = AlertConditions[conditionType]?.(...params) || (() => false);
    const rule = alertEngine.createRule(name, condition, actions, { conditionType, params });
    res.json(formatResponse({ rule: { id: rule.id, name: rule.name, enabled: rule.enabled } }));
  });

  app.get('/api/observability/v2/alerts/rules/:ruleId', (req, res) => {
    const rule = alertEngine.getRule(req.params.ruleId);
    if (!rule) return res.status(404).json(formatResponse({ error: 'Rule not found' }, { code: 'NOT_FOUND' }));
    res.json(formatResponse({ rule }));
  });

  app.patch('/api/observability/v2/alerts/rules/:ruleId/enable', (req, res) => {
    alertEngine.enableRule(req.params.ruleId);
    res.json(formatResponse({ status: 'enabled' }));
  });

  app.patch('/api/observability/v2/alerts/rules/:ruleId/disable', (req, res) => {
    alertEngine.disableRule(req.params.ruleId);
    res.json(formatResponse({ status: 'disabled' }));
  });

  app.delete('/api/observability/v2/alerts/rules/:ruleId', (req, res) => {
    alertEngine.deleteRule(req.params.ruleId);
    res.json(formatResponse({ status: 'deleted' }));
  });

  app.post('/api/observability/v2/alerts/:alertId/resolve', (req, res) => {
    const { resolution } = req.body || { resolution: 'acknowledged' };
    alertEngine.resolveAlert(req.params.alertId, resolution);
    res.json(formatResponse({ status: 'resolved' }));
  });

  app.get('/api/observability/v2/alerts/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const history = alertEngine.getAlertHistory(limit);
    res.json(formatResponse({ history, count: history.length }));
  });

  app.get('/api/observability/v2/events', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const filterType = req.query.type || null;
    let events = eventStream.slice(-limit);
    if (filterType) events = events.filter(e => e.type === filterType);
    res.json(formatResponse({ events, count: events.length }));
  });

  app.get('/api/observability/v2/summary', (req, res) => {
    const summary = {
      traces: { count: tracer.traces.size, avgDuration: 0 },
      toolCalls: toolTracer.getStats(),
      stateTransitions: stateLogger.getStats(),
      storageQueries: storageTracer.getStats(),
      customMetrics: customMetrics.getSummary(),
      alerts: {
        active: alertEngine.getActiveAlerts().length,
        rules: alertEngine.getAllRules().length
      }
    };
    res.json(formatResponse(summary));
  });

  app.get('/api/observability/v2/health', (req, res) => {
    const totalSpans = tracer.spans.size;
    const totalCalls = toolTracer.calls.length;
    const totalTransitions = stateLogger.transitions.length;
    const totalQueries = storageTracer.queries.length;

    res.json(formatResponse({
      status: 'healthy',
      systems: {
        tracing: { spans: totalSpans, traces: tracer.traces.size },
        tools: { calls: totalCalls },
        state: { transitions: totalTransitions },
        storage: { queries: totalQueries }
      }
    }));
  });

  app.delete('/api/observability/v2/clear', (req, res) => {
    tracer.clear();
    toolTracer.clear();
    customMetrics.clear();
    stateLogger.clear();
    storageTracer.clear();
    alertEngine.clear();
    eventStream.length = 0;
    res.json(formatResponse({ status: 'cleared' }));
  });
}

export {
  registerObservabilityV2Routes,
  tracer,
  toolTracer,
  customMetrics,
  stateLogger,
  storageTracer,
  alertEngine,
  broadcastEvent
};
