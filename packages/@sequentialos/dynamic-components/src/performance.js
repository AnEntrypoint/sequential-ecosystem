export class PerformanceMonitor {
  constructor(options = {}) {
    this.metrics = new Map();
    this.enableLogging = options.enableLogging || false;
    this.slowThreshold = options.slowThreshold || 16;
  }

  startMeasure(label) {
    performance.mark(`${label}-start`);
    return () => this.endMeasure(label);
  }

  endMeasure(label) {
    performance.mark(`${label}-end`);
    try {
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      const duration = measure.duration;

      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label).push(duration);

      if (this.enableLogging && duration > this.slowThreshold) {
        console.warn(`⚠️ Slow render: ${label} (${duration.toFixed(2)}ms)`);
      }

      return duration;
    } catch (e) {
      return 0;
    }
  }

  getMetrics(label = null) {
    if (label) {
      const durations = this.metrics.get(label) || [];
      return {
        label,
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        total: durations.reduce((a, b) => a + b, 0)
      };
    }

    const result = {};
    for (const [key, durations] of this.metrics.entries()) {
      result[key] = {
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        total: durations.reduce((a, b) => a + b, 0)
      };
    }
    return result;
  }

  clearMetrics(label = null) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }

  getSlowComponents(threshold = 16) {
    const slow = [];
    for (const [label, durations] of this.metrics.entries()) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      if (avg > threshold) {
        slow.push({ label, avg, count: durations.length });
      }
    }
    return slow.sort((a, b) => b.avg - a.avg);
  }

  report() {
    const metrics = this.getMetrics();
    console.table(Object.entries(metrics).map(([label, data]) => ({
      Component: label,
      'Avg (ms)': data.avg.toFixed(2),
      'Min (ms)': data.min.toFixed(2),
      'Max (ms)': data.max.toFixed(2),
      Renders: data.count
    })));
  }
}

export const useRenderMetrics = (componentName) => {
  return {
    start: () => performance.mark(`${componentName}-render-start`),
    end: () => {
      performance.mark(`${componentName}-render-end`);
      try {
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
        const measure = performance.getEntriesByName(`${componentName}-render`)[0];
        return measure.duration;
      } catch {
        return 0;
      }
    }
  };
};

export const benchmarkComponent = async (component, props = {}, iterations = 100) => {
  const durations = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await component(props);
    const end = performance.now();
    durations.push(end - start);
  }

  return {
    iterations,
    avg: durations.reduce((a, b) => a + b) / durations.length,
    min: Math.min(...durations),
    max: Math.max(...durations),
    total: durations.reduce((a, b) => a + b),
    p95: durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)]
  };
};
