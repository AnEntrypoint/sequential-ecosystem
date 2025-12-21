import { StorageSync } from './StorageSync.js';

export class AppStorageSync extends StorageSync {
  constructor(appId, stateManager) {
    super(appId, stateManager);
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
