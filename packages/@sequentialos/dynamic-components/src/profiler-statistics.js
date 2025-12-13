/**
 * profiler-statistics.js - Statistics calculation
 *
 * Calculates performance statistics from profile data
 */

export class ProfilerStatistics {
  constructor(profilesMap) {
    this.profiles = profilesMap;
  }

  getStatistics(patternId = null) {
    const profiles = patternId
      ? Array.from(this.profiles.values()).filter(p => p.patternId === patternId)
      : Array.from(this.profiles.values());

    if (profiles.length === 0) {
      return null;
    }

    const durations = profiles.map(p => p.metrics.duration).filter(d => d !== undefined);
    const renderCounts = profiles.map(p => p.renderCount);
    const updateCounts = profiles.map(p => p.updateCount);

    const sorted = durations.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    const avgMemoryDelta = profiles.reduce((sum, p) => {
      return sum + (p.metrics.memoryDelta?.usedDelta || 0);
    }, 0) / profiles.length;

    return {
      profileCount: profiles.length,
      patternId,
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        p50,
        p95,
        p99,
        total: durations.reduce((a, b) => a + b, 0)
      },
      renders: {
        total: renderCounts.reduce((a, b) => a + b, 0),
        avg: renderCounts.reduce((a, b) => a + b, 0) / profiles.length
      },
      updates: {
        total: updateCounts.reduce((a, b) => a + b, 0),
        avg: updateCounts.reduce((a, b) => a + b, 0) / profiles.length
      },
      memory: {
        avgDeltaKB: avgMemoryDelta / 1024
      }
    };
  }
}
