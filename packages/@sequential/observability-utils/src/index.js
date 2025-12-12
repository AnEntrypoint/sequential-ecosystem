/**
 * index.js - Observability Utilities Facade
 *
 * Delegates to focused modules:
 * - correlation: Correlation ID tracking
 * - metrics: Metrics collection and analysis
 * - trace-logger: Structured trace logging
 */

export { correlationMiddleware, getCorrelationId } from './correlation.js';
export { MetricsCollector, metricsMiddleware } from './metrics.js';
export { TraceLogger } from './trace-logger.js';
