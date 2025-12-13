// Facade maintaining 100% backward compatibility
import { ProfilerCore } from './profiler-core.js';
import { ProfilerAnalysis } from './profiler-analysis.js';
import { ProfilerUI } from './profiler-ui.js';
import { ProfilerSnapshots } from './profiler-snapshots.js';

class PatternProfiler {
  constructor() {
    this.core = new ProfilerCore();
    this.analysis = new ProfilerAnalysis(this.core.profiles);
    this.ui = new ProfilerUI();
    this.snapshots = new ProfilerSnapshots();
  }

  // Core profiling methods (delegated to core)
  startProfiling(patternId) {
    return this.core.startProfiling(patternId);
  }

  endProfiling(profileId) {
    return this.core.endProfiling(profileId);
  }

  measureRender(patternId, callback) {
    return this.core.measureRender(patternId, callback);
  }

  async measureRenderAsync(patternId, callback) {
    return this.core.measureRenderAsync(patternId, callback);
  }

  recordEvent(profileId, eventType, data) {
    return this.core.recordEvent(profileId, eventType, data);
  }

  getMemoryUsage() {
    return this.core.getMemoryUsage();
  }

  calculateMemoryDelta(startMem, endMem) {
    return this.core.calculateMemoryDelta(startMem, endMem);
  }

  getProfile(profileId) {
    return this.core.getProfile(profileId);
  }

  getPatternProfiles(patternId) {
    return this.core.getPatternProfiles(patternId);
  }

  // Analysis methods (delegated to analysis)
  getStatistics(patternId) {
    return this.analysis.getStatistics(patternId);
  }

  identifyBottlenecks(threshold) {
    return this.analysis.identifyBottlenecks(threshold);
  }

  comparePatterns(patternId1, patternId2) {
    return this.analysis.comparePatterns(patternId1, patternId2);
  }

  getTopPatterns(metric, limit) {
    return this.analysis.getTopPatterns(metric, limit);
  }

  generateRecommendations(stats, bottlenecks) {
    return this.analysis.generateRecommendations(stats, bottlenecks);
  }

  // Report generation
  generateReport(patternId = null) {
    const profiles = patternId
      ? this.core.getPatternProfiles(patternId)
      : Array.from(this.core.profiles.values()).slice(-100);

    const stats = this.getStatistics(patternId);
    const bottlenecks = this.identifyBottlenecks();

    const sessionDuration = Date.now() - this.core.sessionStartTime;

    return {
      generated: new Date().toISOString(),
      sessionDuration,
      totalProfiles: this.core.profiles.size,
      patternId,
      statistics: stats,
      bottlenecks: bottlenecks.slice(0, 10),
      recommendations: this.generateRecommendations(stats, bottlenecks),
      topSlowPatterns: this.getTopPatterns('duration', 5),
      topMemoryPatterns: this.getTopPatterns('memory', 5)
    };
  }

  // UI methods (delegated to ui)
  buildProfilerUI() {
    const stats = this.getStatistics();
    const bottlenecks = this.identifyBottlenecks();
    return this.ui.buildProfilerUI(stats, bottlenecks);
  }

  buildStatCard(label, value) {
    return this.ui.buildStatCard(label, value);
  }

  // Snapshot methods (delegated to snapshots)
  takeSnapshot(label) {
    return this.snapshots.takeSnapshot(
      label,
      this.core.profiles.size,
      () => this.getStatistics(),
      () => this.identifyBottlenecks()
    );
  }

  compareSnapshots(index1, index2) {
    return this.snapshots.compareSnapshots(index1, index2);
  }

  // Export methods
  exportProfiles(format) {
    return this.ui.exportProfiles(
      this.core.profiles,
      format,
      () => this.getStatistics()
    );
  }

  // Cleanup
  clear() {
    this.core.clear();
    this.snapshots.clear();
  }

  // Getters for compatibility
  get profiles() {
    return this.core.profiles;
  }

  get measurements() {
    return this.core.measurements;
  }

  get enabled() {
    return this.core.enabled;
  }

  set enabled(value) {
    this.core.enabled = value;
  }
}

function createPatternProfiler() {
  return new PatternProfiler();
}

export { PatternProfiler, createPatternProfiler };
