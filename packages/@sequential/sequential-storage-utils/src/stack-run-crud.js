// Stack run CRUD operations builder
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

const FIELD_MAP = ['task_run_id', 'parent_stack_run_id', 'status', 'id', 'operation'];
const NORMALIZER = (n) => ({
  id: n.id,
  task_run_id: n.task_run_id,
  parent_stack_run_id: n.parent_stack_run_id,
  operation: n.operation,
  status: n.status || 'pending',
  input: n.input || {},
  output: n.output || null,
  error: n.error || null,
  createdAt: n.createdAt || n.created_at,
  updatedAt: n.updatedAt || n.updated_at
});

export class StackRunCRUD {
  constructor() {
    this.serializer = new Serializer();
  }

  buildCreate(input) {
    const record = { ...input };
    record.createdAt = record.createdAt || nowISO();

    const validation = Validators.validateStackRun?.(record);
    if (validation && !validation.valid) {
      throw new Error(`Invalid stack_run: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'stack_run');
  }

  buildUpdate(input) {
    if (!input || typeof input !== 'object') return {};
    const updates = { ...input };
    updates.updatedAt = nowISO();
    return this.serializer.prepareForStorage(updates, 'stack_run');
  }

  buildQuery(filter) {
    if (!filter || typeof filter !== 'object') return {};
    const query = {};
    for (const [key, value] of Object.entries(filter)) {
      if (FIELD_MAP.includes(key) && value !== null && value !== undefined) {
        query[key] = value;
      }
    }
    return query;
  }

  normalizeRecord(record) {
    if (!record || typeof record !== 'object') return null;
    const normalized = this.serializer.loadFromStorage(record, 'stack_run');
    return NORMALIZER(normalized);
  }
}
