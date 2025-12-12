/**
 * observability-collectors.js - Health and metrics data collection
 *
 * Collect system health, profiling, and status information
 */

import os from 'os';

export class HealthCollector {
  collectBasicHealth() {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    return {
      status: 'healthy',
      uptime,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      cpu: {
        cores: os.cpus().length,
        loadAvg: os.loadavg()
      }
    };
  }
}

export class ProfilingCollector {
  collectProfiling() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUtilization: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2) + '%',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      },
      uptime: {
        seconds: Math.round(uptime),
        formatted: this.formatUptime(uptime)
      },
      nodejs: {
        version: process.version,
        pid: process.pid,
        platform: process.platform,
        arch: process.arch
      },
      system: {
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024) + 'MB',
        loadAvg: os.loadavg()
      }
    };
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
  }
}

export class EndpointMetricsCollector {
  collectEndpointMetrics(metrics, endpoint) {
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / (metrics.length || 1);
    const errorCount = metrics.filter(m => m.error).length;

    return {
      endpoint,
      totalRequests: metrics.length,
      avgDuration: Math.round(avgDuration),
      errorCount,
      errorRate: ((errorCount / (metrics.length || 1)) * 100).toFixed(2) + '%',
      recentRequests: metrics.slice(-10)
    };
  }
}
