import { nanoid } from 'nanoid';
import logger from '@sequentialos/sequential-logging';

class ExecutionService {
  constructor(entityName = 'entity', options = {}) {
    this.entityName = entityName;
    this.handlers = new Map();
    this.executionHistory = [];
    this.debug = options.debug ?? false;
    this.exitOnError = options.exitOnError ?? false;
    this.timeout = options.timeout ?? 30000;
  }

  async executeWithTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`${this.entityName} execution timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }

  generateId() {
    return `${this.entityName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  broadcastEvent(eventName, data) {
    if (this.debug) {
      logger.info(`[${this.constructor.name}] Event: ${eventName}`, data);
    }
  }

  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        history = history.filter(h => h[key] === value);
      }
    }
    return history;
  }

  registerHandler(name, handler) {
    this.handlers.set(name, handler);
  }

  getRegisteredHandlers() {
    return Array.from(this.handlers.keys());
  }

  clearHistory() {
    this.executionHistory = [];
  }
}

export class UnifiedExecutionService extends ExecutionService {
  constructor(type = 'task', options = {}) {
    const typeConfig = {
      task: { timeout: 30000, label: 'Task' },
      flow: { timeout: 60000, label: 'Flow' },
      tool: { timeout: 10000, label: 'Tool' }
    };

    const config = typeConfig[type] || typeConfig.task;
    super(type, options);
    this.type = type;
    this.label = config.label;
    this.timeout = options.timeout || config.timeout;
    this.executionHistory = [];
  }

  register(name, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`Handler for ${this.type} '${name}' must be a function`);
    }
    this.handlers.set(name, handler);
  }

  list() {
    return Array.from(this.handlers.keys());
  }

  async execute(name, input = {}, options = {}) {
    const {
      id = nanoid(9),
      timeout = this.timeout,
      broadcast = false
    } = options;

    const startTime = new Date().toISOString();
    const executionId = `${this.type}-${id}`;

    logger.debug(`[${this.label}Service] Executing: ${name}`, { id, input });

    try {
      const handler = this.handlers.get(name);

      if (!handler) {
        return this.mockExecution(name, input, executionId, startTime);
      }

      let result;
      if (timeout > 0) {
        result = await this._executeWithTimeout(
          handler(input, { id, name, type: this.type }),
          timeout
        );
      } else {
        result = await handler(input, { id, name, type: this.type });
      }

      return this._buildSuccessResult(name, result, executionId, startTime, broadcast);

    } catch (error) {
      return this._buildErrorResult(name, error, executionId, startTime, broadcast);
    }
  }

  async _executeWithTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Execution timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }

  mockExecution(name, input, id, startTime) {
    const result = {
      success: true,
      data: {
        message: `${this.label} '${name}' executed (mock - handler not registered)`,
        input,
        name,
        mock: true
      },
      id,
      name,
      type: this.type,
      startTime,
      endTime: new Date().toISOString(),
      duration: 0
    };
    this.executionHistory.push(result);
    logger.warn(`[${this.label}Service] Using mock execution for: ${name}`);
    return result;
  }

  _buildSuccessResult(name, data, id, startTime, broadcast) {
    const endTime = new Date().toISOString();
    const result = {
      success: true,
      data,
      id,
      name,
      type: this.type,
      startTime,
      endTime,
      duration: new Date(endTime) - new Date(startTime)
    };
    this.executionHistory.push(result);
    logger.debug(`[${this.label}Service] Completed: ${name}`, { duration: result.duration });
    if (broadcast) this._broadcastEvent(`${this.type}:completed`, result);
    return result;
  }

  _buildErrorResult(name, error, id, startTime, broadcast) {
    const endTime = new Date().toISOString();
    const result = {
      success: false,
      error: {
        message: error.message,
        code: error.code || `${this.type.toUpperCase()}_EXECUTION_ERROR`,
        name
      },
      id,
      name,
      type: this.type,
      startTime,
      endTime,
      duration: new Date(endTime) - new Date(startTime)
    };
    this.executionHistory.push(result);
    logger.error(`[${this.label}Service] Failed: ${name}`, error);
    if (broadcast) this._broadcastEvent(`${this.type}:failed`, result);
    return result;
  }

  _broadcastEvent(event, data) {
    // Placeholder for event broadcasting if needed
  }

  getHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }

  clearHistory() {
    this.executionHistory = [];
  }
}
