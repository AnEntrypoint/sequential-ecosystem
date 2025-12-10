import {  EventEmitter  } from 'events';
import {  randomUUID  } from 'crypto';
import {  AsyncLocalStorage  } from 'async_hooks';

const spanStorage = new AsyncLocalStorage();

class Span {
  constructor(traceId, spanId, name, parentSpanId = null) {
    this.traceId = traceId;
    this.spanId = spanId;
    this.parentSpanId = parentSpanId;
    this.name = name;
    this.startTime = Date.now();
    this.endTime = null;
    this.duration = 0;
    this.status = 'running';
    this.error = null;
    this.attributes = {};
    this.events = [];
    this.children = [];
  }

  addAttribute(key, value) {
    this.attributes[key] = value;
    return this;
  }

  addEvent(name, attributes = {}) {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
    return this;
  }

  recordError(error) {
    this.error = {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    };
    this.status = 'error';
    return this;
  }

  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    if (this.status === 'running') this.status = 'success';
    return this;
  }

  toJSON() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status,
      error: this.error,
      attributes: this.attributes,
      events: this.events,
      children: this.children
    };
  }
}

class ExecutionTracer extends EventEmitter {
  constructor(maxTraces = 10000) {
    super();
    this.maxTraces = maxTraces;
    this.traces = new Map();
    this.spans = new Map();
    this.activeSpans = new Map();
  }

  startTrace(traceId = randomUUID()) {
    const trace = {
      traceId,
      startTime: Date.now(),
      spans: [],
      status: 'running',
      rootSpan: null
    };
    this.traces.set(traceId, trace);
    if (this.traces.size > this.maxTraces) {
      const oldest = Array.from(this.traces.entries()).sort((a, b) =>
        a[1].startTime - b[1].startTime
      )[0];
      this.traces.delete(oldest[0]);
    }
    return traceId;
  }

  startSpan(name, attributes = {}, traceId = null) {
    const currentTrace = traceId || spanStorage.getStore()?.traceId;
    if (!currentTrace) {
      traceId = this.startTrace();
    } else {
      traceId = currentTrace;
    }

    const parentSpan = spanStorage.getStore();
    const spanId = randomUUID();
    const span = new Span(traceId, spanId, name, parentSpan?.spanId || null);

    Object.entries(attributes).forEach(([k, v]) => span.addAttribute(k, v));

    this.spans.set(spanId, span);
    if (parentSpan) {
      parentSpan.children.push(spanId);
    }

    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(spanId);
      if (!trace.rootSpan && !parentSpan) {
        trace.rootSpan = spanId;
      }
    }

    this.activeSpans.set(spanId, span);
    this.emit('span:started', { traceId, spanId, name, parentSpanId: span.parentSpanId });

    return span;
  }

  async executeSpan(name, fn, attributes = {}) {
    const span = this.startSpan(name, attributes);
    const store = spanStorage.getStore() || {};

    try {
      const result = await spanStorage.run({ ...store, ...{ traceId: span.traceId, spanId: span.spanId } }, fn);
      span.end();
      this.emit('span:ended', { traceId: span.traceId, spanId: span.spanId, duration: span.duration, status: 'success' });
      return result;
    } catch (error) {
      span.recordError(error);
      span.end();
      this.emit('span:ended', { traceId: span.traceId, spanId: span.spanId, duration: span.duration, status: 'error', error: error.message });
      throw error;
    } finally {
      this.activeSpans.delete(span.spanId);
    }
  }

  executeSpanSync(name, fn, attributes = {}) {
    const span = this.startSpan(name, attributes);

    try {
      const result = fn(span);
      span.end();
      this.emit('span:ended', { traceId: span.traceId, spanId: span.spanId, duration: span.duration, status: 'success' });
      return result;
    } catch (error) {
      span.recordError(error);
      span.end();
      this.emit('span:ended', { traceId: span.traceId, spanId: span.spanId, duration: span.duration, status: 'error', error: error.message });
      throw error;
    } finally {
      this.activeSpans.delete(span.spanId);
    }
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

export {
  ExecutionTracer,
  Span,
  spanStorage
};
export const createExecutionTracer = (maxTraces) => new ExecutionTracer(maxTraces);;
