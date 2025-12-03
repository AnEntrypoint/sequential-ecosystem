export class PerformanceDebugger {
  constructor(config = {}) {
    this.stacks = new Map();
    this.traces = [];
    this.callGraphs = new Map();
    this.memorySnapshots = [];
    this.maxTraces = config.maxTraces || 50000;
    this.samplingInterval = config.samplingInterval || 10;
    this.sampling = new Map();
    this.profiling = false;
  }

  startProfiling(sessionId) {
    this.profiling = true;
    this.stacks.set(sessionId, []);
    this.callGraphs.set(sessionId, { nodes: [], edges: [] });
    this.recordMemorySnapshot(sessionId);
  }

  stopProfiling(sessionId) {
    this.profiling = false;
    this.recordMemorySnapshot(sessionId);
  }

  pushStack(sessionId, functionName, args = {}) {
    const stack = this.stacks.get(sessionId) || [];
    const depth = stack.length;
    const entry = {
      function: functionName,
      startTime: Date.now(),
      args: JSON.stringify(args).slice(0, 200),
      depth
    };
    stack.push(entry);
    this.stacks.set(sessionId, stack);
    this.recordTrace(sessionId, 'enter', functionName, depth);
    return () => this.popStack(sessionId);
  }

  popStack(sessionId) {
    const stack = this.stacks.get(sessionId) || [];
    if (stack.length === 0) return;
    const entry = stack.pop();
    const duration = Date.now() - entry.startTime;
    entry.duration = duration;
    entry.depth = Math.max(0, entry.depth - 1);
    this.recordTrace(sessionId, 'exit', entry.function, entry.depth, { duration });
    this.updateCallGraph(sessionId, entry);
  }

  recordTrace(sessionId, type, name, depth, metadata = {}) {
    if (this.traces.length >= this.maxTraces) {
      this.traces.shift();
    }
    this.traces.push({
      sessionId,
      type,
      function: name,
      depth,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  updateCallGraph(sessionId, entry) {
    const graph = this.callGraphs.get(sessionId);
    if (!graph) return;
    const nodeId = `${entry.function}-${entry.depth}`;
    const existing = graph.nodes.find(n => n.id === nodeId);
    if (existing) {
      existing.calls++;
      existing.totalTime += entry.duration;
      existing.avgTime = existing.totalTime / existing.calls;
    } else {
      graph.nodes.push({
        id: nodeId,
        name: entry.function,
        calls: 1,
        totalTime: entry.duration,
        avgTime: entry.duration
      });
    }
  }

  recordMemorySnapshot(sessionId) {
    const mem = process.memoryUsage();
    this.memorySnapshots.push({
      sessionId,
      timestamp: new Date().toISOString(),
      heapUsed: mem.heapUsed / 1024 / 1024,
      heapTotal: mem.heapTotal / 1024 / 1024,
      rss: mem.rss / 1024 / 1024,
      external: mem.external / 1024 / 1024
    });
    if (this.memorySnapshots.length > 1000) {
      this.memorySnapshots.shift();
    }
  }

  generateFlameGraph(sessionId) {
    const traces = this.traces.filter(t => t.sessionId === sessionId);
    const stack = [];
    const flameData = [];
    let startTime = null;

    for (const trace of traces) {
      if (trace.type === 'enter') {
        stack.push({ name: trace.function, startTime: trace.timestamp });
        if (!startTime) startTime = trace.timestamp;
      } else if (trace.type === 'exit') {
        const entry = stack.pop();
        if (entry) {
          const path = stack.map(s => s.name).join(';') + ';' + entry.name;
          flameData.push({
            path,
            duration: trace.duration || 0,
            timestamp: trace.timestamp
          });
        }
      }
    }

    return {
      sessionId,
      flameGraph: flameData,
      depth: Math.max(...flameData.map(f => f.path.split(';').length - 1)),
      totalTime: flameData.reduce((sum, f) => sum + f.duration, 0)
    };
  }

  getCallGraph(sessionId) {
    const graph = this.callGraphs.get(sessionId);
    if (!graph) return null;
    return {
      nodes: graph.nodes.sort((a, b) => b.totalTime - a.totalTime),
      edges: graph.edges
    };
  }

  getMemoryTrend(sessionId) {
    return this.memorySnapshots
      .filter(m => m.sessionId === sessionId)
      .map(m => ({
        timestamp: m.timestamp,
        heapUsed: m.heapUsed,
        heapTotal: m.heapTotal,
        rss: m.rss
      }));
  }

  identifyBottlenecks(sessionId) {
    const graph = this.getCallGraph(sessionId);
    if (!graph) return [];
    return graph.nodes
      .filter(n => n.totalTime > 100)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10)
      .map(n => ({
        function: n.name,
        calls: n.calls,
        totalTime: n.totalTime,
        avgTime: n.avgTime.toFixed(2),
        percentOfTotal: ((n.totalTime /
          graph.nodes.reduce((sum, nd) => sum + nd.totalTime, 0)) * 100).toFixed(2)
      }));
  }

  exportProfile(sessionId, format = 'json') {
    const flameGraph = this.generateFlameGraph(sessionId);
    const callGraph = this.getCallGraph(sessionId);
    const memoryTrend = this.getMemoryTrend(sessionId);
    const bottlenecks = this.identifyBottlenecks(sessionId);

    const profile = {
      sessionId,
      flameGraph,
      callGraph,
      memoryTrend,
      bottlenecks,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(profile, null, 2);
    }

    if (format === 'html') {
      return this.generateHtmlReport(profile);
    }

    throw new Error(`Unknown format: ${format}`);
  }

  generateHtmlReport(profile) {
    const bottlenecksHtml = profile.bottlenecks
      .map(b => `<tr><td>${b.function}</td><td>${b.calls}</td><td>${b.totalTime}ms</td><td>${b.avgTime}ms</td><td>${b.percentOfTotal}%</td></tr>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <title>Performance Profile - ${profile.sessionId}</title>
  <style>
    body { font-family: monospace; margin: 20px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #444; padding: 8px; text-align: left; }
    th { background: #333; color: #ce9178; }
    .metric { display: inline-block; margin: 10px 20px; padding: 10px; background: #252526; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Performance Profile Report</h1>
  <div class="metric"><strong>Session ID:</strong> ${profile.sessionId}</div>
  <div class="metric"><strong>Total Time:</strong> ${profile.flameGraph.totalTime}ms</div>
  <div class="metric"><strong>Flame Depth:</strong> ${profile.flameGraph.depth}</div>

  <h2>Top Bottlenecks</h2>
  <table>
    <tr><th>Function</th><th>Calls</th><th>Total Time</th><th>Avg Time</th><th>% of Total</th></tr>
    ${bottlenecksHtml}
  </table>

  <h2>Memory Usage Trend</h2>
  <table>
    <tr><th>Timestamp</th><th>Heap Used (MB)</th><th>Heap Total (MB)</th><th>RSS (MB)</th></tr>
    ${profile.memoryTrend.slice(-10).map(m =>
      `<tr><td>${m.timestamp}</td><td>${m.heapUsed.toFixed(2)}</td><td>${m.heapTotal.toFixed(2)}</td><td>${m.rss.toFixed(2)}</td></tr>`
    ).join('')}
  </table>
</body>
</html>`;
  }

  clearSession(sessionId) {
    this.stacks.delete(sessionId);
    this.callGraphs.delete(sessionId);
    this.traces = this.traces.filter(t => t.sessionId !== sessionId);
    this.memorySnapshots = this.memorySnapshots.filter(m => m.sessionId !== sessionId);
  }
}

export function createPerformanceDebugger(config) {
  return new PerformanceDebugger(config);
}
