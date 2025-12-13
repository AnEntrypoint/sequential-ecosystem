/**
 * Hot Reload Change Processor
 * Handles change queue processing and metrics collection
 */

export class HotReloadProcessor {
  constructor(core, history) {
    this.core = core;
    this.history = history;
    this.debugMode = false;
  }

  /**
   * Process pending changes from queue
   */
  process() {
    if (this.core.isProcessing || this.core.changeQueue.length === 0) return;

    this.core.isProcessing = true;
    const startTime = performance.now();

    try {
      const changes = this.core.changeQueue.splice(0);

      changes.forEach(change => {
        this.core.applyChanges(this.core.currentComponent, change.updates);
      });

      this.history.recordChange(changes, this.core.currentComponent);
      this.core.render();

      const endTime = performance.now();
      this.history.recordMetrics(startTime, endTime);

      if (this.debugMode) {
        console.log('[Hot Reload] Processed ' + changes.length + ' change(s) in ' + (endTime - startTime).toFixed(2) + 'ms');
      }

      return { changes, endTime, startTime };
    } finally {
      this.core.isProcessing = false;

      if (this.core.changeQueue.length > 0) {
        this.core.debounceRender();
      }
    }
  }
}
