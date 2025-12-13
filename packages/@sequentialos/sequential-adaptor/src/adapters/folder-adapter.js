/**
 * folder-adapter.js - Folder-Based Storage Adapter Facade
 *
 * Delegates to focused operation modules:
 * - cache-loader: Cache initialization and loading
 * - task-run-operations: Task run CRUD operations
 * - stack-run-operations: Stack run CRUD operations
 * - function-storage: Task function persistence
 * - keystore-operations: Key-value storage operations
 */

import path from 'path';
import { validatePath } from '@sequentialos/validation';
import { StorageAdapter } from '../interfaces/storage-adapter.js';
import { CRUDPatterns, Serializer } from '@sequentialos/sequential-storage-utils';
import { CacheLoader } from './cache-loader.js';
import { TaskRunOperations } from './task-run-operations.js';
import { StackRunOperations } from './stack-run-operations.js';
import { FunctionStorage } from './function-storage.js';
import { KeystoreOperations } from './keystore-operations.js';

export class FolderAdapter extends StorageAdapter {
  constructor(basePath = './tasks') {
    super();
    this.basePath = path.resolve(basePath);
    this.taskRunsCache = new Map();
    this.stackRunsCache = new Map();
    this.keystoreCache = new Map();
    this.crud = new CRUDPatterns();
    this.serializer = new Serializer();

    this.cacheLoader = new CacheLoader(this.basePath, this.taskRunsCache, this.stackRunsCache, this.keystoreCache);
    this.taskRuns = new TaskRunOperations(this.basePath, this.taskRunsCache, this.crud);
    this.stackRuns = new StackRunOperations(this.basePath, this.stackRunsCache, this.crud);
    this.functions = new FunctionStorage(this.basePath);
    this.keystore = new KeystoreOperations(this.basePath, this.keystoreCache);
  }

  validatePath(subPath) {
    try {
      return validatePath(subPath, this.basePath);
    } catch (err) {
      if (err.code === 'FORBIDDEN') {
        throw new Error(`Path traversal attempt: ${subPath}`);
      }
      throw err;
    }
  }

  async init() {
    return await this.cacheLoader.init();
  }

  async createTaskRun(taskRun) {
    return await this.taskRuns.create(taskRun);
  }

  async getTaskRun(id) {
    return await this.taskRuns.get(id);
  }

  async updateTaskRun(id, updates) {
    return await this.taskRuns.update(id, updates);
  }

  async queryTaskRuns(filter) {
    return await this.taskRuns.query(filter);
  }

  async createStackRun(stackRun) {
    return await this.stackRuns.create(stackRun);
  }

  async getStackRun(id) {
    return await this.stackRuns.get(id);
  }

  async updateStackRun(id, updates) {
    return await this.stackRuns.update(id, updates);
  }

  async queryStackRuns(filter) {
    return await this.stackRuns.query(filter);
  }

  async getPendingStackRuns() {
    return await this.stackRuns.getPending();
  }

  async storeTaskFunction(taskFunction) {
    return await this.functions.store(taskFunction);
  }

  async getTaskFunction(identifier) {
    return await this.functions.get(identifier);
  }

  async setKeystore(key, value) {
    return await this.keystore.set(key, value);
  }

  async getKeystore(key) {
    return await this.keystore.get(key);
  }

  async deleteKeystore(key) {
    return await this.keystore.delete(key);
  }

  async close() {
  }
}
