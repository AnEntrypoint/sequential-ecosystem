/**
 * composition-history.js - Composition action history tracking
 *
 * Track and manage composition changes for undo/audit
 */

export class CompositionHistory {
  constructor() {
    this.history = [];
  }

  recordAction(action, details = {}) {
    this.history.push({
      action,
      ...details,
      timestamp: new Date()
    });
  }

  undo() {
    if (this.history.length === 0) return false;
    this.history.pop();
    return true;
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}
