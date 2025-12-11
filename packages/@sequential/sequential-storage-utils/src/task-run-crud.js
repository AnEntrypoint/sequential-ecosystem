// Task run CRUD operations builder
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

const FIELD_MAP = ['taskName', 'task_identifier', 'status', 'id'];
const NORMALIZER = (n) => ({
  id: n.id,
  taskName: n.taskName || n.task_identifier,
  status: n.status || 'pending',
  input: n.input || {},
  output: n.output || null,
  error: n.error || null,
  startedAt: n.startedAt || n.created_at,
  completedAt: n.completedAt,
  createdAt: n.created_at || n.startedAt,
  updatedAt: n.updated_at || n.startedAt
});

export class TaskRunCRUD {
  constructor() {
    this.serializer = new Serializer();
  }

  buildCreate(input) {
    const record = { ...input };
    record.startedAt = record.startedAt || nowISO();

    const validation = Validators.validateTaskRun?.(record);
    if (validation && !validation.valid) {
      throw new Error(`Invalid task_run: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'task_run');
  }

  buildUpdate(input) {
    if (!input || typeof input !== 'object') return {};
    const updates = { ...input };
    updates.updatedAt = nowISO();
    return this.serializer.prepareForStorage(updates, 'task_run');
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
    const normalized = this.serializer.loadFromStorage(record, 'task_run');
    return NORMALIZER(normalized);
  }
}
