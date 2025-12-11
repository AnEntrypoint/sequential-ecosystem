// Event listener management for versioning
export class VersionEvents {
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
          console.error(`Versioning listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.listeners = [];
    return this;
  }
}
