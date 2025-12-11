/**
 * supabase.js - Facade for Supabase storage adapter
 *
 * Delegates to focused modules:
 * - task-run-operations: Task run CRUD
 * - stack-run-operations: Stack run CRUD
 * - task-function-operations: Task function storage
 * - keystore-operations: Credential management
 */

import { createClient } from '@supabase/supabase-js';
import { StorageAdapter } from '@sequentialos/sequential-adaptor';
import { createTaskRunOperations } from './task-run-operations.js';
import { createStackRunOperations } from './stack-run-operations.js';
import { createTaskFunctionOperations } from './task-function-operations.js';
import { createKeystoreOperations } from './keystore-operations.js';

/**
 * Supabase storage adapter
 * Stores task data in Supabase database
 */
export class SupabaseAdapter extends StorageAdapter {
  constructor(url, serviceKey, anonKey) {
    super();
    this.url = url;
    this.serviceKey = serviceKey;
    this.anonKey = anonKey;
    this.client = null;
    this.admin = null;
  }

  async init() {
    this.client = createClient(this.url, this.anonKey);
    this.admin = createClient(this.url, this.serviceKey);

    // Initialize operation modules
    this.taskRunOps = createTaskRunOperations(this.admin, this.client);
    this.stackRunOps = createStackRunOperations(this.admin, this.client);
    this.taskFunctionOps = createTaskFunctionOperations(this.admin, this.client);
    this.keystoreOps = createKeystoreOperations(this.admin, this.client);
  }

  // Task run operations
  async createTaskRun(taskRun) {
    return this.taskRunOps.createTaskRun(taskRun);
  }

  async getTaskRun(id) {
    return this.taskRunOps.getTaskRun(id);
  }

  async updateTaskRun(id, updates) {
    return this.taskRunOps.updateTaskRun(id, updates);
  }

  async queryTaskRuns(filter) {
    return this.taskRunOps.queryTaskRuns(filter);
  }

  // Stack run operations
  async createStackRun(stackRun) {
    return this.stackRunOps.createStackRun(stackRun);
  }

  async getStackRun(id) {
    return this.stackRunOps.getStackRun(id);
  }

  async updateStackRun(id, updates) {
    return this.stackRunOps.updateStackRun(id, updates);
  }

  async queryStackRuns(filter) {
    return this.stackRunOps.queryStackRuns(filter);
  }

  async getPendingStackRuns() {
    return this.stackRunOps.getPendingStackRuns();
  }

  // Task function operations
  async storeTaskFunction(taskFunction) {
    return this.taskFunctionOps.storeTaskFunction(taskFunction);
  }

  async getTaskFunction(identifier) {
    return this.taskFunctionOps.getTaskFunction(identifier);
  }

  // Keystore operations
  async setKeystore(key, value) {
    return this.keystoreOps.setKeystore(key, value);
  }

  async getKeystore(key) {
    return this.keystoreOps.getKeystore(key);
  }

  async deleteKeystore(key) {
    return this.keystoreOps.deleteKeystore(key);
  }

  async close() {
    // Supabase client doesn't need explicit close
  }
}
