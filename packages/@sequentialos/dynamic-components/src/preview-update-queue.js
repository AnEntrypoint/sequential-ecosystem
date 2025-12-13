/**
 * preview-update-queue.js - Update queue processing for previews
 *
 * Manage queued updates with debouncing and batch processing
 */

export class PreviewUpdateQueue {
  constructor(applyCallback, notifyCallback) {
    this.queue = [];
    this.isUpdating = false;
    this.applyCallback = applyCallback;
    this.notifyCallback = notifyCallback;
  }

  enqueue(updates) {
    this.queue.push({
      updates,
      timestamp: Date.now()
    });

    if (!this.isUpdating) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0) {
      this.isUpdating = false;
      return;
    }

    this.isUpdating = true;
    const { updates, timestamp } = this.queue.shift();

    this.applyCallback(updates);
    this.notifyCallback({
      type: 'update',
      timestamp,
      updates
    });

    setTimeout(() => this.processQueue(), 16);
  }

  clear() {
    this.queue = [];
    this.isUpdating = false;
  }

  getQueueSize() {
    return this.queue.length;
  }

  isProcessing() {
    return this.isUpdating;
  }
}
