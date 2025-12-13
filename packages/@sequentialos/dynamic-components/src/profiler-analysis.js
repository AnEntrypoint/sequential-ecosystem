/**
 * profiler-analysis.js - Profiler Analysis Facade
 *
 * Delegates to focused analysis modules:
 * - profiler-statistics: Statistics calculation
 * - profiler-performance: Performance analysis
 * - profiler-recommendations: Recommendation generation
 */

import { ProfilerStatistics } from './profiler-statistics.js';
import { PerformanceAnalyzer } from './profiler-performance.js';
import { RecommendationGenerator } from './profiler-recommendations.js';

export class ProfilerAnalysis {
  constructor(profilesMap) {
    this.profilesMap = profilesMap;
    this.statistics = new ProfilerStatistics(profilesMap);
    this.performance = new PerformanceAnalyzer(profilesMap, this.statistics);
  }

  getStatistics(patternId = null) {
    return this.statistics.getStatistics(patternId);
  }

  identifyBottlenecks(threshold = 16.67) {
    return this.performance.identifyBottlenecks(threshold);
  }

  comparePatterns(patternId1, patternId2) {
    return this.performance.comparePatterns(patternId1, patternId2);
  }

  getTopPatterns(metric = 'duration', limit = 5) {
    return this.performance.getTopPatterns(metric, limit);
  }

  generateRecommendations(stats, bottlenecks) {
    return RecommendationGenerator.generateRecommendations(stats, bottlenecks);
  }
}
