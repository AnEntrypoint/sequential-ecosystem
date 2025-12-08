class RendererPerformanceOptimizer {
  constructor() {
    this.metrics = new Map();
    this.renderThreshold = 1000;
    this.batchSize = 100;
    this.useVirtualization = true;
    this.useMemoization = true;
    this.memoCache = new WeakMap();
  }

  analyzeComponentTree(componentDef) {
    const analysis = {
      totalNodes: 0,
      maxDepth: 0,
      largeSubtrees: [],
      recommendations: []
    };

    this.traverse(componentDef, (node, depth) => {
      analysis.totalNodes++;
      analysis.maxDepth = Math.max(analysis.maxDepth, depth);

      if (this.countDescendants(node) > this.renderThreshold) {
        analysis.largeSubtrees.push({
          type: node.type,
          descendants: this.countDescendants(node)
        });
      }
    });

    this.generateRecommendations(analysis);
    return analysis;
  }

  traverse(node, callback, depth = 0) {
    callback(node, depth);
    if (node.children) {
      const children = Array.isArray(node.children) ? node.children : [node.children];
      children.forEach(child => {
        if (child && typeof child === 'object') {
          this.traverse(child, callback, depth + 1);
        }
      });
    }
  }

  countDescendants(node) {
    let count = 1;
    if (node.children) {
      const children = Array.isArray(node.children) ? node.children : [node.children];
      children.forEach(child => {
        if (child && typeof child === 'object') {
          count += this.countDescendants(child);
        }
      });
    }
    return count;
  }

  generateRecommendations(analysis) {
    if (analysis.totalNodes > 5000) {
      analysis.recommendations.push('Consider breaking large component tree into smaller components');
    }

    if (analysis.maxDepth > 20) {
      analysis.recommendations.push('Component tree nesting is very deep - consider flattening structure');
    }

    if (analysis.largeSubtrees.length > 0) {
      analysis.recommendations.push(`Found ${analysis.largeSubtrees.length} large subtrees - consider virtualization`);
    }
  }

  optimizeForRendering(componentDef) {
    const optimized = this.applyMemoization(componentDef);
    return this.applyBatching(optimized);
  }

  applyMemoization(componentDef) {
    if (!this.useMemoization) return componentDef;

    const cached = this.memoCache.get(componentDef);
    if (cached) return cached;

    const optimized = {
      ...componentDef,
      _memoKey: this.generateMemoKey(componentDef)
    };

    if (componentDef.children) {
      const children = Array.isArray(componentDef.children)
        ? componentDef.children
        : [componentDef.children];
      optimized.children = children.map(child =>
        child && typeof child === 'object' ? this.applyMemoization(child) : child
      );
    }

    this.memoCache.set(componentDef, optimized);
    return optimized;
  }

  applyBatching(componentDef) {
    if (!Array.isArray(componentDef.children) || componentDef.children.length < this.batchSize) {
      return componentDef;
    }

    return {
      ...componentDef,
      children: componentDef.children.map((child, idx) => ({
        ...child,
        _batchIndex: Math.floor(idx / this.batchSize)
      }))
    };
  }

  generateMemoKey(componentDef) {
    return `${componentDef.type}_${JSON.stringify(componentDef.style || {}).length}_${(componentDef.children || []).length}`;
  }

  enableVirtualization(enabled = true) {
    this.useVirtualization = enabled;
  }

  enableMemoization(enabled = true) {
    this.useMemoization = enabled;
  }

  setThresholds(renderThreshold, batchSize) {
    this.renderThreshold = renderThreshold;
    this.batchSize = batchSize;
  }

  startMetrics(componentId) {
    this.metrics.set(componentId, {
      startTime: performance.now(),
      children: []
    });
  }

  endMetrics(componentId) {
    const metric = this.metrics.get(componentId);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric;
    }
    return null;
  }

  getMetrics(componentId) {
    return this.metrics.get(componentId);
  }

  getAllMetrics() {
    return Array.from(this.metrics.values()).sort((a, b) => b.duration - a.duration);
  }

  getSlowComponents(threshold = 16.67) {
    return this.getAllMetrics().filter(m => m.duration > threshold);
  }

  clearMetrics() {
    this.metrics.clear();
  }

  generateReport() {
    const allMetrics = this.getAllMetrics();
    const totalDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalDuration / allMetrics.length;
    const slowest = allMetrics.slice(0, 5);

    return {
      totalComponents: allMetrics.length,
      totalDuration,
      avgDuration,
      slowestComponents: slowest,
      targetFrameTime: 16.67,
      framesDropped: allMetrics.filter(m => m.duration > 16.67).length
    };
  }
}

function createRendererPerformanceOptimizer() {
  return new RendererPerformanceOptimizer();
}

export { RendererPerformanceOptimizer, createRendererPerformanceOptimizer };
