/**
 * Performance Monitor Core
 * Creates performance monitors for tracking execution metrics
 *
 * Delegates to:
 * - performance-monitor-factory: Performance monitor factory with metrics tracking
 * - performance-monitor-example: Example template code generation
 */

import { createPerformanceMonitor } from './performance-monitor-factory.js';
import { generatePerformanceMonitorTemplate } from './performance-monitor-example.js';

export { createPerformanceMonitor, generatePerformanceMonitorTemplate };
