import { AsyncLocalStorage } from 'async_hooks';

const spanStorage = new AsyncLocalStorage();

/**
 * tracer-executor.js
 *
 * Span execution with async and sync support
 */

export { spanStorage };

export class TracerExecutor {
  constructor(storage, emitter) {
    this.storage = storage;
    this.emitter = emitter;
  }

  async executeSpan(name, fn, attributes = {}) {
    const span = this.startSpan(name, attributes);
    const store = spanStorage.getStore() || {};

    try {
      const result = await spanStorage.run(
        { ...store, traceId: span.traceId, spanId: span.spanId },
        fn
      );
      span.end();
      this.emitter.emit('span:ended', {
        traceId: span.traceId,
        spanId: span.spanId,
        duration: span.duration,
        status: 'success'
      });
      return result;
    } catch (error) {
      span.recordError(error);
      span.end();
      this.emitter.emit('span:ended', {
        traceId: span.traceId,
        spanId: span.spanId,
        duration: span.duration,
        status: 'error',
        error: error.message
      });
      throw error;
    } finally {
      this.storage.removeActiveSpan(span.spanId);
    }
  }

  executeSpanSync(name, fn, attributes = {}) {
    const span = this.startSpan(name, attributes);

    try {
      const result = fn(span);
      span.end();
      this.emitter.emit('span:ended', {
        traceId: span.traceId,
        spanId: span.spanId,
        duration: span.duration,
        status: 'success'
      });
      return result;
    } catch (error) {
      span.recordError(error);
      span.end();
      this.emitter.emit('span:ended', {
        traceId: span.traceId,
        spanId: span.spanId,
        duration: span.duration,
        status: 'error',
        error: error.message
      });
      throw error;
    } finally {
      this.storage.removeActiveSpan(span.spanId);
    }
  }

  startSpan(name, attributes = {}, traceId = null) {
    const { randomUUID } = require('crypto');

    const currentTrace = traceId || spanStorage.getStore()?.traceId;
    if (!currentTrace) {
      traceId = this.storage.startTrace(randomUUID()).traceId;
    } else {
      traceId = currentTrace;
    }

    const parentSpan = spanStorage.getStore();
    const spanId = randomUUID();
    const span = this.createSpanInstance(traceId, spanId, name, parentSpan?.spanId || null);

    Object.entries(attributes).forEach(([k, v]) => span.addAttribute(k, v));

    this.storage.addSpan(span, parentSpan);
    this.emitter.emit('span:started', {
      traceId,
      spanId,
      name,
      parentSpanId: span.parentSpanId
    });

    return span;
  }

  createSpanInstance(traceId, spanId, name, parentSpanId) {
    const { Span } = require('./span-class.js');
    return new Span(traceId, spanId, name, parentSpanId);
  }
}
