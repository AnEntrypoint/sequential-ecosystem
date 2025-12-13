// Keystore CRUD operations builder
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

const FIELD_MAP = ['key'];
const NORMALIZER = (n) => ({
  key: n.key,
  value: n.value,
  metadata: n.metadata || {},
  createdAt: n.createdAt || n.created_at,
  updatedAt: n.updatedAt || n.updated_at
});

export class KeystoreCRUD {
  constructor() {
    this.serializer = new Serializer();
  }

  buildCreate(input) {
    const record = { ...input };

    const validation = Validators.validateKeystore?.(record);
    if (validation && !validation.valid) {
      throw new Error(`Invalid keystore: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'keystore');
  }

  buildUpdate(input) {
    if (!input || typeof input !== 'object') return {};
    const updates = { ...input };
    updates.updatedAt = nowISO();
    return this.serializer.prepareForStorage(updates, 'keystore');
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
    const normalized = this.serializer.loadFromStorage(record, 'keystore');
    return NORMALIZER(normalized);
  }
}
