/**
 * profiler-recommendations.js - Performance recommendations
 *
 * Generates optimization recommendations based on analysis
 */

export class RecommendationGenerator {
  static generateRecommendations(stats, bottlenecks) {
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
