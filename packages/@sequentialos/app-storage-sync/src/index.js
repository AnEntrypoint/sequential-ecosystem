export class AppStorageSync {
  constructor(appId, stateManager) {
    this.appId = appId;
    this.stateManager = stateManager;
    this.subscribers = new Map();
    this.syncQueue = [];
    this.isOnline = true;
    this.isSyncing = false;
  }

  async get(key) {
    try {
      const data = await this.stateManager.get(`app:${this.appId}`, key);
      return data;
    } catch (err) {
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.stateManager.set(`app:${this.appId}`, key, value);
      this.notifySubscribers(key, value);
      this.queueSync({ type: 'set', key, value });
      return true;
    } catch (err) {
      this.addToQueue({ type: 'set', key, value });
      return false;
    }
  }

  async delete(key) {
    try {
      await this.stateManager.delete(`app:${this.appId}`, key);
      this.notifySubscribers(key, null);
      this.queueSync({ type: 'delete', key });
      return true;
    } catch (err) {
      this.addToQueue({ type: 'delete', key });
      return false;
    }
  }

  async clear() {
    try {
      await this.stateManager.clear(`app:${this.appId}`);
      this.subscribers.clear();
      this.queueSync({ type: 'clear' });
      return true;
    } catch (err) {
      this.addToQueue({ type: 'clear' });
      return false;
    }
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

  notifySubscribers(key, value) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(cb => {
        try {
          cb(value);
        } catch {}
      });
    }
  }

  addToQueue(operation) {
    this.syncQueue.push({ ...operation, timestamp: Date.now() });
    if (this.syncQueue.length === 1 && this.isOnline) {
      this.processSyncQueue();
    }
  }

  queueSync(operation) {
    if (!this.isOnline) {
      this.addToQueue(operation);
    }
  }

  async processSyncQueue() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    const batch = [...this.syncQueue];
    this.syncQueue = [];

    try {
      for (const op of batch) {
        switch (op.type) {
          case 'set':
            await this.stateManager.set(`app:${this.appId}`, op.key, op.value);
            break;
          case 'delete':
            await this.stateManager.delete(`app:${this.appId}`, op.key);
            break;
          case 'clear':
            await this.stateManager.clear(`app:${this.appId}`);
            break;
        }
      }
    } catch (err) {
      this.syncQueue = batch;
      this.isOnline = false;
    } finally {
      this.isSyncing = false;
    }
  }

  setOnline(isOnline) {
    this.isOnline = isOnline;
    if (isOnline) {
      this.processSyncQueue();
    }
  }

  getSyncQueueSize() {
    return this.syncQueue.length;
  }

  async getAllData() {
    return this.stateManager.getAll(`app:${this.appId}`);
  }
}

export class AppStorageSyncBridge {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.storage = new Map();
  }

  createSync(appId) {
    const sync = new AppStorageSync(appId, this.stateManager);
    this.storage.set(appId, sync);
    return sync;
  }

  getSync(appId) {
    return this.storage.get(appId);
  }

  removeSync(appId) {
    this.storage.delete(appId);
  }
}
