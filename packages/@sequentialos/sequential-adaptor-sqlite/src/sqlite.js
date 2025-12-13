import { StorageAdapter } from '@sequentialos/sequential-adaptor';
import { Serializer, CRUDPatterns } from '@sequentialos/sequential-storage-utils';
import * as init from './sqlite-init.js';
import * as schema from './sqlite-schema.js';
import * as taskRunOps from './sqlite-task-run-ops.js';
import * as stackRunOps from './sqlite-stack-run-ops.js';
import * as keystoreOps from './sqlite-keystore-ops.js';

export class SQLiteAdapter extends StorageAdapter {
  constructor(dbPath = ':memory:') {
    super();
    this.dbPath = dbPath;
    this.db = null;
    this.serializer = new Serializer();
    this.crudPatterns = new CRUDPatterns();
  }

  async init() {
    this.db = await init.initializeDatabase(this.dbPath);
    await schema.createTables(this.db);
  }

  async createTaskRun(taskRun) {
    const lastId = taskRunOps.createTaskRunSQL(this.db, taskRun, this.crudPatterns);
    return this._getTaskRunById(lastId);
  }

  async getTaskRun(id) {
    return this._getTaskRunById(id);
  }

  _getTaskRunById(id) {
    const row = taskRunOps.getTaskRunById(this.db, id);
    if (!row) return null;
    return taskRunOps.parseTaskRunRow(this.serializer, this.crudPatterns, row);
  }

  async updateTaskRun(id, updates) {
    taskRunOps.updateTaskRunSQL(this.db, id, updates, this.crudPatterns);
    return this._getTaskRunById(id);
  }

  async queryTaskRuns(filter) {
    const rows = taskRunOps.queryTaskRunsSQL(this.db, filter);
    return rows.map(row => taskRunOps.parseTaskRunRow(this.serializer, this.crudPatterns, row));
  }

  async createStackRun(stackRun) {
    const lastId = stackRunOps.createStackRunSQL(this.db, stackRun, this.crudPatterns);
    return this._getStackRunById(lastId);
  }

  async getStackRun(id) {
    return this._getStackRunById(id);
  }

  _getStackRunById(id) {
    const row = stackRunOps.getStackRunById(this.db, id);
    if (!row) return null;
    return stackRunOps.parseStackRunRow(this.serializer, this.crudPatterns, row);
  }

  async updateStackRun(id, updates) {
    stackRunOps.updateStackRunSQL(this.db, id, updates, this.crudPatterns);
    return this._getStackRunById(id);
  }

  async queryStackRuns(filter) {
    const rows = stackRunOps.queryStackRunsSQL(this.db, filter);
    return rows.map(row => stackRunOps.parseStackRunRow(this.serializer, this.crudPatterns, row));
  }

  async getPendingStackRuns() {
    const rows = stackRunOps.getPendingStackRunsSQL(this.db);
    return rows.map(row => stackRunOps.parseStackRunRow(this.serializer, this.crudPatterns, row));
  }

  async storeTaskFunction(taskFunction) {
    const identifier = keystoreOps.storeTaskFunctionSQL(this.db, taskFunction, this.crudPatterns);
    return this.getTaskFunction(identifier);
  }

  async getTaskFunction(identifier) {
    const row = keystoreOps.getTaskFunctionSQL(this.db, identifier);
    if (!row) return null;
    return keystoreOps.parseTaskFunctionRow(this.serializer, this.crudPatterns, row);
  }

  async setKeystore(key, value) {
    keystoreOps.setKeystoreSQL(this.db, key, value, this.crudPatterns);
  }

  async getKeystore(key) {
    return keystoreOps.getKeystoreSQL(this.db, key, this.serializer);
  }

  async deleteKeystore(key) {
    keystoreOps.deleteKeystoreSQL(this.db, key);
  }

  async close() {
    await init.persistDatabase(this.db, this.dbPath);
    if (this.db) {
      this.db.close();
    }
  }
}
