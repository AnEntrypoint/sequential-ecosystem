/**
 * stack-run-operations.js - Stack run CRUD operations
 *
 * Manages stack run creation, retrieval, updates, queries, and status tracking
 */

import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicJson } from '@sequentialos/file-operations';

export class StackRunOperations {
  constructor(basePath, stackRunsCache, crud) {
    this.basePath = basePath;
    this.stackRunsCache = stackRunsCache;
    this.crud = crud;
  }

  async create(stackRun) {
    const id = stackRun.id || randomUUID();
    const record = this.crud.buildStackRunCreate({ id, ...stackRun });
    const normalized = this.crud.normalizeStackRunRecord(record);
    this.stackRunsCache.set(id, normalized);
    await writeFileAtomicJson(path.join(this.basePath, `stack-run-${id}.json`), normalized);
    return normalized;
  }

  async get(id) {
    const cached = this.stackRunsCache.get(id);
    return cached ? this.crud.normalizeStackRunRecord(cached) : null;
  }

  async update(id, updates) {
    const record = this.stackRunsCache.get(id);
    if (!record) return null;
    const prepared = this.crud.buildStackRunUpdate(updates);
    const merged = this.crud.mergeUpdates(record, prepared);
    const normalized = this.crud.normalizeStackRunRecord(merged);
    this.stackRunsCache.set(id, normalized);
    await writeFileAtomicJson(path.join(this.basePath, `stack-run-${id}.json`), normalized);
    return normalized;
  }

  async query(filter) {
    const records = Array.from(this.stackRunsCache.values());
    const query = this.crud.buildStackRunQuery(filter);
    const filtered = this.crud.filterRecords(records, query);
    return filtered.map(r => this.crud.normalizeStackRunRecord(r));
  }

  async getPending() {
    const records = Array.from(this.stackRunsCache.values());
    return records.filter(run => run.status === 'pending').map(r => this.crud.normalizeStackRunRecord(r));
  }
}
