import logger from '@sequential/sequential-logging';
import { getCorrelationContext } from './correlation-context.js';

export class TraceLogger {
  static log(level, message, data = {}) {
    const context = getCorrelationContext();
    const enriched = {
      ...data,
      correlationId: context?.id,
      timestamp: new Date().toISOString()
    };

    logger[level](message, enriched);
  }

  static debug(message, data) {
    this.log('debug', message, data);
  }

  static info(message, data) {
    this.log('info', message, data);
  }

  static warn(message, data) {
    this.log('warn', message, data);
  }

  static error(message, data) {
    this.log('error', message, data);
  }

  static span(name, fn, data = {}) {
    const startTime = Date.now();
    const context = getCorrelationContext();

    try {
      const result = fn();
      const duration = Date.now() - startTime;

      this.info(`span:${name}:complete`, {
        ...data,
        duration,
        status: 'success',
        correlationId: context?.id
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`span:${name}:error`, {
        ...data,
        duration,
        error: error.message,
        stack: error.stack,
        correlationId: context?.id
      });
      throw error;
    }
  }

  static async spanAsync(name, fn, data = {}) {
    const startTime = Date.now();
    const context = getCorrelationContext();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.info(`span:${name}:complete`, {
        ...data,
        duration,
        status: 'success',
        correlationId: context?.id
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`span:${name}:error`, {
        ...data,
        duration,
        error: error.message,
        stack: error.stack,
        correlationId: context?.id
      });
      throw error;
    }
  }
}

export function createTraceLogger() {
  return TraceLogger;
}
