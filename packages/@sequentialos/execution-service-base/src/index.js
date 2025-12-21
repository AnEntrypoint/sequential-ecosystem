/**
 * ExecutionService - Base class for execution services
 *
 * Provides common functionality for task and flow execution including:
 * - Handler registration and retrieval
 * - Timeout management
 * - ID generation
 * - Event broadcasting
 * - Execution history tracking
 */

import logger from '@sequentialos/sequential-logging';

export class ExecutionService {
  /**
   * Create a new ExecutionService instance
   * @param {string} entityName - Name of the entity type (e.g., 'task', 'flow')
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug logging (defaults to false)
   * @param {boolean} options.exitOnError - Exit process on errors (defaults to false)
   * @param {number} options.timeout - Default timeout in milliseconds (defaults to 30000)
   */
  constructor(entityName = 'entity', options = {}) {
    this.entityName = entityName;
    this.handlers = new Map();
    this.executionHistory = [];

    // Store configuration options
    this.debug = options.debug ?? false;
    this.exitOnError = options.exitOnError ?? false;
    this.timeout = options.timeout ?? 30000;
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
        setTimeout(
          () => reject(new Error(`${this.entityName} execution timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }

  /**
   * Generate a unique ID
   * @returns {string} Unique identifier in format: {entityName}-{timestamp}-{random}
   */
  generateId() {
    return `${this.entityName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Broadcast an event (placeholder for event system integration)
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  broadcastEvent(eventName, data) {
    // Placeholder for event broadcasting
    // In production, this would integrate with an event bus or WebSocket system
    if (this.debug) {
      logger.info(`[${this.constructor.name}] Event: ${eventName}`, data);
    }
  }

  /**
   * Get execution history
   * @param {Object} filters - Optional filters to apply
   * @returns {Array} Filtered execution history
   */
  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];

    // Apply filters dynamically based on filter keys
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        history = history.filter(h => h[key] === value);
      }
    }

    return history;
  }

  /**
   * Register a handler
   * @param {string} name - The name of the handler
   * @param {Function} handler - Async function to execute
   */
  registerHandler(name, handler) {
    this.handlers.set(name, handler);
  }

  /**
   * Get registered handlers
   * @returns {Array<string>} List of registered handler names
   */
  getRegisteredHandlers() {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }
}
