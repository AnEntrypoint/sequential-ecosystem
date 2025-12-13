/**
 * message-formatter.js - Message formatting logic
 *
 * Format log messages for different output formats
 */

import { nowISO } from '@sequentialos/sequential-utils/timestamps';

export class MessageFormatter {
  constructor(outputFormat, context, timestamp) {
    this.outputFormat = outputFormat;
    this.context = context;
    this.timestamp = timestamp;
  }

  format(levelName, msg, data) {
    const ts = this.timestamp ? `[${nowISO()}] ` : '';

    if (this.outputFormat === 'json') {
      return this.formatJSON(levelName, msg, data, ts);
    }

    if (this.outputFormat === 'server') {
      return this.formatServer(levelName, msg, data, ts);
    }

    return this.formatCLI(levelName, msg, data, ts);
  }

  formatJSON(levelName, msg, data, ts) {
    const entry = {
      level: levelName,
      message: msg,
      ...this.context
    };
    if (data) {
      entry.data = data;
    }
    if (this.timestamp) {
      entry.timestamp = nowISO();
    }
    return JSON.stringify(entry);
  }

  formatServer(levelName, msg, data, ts) {
    const contextStr = Object.keys(this.context).length > 0
      ? ` ${JSON.stringify(this.context)}`
      : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${ts}[${levelName}]${contextStr} ${msg}${dataStr}`;
  }

  formatCLI(levelName, msg, data, ts) {
    const contextStr = Object.keys(this.context).length > 0
      ? `[${Object.entries(this.context).map(([k, v]) => `${k}=${v}`).join(' ')}] `
      : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${ts}${contextStr}${msg}${dataStr}`;
  }
}
