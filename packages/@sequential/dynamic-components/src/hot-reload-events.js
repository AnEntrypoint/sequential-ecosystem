/**
 * Hot Reload Event Manager
 * Handles listener registration and event dispatch
 */

export class HotReloadEvents {
  constructor() {
    this.listeners = [];
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  /**
   * Execute listeners for event
   */
  execute(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error('Listener error for event ' + event + ':', e);
        }
      });
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners = [];
  }
}
