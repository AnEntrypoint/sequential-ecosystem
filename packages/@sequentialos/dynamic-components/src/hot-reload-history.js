// Hot reload history, undo/redo, and state management
export class HotReloadHistory {
  constructor(options = {}) {
    this.changeHistory = [];
    this.maxHistory = options.maxHistory || 50;
    this.performanceMetrics = {
      reloads: 0,
      totalTime: 0,
      averageTime: 0,
      lastReloadTime: 0
    };
  }

  recordChange(changes, currentComponent) {
    const record = {
      timestamp: Date.now(),
      changes,
      snapshot: JSON.parse(JSON.stringify(currentComponent))
    };

    this.changeHistory.push(record);

    if (this.changeHistory.length > this.maxHistory) {
      this.changeHistory.shift();
    }
  }

  undo(steps = 1) {
    if (this.changeHistory.length < steps) return { success: false };

    const targetIndex = this.changeHistory.length - steps - 1;
    if (targetIndex < 0) return { success: false };

    const targetRecord = this.changeHistory[targetIndex];
    const snapshot = JSON.parse(JSON.stringify(targetRecord.snapshot));

    this.changeHistory.splice(targetIndex + 1);

    return { success: true, snapshot };
  }

  redo(steps = 1) {
    const lastRecord = this.changeHistory[this.changeHistory.length - 1];
    if (!lastRecord) return { success: false };

    const nextRecord = this.changeHistory[this.changeHistory.length + steps];
    if (!nextRecord) return { success: false };

    const snapshot = JSON.parse(JSON.stringify(nextRecord.snapshot));
    return { success: true, snapshot };
  }

  canUndo() {
    return this.changeHistory.length > 0;
  }

  canRedo() {
    return false;
  }

  getHistory() {
    return this.changeHistory.map((record, idx) => ({
      index: idx,
      timestamp: record.timestamp,
      changeCount: record.changes.length,
      summary: this.summarizeChanges(record.changes)
    }));
  }

  summarizeChanges(changes) {
    const pathSet = new Set();

    changes.forEach(change => {
      Object.keys(change.updates).forEach(path => {
        pathSet.add(path.split('.')[0]);
      });
    });

    return Array.from(pathSet);
  }

  jumpToHistory(index) {
    if (index < 0 || index >= this.changeHistory.length) return { success: false };

    const record = this.changeHistory[index];
    const snapshot = JSON.parse(JSON.stringify(record.snapshot));

    return { success: true, snapshot };
  }

  clearHistory() {
    this.changeHistory = [];
  }

  recordMetrics(startTime, endTime) {
    const duration = endTime - startTime;

    this.performanceMetrics.reloads++;
    this.performanceMetrics.totalTime += duration;
    this.performanceMetrics.averageTime = this.performanceMetrics.totalTime / this.performanceMetrics.reloads;
    this.performanceMetrics.lastReloadTime = duration;
  }

  getMetrics() {
    return { ...this.performanceMetrics };
  }

  exportState(currentComponent) {
    return {
      component: JSON.parse(JSON.stringify(currentComponent)),
      history: this.changeHistory.map(r => ({
        timestamp: r.timestamp,
        changeCount: r.changes.length,
        summary: this.summarizeChanges(r.changes)
      })),
      metrics: this.getMetrics(),
      exportedAt: new Date().toISOString()
    };
  }

  importState(state) {
    if (state.component) {
      return JSON.parse(JSON.stringify(state.component));
    }
    return null;
  }
}
