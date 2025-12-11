export class EventEmitter {
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

  once(event, callback) {
    const wrappedCallback = (...args) => {
      callback(...args);
      this.off(event, wrappedCallback);
    };
    return this.on(event, wrappedCallback);
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Event listener error for ${event}:`, e);
        }
      });
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners = this.listeners.filter(l => l.event !== event);
    } else {
      this.listeners = [];
    }
    return this;
  }

  getListenerCount(event) {
    if (event) {
      return this.listeners.filter(l => l.event === event).length;
    }
    return this.listeners.length;
  }
}
