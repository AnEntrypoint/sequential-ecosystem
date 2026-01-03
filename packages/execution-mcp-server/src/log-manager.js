export class LogManager {
  constructor(maxLines = 100) {
    this.maxLines = maxLines;
    this.logs = [];
    this.isCapturing = false;
  }

  addLog(line, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message: line
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLines) {
      this.logs.shift();
    }
  }

  startCapture() {
    this.isCapturing = true;
    this.logs = [];
  }

  stopCapture() {
    this.isCapturing = false;
  }

  getLogs(limit = null) {
    if (limit === null) {
      return this.logs;
    }
    return this.logs.slice(-limit);
  }

  getFormattedLogs(limit = null) {
    const logs = this.getLogs(limit);
    return logs.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`);
  }

  clear() {
    this.logs = [];
  }

  getStats() {
    const totalLines = this.logs.length;
    const levelCounts = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});

    return {
      totalLines,
      maxLines: this.maxLines,
      isFull: totalLines >= this.maxLines,
      isCapturing: this.isCapturing,
      levelCounts
    };
  }
}

export const logManager = new LogManager(100);
