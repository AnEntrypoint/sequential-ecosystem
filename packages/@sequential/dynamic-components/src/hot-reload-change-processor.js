/**
 * hot-reload-change-processor.js - Change queue and rendering processor
 *
 * Debounce and process component changes with rendering
 */

export class HotReloadChangeProcessor {
  constructor(debounceDelay = 300) {
    this.changeQueue = [];
    this.isProcessing = false;
    this.debounceDelay = debounceDelay;
    this.debounceTimer = null;
  }

  queueChange(updates) {
    this.changeQueue.push({
      timestamp: Date.now(),
      updates,
      before: JSON.parse(JSON.stringify(updates))
    });
  }

  debounceRender(callback) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges(callback);
    }, this.debounceDelay);
  }

  processChanges(callback) {
    if (this.isProcessing || this.changeQueue.length === 0) return;

    this.isProcessing = true;
    try {
      callback();
    } finally {
      this.changeQueue = [];
      this.isProcessing = false;
    }
  }

  clear() {
    this.changeQueue = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
