/**
 * @sequentialos/sequential-logging
 *
 * Simple logging utilities for Sequential OS
 */

/**
 * Logger with structured output methods
 */
const logger = {
  /**
   * Log info message
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    console.log(...args);
  },

  /**
   * Log error message
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(...args);
  },

  /**
   * Log warning message
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    console.warn(...args);
  },

  /**
   * Log debug message
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (process.env.DEBUG) {
      console.debug(...args);
    }
  },

  /**
   * Log trace message
   * @param {...any} args - Arguments to log
   */
  trace(...args) {
    if (process.env.DEBUG) {
      console.trace(...args);
    }
  }
};

export default logger;
export { logger };
