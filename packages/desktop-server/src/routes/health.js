import fs from 'fs-extra';
import path from 'path';
import { asyncHandler } from '../middleware/error-handler.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';

const ERROR_LOG_DIR = path.join(process.cwd(), '.sequential-errors');

let cachedErrorCount = 0;
let lastErrorCountUpdate = 0;
const ERROR_COUNT_CACHE_TTL = 5000;

export function registerHealthRoutes(app) {
  app.get('/api/health', asyncHandler(async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: nowISO(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      node: process.version
    };

    try {
      if (fs.existsSync(ERROR_LOG_DIR)) {
        const now = Date.now();
        if (now - lastErrorCountUpdate > ERROR_COUNT_CACHE_TTL) {
          const files = await fs.readdir(ERROR_LOG_DIR);
          cachedErrorCount = files.length;
          lastErrorCountUpdate = now;
        }
        health.errors = { totalCount: cachedErrorCount, logFiles: cachedErrorCount };
      } else {
        health.errors = { totalCount: 0, logFiles: 0 };
      }
    } catch (err) {
      health.errors = { error: err.message };
    }

    res.json(health);
  }));

  app.get('/api/health/detailed', asyncHandler(async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: nowISO(),
      services: {},
      metrics: {}
    };

    try {
      health.services.filesystem = { status: 'ok', path: process.cwd() };
    } catch (err) {
      health.services.filesystem = { status: 'error', error: err.message };
    }

    try {
      health.services.errors = { status: 'ok', dir: ERROR_LOG_DIR };
      if (fs.existsSync(ERROR_LOG_DIR)) {
        const files = await fs.readdir(ERROR_LOG_DIR);
        health.services.errors.files = files.length;
      }
    } catch (err) {
      health.services.errors = { status: 'error', error: err.message };
    }

    health.metrics.memory = {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    };

    health.metrics.uptime = {
      seconds: Math.round(process.uptime()),
      formatted: formatUptime(process.uptime())
    };

    res.json(health);
  }));
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}
