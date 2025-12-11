// Facade maintaining 100% backward compatibility with task scheduler
import { EventEmitter } from 'events';
import { createOnceSchedule, createRecurringSchedule, createIntervalSchedule } from './schedule-creator.js';
import { CronCalculator } from './cron-calculator.js';
import { ScheduleExecutor } from './schedule-executor.js';
import { ScheduleStorage } from './schedule-storage.js';

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

    this.cronCalculator = new CronCalculator();
    this.scheduleStorage = new ScheduleStorage(this.stateManager);
    this.scheduleExecutor = new ScheduleExecutor(
      this.taskQueueManager,
      this.stats,
      this.recordExecution.bind(this),
      this.emit.bind(this)
    );
  }

  setDependencies(taskQueueManager, stateManager) {
    this.taskQueueManager = taskQueueManager;
    this.stateManager = stateManager;
    this.scheduleStorage = new ScheduleStorage(stateManager);
    this.scheduleExecutor = new ScheduleExecutor(
      taskQueueManager,
      this.stats,
      this.recordExecution.bind(this),
      this.emit.bind(this)
    );
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
      this.scheduleExecutor.checkDueSchedules(this.scheduled);
    }, this.checkInterval);
  }

  scheduleOnce(taskName, args, executeAt, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const schedule = createOnceSchedule(taskName, args, executeAt, options);
    this.scheduled.set(schedule.id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id: schedule.id, type: 'once', executeAt });
    return { id: schedule.id, status: 'scheduled' };
  }

  scheduleRecurring(taskName, args, cronExpression, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const nextRun = this.cronCalculator.calculateNextCronRun(cronExpression);
    const schedule = createRecurringSchedule(taskName, args, cronExpression, nextRun, options);
    this.scheduled.set(schedule.id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id: schedule.id, type: 'recurring', cronExpression });
    return { id: schedule.id, status: 'scheduled' };
  }

  scheduleInterval(taskName, args, intervalMs, options = {}) {
    if (this.scheduled.size >= this.maxScheduled) {
      throw new Error(`Cannot schedule: limit of ${this.maxScheduled} reached`);
    }

    const schedule = createIntervalSchedule(taskName, args, intervalMs, options);
    this.scheduled.set(schedule.id, schedule);
    this.stats.total++;

    this.emit('schedule:created', { id: schedule.id, type: 'interval', intervalMs });
    return { id: schedule.id, status: 'scheduled' };
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
    await this.scheduleStorage.persistToStorage(this.scheduled);
  }

  async loadFromStorage() {
    const loaded = await this.scheduleStorage.loadFromStorage();
    this.scheduled = loaded;
  }
}

export const taskScheduler = new TaskScheduler();
