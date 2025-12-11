// Facade maintaining 100% backward compatibility with CRUD patterns
import { TaskRunCRUD } from './task-run-crud.js';
import { StackRunCRUD } from './stack-run-crud.js';
import { TaskFunctionCRUD } from './task-function-crud.js';
import { KeystoreCRUD } from './keystore-crud.js';

export class CRUDPatterns {
  constructor() {
    this.taskRunCRUD = new TaskRunCRUD();
    this.stackRunCRUD = new StackRunCRUD();
    this.taskFunctionCRUD = new TaskFunctionCRUD();
    this.keystoreCRUD = new KeystoreCRUD();
  }

  buildTaskRunCreate(input) {
    return this.taskRunCRUD.buildCreate(input);
  }

  buildTaskRunUpdate(input) {
    return this.taskRunCRUD.buildUpdate(input);
  }

  buildTaskRunQuery(filter) {
    return this.taskRunCRUD.buildQuery(filter);
  }

  normalizeTaskRunRecord(record) {
    return this.taskRunCRUD.normalizeRecord(record);
  }

  buildStackRunCreate(input) {
    return this.stackRunCRUD.buildCreate(input);
  }

  buildStackRunUpdate(input) {
    return this.stackRunCRUD.buildUpdate(input);
  }

  buildStackRunQuery(filter) {
    return this.stackRunCRUD.buildQuery(filter);
  }

  normalizeStackRunRecord(record) {
    return this.stackRunCRUD.normalizeRecord(record);
  }

  buildTaskFunctionCreate(input) {
    return this.taskFunctionCRUD.buildCreate(input);
  }

  buildTaskFunctionUpdate(input) {
    return this.taskFunctionCRUD.buildUpdate(input);
  }

  normalizeTaskFunctionRecord(record) {
    return this.taskFunctionCRUD.normalizeRecord(record);
  }

  buildKeystoreCreate(input) {
    return this.keystoreCRUD.buildCreate(input);
  }

  buildKeystoreUpdate(input) {
    return this.keystoreCRUD.buildUpdate(input);
  }

  normalizeKeystoreRecord(record) {
    return this.keystoreCRUD.normalizeRecord(record);
  }

  buildFilterQuery(filter, recordType = null) {
    // Generic filter builder
    if (!filter || typeof filter !== 'object') {
      return {};
    }
    const query = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== null && value !== undefined) {
        query[key] = value;
      }
    }
    return query;
  }

  filterRecords(records, filter) {
    if (!Array.isArray(records)) {
      return [];
    }

    if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
      return records;
    }

    return records.filter(record => {
      for (const [key, value] of Object.entries(filter)) {
        if (!(key in record)) {
          return false;
        }
        if (record[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  mergeUpdates(original, updates) {
    if (!original || typeof original !== 'object') {
      return updates;
    }

    if (!updates || typeof updates !== 'object') {
      return original;
    }

    const merged = { ...original };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }

    return merged;
  }

  normalizeRecord(record, recordType = null) {
    // Generic normalizer - delegates to specific type if available
    if (recordType === 'task_run') return this.normalizeTaskRunRecord(record);
    if (recordType === 'stack_run') return this.normalizeStackRunRecord(record);
    if (recordType === 'task_function') return this.normalizeTaskFunctionRecord(record);
    if (recordType === 'keystore') return this.normalizeKeystoreRecord(record);
    return record;
  }
}
