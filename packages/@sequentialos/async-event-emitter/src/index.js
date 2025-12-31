import EventEmitter from 'eventemitter3';

export class AsyncEventEmitter extends EventEmitter {
  async emitAsync(event, ...args) {
    const listeners = this.listeners(event);
    if (!listeners.length) return;

    const promises = listeners.map(fn => {
      try {
        return Promise.resolve(fn(...args));
      } catch (err) {
        return Promise.reject(err);
      }
    });

    await Promise.all(promises);
  }

  async emitAsyncSerial(event, ...args) {
    const listeners = this.listeners(event);
    for (const fn of listeners) {
      try {
        await Promise.resolve(fn(...args));
      } catch (err) {
        throw err;
      }
    }
  }
}

export default AsyncEventEmitter;
