/**
 * @module event-emitter
 * Event emitter utility for Sequential OS
 */

import logger from '@sequentialos/sequential-logging';

/**
 * Simple event emitter with support for custom broadcast functions
 * @class EventEmitter
 */
export class EventEmitter {
  /**
   * Create a new EventEmitter
   * @param {Object} options - Configuration options
   * @param {Function} options.broadcast - Optional custom broadcast function for distributed events
   */
  constructor(options = {}) {
    this._events = new Map();
    this._broadcastFn = options.broadcast || null;
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const emitter = new EventEmitter();
   * const unsubscribe = emitter.on('user:created', (data) => {
   *   console.log('User created:', data);
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   */
  on(event, handler) {
    if (typeof event !== 'string' || !event) {
      throw new TypeError('Event name must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }

    // Get or create handler array for this event
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    const handlers = this._events.get(event);
    handlers.push(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function to remove
   * @returns {boolean} True if handler was removed, false if not found
   *
   * @example
   * const emitter = new EventEmitter();
   * const handler = (data) => console.log(data);
   * emitter.on('event', handler);
   * emitter.off('event', handler); // => true
   */
  off(event, handler) {
    if (!this._events.has(event)) {
      return false;
    }

    const handlers = this._events.get(event);
    const index = handlers.indexOf(handler);

    if (index === -1) {
      return false;
    }

    handlers.splice(index, 1);

    // Clean up empty event arrays
    if (handlers.length === 0) {
      this._events.delete(event);
    }

    return true;
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   * @param {string} [event] - Optional event name to clear (clears all if omitted)
   *
   * @example
   * emitter.removeAllListeners('user:created'); // Remove all listeners for this event
   * emitter.removeAllListeners(); // Remove all listeners for all events
   */
  removeAllListeners(event) {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param {string} event - Event name
   * @param {*} data - Event data to pass to handlers
   * @returns {Promise<void>}
   *
   * @example
   * await emitter.emit('user:created', { id: 'user_123', name: 'Alice' });
   */
  async emit(event, data) {
    if (typeof event !== 'string' || !event) {
      throw new TypeError('Event name must be a non-empty string');
    }

    // Call custom broadcast function if provided
    if (this._broadcastFn) {
      try {
        await this._broadcastFn(event, data);
      } catch (error) {
        logger.error(`Broadcast error for event "${event}":`, error);
      }
    }

    // Call local handlers
    if (!this._events.has(event)) {
      return;
    }

    const handlers = this._events.get(event);

    // Execute all handlers (supports both sync and async handlers)
    const promises = handlers.map(async (handler) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error(`Handler error for event "${event}":`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Register a one-time event listener that auto-removes after first invocation
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {Function} Unsubscribe function
   *
   * @example
   * emitter.once('initialized', (data) => {
   *   console.log('App initialized:', data);
   * });
   */
  once(event, handler) {
    const wrappedHandler = async (data) => {
      this.off(event, wrappedHandler);
      await handler(data);
    };

    return this.on(event, wrappedHandler);
  }

  /**
   * Get the number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of registered listeners
   *
   * @example
   * emitter.listenerCount('user:created'); // => 3
   */
  listenerCount(event) {
    if (!this._events.has(event)) {
      return 0;
    }
    return this._events.get(event).length;
  }

  /**
   * Get all event names with registered listeners
   * @returns {string[]} Array of event names
   *
   * @example
   * emitter.eventNames(); // => ['user:created', 'user:updated', 'user:deleted']
   */
  eventNames() {
    return Array.from(this._events.keys());
  }
}

/**
 * Create a new EventEmitter instance
 * @param {Object} options - Configuration options
 * @returns {EventEmitter}
 *
 * @example
 * const emitter = createEventEmitter({
 *   broadcast: async (event, data) => {
 *     // Custom broadcast logic (e.g., Redis pub/sub, WebSocket)
 *     await redis.publish(event, JSON.stringify(data));
 *   }
 * });
 */
export function createEventEmitter(options = {}) {
  return new EventEmitter(options);
}
