// Snapshot and comparison functionality
class ProfilerSnapshots {
  constructor() {
    this.snapshots = [];
  }

  takeSnapshot(label = null, profileCount, getStatistics, identifyBottlenecks) {
    const snapshot = {
      label: label || `Snapshot-${this.snapshots.length}`,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      profileCount,
      statistics: getStatistics(),
      bottlenecks: identifyBottlenecks()
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  compareSnapshots(index1, index2) {
    const snap1 = this.snapshots[index1];
    const snap2 = this.snapshots[index2];

    if (!snap1 || !snap2) return null;

    return {
      snapshot1: snap1.label,
      snapshot2: snap2.label,
      timeBetween: snap2.timestamp - snap1.timestamp,
      profileCountDelta: snap2.profileCount - snap1.profileCount,
      durationChange: {
        before: snap1.statistics?.duration.avg,
        after: snap2.statistics?.duration.avg,
        change: ((snap2.statistics?.duration.avg || 0) / (snap1.statistics?.duration.avg || 1)) - 1
      }
    };
  }

  clear() {
    this.snapshots = [];
  }
}

export { ProfilerSnapshots };
