/**
 * log-methods.js - Log level methods
 *
 * Debug, info, warn, error logging methods
 */

import { LOG_LEVELS } from './levels.js';

export class LogMethods {
  constructor(logger, formatter) {
    this.logger = logger;
    this.formatter = formatter;
  }

  debug(msg, dataOrFn) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    const data = typeof dataOrFn === 'function' ? dataOrFn() : dataOrFn;
    const formatted = this.formatter.format('DEBUG', msg, data);
    this.write(process.stdout, formatted);
  }

  info(msg, dataOrFn) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    const data = typeof dataOrFn === 'function' ? dataOrFn() : dataOrFn;
    const formatted = this.formatter.format('INFO', msg, data);
    this.write(process.stdout, formatted);
  }

  warn(msg, dataOrFn) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    const data = typeof dataOrFn === 'function' ? dataOrFn() : dataOrFn;
    const formatted = this.formatter.format('WARN', msg, data);
    this.write(process.stderr, formatted);
  }

  error(msg, err, dataOrFn) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;

    let data = err;
    let errorObj = null;

    if (err instanceof Error) {
      errorObj = {
        name: err.name,
        message: err.message,
        stack: err.stack
      };
      data = typeof dataOrFn === 'function' ? dataOrFn() : dataOrFn;
    } else if (typeof err === 'function') {
      data = err();
      errorObj = null;
    } else {
      data = err;
      errorObj = null;
    }

    const mergedData = errorObj ? { ...data, error: errorObj } : data;
    const formatted = this.formatter.format('ERROR', msg, mergedData);
    this.write(process.stderr, formatted);
  }

  shouldLog(level) {
    return level >= this.logger.level;
  }

  write(stream, formatted) {
    stream.write(formatted + '\n');
  }
}
