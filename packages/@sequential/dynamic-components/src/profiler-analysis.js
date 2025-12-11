// Analysis and statistics generation
class ProfilerAnalysis {
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
    const stats1 = this.getStatistics(patternId1);
    const stats2 = this.getStatistics(patternId2);

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
      const stats = this.getStatistics(patternId);
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

  generateRecommendations(stats, bottlenecks) {
    const recommendations = [];

    if (!stats) return recommendations;

    if (stats.duration.p95 > 50) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'P95 render time exceeds 50ms. Consider memoization or code splitting.',
        estimated_improvement: '30-50%'
      });
    }

    if (stats.renders.avg > 3) {
      recommendations.push({
        type: 'rendering',
        severity: 'medium',
        message: 'High average render count. Profile component re-renders.',
        estimated_improvement: '20-40%'
      });
    }

    if (stats.memory.avgDeltaKB > 1000) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'Large memory growth per pattern. Check for memory leaks.',
        estimated_improvement: '15-25%'
      });
    }

    if (bottlenecks.length > 0) {
      const slowest = bottlenecks[0];
      recommendations.push({
        type: 'optimization',
        severity: 'medium',
        message: `Pattern "${slowest.patternId}" takes ${slowest.excess.toFixed(2)}ms over target.`,
        estimated_improvement: '10-30%'
      });
    }

    return recommendations;
  }
}

export { ProfilerAnalysis };
