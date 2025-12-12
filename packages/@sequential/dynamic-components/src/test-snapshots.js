/**
 * test-snapshots.js - Snapshot testing utilities
 *
 * Manages snapshot creation and comparison
 */

export class SnapshotManager {
  constructor() {
    this.snapshots = new Map();
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  snapshotTest(name, component) {
    const snapshot = JSON.stringify(component);
    const hash = this.hashString(snapshot);

    if (!this.snapshots.has(name)) {
      this.snapshots.set(name, { snapshot, hash });
      return { created: true, hash };
    }

    const stored = this.snapshots.get(name);
    if (stored.hash === hash) {
      return { matched: true };
    }

    return { matched: false, expected: stored.hash, actual: hash };
  }
}
