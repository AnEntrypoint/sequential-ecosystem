/**
 * task-run-operations.js - Task run CRUD operations
 *
 * Manages task run creation, retrieval, updates, and queries
 */

import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicJson } from '@sequentialos/file-operations';

export class TaskRunOperations {
  constructor(basePath, taskRunsCache, crud) {
    this.basePath = basePath;
    this.taskRunsCache = taskRunsCache;
    this.crud = crud;
  }

  async create(taskRun) {
    const id = taskRun.id || randomUUID();
    const record = this.crud.buildTaskRunCreate({ id, ...taskRun });
    const normalized = this.crud.normalizeTaskRunRecord(record);
    this.taskRunsCache.set(id, normalized);
    await writeFileAtomicJson(path.join(this.basePath, `task-run-${id}.json`), normalized);
    return normalized;
  }

  async get(id) {
    const cached = this.taskRunsCache.get(id);
    return cached ? this.crud.normalizeTaskRunRecord(cached) : null;
  }

  async update(id, updates) {
    const record = this.taskRunsCache.get(id);
    if (!record) return null;
    const prepared = this.crud.buildTaskRunUpdate(updates);
    const merged = this.crud.mergeUpdates(record, prepared);
    const normalized = this.crud.normalizeTaskRunRecord(merged);
    this.taskRunsCache.set(id, normalized);
    await writeFileAtomicJson(path.join(this.basePath, `task-run-${id}.json`), normalized);
    return normalized;
  }

  async query(filter) {
    const records = Array.from(this.taskRunsCache.values());
    const query = this.crud.buildTaskRunQuery(filter);
    const filtered = this.crud.filterRecords(records, query);
    return filtered.map(r => this.crud.normalizeTaskRunRecord(r));
  }
}
