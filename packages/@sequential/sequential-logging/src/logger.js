/**
 * logger.js - Logger Facade
 *
 * Delegates to message formatter and log methods modules
 */

import { LOG_LEVELS, LEVEL_NAMES } from './levels.js';
import { MessageFormatter } from './message-formatter.js';
import { LogMethods } from './log-methods.js';

export class Logger {
  constructor() {
    this.level = LOG_LEVELS.INFO;
    this.context = {};
    this.outputFormat = 'cli';
    this.timestamp = true;
    this.#initMethods();
  }

  #initMethods() {
    const formatter = new MessageFormatter(this.outputFormat, this.context, this.timestamp);
    this.logMethods = new LogMethods(this, formatter);
  }

  setLevel(level) {
    if (typeof level === 'string') {
      const numLevel = LOG_LEVELS[level.toUpperCase()];
      if (numLevel === undefined) {
        throw new Error(`Invalid log level: ${level}. Must be one of: DEBUG, INFO, WARN, ERROR`);
      }
      this.level = numLevel;
    } else if (typeof level === 'number') {
      if (level < 0 || level > 3) {
        throw new Error(`Invalid log level: ${level}. Must be 0-3 (DEBUG-ERROR)`);
      }
      this.level = level;
    } else {
      throw new Error(`Invalid log level type: ${typeof level}`);
    }
  }

  setContext(context) {
    this.context = context || {};
    this.#initMethods();
  }

  addContext(key, value) {
    this.context[key] = value;
    this.#initMethods();
  }

  setOutputFormat(format) {
    if (!['cli', 'server', 'json'].includes(format)) {
      throw new Error(`Invalid output format: ${format}. Must be one of: cli, server, json`);
    }
    this.outputFormat = format;
    this.#initMethods();
  }

  setTimestamp(enabled) {
    this.timestamp = enabled;
    this.#initMethods();
  }

  debug(msg, dataOrFn) {
    this.logMethods.debug(msg, dataOrFn);
  }

  info(msg, dataOrFn) {
    this.logMethods.info(msg, dataOrFn);
  }

  warn(msg, dataOrFn) {
    this.logMethods.warn(msg, dataOrFn);
  }

  error(msg, err, dataOrFn) {
    this.logMethods.error(msg, err, dataOrFn);
  }

  child(context) {
    const childLogger = new Logger();
    childLogger.level = this.level;
    childLogger.context = { ...this.context, ...context };
    childLogger.outputFormat = this.outputFormat;
    childLogger.timestamp = this.timestamp;
    return childLogger;
  }
}
