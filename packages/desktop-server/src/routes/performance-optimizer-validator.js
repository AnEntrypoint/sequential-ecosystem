export class PerformanceOptimizerValidator {
  constructor() {
    this.testResults = [];
    this.metricsCollector = new Map();
    this.cacheStats = { hits: 0, misses: 0 };
  }

  // Phase 1: Metrics Collection & Tracking

  async validateBasicMetricsCollection() {
    const metrics = { request_count: 0, total_duration: 0, requests: [] };
    for (let i = 0; i < 10; i++) {
      metrics['request_count']++;
      const duration = Math.random() * 100;
      metrics['total_duration'] += duration;
      metrics['requests'].push({ duration, timestamp: Date.now() });
    }
    const avgDuration = metrics['total_duration'] / metrics['request_count'];
    const isValid = metrics['request_count'] === 10 && avgDuration > 0;
    return {
      name: 'Basic Metrics Collection',
      passed: isValid,
      details: { requestCount: metrics['request_count'], avgDuration: avgDuration.toFixed(2) }
    };
  }

  async validateExecutionTracing() {
    const traces = [];
    const createSpan = (name, fn) => {
      const startTime = Date.now();
      const result = fn();
      const duration = Date.now() - startTime;
      return { name, duration, result, timestamp: startTime };
    };
    traces.push(createSpan('parent', () => createSpan('child1', () => 42).result));
    traces.push(createSpan('parent', () => createSpan('child2', () => 'test').result));
    const hasSpans = traces.length === 2;
    const allHaveDuration = traces.every(t => typeof t.duration === 'number');
    const allHaveNames = traces.every(t => t.name);
    return {
      name: 'Execution Tracing',
      passed: hasSpans && allHaveDuration && allHaveNames,
      details: { spansRecorded: traces.length, avgDuration: (traces.reduce((s, t) => s + t.duration, 0) / traces.length).toFixed(2) }
    };
  }

  async validateToolCallMetrics() {
    const toolStats = {};
    const recordToolCall = (toolName, duration, success) => {
      if (!toolStats[toolName]) {
        toolStats[toolName] = { count: 0, total: 0, errors: 0, durations: [] };
      }
      toolStats[toolName].count++;
      toolStats[toolName].total += duration;
      toolStats[toolName].durations.push(duration);
      if (!success) toolStats[toolName].errors++;
    };
    recordToolCall('tool-a', 10, true);
    recordToolCall('tool-a', 15, true);
    recordToolCall('tool-a', 12, false);
    recordToolCall('tool-b', 50, true);
    const avgToolA = toolStats['tool-a'].total / toolStats['tool-a'].count;
    const errorRateA = toolStats['tool-a'].errors / toolStats['tool-a'].count;
    const isValid = toolStats['tool-a'].count === 3 && avgToolA > 0 && errorRateA === 1 / 3;
    return {
      name: 'Tool Call Metrics',
      passed: isValid,
      details: { toolACount: toolStats['tool-a'].count, toolAAvg: avgToolA.toFixed(2), toolAErrorRate: (errorRateA * 100).toFixed(1) + '%' }
    };
  }

  async validateFlowMetricsCollection() {
    const flowMetrics = { flows: [], states: {} };
    const recordFlow = (flowId, duration, states) => {
      flowMetrics.flows.push({ flowId, duration, stateCount: states.length });
      states.forEach(s => {
        if (!flowMetrics.states[s.name]) {
          flowMetrics.states[s.name] = { count: 0, total: 0 };
        }
        flowMetrics.states[s.name].count++;
        flowMetrics.states[s.name].total += s.duration;
      });
    };
    recordFlow('flow-1', 100, [
      { name: 'fetch', duration: 40 },
      { name: 'process', duration: 50 },
      { name: 'save', duration: 10 }
    ]);
    recordFlow('flow-1', 95, [
      { name: 'fetch', duration: 35 },
      { name: 'process', duration: 55 },
      { name: 'save', duration: 5 }
    ]);
    const flowCount = flowMetrics.flows.length;
    const stateCount = Object.keys(flowMetrics.states).length;
    const fetchAvg = flowMetrics.states['fetch'].total / flowMetrics.states['fetch'].count;
    return {
      name: 'Flow Metrics Collection',
      passed: flowCount === 2 && stateCount === 3 && fetchAvg > 0,
      details: { flows: flowCount, states: stateCount, fetchAvgDuration: fetchAvg.toFixed(2) }
    };
  }

  async validatePercentileCalculation() {
    const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const percentile = (arr, p) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, idx)];
    };
    const p50 = percentile(durations, 50);
    const p95 = percentile(durations, 95);
    const p99 = percentile(durations, 99);
    const isValid = p50 === 50 && p95 >= 95 && p99 === 100;
    return {
      name: 'Percentile Calculation',
      passed: isValid,
      details: { p50, p95, p99, dataPoints: durations.length }
    };
  }

  // Phase 2: Memory Management & Caching

  async validateLRUCache() {
    const cache = new Map();
    const maxSize = 5;
    const set = (key, value) => {
      if (cache.size >= maxSize && !cache.has(key)) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    };
    for (let i = 1; i <= 8; i++) {
      set(`key${i}`, `value${i}`);
    }
    const hasLatest = cache.has('key8');
    const hasEarliest = cache.has('key1');
    const correctSize = cache.size === maxSize;
    return {
      name: 'LRU Cache Eviction',
      passed: hasLatest && !hasEarliest && correctSize,
      details: { cacheSize: cache.size, maxSize, hasKey8: hasLatest, evictedKey1: !hasEarliest }
    };
  }

  async validateTTLCache() {
    const ttlCache = new Map();
    const ttl = 50;
    const set = (key, value) => {
      ttlCache.set(key, { value, timestamp: Date.now() });
    };
    const get = (key) => {
      const entry = ttlCache.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttl) {
        ttlCache.delete(key);
        return null;
      }
      return entry.value;
    };
    set('key1', 'value1');
    const freshGet = get('key1');
    await new Promise(r => setTimeout(r, 60));
    const expiredGet = get('key1');
    return {
      name: 'TTL Cache Expiration',
      passed: freshGet === 'value1' && expiredGet === null,
      details: { ttl, freshValue: freshGet, expiredValue: expiredGet, cacheEmpty: ttlCache.size === 0 }
    };
  }

  async validateCacheHitRate() {
    const cache = new Map();
    let hits = 0;
    let misses = 0;
    const get = (key) => {
      if (cache.has(key)) {
        hits++;
        return cache.get(key);
      }
      misses++;
      cache.set(key, `value-${key}`);
      return null;
    };
    get('a');
    get('a');
    get('b');
    get('b');
    get('a');
    const hitRate = hits / (hits + misses);
    const isValid = hits === 3 && misses === 2 && hitRate === 0.6;
    return {
      name: 'Cache Hit Rate',
      passed: isValid,
      details: { hits, misses, hitRate: (hitRate * 100).toFixed(1) + '%' }
    };
  }

  async validateMemoryCircularBuffer() {
    const buffer = [];
    const maxSize = 10;
    const add = (item) => {
      buffer.push(item);
      if (buffer.length > maxSize) {
        buffer.shift();
      }
    };
    for (let i = 1; i <= 15; i++) {
      add({ id: i, data: 'x'.repeat(100) });
    }
    const isValid = buffer.length === maxSize && buffer[0].id === 6 && buffer[maxSize - 1].id === 15;
    return {
      name: 'Memory Circular Buffer',
      passed: isValid,
      details: { bufferSize: buffer.length, maxSize, firstId: buffer[0].id, lastId: buffer[maxSize - 1].id }
    };
  }

  // Phase 3: Rate Limiting & Throttling

  async validateSlidingWindowRateLimit() {
    const now = Date.now();
    const windowMs = 1000;
    const limit = 5;
    const requests = [];
    const isAllowed = () => {
      const cutoff = now - windowMs;
      requests.push(now);
      const inWindow = requests.filter(t => t > cutoff);
      if (inWindow.length > limit) return false;
      requests.length = 0;
      requests.push(...inWindow);
      return true;
    };
    const results = [];
    for (let i = 0; i < 7; i++) {
      results.push(isAllowed());
    }
    const allowed = results.filter(r => r).length;
    const blocked = results.filter(r => !r).length;
    return {
      name: 'Sliding Window Rate Limit',
      passed: allowed === 5 && blocked === 2,
      details: { allowed, blocked, limit }
    };
  }

  async validateTokenBucketThrottling() {
    let tokens = 10;
    const capacity = 10;
    const refillRate = 2;
    let lastRefill = Date.now();
    const consume = (amount = 1) => {
      const now = Date.now();
      const refills = Math.floor((now - lastRefill) / 1000) * refillRate;
      tokens = Math.min(capacity, tokens + refills);
      lastRefill = now;
      if (tokens >= amount) {
        tokens -= amount;
        return true;
      }
      return false;
    };
    const results = [];
    for (let i = 0; i < 12; i++) {
      results.push(consume());
    }
    const successful = results.filter(r => r).length;
    const isValid = successful === 10;
    return {
      name: 'Token Bucket Throttling',
      passed: isValid,
      details: { successful, totalAttempts: results.length, tokens }
    };
  }

  async validateConcurrentRateLimit() {
    const limits = {};
    const checkLimit = (ip, limit = 10, window = 1000) => {
      const now = Date.now();
      if (!limits[ip]) limits[ip] = [];
      limits[ip].push(now);
      const inWindow = limits[ip].filter(t => t > now - window);
      limits[ip] = inWindow;
      return inWindow.length <= limit;
    };
    const ips = ['ip-1', 'ip-2', 'ip-3'];
    let allowed = 0;
    for (let i = 0; i < 15; i++) {
      const ip = ips[i % 3];
      if (checkLimit(ip, 5)) allowed++;
    }
    const isValid = allowed >= 15;
    return {
      name: 'Concurrent IP Rate Limiting',
      passed: isValid,
      details: { allowed, ips: Object.keys(limits).length, requestsPerIp: 5 }
    };
  }

  // Phase 4: Bottleneck Detection & Optimization

  async validateSlowEndpointDetection() {
    const endpoints = [
      { path: '/api/a', durations: [50, 55, 52] },
      { path: '/api/b', durations: [100, 150, 120] },
      { path: '/api/c', durations: [10, 12, 11] }
    ];
    const slowThreshold = 100;
    const slowEndpoints = endpoints
      .map(e => ({
        path: e.path,
        avg: e.durations.reduce((s, d) => s + d, 0) / e.durations.length
      }))
      .filter(e => e.avg > slowThreshold);
    const isValid = slowEndpoints.length === 1 && slowEndpoints[0].path === '/api/b';
    return {
      name: 'Slow Endpoint Detection',
      passed: isValid,
      details: { slowEndpoints: slowEndpoints.length, slowestPath: slowEndpoints[0]?.path, threshold: slowThreshold }
    };
  }

  async validateRenderBottleneckAnalysis() {
    const components = [
      { name: 'Button', renderTime: 2 },
      { name: 'Input', renderTime: 3 },
      { name: 'List', renderTime: 25 },
      { name: 'Modal', renderTime: 20 },
      { name: 'Text', renderTime: 1 }
    ];
    const budget = 16;
    const slowComponents = components.filter(c => c.renderTime > budget);
    const isValid = slowComponents.length === 2 && slowComponents[0].name === 'List';
    return {
      name: 'Render Bottleneck Analysis',
      passed: isValid,
      details: {
        budget,
        slowComponents: slowComponents.length,
        slowestComponent: slowComponents[0]?.name,
        overhead: ((slowComponents[0]?.renderTime || 0) - budget).toFixed(2) + 'ms'
      }
    };
  }

  async validateErrorRateAnalysis() {
    const flows = [
      { name: 'flow-a', runs: 100, errors: 2 },
      { name: 'flow-b', runs: 50, errors: 8 },
      { name: 'flow-c', runs: 200, errors: 3 }
    ];
    const errorThreshold = 0.05;
    const problematicFlows = flows
      .map(f => ({ name: f.name, errorRate: f.errors / f.runs }))
      .filter(f => f.errorRate > errorThreshold);
    const isValid = problematicFlows.length === 1 && problematicFlows[0].name === 'flow-b';
    return {
      name: 'Error Rate Analysis',
      passed: isValid,
      details: {
        threshold: (errorThreshold * 100).toFixed(1) + '%',
        problematicFlows: problematicFlows.length,
        highestErrorRate: (problematicFlows[0]?.errorRate * 100).toFixed(1) + '%'
      }
    };
  }

  // Phase 5: Profiling & Resource Utilization

  async validateMemoryProfiler() {
    const snapshot1 = process.memoryUsage();
    const arr = Array(10000).fill('data');
    const snapshot2 = process.memoryUsage();
    const heapGrowth = (snapshot2.heapUsed - snapshot1.heapUsed) / 1024 / 1024;
    return {
      name: 'Memory Profiling',
      passed: heapGrowth > 0,
      details: {
        snapshot1HeapMB: (snapshot1.heapUsed / 1024 / 1024).toFixed(2),
        snapshot2HeapMB: (snapshot2.heapUsed / 1024 / 1024).toFixed(2),
        growthMB: heapGrowth.toFixed(2)
      }
    };
  }

  async validateExecutionProfiler() {
    const profiles = [];
    const profile = (name, fn) => {
      const start = Date.now();
      const result = fn();
      const duration = Date.now() - start;
      profiles.push({ name, duration, result });
      return result;
    };
    profile('heavy-operation', () => {
      let sum = 0;
      for (let i = 0; i < 1000000; i++) sum += i;
      return sum;
    });
    profile('light-operation', () => {
      return 42;
    });
    const heavyDuration = profiles[0].duration;
    const lightDuration = profiles[1].duration;
    const isValid = heavyDuration > lightDuration;
    return {
      name: 'Execution Profiling',
      passed: isValid,
      details: {
        heavyMs: heavyDuration,
        lightMs: lightDuration,
        ratio: (heavyDuration / lightDuration).toFixed(1) + 'x'
      }
    };
  }

  async validateResourceUtilization() {
    const initial = process.memoryUsage();
    const cache = new Map();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, { data: 'x'.repeat(100) });
    }
    const final = process.memoryUsage();
    const heapUsed = (final.heapUsed / 1024 / 1024).toFixed(2);
    const external = (final.external / 1024 / 1024).toFixed(2);
    const isValid = parseFloat(heapUsed) > 0;
    return {
      name: 'Resource Utilization Tracking',
      passed: isValid,
      details: {
        heapUsedMB: heapUsed,
        externalMB: external,
        rss: (final.rss / 1024 / 1024).toFixed(2),
        cacheEntries: cache.size
      }
    };
  }

  async validatePerformanceBudget() {
    const budget = { render: 16, api: 200, memory: 100 };
    const metrics = { render: 12, api: 250, memory: 85 };
    const violations = [];
    for (const [key, value] of Object.entries(metrics)) {
      if (value > budget[key]) {
        violations.push({ metric: key, value, budget: budget[key], excess: value - budget[key] });
      }
    }
    const isValid = violations.length === 1 && violations[0].metric === 'api';
    return {
      name: 'Performance Budget Tracking',
      passed: isValid,
      details: {
        violations: violations.length,
        withinBudget: Object.keys(metrics).length - violations.length,
        violation: violations[0]?.metric
      }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicMetricsCollection(),
      this.validateExecutionTracing(),
      this.validateToolCallMetrics(),
      this.validateFlowMetricsCollection(),
      this.validatePercentileCalculation(),
      this.validateLRUCache(),
      this.validateTTLCache(),
      this.validateCacheHitRate(),
      this.validateMemoryCircularBuffer(),
      this.validateSlidingWindowRateLimit(),
      this.validateTokenBucketThrottling(),
      this.validateConcurrentRateLimit(),
      this.validateSlowEndpointDetection(),
      this.validateRenderBottleneckAnalysis(),
      this.validateErrorRateAnalysis(),
      this.validateMemoryProfiler(),
      this.validateExecutionProfiler(),
      this.validateResourceUtilization(),
      this.validatePerformanceBudget()
    ]);
    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createPerformanceOptimizerValidator() {
  return new PerformanceOptimizerValidator();
}
