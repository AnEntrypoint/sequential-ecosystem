const { EventEmitter } = require('events');
const { randomUUID } = require('crypto');

class Counter {
  constructor(name, description = '') {
    this.name = name;
    this.description = description;
    this.value = 0;
    this.history = [];
  }

  increment(amount = 1, labels = {}) {
    this.value += amount;
    this.history.push({ timestamp: Date.now(), value: amount, labels });
    if (this.history.length > 1000) this.history.shift();
  }

  getMetrics() {
    return { name: this.name, type: 'counter', value: this.value, description: this.description };
  }
}

class Gauge {
  constructor(name, description = '') {
    this.name = name;
    this.description = description;
    this.value = 0;
    this.history = [];
  }

  set(value, labels = {}) {
    this.value = value;
    this.history.push({ timestamp: Date.now(), value, labels });
    if (this.history.length > 1000) this.history.shift();
  }

  getMetrics() {
    return { name: this.name, type: 'gauge', value: this.value, description: this.description };
  }
}

class Histogram {
  constructor(name, description = '', buckets = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]) {
    this.name = name;
    this.description = description;
    this.buckets = buckets;
    this.bucketCounts = Object.fromEntries(buckets.map(b => [b, 0]));
    this.observations = [];
    this.sum = 0;
    this.count = 0;
  }

  observe(value, labels = {}) {
    this.observations.push({ timestamp: Date.now(), value, labels });
    this.sum += value;
    this.count++;

    for (const bucket of this.buckets) {
      if (value <= bucket) this.bucketCounts[bucket]++;
    }

    if (this.observations.length > 1000) this.observations.shift();
  }

  getMetrics() {
    return {
      name: this.name,
      type: 'histogram',
      count: this.count,
      sum: this.sum,
      avg: this.count > 0 ? (this.sum / this.count).toFixed(2) : 0,
      min: this.observations.length > 0 ? Math.min(...this.observations.map(o => o.value)) : 0,
      max: this.observations.length > 0 ? Math.max(...this.observations.map(o => o.value)) : 0,
      description: this.description
    };
  }
}

class CustomMetrics extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.events = [];
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
    const event = {
      id: randomUUID(),
      type: eventType,
      timestamp: Date.now(),
      data,
      labels
    };
    this.events.push(event);
    if (this.events.length > 10000) this.events.shift();
    this.emit('event:recorded', event);
    return event;
  }

  getMetric(name) {
    const metric = this.metrics.get(name);
    return metric ? metric.getMetrics() : null;
  }

  getAllMetrics() {
    return Array.from(this.metrics.values()).map(m => m.getMetrics());
  }

  getEvents(limit = 100, filterType = null) {
    let result = this.events.slice(-limit);
    if (filterType) result = result.filter(e => e.type === filterType);
    return result;
  }

  getSummary() {
    const metrics = this.getAllMetrics();
    const eventTypes = {};
    this.events.forEach(e => {
      eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
    });
    return { totalMetrics: this.metrics.size, totalEvents: this.events.length, metrics, eventTypes };
  }

  clear() {
    this.metrics.clear();
    this.events = [];
  }
}

module.exports = {
  CustomMetrics,
  Counter,
  Gauge,
  Histogram,
  createCustomMetrics: () => new CustomMetrics()
};
