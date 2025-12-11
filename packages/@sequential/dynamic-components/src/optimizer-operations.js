/**
 * optimizer-operations.js
 *
 * Memoization and batching optimization operations
 */

export class OptimizerOperations {
  constructor(batchSize = 100) {
    this.batchSize = batchSize;
    this.memoCache = new WeakMap();
    this.useMemoization = true;
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

  enableMemoization(enabled = true) {
    this.useMemoization = enabled;
  }

  setThresholds(renderThreshold, batchSize) {
    this.batchSize = batchSize;
  }
}
