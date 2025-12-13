/**
 * composition-event-manager.js - Event listener management for composition core
 *
 * Manages event registration and notification for composition changes
 */

export class CompositionEventManager {
  constructor() {
    this.listeners = [];
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Pattern composition listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.listeners = [];
    return this;
  }

  hasListeners(event) {
    return this.listeners.some(l => l.event === event);
  }

  listenerCount(event) {
    return this.listeners.filter(l => l.event === event).length;
  }
}
