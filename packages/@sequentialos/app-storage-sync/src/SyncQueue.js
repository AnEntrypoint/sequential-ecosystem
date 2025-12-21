export class SyncQueue {
  constructor(appId, stateManager) {
    this.appId = appId;
    this.stateManager = stateManager;
    this.syncQueue = [];
    this.isOnline = true;
    this.isSyncing = false;
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
}
