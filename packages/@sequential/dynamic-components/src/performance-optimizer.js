class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.renderMetrics = [];
    this.virtualScrollRegions = new Map();
    this.listeners = [];
    this.maxCacheSize = 500;
    this.maxMetrics = 1000;
    this.enableVirtualization = true;
    this.renderBudget = 16;
  }

  memoizeRender(key, componentDef, renderFn) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);

      if (JSON.stringify(cached.definition) === JSON.stringify(componentDef)) {
        return cached.result;
      }
    }

    const startTime = performance.now();
    const result = renderFn(componentDef);
    const duration = performance.now() - startTime;

    this.cache.set(key, {
      definition: JSON.parse(JSON.stringify(componentDef)),
      result,
      timestamp: Date.now(),
      duration
    });

    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];

      this.cache.delete(oldestKey);
    }

    this.recordMetric('render', key, duration);

    return result;
  }

  setupVirtualScrolling(elementId, items, itemHeight, containerHeight) {
    const scrollRegion = {
      elementId,
      items,
      itemHeight,
      containerHeight,
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: Math.ceil(containerHeight / itemHeight),
      overscan: 3,
      lastScrollTime: 0
    };

    this.virtualScrollRegions.set(elementId, scrollRegion);

    return {
      visibleItems: this.getVisibleItems(elementId),
      offsetY: 0
    };
  }

  updateScroll(elementId, scrollTop) {
    const region = this.virtualScrollRegions.get(elementId);
    if (!region) return null;

    const now = Date.now();

    if (now - region.lastScrollTime < 16) {
      return { visibleItems: region.items.slice(region.visibleStart, region.visibleEnd) };
    }

    region.scrollTop = scrollTop;
    region.visibleStart = Math.max(0, Math.floor(scrollTop / region.itemHeight) - region.overscan);
    region.visibleEnd = Math.min(
      region.items.length,
      Math.ceil((scrollTop + region.containerHeight) / region.itemHeight) + region.overscan
    );

    region.lastScrollTime = now;

    return {
      visibleItems: this.getVisibleItems(elementId),
      offsetY: region.visibleStart * region.itemHeight
    };
  }

  getVisibleItems(elementId) {
    const region = this.virtualScrollRegions.get(elementId);
    if (!region) return [];

    return region.items.slice(region.visibleStart, region.visibleEnd);
  }

  debounceRender(fn, delay = 16) {
    let timeoutId;
    let lastCallTime = 0;

    return function debounced(...args) {
      const now = Date.now();

      if (now - lastCallTime >= delay) {
        lastCallTime = now;
        fn.apply(this, args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          fn.apply(this, args);
        }, delay - (now - lastCallTime));
      }
    };
  }

  requestAnimationFrameRender(fn) {
    let isScheduled = false;

    return function scheduled(...args) {
      if (!isScheduled) {
        isScheduled = true;

        requestAnimationFrame(() => {
          fn.apply(this, args);
          isScheduled = false;
        });
      }
    };
  }

  recordMetric(type, key, duration) {
    const metric = {
      type,
      key,
      duration,
      timestamp: Date.now(),
      iso: new Date().toISOString()
    };

    this.renderMetrics.push(metric);

    if (this.renderMetrics.length > this.maxMetrics) {
      this.renderMetrics.shift();
    }

    if (duration > this.renderBudget) {
      this.notifyListeners('slowRender', { key, duration });
    }
  }

  getMetrics(since = null) {
    let metrics = this.renderMetrics;

    if (since) {
      metrics = metrics.filter(m => m.timestamp > since);
    }

    const types = {};

    metrics.forEach(m => {
      if (!types[m.type]) {
        types[m.type] = [];
      }
      types[m.type].push(m.duration);
    });

    const summary = {};

    Object.entries(types).forEach(([type, durations]) => {
      durations.sort((a, b) => a - b);

      summary[type] = {
        count: durations.length,
        total: durations.reduce((a, b) => a + b, 0),
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: durations[0],
        max: durations[durations.length - 1],
        p50: durations[Math.floor(durations.length / 2)],
        p95: durations[Math.floor(durations.length * 0.95)],
        p99: durations[Math.floor(durations.length * 0.99)]
      };
    });

    return summary;
  }

  identifyBottlenecks() {
    const metrics = this.getMetrics();
    const bottlenecks = [];

    Object.entries(metrics).forEach(([type, stats]) => {
      if (stats.average > this.renderBudget * 1.5) {
        bottlenecks.push({
          type,
          severity: 'high',
          message: `${type} renders averaging ${stats.average.toFixed(2)}ms (budget: ${this.renderBudget}ms)`,
          suggestion: 'Consider memoization, virtualization, or code splitting',
          improvement: stats.average - this.renderBudget
        });
      }

      if (stats.p99 > this.renderBudget * 3) {
        bottlenecks.push({
          type,
          severity: 'medium',
          message: `${type} p99 is ${stats.p99.toFixed(2)}ms`,
          suggestion: 'Occasional slowdowns detected. Profile individual renders.',
          improvement: stats.p99 - this.renderBudget
        });
      }
    });

    return bottlenecks.sort((a, b) => b.improvement - a.improvement);
  }

  getOptimizationScore() {
    const metrics = this.getMetrics();
    let score = 100;

    Object.values(metrics).forEach(stats => {
      const overBudget = Math.max(0, stats.average - this.renderBudget);

      if (overBudget > 0) {
        score -= Math.min(30, (overBudget / this.renderBudget) * 30);
      }
    });

    return Math.max(0, score);
  }

  analyzeComponentComplexity(definition) {
    return {
      depth: this.getDepth(definition),
      width: this.getWidth(definition),
      nodeCount: this.countNodes(definition),
      hasEventHandlers: this.countEventHandlers(definition) > 0,
      eventHandlerCount: this.countEventHandlers(definition),
      isResponsive: this.isResponsive(definition)
    };
  }

  getDepth(definition, current = 0) {
    if (!definition || !definition.children) return current;

    const childDepths = definition.children
      .filter(c => c)
      .map(c => this.getDepth(c, current + 1));

    return Math.max(current, ...childDepths, 0);
  }

  getWidth(definition) {
    if (!definition) return 0;

    const childCount = definition.children?.length || 0;

    if (!definition.children) return Math.max(1, childCount);

    return Math.max(
      childCount,
      ...definition.children.map(c => this.getWidth(c))
    );
  }

  countNodes(definition) {
    if (!definition) return 0;

    let count = 1;

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countNodes(child);
      });
    }

    return count;
  }

  countEventHandlers(definition) {
    if (!definition) return 0;

    let count = 0;

    const eventProps = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
    eventProps.forEach(prop => {
      if (definition[prop]) count++;
    });

    if (definition.children) {
      definition.children.forEach(child => {
        count += this.countEventHandlers(child);
      });
    }

    return count;
  }

  isResponsive(definition) {
    if (!definition) return false;

    if (definition.responsiveStyles) return true;

    if (definition.children) {
      return definition.children.some(c => this.isResponsive(c));
    }

    return false;
  }

  buildPerformanceReport() {
    const metrics = this.getMetrics();
    const bottlenecks = this.identifyBottlenecks();
    const score = this.getOptimizationScore();

    return {
      timestamp: new Date().toISOString(),
      score,
      metrics,
      bottlenecks,
      summary: {
        totalRenders: this.renderMetrics.length,
        slowRenders: bottlenecks.length,
        averageTime: this.renderMetrics.length > 0
          ? this.renderMetrics.reduce((a, b) => a + b.duration, 0) / this.renderMetrics.length
          : 0
      }
    };
  }

  buildPerformanceUI() {
    const report = this.buildPerformanceReport();
    const bottlenecks = this.identifyBottlenecks();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Performance Score: ${report.score.toFixed(0)}/100`,
          level: 3,
          style: { margin: 0, fontSize: '18px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          },
          children: [
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Total Renders', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: String(report.summary.totalRenders), level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600 } }
              ]
            },
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Avg Duration', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: `${report.summary.averageTime.toFixed(1)}ms`, level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600 } }
              ]
            },
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Bottlenecks', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: String(bottlenecks.length), level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600, color: bottlenecks.length > 0 ? '#dc3545' : '#28a745' } }
              ]
            }
          ]
        },
        {
          type: 'heading',
          content: 'Bottlenecks',
          level: 4,
          style: { margin: '12px 0 0 0', fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: bottlenecks.slice(0, 5).map(bottleneck => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: `1px solid ${bottleneck.severity === 'high' ? '#dc3545' : '#ffc107'}`,
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: bottleneck.message,
                style: { fontWeight: 500, fontSize: '12px' }
              },
              {
                type: 'text',
                content: bottleneck.suggestion,
                style: { fontSize: '11px', color: '#666', margin: '4px 0 0 0' }
              }
            ]
          }))
        }
      ]
    };
  }

  clearMetrics() {
    this.renderMetrics = [];
    return this;
  }

  clearCache() {
    this.cache.clear();
    return this;
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Performance optimizer listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.cache.clear();
    this.renderMetrics = [];
    this.virtualScrollRegions.clear();
    this.listeners = [];
    return this;
  }
}

function createPerformanceOptimizer() {
  return new PerformanceOptimizer();
}

export { PerformanceOptimizer, createPerformanceOptimizer };
