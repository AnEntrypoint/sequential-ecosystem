/**
 * TaskService - Handles task execution for GXE webhook dispatch
 *
 * Provides task execution with lifecycle management, input/output handling,
 * and consistent response formatting for webhook-style invocations.
 */

export class TaskService {
  constructor() {
    this.tasks = new Map();
    this.executionHistory = [];
  }

  /**
   * Register a task handler
   * @param {string} taskName - The name of the task
   * @param {Function} handler - Async function to execute the task
   */
  registerTask(taskName, handler) {
    this.tasks.set(taskName, handler);
  }

  /**
   * Execute a task by name
   * @param {string} taskName - The name of the task to execute
   * @param {Object} input - JSON input data for the task
   * @param {Object} options - Execution options
   * @param {string} options.runId - Optional run ID (auto-generated if omitted)
   * @param {boolean} options.broadcast - Whether to broadcast execution events
   * @param {number} options.timeout - Execution timeout in milliseconds
   * @returns {Promise<Object>} Execution result with success/data/metadata
   */
  async executeTask(taskName, input = {}, options = {}) {
    const {
      runId = this.generateRunId(),
      broadcast = false,
      timeout = 30000
    } = options;

    const startTime = new Date().toISOString();
    const taskId = `task-${runId}`;

    try {
      // Check if task is registered
      const taskHandler = this.tasks.get(taskName);

      if (!taskHandler) {
        // Task not registered - return mock success for testing
        // In production, this would throw an error or load task dynamically
        const result = {
          success: true,
          data: {
            message: `Task '${taskName}' executed (mock)`,
            input: input,
            taskName: taskName,
            mock: true
          },
          taskId,
          runId,
          taskName,
          startTime,
          endTime: new Date().toISOString(),
          duration: 0
        };

        this.executionHistory.push(result);
        return result;
      }

      // Execute registered task handler with timeout
      let taskResult;
      if (timeout > 0) {
        taskResult = await this.executeWithTimeout(
          taskHandler(input, { runId, taskName }),
          timeout
        );
      } else {
        taskResult = await taskHandler(input, { runId, taskName });
      }

      const endTime = new Date().toISOString();
      const duration = new Date(endTime) - new Date(startTime);

      const result = {
        success: true,
        data: taskResult,
        taskId,
        runId,
        taskName,
        startTime,
        endTime,
        duration
      };

      this.executionHistory.push(result);

      if (broadcast) {
        this.broadcastEvent('task:completed', result);
      }

      return result;

    } catch (error) {
      const endTime = new Date().toISOString();
      const duration = new Date(endTime) - new Date(startTime);

      const errorResult = {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'TASK_EXECUTION_ERROR',
          taskName: taskName
        },
        taskId,
        runId,
        taskName,
        startTime,
        endTime,
        duration
      };

      this.executionHistory.push(errorResult);

      if (broadcast) {
        this.broadcastEvent('task:failed', errorResult);
      }

      throw error;
    }
  }

  /**
   * Execute a promise with timeout
   * @param {Promise} promise - The promise to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise} The promise result or timeout error
   */
  async executeWithTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Task execution timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Generate a unique run ID
   * @returns {string} Unique run identifier
   */
  generateRunId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Broadcast an event (placeholder for event system integration)
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  broadcastEvent(eventName, data) {
    // Placeholder for event broadcasting
    // In production, this would integrate with an event bus or WebSocket system
    if (process.env.DEBUG) {
      console.log(`[TaskService] Event: ${eventName}`, data);
    }
  }

  /**
   * Get execution history
   * @param {Object} filters - Optional filters (taskName, runId, success)
   * @returns {Array} Filtered execution history
   */
  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];

    if (filters.taskName) {
      history = history.filter(h => h.taskName === filters.taskName);
    }

    if (filters.runId) {
      history = history.filter(h => h.runId === filters.runId);
    }

    if (filters.success !== undefined) {
      history = history.filter(h => h.success === filters.success);
    }

    return history;
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Get registered tasks
   * @returns {Array<string>} List of registered task names
   */
  getRegisteredTasks() {
    return Array.from(this.tasks.keys());
  }
}
