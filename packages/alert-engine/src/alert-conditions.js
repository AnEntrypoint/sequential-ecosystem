/**
 * alert-conditions.js
 *
 * Pre-built alert condition factories
 */

export class AlertConditions {
  static threshold(key, operator, value) {
    return (metrics) => {
      const metricValue = metrics[key];
      if (metricValue === undefined) return false;
      switch (operator) {
        case '>':
          return metricValue > value;
        case '<':
          return metricValue < value;
        case '>=':
          return metricValue >= value;
        case '<=':
          return metricValue <= value;
        case '==':
          return metricValue === value;
        default:
          return false;
      }
    };
  }

  static errorRate(threshold) {
    return (metrics) => metrics.errorRate !== undefined && metrics.errorRate > threshold;
  }

  static slowEndpoint(durationThreshold) {
    return (metrics) => metrics.avgDuration !== undefined && metrics.avgDuration > durationThreshold;
  }

  static memoryUsage(percentThreshold) {
    return (metrics) => metrics.memoryUsagePercent !== undefined && metrics.memoryUsagePercent > percentThreshold;
  }

  static and(...conditions) {
    return (metrics) => conditions.every(c => c(metrics));
  }

  static or(...conditions) {
    return (metrics) => conditions.some(c => c(metrics));
  }
}
