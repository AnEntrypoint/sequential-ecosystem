/**
 * Performance Monitor Example Template
 * Generates performance monitoring example code
 */

export function generatePerformanceMonitorTemplate() {
  return `/**
 * Performance Monitoring
 *
 * Tracks execution performance for tasks, flows, and tools.
 * Collects metrics: duration, success rate, percentiles.
 */

import { createPerformanceMonitor } from '@sequentialos/performance-monitor';

const monitor = createPerformanceMonitor();

// Record task execution
export async function myTask(input) {
  const start = Date.now();
  try {
    const result = await processData(input);
    const duration = Date.now() - start;
    monitor.recordExecution('myTask', duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    monitor.recordExecution('myTask', duration, false, { error: error.message });
    throw error;
  }
}

// Get statistics
export function getPerformanceStats() {
  return {
    summary: monitor.getSummary(),
    all: monitor.getAllStats(),
    slow: monitor.getSlowExecutions(1000),
    failed: monitor.getFailedExecutions()
  };
}

// Export metrics
export function exportMetrics() {
  return monitor.export();
}
`;
}
