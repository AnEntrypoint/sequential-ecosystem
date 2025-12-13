/**
 * trace-logger.js - Structured trace logging
 *
 * Logs traces with correlation ID context
 */

import { getCorrelationId } from './correlation.js';

export class TraceLogger {
  static info(message, data = {}) {
    const correlationId = getCorrelationId();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId,
      level: 'info',
      message,
      data
    }));
  }

  static error(message, data = {}) {
    const correlationId = getCorrelationId();
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId,
      level: 'error',
      message,
      data
    }));
  }

  static span(name, fn, data = {}) {
    const start = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - start;
      this.info(`Span: ${name}`, { duration, ...data });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Span: ${name}`, { duration, error: error.message, ...data });
      throw error;
    }
  }

  static async spanAsync(name, fn, data = {}) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Span: ${name}`, { duration, ...data });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Span: ${name}`, { duration, error: error.message, ...data });
      throw error;
    }
  }
}
