class PatternProfiler {
  constructor() {
    this.profiles = new Map();
    this.measurements = new Map();
    this.snapshots = [];
    this.enabled = true;
    this.sessionStartTime = Date.now();
  }

  startProfiling(patternId) {
    if (!this.enabled) return null;

    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const profile = {
      id: profileId,
      patternId,
      startTime: performance.now(),
      startMark: `pattern-start-${profileId}`,
      endMark: `pattern-end-${profileId}`,
      metrics: {},
      memory: this.getMemoryUsage(),
      renderCount: 0,
      updateCount: 0,
      events: []
    };

    this.profiles.set(profileId, profile);

    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(profile.startMark);
    }

    return profileId;
  }

  endProfiling(profileId) {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    profile.endTime = performance.now();

    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(profile.endMark);
      const measureName = `pattern-measure-${profileId}`;
      performance.measure(measureName, profile.startMark, profile.endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      profile.metrics.duration = measure.duration;
    } else {
      profile.metrics.duration = profile.endTime - profile.startTime;
    }

    profile.metrics.endMemory = this.getMemoryUsage();
    profile.metrics.memoryDelta = this.calculateMemoryDelta(
      profile.memory,
      profile.metrics.endMemory
    );

    return profile;
  }

  measureRender(patternId, callback) {
    const profileId = this.startProfiling(patternId);
    let result;

    try {
      result = callback();
    } catch (e) {
      this.recordEvent(profileId, 'error', {
        message: e.message,
        stack: e.stack
      });
      throw e;
    }

    this.endProfiling(profileId);
    return result;
  }

  async measureRenderAsync(patternId, callback) {
    const profileId = this.startProfiling(patternId);
    let result;

    try {
      result = await callback();
    } catch (e) {
      this.recordEvent(profileId, 'error', {
        message: e.message,
        stack: e.stack
      });
      throw e;
    }

    this.endProfiling(profileId);
    return result;
  }

  recordEvent(profileId, eventType, data = {}) {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    profile.events.push({
      type: eventType,
      timestamp: performance.now(),
      relativeTime: performance.now() - profile.startTime,
      data
    });

    if (eventType === 'render') profile.renderCount++;
    if (eventType === 'update') profile.updateCount++;
  }

  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  calculateMemoryDelta(startMem, endMem) {
    if (!startMem || !endMem) return null;

    return {
      usedDelta: endMem.usedJSHeapSize - startMem.usedJSHeapSize,
      totalDelta: endMem.totalJSHeapSize - startMem.totalJSHeapSize
    };
  }

  getProfile(profileId) {
    return this.profiles.get(profileId);
  }

  getPatternProfiles(patternId) {
    return Array.from(this.profiles.values()).filter(p => p.patternId === patternId);
  }

  getStatistics(patternId = null) {
    const profiles = patternId
      ? this.getPatternProfiles(patternId)
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

  generateReport(patternId = null) {
    const profiles = patternId
      ? this.getPatternProfiles(patternId)
      : Array.from(this.profiles.values()).slice(-100);

    const stats = this.getStatistics(patternId);
    const bottlenecks = this.identifyBottlenecks();

    const sessionDuration = Date.now() - this.sessionStartTime;

    return {
      generated: new Date().toISOString(),
      sessionDuration,
      totalProfiles: this.profiles.size,
      patternId,
      statistics: stats,
      bottlenecks: bottlenecks.slice(0, 10),
      recommendations: this.generateRecommendations(stats, bottlenecks),
      topSlowPatterns: this.getTopPatterns('duration', 5),
      topMemoryPatterns: this.getTopPatterns('memory', 5)
    };
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

  getTopPatterns(metric = 'duration', limit = 5) {
    const patternMap = new Map();

    Array.from(this.profiles.values()).forEach(profile => {
      if (!patternMap.has(profile.patternId)) {
        patternMap.set(profile.patternId, []);
      }
      patternMap.get(profile.patternId).push(profile);
    });

    const patternStats = Array.from(patternMap.entries()).map(([patternId, profiles]) => {
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

  buildProfilerUI() {
    const stats = this.getStatistics();
    const bottlenecks = this.identifyBottlenecks();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '⚡ Performance Profiler',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        stats ? {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          },
          children: [
            this.buildStatCard('Avg Duration', `${stats.duration.avg.toFixed(2)}ms`),
            this.buildStatCard('P95 Duration', `${stats.duration.p95.toFixed(2)}ms`),
            this.buildStatCard('Total Renders', stats.renders.total.toString()),
            this.buildStatCard('Avg Updates', stats.updates.avg.toFixed(1).toString()),
            this.buildStatCard('Memory Δ', `${(stats.memory.avgDeltaKB / 1024).toFixed(2)}MB`),
            this.buildStatCard('Profiles', stats.profileCount.toString())
          ]
        } : {
          type: 'paragraph',
          content: 'No profiles yet',
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585'
          }
        },
        bottlenecks.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px'
          },
          children: [
            {
              type: 'heading',
              content: '🐌 Bottlenecks',
              level: 4,
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#ef4444'
              }
            },
            ...bottlenecks.slice(0, 3).map(bn => ({
              type: 'box',
              style: {
                padding: '6px 8px',
                background: '#3e3e42',
                borderRadius: '3px',
                borderLeft: '3px solid #ef4444',
                fontSize: '9px'
              },
              children: [{
                type: 'paragraph',
                content: `${bn.patternId}: ${bn.duration.toFixed(2)}ms (+${bn.excess.toFixed(2)}ms)`,
                style: {
                  margin: 0,
                  color: '#d4d4d4'
                }
              }]
            }))
          ]
        } : null
      ].filter(Boolean)
    };
  }

  buildStatCard(label, value) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#2d2d30',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: {
            margin: 0,
            fontSize: '9px',
            color: '#858585'
          }
        },
        {
          type: 'heading',
          content: value,
          level: 4,
          style: {
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#667eea'
          }
        }
      ]
    };
  }

  takeSnapshot(label = null) {
    const snapshot = {
      label: label || `Snapshot-${this.snapshots.length}`,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      profileCount: this.profiles.size,
      statistics: this.getStatistics(),
      bottlenecks: this.identifyBottlenecks()
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

  exportProfiles(format = 'json') {
    const profiles = Array.from(this.profiles.values()).map(p => ({
      id: p.id,
      patternId: p.patternId,
      duration: p.metrics.duration,
      renders: p.renderCount,
      updates: p.updateCount,
      memoryDeltaKB: (p.metrics.memoryDelta?.usedDelta || 0) / 1024
    }));

    if (format === 'json') {
      return {
        export: 'profiler-data',
        exportedAt: new Date().toISOString(),
        totalProfiles: profiles.length,
        statistics: this.getStatistics(),
        profiles
      };
    }

    return profiles;
  }

  clear() {
    this.profiles.clear();
    this.measurements.clear();
    this.snapshots = [];
  }
}

function createPatternProfiler() {
  return new PatternProfiler();
}

export { PatternProfiler, createPatternProfiler };
