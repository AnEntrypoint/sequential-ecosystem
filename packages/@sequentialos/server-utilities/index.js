/**
 * Server utilities for sequential-ecosystem
 * HTTP request building, response parsing, and retry logic
 */

// Export retry configuration
export { RetryConfig } from './retry-config.js';

// Export fetch with retry
export { fetchWithRetry, createFetchWithRetry } from './fetch-retry.js';

// Export response parsing
export {
  ResponseParseError,
  parseResponse,
  parseResponseSafe
} from './response-parser.js';

// Export request builder
export { RequestBuilder, buildRequest } from './request-builder.js';

// Configuration object
export const CONFIG = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  taskTimeout: parseInt(process.env.TASK_TIMEOUT || '300000'),
  cacheTTL: parseInt(process.env.CACHE_TTL || '60000'),
};

// Cache management utilities
const cache = new Map();

export function setCache(key, value, ttl = CONFIG.cacheTTL) {
  cache.set(key, { value, expires: Date.now() + ttl });
}

export function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function createCacheKey(...parts) {
  return parts.join(':');
}

// Timer utilities
export function createTimer(name) {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    log: (label) => console.log(`[${name}] ${label}: ${Date.now() - start}ms`)
  };
}

// Request logging
const requestLog = [];

export function createRequestLogger() {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      requestLog.push({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: Date.now() - start,
        timestamp: new Date().toISOString()
      });
      if (requestLog.length > 1000) requestLog.shift();
    });
    next();
  };
}

export function getRequestLog() {
  return requestLog;
}

// Background task management
export const backgroundTaskManager = {
  tasks: new Map(),

  create(id, fn) {
    this.tasks.set(id, { fn, status: 'pending', startTime: null, endTime: null });
    return id;
  },

  start(id) {
    const task = this.tasks.get(id);
    if (task) task.status = 'running';
  },

  complete(id, result) {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 'completed';
      task.result = result;
    }
  },

  fail(id, error) {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 'failed';
      task.error = error.message;
    }
  },

  get(id) {
    return this.tasks.get(id);
  },

  list() {
    return Array.from(this.tasks.entries()).map(([id, task]) => ({ id, ...task }));
  }
};

// Task queue manager
export const taskQueueManager = {
  queue: [],

  enqueue(task) {
    this.queue.push(task);
  },

  dequeue() {
    return this.queue.shift();
  },

  list() {
    return [...this.queue];
  },

  size() {
    return this.queue.length;
  }
};

// Task scheduler
export const taskScheduler = {
  tasks: new Map(),

  schedule(id, interval, fn) {
    const timer = setInterval(fn, interval);
    this.tasks.set(id, { timer, interval, fn });
  },

  cancel(id) {
    const task = this.tasks.get(id);
    if (task) clearInterval(task.timer);
    this.tasks.delete(id);
  },

  list() {
    return Array.from(this.tasks.keys());
  }
};

// Execute task with timeout
export async function executeTaskWithTimeout(task, timeout = CONFIG.taskTimeout) {
  return Promise.race([
    task(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Task timeout')), timeout)
    )
  ]);
}

// Queue worker pool
export const queueWorkerPool = {
  workers: [],

  addWorker(worker) {
    this.workers.push(worker);
  },

  getWorkers() {
    return this.workers;
  }
};

// Default export with all utilities
import { RetryConfig } from './retry-config.js';
import { fetchWithRetry, createFetchWithRetry } from './fetch-retry.js';
import { ResponseParseError, parseResponse, parseResponseSafe } from './response-parser.js';
import { RequestBuilder, buildRequest } from './request-builder.js';

export default {
  RetryConfig,
  fetchWithRetry,
  createFetchWithRetry,
  ResponseParseError,
  parseResponse,
  parseResponseSafe,
  RequestBuilder,
  buildRequest,
  CONFIG,
  setCache,
  getFromCache,
  createCacheKey,
  createTimer,
  createRequestLogger,
  getRequestLog,
  backgroundTaskManager,
  taskQueueManager,
  taskScheduler,
  executeTaskWithTimeout,
  queueWorkerPool
};
