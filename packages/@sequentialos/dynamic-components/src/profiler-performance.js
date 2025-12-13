/**
 * profiler-performance.js - Performance analysis
 *
 * Analyzes bottlenecks, comparisons, and top patterns
 */

export class PerformanceAnalyzer {
  constructor(profilesMap, statisticsCalculator) {
    this.profiles = profilesMap;
    this.stats = statisticsCalculator;
  }

  identifyBottlenecks(threshold = 16.67) {
    const profiles = Array.from(this.profiles.values());
    const slow = profiles.filter(p => p.metrics.duration > threshold);

    return slow.map(profile => ({
      patternId: profile.patternId,
      duration: profile.metrics.duration,
      excess: profile.metrics.duration - threshold,
      renders: profile.renderCount,
      updates: profile.updateCount,
      events: profile.events
    })).sort((a, b) => b.excess - a.excess);
  }

  comparePatterns(patternId1, patternId2) {
    const stats1 = this.stats.getStatistics(patternId1);
    const stats2 = this.stats.getStatistics(patternId2);

    if (!stats1 || !stats2) return null;

    const durationRatio = stats2.duration.avg / stats1.duration.avg;
    const renderRatio = stats2.renders.total / stats1.renders.total;

    return {
      patternId1,
      patternId2,
      duration: {
        pattern1Avg: stats1.duration.avg,
        pattern2Avg: stats2.duration.avg,
        ratio: durationRatio,
        faster: durationRatio < 1 ? patternId1 : patternId2
      },
      renders: {
        pattern1Total: stats1.renders.total,
        pattern2Total: stats2.renders.total,
        ratio: renderRatio
      },
      memory: {
        pattern1DeltaKB: stats1.memory.avgDeltaKB,
        pattern2DeltaKB: stats2.memory.avgDeltaKB
      }
    };
  }

  getTopPatterns(metric = 'duration', limit = 5) {
    const patternMap = new Map();

    Array.from(this.profiles.values()).forEach(profile => {
      if (!patternMap.has(profile.patternId)) {
        patternMap.set(profile.patternId, []);
      }
      patternMap.get(profile.patternId).push(profile);
    });

    const patternStats = Array.from(patternMap.entries()).map(([patternId]) => {
      const stats = this.stats.getStatistics(patternId);
      return { patternId, stats };
    });

    if (metric === 'duration') {
      return patternStats
        .sort((a, b) => (b.stats?.duration.avg || 0) - (a.stats?.duration.avg || 0))
        .slice(0, limit);
    } else if (metric === 'memory') {
      return patternStats
        .sort((a, b) => (b.stats?.memory.avgDeltaKB || 0) - (a.stats?.memory.avgDeltaKB || 0))
        .slice(0, limit);
    }

    return [];
  }
}
