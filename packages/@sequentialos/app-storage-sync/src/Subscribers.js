import logger from '@sequentialos/sequential-logging';

export class Subscribers {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);

    return () => {
      const callbacks = this.subscribers.get(key);
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    };
  }

  notify(key, value) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(cb => {
        try {
          cb(value);
        } catch (err) {
          logger.error('Subscriber error:', err);
        }
      });
    }
  }

  clear() {
    this.subscribers.clear();
  }
}
