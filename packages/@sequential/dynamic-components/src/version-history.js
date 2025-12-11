// Version history tracking
export class VersionHistory {
  constructor() {
    this.history = new Map();
  }

  recordHistory(patternName, action, data) {
    if (!this.history.has(patternName)) {
      this.history.set(patternName, []);
    }

    const record = {
      timestamp: Date.now(),
      action,
      data,
      iso: new Date().toISOString()
    };

    this.history.get(patternName).unshift(record);

    if (this.history.get(patternName).length > 200) {
      this.history.get(patternName).pop();
    }
  }

  getHistory(patternName, limit = 50) {
    const records = this.history.get(patternName) || [];
    return records.slice(0, limit);
  }

  clear() {
    this.history.clear();
  }
}
