/**
 * metric-types.js - Individual metric type implementations
 *
 * Counter, Gauge, and Histogram metric types
 */

export class Counter {
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

export class Gauge {
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

export class Histogram {
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
