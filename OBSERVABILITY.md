# Comprehensive Observability Suite

The Sequential Ecosystem now includes an enterprise-grade observability system for comprehensive monitoring, tracing, debugging, and alerting.

## Core Systems

### 1. Execution Tracing (`@sequential/execution-tracer`)

Full distributed tracing with parent-child span relationships for waterfall visualization.

```javascript
const { tracer } = require('@sequential/execution-tracer');

// Start a trace
const traceId = tracer.startTrace();

// Execute with automatic span tracking
const result = await tracer.executeSpan('operation-name', async (span) => {
  span.addAttribute('userId', 123);
  span.addEvent('Processing started', { progress: 0 });
  // Your code here
  span.addEvent('Processing complete', { progress: 100 });
  return result;
});

// Query traces
const trace = tracer.getTrace(traceId);
const allTraces = tracer.getTraces(100); // Last 100 traces
```

**API Endpoints:**
```
GET    /api/observability/v2/traces              All traces
GET    /api/observability/v2/traces/:traceId     Specific trace
GET    /api/observability/v2/spans/:spanId       Specific span
```

---

### 2. Tool Call Tracing (`@sequential/tool-call-tracer`)

Automatic tracing of all tool invocations with parameters, results, and timing.

```javascript
const { toolTracer } = require('@sequential/tool-call-tracer');

// Automatically called by tool registry
await toolTracer.executeToolCall('app-1', 'query-db', { id: 123 }, async () => {
  return await db.query('SELECT * WHERE id=123');
});

// Query tool statistics
const stats = toolTracer.getStats();
// { totalCalls, byStatus, avgDuration, tools: [{tool, count, avgDuration, errors, errorRate}] }

const callsForTool = toolTracer.getCallsForTool('query-db');
const callsForApp = toolTracer.getCallsForApp('app-1');
```

**API Endpoints:**
```
GET    /api/observability/v2/tool-calls              All recent calls
GET    /api/observability/v2/tool-calls/:toolName    Calls for specific tool
GET    /api/observability/v2/tool-calls/app/:appId   Calls for specific app
```

---

### 3. State Transition Logging (`@sequential/state-transition-logger`)

Track all state machine transitions in tasks and flows.

```javascript
const { stateLogger } = require('@sequential/state-transition-logger');

// Log state transitions
stateLogger.recordTransition('task-1', 'task', 'running', 'paused', 'fetch', { duration: 150 });
stateLogger.recordTransition('task-1', 'task', 'paused', 'running', 'resume', { duration: 50 });

// Query transition paths
const path = stateLogger.getTransitionPath('task-1');
// [{state: 'paused', trigger: 'fetch', timestamp: ...}, {state: 'running', ...}]

// Get state duration metrics
const durations = stateLogger.getStateDurations('task-1');
// [{state: 'paused', avgDuration: 150, minDuration: 100, maxDuration: 200, count: 5}]

// Get statistics
const stats = stateLogger.getStats('task'); // Filter by resource type
```

**API Endpoints:**
```
GET    /api/observability/v2/state-transitions              All transitions
GET    /api/observability/v2/state-transitions/:resourceId  Transitions for resource
GET    /api/observability/v2/state-transitions/:resourceId/path  State path
```

---

### 4. Storage Query Tracing (`@sequential/storage-query-tracer`)

Full visibility into database/file operations.

```javascript
const { storageTracer } = require('@sequential/storage-query-tracer');

// Trace a query
const query = storageTracer.recordQuery('get', 'tasks', 'task-1');
try {
  const result = await stateManager.get('tasks', 'task-1');
  query.end(1); // row count = 1
} catch (error) {
  query.end(0, error);
}

// Find slow queries
const slowQueries = storageTracer.getSlowQueries(100); // > 100ms

// Get statistics
const stats = storageTracer.getStats();
// { totalQueries, successRate, avgDuration, totalErrors, byOperation: [...] }
```

**API Endpoints:**
```
GET    /api/observability/v2/storage-queries        All queries
GET    /api/observability/v2/storage-queries/slow   Slow queries (threshold, limit)
```

---

### 5. Custom Metrics (`@sequential/custom-metrics`)

Application-level metrics for business events and domain-specific tracking.

```javascript
const { customMetrics } = require('@sequential/custom-metrics');

// Counters
const loginCounter = customMetrics.counter('auth.logins', 'User login count');
loginCounter.increment(1, { region: 'us-east' });

// Gauges (current value)
const activeUsersGauge = customMetrics.gauge('users.active', 'Active users');
activeUsersGauge.set(42, { region: 'global' });

// Histograms (distributions)
const processingTime = customMetrics.histogram('process.duration_ms', 'Processing duration');
processingTime.observe(234);
processingTime.observe(567);

// Custom events
const event = customMetrics.recordEvent('user.signup', {
  userId: '123',
  method: 'email'
}, { environment: 'prod' });

// Query metrics
const allMetrics = customMetrics.getAllMetrics();
const metric = customMetrics.getMetric('auth.logins');
```

**API Endpoints:**
```
GET    /api/observability/v2/custom-metrics              All metrics
GET    /api/observability/v2/custom-metrics/:metricName  Specific metric
GET    /api/observability/v2/custom-events              All events (limit, type filter)
POST   /api/observability/v2/custom-events              Record event
```

---

### 6. Alert Engine (`@sequential/alert-engine`)

Threshold-based alerting with flexible condition evaluation.

```javascript
const { alertEngine, AlertConditions } = require('@sequential/alert-engine');

// Create rules with built-in conditions
alertEngine.createRule(
  'High Error Rate',
  AlertConditions.errorRate(5), // > 5%
  [(alert) => console.log('Alert:', alert)]
);

alertEngine.createRule(
  'Slow Endpoints',
  AlertConditions.slowEndpoint(1000), // > 1000ms avg
  [(alert) => sendWebhook(alert)]
);

alertEngine.createRule(
  'Memory Threshold',
  AlertConditions.memoryUsage(80) // > 80%
);

// Custom conditions
alertEngine.createRule(
  'Custom',
  AlertConditions.and(
    AlertConditions.errorRate(3),
    AlertConditions.threshold('errorCount', '>', 100)
  )
);

// Evaluate metrics against all rules
const triggered = alertEngine.evaluateAllRules(metrics);

// Manage alerts
const activeAlerts = alertEngine.getActiveAlerts();
alertEngine.resolveAlert(alertId, 'acknowledged');

// Get history
const history = alertEngine.getAlertHistory(100);
```

**Condition Types:**
```
AlertConditions.threshold(key, operator, value)          # >, <, >=, <=, ==
AlertConditions.errorRate(percentThreshold)
AlertConditions.slowEndpoint(durationThreshold)
AlertConditions.memoryUsage(percentThreshold)
AlertConditions.and(...conditions)
AlertConditions.or(...conditions)
```

**API Endpoints:**
```
GET    /api/observability/v2/alerts                      Active alerts & rules
POST   /api/observability/v2/alerts/rules               Create alert rule
GET    /api/observability/v2/alerts/rules/:ruleId       Get rule
PATCH  /api/observability/v2/alerts/rules/:ruleId/enable   Enable rule
PATCH  /api/observability/v2/alerts/rules/:ruleId/disable  Disable rule
DELETE /api/observability/v2/alerts/rules/:ruleId       Delete rule
POST   /api/observability/v2/alerts/:alertId/resolve    Resolve alert
GET    /api/observability/v2/alerts/history             Alert history
```

---

## Observer Apps

### Observability Console (`app-observability-console`)

Real-time event stream viewer with filtering and search.

**Features:**
- Live event feed (HTTP, tool calls, state transitions, storage, spans)
- Filter by type, severity, app, correlation ID
- Event statistics dashboard
- Pause/resume streaming
- Full-text search

**URL:** `http://localhost:3001/?app=app-observability-console`

---

### Observability Dashboard (`app-observability-dashboard`)

Comprehensive monitoring dashboard with metrics, traces, and alerts.

**Features:**
- Real-time metric visualization
- Request volume charts
- Trace waterfall explorer
- Tool call analytics
- Storage query performance
- Alert management interface
- System health overview

**URL:** `http://localhost:3001/?app=app-observability-dashboard`

---

## Integration Guide

### Instrument Your Code

```javascript
const { tracer, toolTracer, customMetrics, stateLogger, storageTracer, alertEngine, broadcastEvent } = require('@sequential/observability');

// Automatic tool tracing (integrated with tool registry)
// No changes needed - all tool calls are traced automatically

// Manual span tracing
app.get('/api/users/:id', async (req, res) => {
  const span = await tracer.executeSpan('fetch-user', async () => {
    const user = await db.findUser(req.params.id);
    return user;
  }, { userId: req.params.id });

  res.json(span);
});

// Record custom business events
app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body);

  customMetrics.counter('users.created').increment(1, { region: req.body.region });
  customMetrics.recordEvent('user.created', { userId: user.id, plan: user.plan });

  broadcastEvent('user:created', { userId: user.id }, 'info');

  res.json(user);
});

// Manual state transition logging
stateLogger.recordTransition(taskId, 'task', 'running', 'paused', 'fetch', { duration: 150 });

// Manual storage query tracing
const query = storageTracer.recordQuery('set', 'users', userId);
try {
  await stateManager.set('users', userId, data);
  query.end(1);
} catch (error) {
  query.end(0, error);
}

// Evaluate alerts
setInterval(async () => {
  const metrics = await getSystemMetrics();
  alertEngine.evaluateAllRules(metrics);
}, 10000);
```

---

## Data Flow

```
Application Code
    ↓
Instrumentation (tracer.executeSpan, toolTracer.executeToolCall, etc.)
    ↓
In-Memory Collection (EventEmitter with sliding window storage)
    ↓
Real-Time Broadcast (via RealtimeBroadcaster to /ws/observability channel)
    ↓
Connected Apps (Observability Console, Dashboard)
    ↓
On-Demand API Queries (/api/observability/v2/*)
```

---

## Performance Considerations

| System | Default Size | Memory Impact |
|--------|-------------|---|
| ExecutionTracer | 10,000 traces | ~5MB |
| ToolCallTracer | 10,000 calls | ~3MB |
| StateTransitionLogger | 10,000 transitions | ~2MB |
| StorageQueryTracer | 10,000 queries | ~2MB |
| CustomMetrics | 1,000 events per metric | ~1MB |
| AlertEngine | 10,000 history items | ~2MB |
| Event Stream | 5,000 events | ~2MB |
| **Total** | | **~17MB** |

**Tuning:**
```javascript
// Adjust window sizes
new ExecutionTracer(5000);     // Smaller trace window
new ToolCallTracer(5000);
new StateTransitionLogger(5000);
new StorageQueryTracer(5000);
```

---

## Best Practices

1. **Always use correlation IDs** for request tracing
2. **Record custom metrics** for business domain events
3. **Set alert rules** for production SLOs (error rate, latency)
4. **Monitor slow storage queries** regularly
5. **Clear old data** periodically: `DELETE /api/observability/v2/clear`
6. **Export traces** periodically for long-term analysis
7. **Use span attributes** to add context without bloating data

---

## API Quick Reference

| Method | Endpoint | Description |
|--------|----------|---|
| GET | `/api/observability/v2/traces` | List all traces |
| GET | `/api/observability/v2/traces/:traceId` | Get specific trace |
| GET | `/api/observability/v2/tool-calls` | Tool call statistics |
| GET | `/api/observability/v2/state-transitions` | State transitions |
| GET | `/api/observability/v2/storage-queries` | Storage queries |
| GET | `/api/observability/v2/custom-metrics` | All custom metrics |
| GET | `/api/observability/v2/alerts` | Active alerts |
| POST | `/api/observability/v2/custom-events` | Record custom event |
| GET | `/api/observability/v2/summary` | System summary |
| DELETE | `/api/observability/v2/clear` | Clear all data |

---

## Troubleshooting

**High Memory Usage:**
- Reduce window sizes for tracers
- Clear data more frequently
- Check for memory leaks in span creation

**Missing Events:**
- Verify RealtimeBroadcaster is connected
- Check WebSocket connection status
- Ensure apps have read permissions

**Slow Queries:**
- Use `/api/observability/v2/storage-queries/slow` endpoint
- Check database indexes
- Monitor connection pool

---

## Examples

### Example 1: Find Slow Endpoints

```bash
# Get all storage queries over 500ms
curl http://localhost:3000/api/observability/v2/storage-queries/slow?threshold=500

# Get tool call stats
curl http://localhost:3000/api/observability/v2/tool-calls

# Check which endpoint is slow
curl http://localhost:3000/api/observability/v2/summary
```

### Example 2: Set Up Error Rate Alert

```javascript
const { alertEngine, AlertConditions } = require('@sequential/alert-engine');

alertEngine.createRule(
  'Production Error Rate > 5%',
  AlertConditions.errorRate(5),
  [(alert) => {
    fetch('/api/webhook', {
      method: 'POST',
      body: JSON.stringify({ alert: alert.ruleName, value: alert.value })
    });
  }]
);
```

### Example 3: Track Custom Business Events

```javascript
// User signup
customMetrics.counter('signups').increment(1, { plan: 'premium' });
customMetrics.recordEvent('user.signup', { plan: 'premium', source: 'organic' });

// Payment processing
const timer = customMetrics.histogram('payment.duration_ms');
const start = Date.now();
const result = await processPayment(order);
timer.observe(Date.now() - start);
```

---

## Summary

The Sequential Ecosystem now provides **complete end-to-end observability** with:
- ✅ Distributed tracing with span hierarchy
- ✅ Tool call analytics
- ✅ State machine visibility
- ✅ Storage query performance monitoring
- ✅ Custom business metrics
- ✅ Alerting and thresholds
- ✅ Real-time event streaming
- ✅ Comprehensive dashboards

All systems integrate seamlessly with automatic collection, real-time broadcasting, and on-demand APIs.
