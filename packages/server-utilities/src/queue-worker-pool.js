import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';

export class QueueWorkerPool extends EventEmitter {
  constructor(options = {}) {
    super();
    this.numWorkers = options.numWorkers || 2;
    this.taskQueueManager = null;
    this.backgroundTaskManager = null;
    this.pollInterval = options.pollInterval || 1000;
    this.taskTimeout = options.taskTimeout || 30000;
    this.autoStart = options.autoStart !== false;

    this.workers = [];
    this.isRunning = false;
    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      retried: 0,
      workersActive: 0,
      workersIdle: 0
    };
    this.workerStatus = new Map();
  }

  setDependencies(taskQueueManager, backgroundTaskManager) {
    this.taskQueueManager = taskQueueManager;
    this.backgroundTaskManager = backgroundTaskManager;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    for (let i = 0; i < this.numWorkers; i++) {
      this.workerStatus.set(i, { state: 'idle', currentTask: null, processed: 0, failed: 0 });
      this.startWorkerLoop(i);
    }

    this.emit('pool:started', { numWorkers: this.numWorkers });
  }

  async stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    await new Promise(resolve => {
      if (this.workers.length === 0) return resolve();

      let completed = 0;
      this.workers.forEach(() => {
        setImmediate(() => {
          completed++;
          if (completed === this.workers.length) resolve();
        });
      });
    });

    this.emit('pool:stopped', { totalProcessed: this.stats.processed });
  }

  startWorkerLoop(workerId) {
    const loop = async () => {
      if (!this.isRunning) return;

      try {
        this.workerStatus.set(workerId, {
          ...this.workerStatus.get(workerId),
          state: 'active',
          lastActivity: Date.now()
        });
        this.updateStats();

        const dequeued = this.taskQueueManager.dequeue();

        if (!dequeued) {
          this.workerStatus.set(workerId, {
            ...this.workerStatus.get(workerId),
            state: 'idle'
          });
          this.updateStats();
          await new Promise(r => setTimeout(r, this.pollInterval));
          return loop();
        }

        const { id, task } = dequeued;
        this.workerStatus.set(workerId, {
          ...this.workerStatus.get(workerId),
          currentTask: id,
          taskName: task.taskName
        });

        await this.executeTask(id, task, workerId);

        const status = this.workerStatus.get(workerId);
        this.workerStatus.set(workerId, {
          ...status,
          currentTask: null,
          processed: (status.processed || 0) + 1
        });

        return loop();
      } catch (error) {
        logger.error(`[WorkerPool] Worker ${workerId} error:`, error.message);
        this.emit('worker:error', { workerId, error: error.message });
        await new Promise(r => setTimeout(r, this.pollInterval));
        return loop();
      }
    };

    loop();
  }

  async executeTask(taskId, task, workerId) {
    try {
      const result = await this.backgroundTaskManager.executeTask(
        task.taskName,
        task.args,
        { taskId, timeout: this.taskTimeout }
      );

      this.taskQueueManager.complete(taskId, result);
      this.stats.succeeded++;
      this.stats.processed++;

      this.emit('task:completed', { taskId, workerId, result });
    } catch (error) {
      this.taskQueueManager.fail(taskId, error);
      this.stats.failed++;
      this.stats.processed++;

      const status = this.taskQueueManager.status(taskId);
      if (status && status.retries < status.maxRetries) {
        this.stats.retried++;
        this.emit('task:retrying', { taskId, workerId, attempt: status.retries });
      } else {
        this.emit('task:failed', { taskId, workerId, error: error.message });
      }
    }
  }

  updateStats() {
    let active = 0;
    let idle = 0;

    for (const status of this.workerStatus.values()) {
      if (status.state === 'active') active++;
      else idle++;
    }

    this.stats.workersActive = active;
    this.stats.workersIdle = idle;
  }

  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      numWorkers: this.numWorkers,
      workers: Array.from(this.workerStatus.entries()).map(([id, status]) => ({
        id,
        ...status
      }))
    };
  }

  getWorkerStatus(workerId) {
    return this.workerStatus.get(workerId) || null;
  }

  getAllWorkerStatus() {
    return Array.from(this.workerStatus.entries()).map(([id, status]) => ({
      id,
      ...status
    }));
  }
}

export const queueWorkerPool = new QueueWorkerPool();
