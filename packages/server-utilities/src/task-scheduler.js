import { EventEmitter } from 'events';
import cron from 'node-cron';
import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';

export class TaskScheduler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.taskQueueManager = null;
    this.stateManager = null;
    this.maxScheduled = options.maxScheduled || 1000;
    this.checkInterval = options.checkInterval || 1000;
    this.timezone = options.timezone || 'UTC';

    this.scheduled = new Map();
    this.isRunning = false;
    this.stats = {
      total: 0,
      executed: 0,
      failed: 0,
      active: 0,
      cancelled: 0
    };
    this.executionHistory = new Map();
    this.checkLoop = null;
  }

  setDependencies(taskQueueManager, stateManager) {
    this.taskQueueManager = taskQueueManager;
    this.stateManager = stateManager;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.stateManager) {
      await this.loadFromStorage();
    }

    this.startCheckLoop();

    this.emit('scheduler:started', { total: this.scheduled.size });
  }

  async stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.checkLoop) {
      clearInterval(this.checkLoop);
      this.checkLoop = null;
    }

    if (this.stateManager) {
      await this.persistToStorage();
    }

    this.emit('scheduler:stopped', { totalExecuted: this.stats.executed });
  }

  startCheckLoop() {
    this.checkLoop = setInterval(() => {
      this.checkDueSchedules();
    }, this.checkInterval);
  }

  checkDueSchedules() {
    const now = Date.now();

    for (const [id, schedule] of this.scheduled.entries()) {
      if (!schedule.enabled) continue;

      const shouldExecute = this.shouldExecuteSchedule(schedule, now);

      if (shouldExecute) {
        this.executeSchedule(id, schedule, now);
      }
    }
  }

  shouldExecuteSchedule(schedule, now) {
    if (!schedule.nextRun) return false;
    if (schedule.nextRun > now) return false;

    return true;
  }

  async executeSchedule(id, schedule, now) {
    try {
      if (!this.taskQueueManager) return;

      const queueResult = this.taskQueueManager.enqueue(
        schedule.taskName,
        schedule.args || [],
        {
          scheduledId: id,
          scheduledAt: schedule.createdAt,
          executedAt: now
        }
      );

      schedule.lastRun = now;
      schedule.lastQueueId = queueResult.id;

      this.recordExecution(id, { status: 'enqueued', queueId: queueResult.id, timestamp: now });

      this.calculateNextRun(schedule);

      if (schedule.type === 'once') {
        schedule.enabled = false;
        this.stats.total++;
      }

      this.stats.executed++;

      this.emit('schedule:executed', { id, taskName: schedule.taskName, timestamp: now });

      if (this.stateManager) {
        await this.stateManager.set('schedules', id, schedule);
      }
    } catch (error) {
      this.stats.failed++;
      this.recordExecution(id, { status: 'failed', error: error.message, timestamp: now });
      this.emit('schedule:error', { id, error: error.message });
    }
  }

  scheduleOnce(taskName, args, executeAt, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const schedule = {
      id,
      type: 'once',
      taskName,
      args: args || [],
      nextRun: executeAt,
      lastRun: null,
      enabled: true,
      createdAt: Date.now(),
      ...options
    };

    this.scheduled.set(id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id, type: 'once', executeAt });

    return { id, status: 'scheduled' };
  }

  scheduleRecurring(taskName, args, cronExpression, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const schedule = {
      id,
      type: 'recurring',
      taskName,
      args: args || [],
      cronExpression,
      nextRun: this.calculateNextCronRun(cronExpression),
      lastRun: null,
      enabled: true,
      createdAt: Date.now(),
      ...options
    };

    this.scheduled.set(id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id, type: 'recurring', cronExpression });

    return { id, status: 'scheduled' };
  }

  scheduleInterval(taskName, args, intervalMs, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const schedule = {
      id,
      type: 'interval',
      taskName,
      args: args || [],
      intervalMs,
      nextRun: now + intervalMs,
      lastRun: null,
      enabled: true,
      createdAt: now,
      ...options
    };

    this.scheduled.set(id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id, type: 'interval', intervalMs });

    return { id, status: 'scheduled' };
  }

  calculateNextRun(schedule) {
    if (schedule.type === 'interval') {
      schedule.nextRun = Date.now() + schedule.intervalMs;
    } else if (schedule.type === 'recurring') {
      schedule.nextRun = this.calculateNextCronRun(schedule.cronExpression);
    }
  }

  calculateNextCronRun(cronExpression) {
    if (!cron.validate(cronExpression)) {
      throw new Error('Invalid cron expression format');
    }

    const parts = cronExpression.split(' ');
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setSeconds(0, 0);
    nextRun.setMinutes(nextRun.getMinutes() + 1);

    let found = false;
    let iterations = 0;
    const maxIterations = 1440 * 32;

    while (!found && iterations < maxIterations) {
      if (this.matchesCronExpression(nextRun, minute, hour, dayOfMonth, month, dayOfWeek)) {
        found = true;
      } else {
        nextRun.setMinutes(nextRun.getMinutes() + 1);
      }
      iterations++;
    }

    return found ? nextRun.getTime() : null;
  }

  matchesCronExpression(date, minute, hour, dayOfMonth, month, dayOfWeek) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const h = date.getHours();
    const min = date.getMinutes();
    const dow = date.getDay();

    return this.cronPartMatches(min, minute) && this.cronPartMatches(h, hour) &&
           this.cronPartMatches(d, dayOfMonth) && this.cronPartMatches(m, month) &&
           this.cronPartMatches(dow, dayOfWeek);
  }

  cronPartMatches(value, pattern) {
    if (pattern === '*' || pattern === '?') return true;

    if (pattern.includes('/')) {
      const [start, step] = pattern.split('/');
      const startVal = start === '*' ? 0 : parseInt(start);
      const stepVal = parseInt(step);
      return (value - startVal) % stepVal === 0;
    }

    if (pattern.includes(',')) {
      return pattern.split(',').some(p => parseInt(p) === value);
    }

    if (pattern.includes('-')) {
      const [min, max] = pattern.split('-').map(Number);
      return value >= min && value <= max;
    }

    return parseInt(pattern) === value;
  }

  cancel(id) {
    const schedule = this.scheduled.get(id);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }

    schedule.enabled = false;
    this.stats.cancelled++;

    this.emit('schedule:cancelled', { id });

    return { success: true, id };
  }

  update(id, options) {
    const schedule = this.scheduled.get(id);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }

    Object.assign(schedule, options);

    this.emit('schedule:updated', { id, options });

    return { success: true, id };
  }

  getSchedule(id) {
    return this.scheduled.get(id) || null;
  }

  getAllSchedules() {
    return Array.from(this.scheduled.values()).map(s => ({
      id: s.id,
      type: s.type,
      taskName: s.taskName,
      nextRun: s.nextRun,
      lastRun: s.lastRun,
      enabled: s.enabled,
      createdAt: s.createdAt
    }));
  }

  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      maxScheduled: this.maxScheduled,
      scheduled: this.scheduled.size
    };
  }

  recordExecution(id, details) {
    if (!this.executionHistory.has(id)) {
      this.executionHistory.set(id, []);
    }

    const history = this.executionHistory.get(id);
    history.push(details);

    if (history.length > 1000) {
      history.shift();
    }
  }

  getExecutionHistory(id, limit = 50) {
    const history = this.executionHistory.get(id) || [];
    return history.slice(-limit);
  }

  async persistToStorage() {
    if (!this.stateManager) return;

    try {
      for (const [id, schedule] of this.scheduled.entries()) {
        await this.stateManager.set('schedules', id, schedule);
      }
    } catch (error) {
      logger.error('[TaskScheduler] Error persisting to storage:', error.message);
    }
  }

  async loadFromStorage() {
    if (!this.stateManager) return;

    try {
      const schedules = await this.stateManager.getAll('schedules');
      if (schedules && typeof schedules === 'object') {
        for (const [id, schedule] of Object.entries(schedules)) {
          if (schedule && schedule.id) {
            this.scheduled.set(id, schedule);
          }
        }
      }
    } catch (error) {
      logger.error('[TaskScheduler] Error loading from storage:', error.message);
    }
  }
}

export const taskScheduler = new TaskScheduler();
