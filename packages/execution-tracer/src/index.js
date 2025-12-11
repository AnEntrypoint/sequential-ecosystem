import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { Span } from './span-class.js';
import { TraceStorage } from './trace-storage.js';
import { TracerExecutor, spanStorage } from './tracer-executor.js';

/**
 * ExecutionTracer - Facade for distributed tracing
 *
 * Delegates to focused modules:
 * - span-class: Span data structure and lifecycle
 * - trace-storage: Trace and span storage with memory management
 * - tracer-executor: Span execution with async/sync support
 */
class ExecutionTracer extends EventEmitter {
  constructor(maxTraces = 10000) {
    super();
    this.storage = new TraceStorage(maxTraces);
    this.executor = new TracerExecutor(this.storage, this);
  }

  startTrace(traceId = randomUUID()) {
    return this.storage.startTrace(traceId).traceId;
  }

  startSpan(name, attributes = {}, traceId = null) {
    return this.executor.startSpan(name, attributes, traceId);
  }

  async executeSpan(name, fn, attributes = {}) {
    return this.executor.executeSpan(name, fn, attributes);
  }

  executeSpanSync(name, fn, attributes = {}) {
    return this.executor.executeSpanSync(name, fn, attributes);
  }

  getSpan(spanId) {
    return this.storage.getSpan(spanId);
  }

  getTrace(traceId) {
    return this.storage.getTrace(traceId);
  }

  endTrace(traceId) {
    return this.storage.endTrace(traceId);
  }

  getTraces(limit = 100) {
    return this.storage.getTraces(limit);
  }

  clear() {
    return this.storage.clear();
  }
}

export {
  ExecutionTracer,
  Span,
  spanStorage
};
export const createExecutionTracer = (maxTraces) => new ExecutionTracer(maxTraces);
