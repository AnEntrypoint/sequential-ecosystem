import { SyncQueue } from './SyncQueue.js';
import { Subscribers } from './Subscribers.js';

export class StorageSync {
  constructor(appId, stateManager) {
    this.appId = appId;
    this.stateManager = stateManager;
    this.syncQueue = new SyncQueue(appId, stateManager);
    this.subscribers = new Subscribers();
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
      this.subscribers.notify(key, value);
      this.syncQueue.queueSync({ type: 'set', key, value });
      return true;
    } catch (err) {
      this.syncQueue.addToQueue({ type: 'set', key, value });
      return false;
    }
  }

  async delete(key) {
    try {
      await this.stateManager.delete(`app:${this.appId}`, key);
      this.subscribers.notify(key, null);
      this.syncQueue.queueSync({ type: 'delete', key });
      return true;
    } catch (err) {
      this.syncQueue.addToQueue({ type: 'delete', key });
      return false;
    }
  }

  async clear() {
    try {
      await this.stateManager.clear(`app:${this.appId}`);
      this.subscribers.clear();
      this.syncQueue.queueSync({ type: 'clear' });
      return true;
    } catch (err) {
      this.syncQueue.addToQueue({ type: 'clear' });
      return false;
    }
  }

  subscribe(key, callback) {
    return this.subscribers.subscribe(key, callback);
  }

  setOnline(isOnline) {
    this.syncQueue.setOnline(isOnline);
  }

  getSyncQueueSize() {
    return this.syncQueue.getSyncQueueSize();
  }

  async getAllData() {
    return this.stateManager.getAll(`app:${this.appId}`);
  }
}
