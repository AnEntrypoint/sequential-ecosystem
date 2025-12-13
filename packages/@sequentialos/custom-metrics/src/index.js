import { EventEmitter } from 'events';
import { Counter, Gauge, Histogram } from './metric-types.js';
import { EventRecorder } from './event-recorder.js';

class CustomMetrics extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.recorder = new EventRecorder(this);
  }

  counter(name, description = '') {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new Counter(name, description));
    }
    return this.metrics.get(name);
  }

  gauge(name, description = '') {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new Gauge(name, description));
    }
    return this.metrics.get(name);
  }

  histogram(name, description = '', buckets) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new Histogram(name, description, buckets));
    }
    return this.metrics.get(name);
  }

  recordEvent(eventType, data = {}, labels = {}) {
    return this.recorder.recordEvent(eventType, data, labels);
  }

  getMetric(name) {
    const metric = this.metrics.get(name);
    return metric ? metric.getMetrics() : null;
  }

  getAllMetrics() {
    return Array.from(this.metrics.values()).map(m => m.getMetrics());
  }

  getEvents(limit = 100, filterType = null) {
    return this.recorder.getEvents(limit, filterType);
  }

  getSummary() {
    const metrics = this.getAllMetrics();
    const eventTypes = this.recorder.getEventSummary();
    return { totalMetrics: this.metrics.size, totalEvents: this.recorder.getEventCount(), metrics, eventTypes };
  }

  clear() {
    this.metrics.clear();
    this.recorder.clear();
  }
}

export {
  CustomMetrics,
  Counter,
  Gauge,
  Histogram
};
export const createCustomMetrics = () => new CustomMetrics();
