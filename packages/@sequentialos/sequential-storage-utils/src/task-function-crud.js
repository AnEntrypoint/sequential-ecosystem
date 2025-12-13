// Task function CRUD operations builder
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

const FIELD_MAP = ['id', 'name'];
const NORMALIZER = (n) => ({
  id: n.id,
  name: n.name,
  code: n.code,
  metadata: n.metadata || {},
  createdAt: n.createdAt || n.created_at,
  updatedAt: n.updatedAt || n.updated_at
});

export class TaskFunctionCRUD {
  constructor() {
    this.serializer = new Serializer();
  }

  buildCreate(input) {
    const record = { ...input };

    const validation = Validators.validateTaskFunction?.(record);
    if (validation && !validation.valid) {
      throw new Error(`Invalid task_function: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'task_function');
  }

  buildUpdate(input) {
    if (!input || typeof input !== 'object') return {};
    const updates = { ...input };
    updates.updatedAt = nowISO();
    return this.serializer.prepareForStorage(updates, 'task_function');
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
    const normalized = this.serializer.loadFromStorage(record, 'task_function');
    return NORMALIZER(normalized);
  }
}
