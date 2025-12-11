/**
 * span-class.js
 *
 * Span data structure representing a single operation within a trace
 */

export class Span {
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
