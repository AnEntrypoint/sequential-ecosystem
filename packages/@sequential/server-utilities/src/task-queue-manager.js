import { EventEmitter } from 'events';
import logger from '@sequentialos/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';
import { delay, withRetry } from '@sequentialos/async-patterns';

export class TaskQueueManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.queue = new Map();
    this.nextId = 1;
    this.stateManager = null;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 5000;
    this.autoStart = options.autoStart !== false;
  }

  setStateManager(stateManager) {
    this.stateManager = stateManager;
  }

  enqueue(taskName, args = [], options = {}) {
    const id = this.nextId++;
    const task = {
      id,
      taskName,
      args,
      status: 'pending',
      retries: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null
    };

    this.queue.set(id, task);
    this.emit('task:enqueued', { id, taskName });

    if (this.autoStart) {
      this._persistTask(id);
    }

    return { id, status: 'enqueued' };
  }

  dequeue() {
    for (const [id, task] of this.queue) {
      if (task.status === 'pending') {
        task.status = 'processing';
        task.startedAt = Date.now();
        this.emit('task:dequeued', { id });
        this._persistTask(id);
        return { id, task };
      }
    }
    return null;
  }

  complete(id, result) {
    const task = this.queue.get(id);
    if (!task) return false;

    task.status = 'completed';
    task.result = result;
    task.completedAt = Date.now();
    this.emit('task:completed', { id, result });
    this._persistTask(id);
    return true;
  }

  fail(id, error) {
    const task = this.queue.get(id);
    if (!task) return false;

    task.error = error.message || String(error);
    task.retries++;

    if (task.retries < task.maxRetries) {
      task.status = 'pending';
      setTimeout(() => {
        this.emit('task:retry', { id, retries: task.retries, maxRetries: task.maxRetries });
      }, this.retryDelayMs);
    } else {
      task.status = 'failed';
      task.completedAt = Date.now();
      this.emit('task:failed', { id, error: task.error, retries: task.retries });
    }

    this._persistTask(id);
    return true;
  }

  status(id) {
    return this.queue.get(id) || null;
  }

  list(filter = {}) {
    const results = [];
    for (const [id, task] of this.queue) {
      if (filter.status && task.status !== filter.status) continue;
      if (filter.taskName && task.taskName !== filter.taskName) continue;
      results.push({ id, ...task });
    }
    return results;
  }

  getStats() {
    const stats = {
      total: this.queue.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      retriedCount: 0
    };

    for (const task of this.queue.values()) {
      stats[task.status]++;
      if (task.retries > 0) stats.retriedCount++;
    }

    return stats;
  }

  async loadFromStorage() {
    if (!this.stateManager) return;

    try {
      const saved = await this.stateManager.get('queue', 'tasks');
      if (!saved) return;

      for (const [id, task] of Object.entries(saved)) {
        this.queue.set(parseInt(id), task);
        this.nextId = Math.max(this.nextId, parseInt(id) + 1);
      }

      this.emit('queue:loaded', { count: this.queue.size });
    } catch (e) {
      logger.error('[TaskQueueManager] Error loading queue from storage:', e.message);
    }
  }

  _persistTask(id) {
    if (!this.stateManager) return;

    try {
      const task = this.queue.get(id);
      if (task) {
        this.stateManager.set('queue', 'tasks', Object.fromEntries(this.queue));
      }
    } catch (e) {
      logger.error(`[TaskQueueManager] Error persisting task ${id}:`, e.message);
    }
  }

  clear() {
    this.queue.clear();
  }
}

export const taskQueueManager = new TaskQueueManager();
