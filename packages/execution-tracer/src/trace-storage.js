/**
 * trace-storage.js
 *
 * Trace and span storage with memory management
 */

export class TraceStorage {
  constructor(maxTraces = 10000) {
    this.maxTraces = maxTraces;
    this.traces = new Map();
    this.spans = new Map();
    this.activeSpans = new Map();
  }

  startTrace(traceId) {
    const trace = {
      traceId,
      startTime: Date.now(),
      spans: [],
      status: 'running',
      rootSpan: null
    };
    this.traces.set(traceId, trace);

    // Evict oldest trace if exceeded maxTraces
    if (this.traces.size > this.maxTraces) {
      const oldest = Array.from(this.traces.entries()).sort((a, b) =>
        a[1].startTime - b[1].startTime
      )[0];
      this.traces.delete(oldest[0]);
    }

    return trace;
  }

  addSpan(span, parentSpan = null) {
    this.spans.set(span.spanId, span);

    if (parentSpan) {
      parentSpan.children.push(span.spanId);
    }

    const trace = this.traces.get(span.traceId);
    if (trace) {
      trace.spans.push(span.spanId);
      if (!trace.rootSpan && !parentSpan) {
        trace.rootSpan = span.spanId;
      }
    }

    this.activeSpans.set(span.spanId, span);
  }

  removeActiveSpan(spanId) {
    this.activeSpans.delete(spanId);
  }

  getSpan(spanId) {
    return this.spans.get(spanId);
  }

  getTrace(traceId) {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    return {
      ...trace,
      spans: trace.spans.map(spanId => this.spans.get(spanId)?.toJSON()).filter(Boolean)
    };
  }

  endTrace(traceId) {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.status = 'completed';
      trace.endTime = Date.now();
    }
  }

  getTraces(limit = 100) {
    return Array.from(this.traces.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
      .map(trace => ({
        ...trace,
        spans: trace.spans.map(spanId => {
          const span = this.spans.get(spanId);
          return span ? { id: span.spanId, name: span.name, duration: span.duration, status: span.status } : null;
        }).filter(Boolean)
      }));
  }

  clear() {
    this.traces.clear();
    this.spans.clear();
    this.activeSpans.clear();
  }
}
