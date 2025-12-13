/**
 * keystore-operations.js - Key-value storage operations
 *
 * Manages secure key-value storage with persistence
 */

import path from 'path';
import { writeFileAtomicJson } from '@sequentialos/file-operations';

export class KeystoreOperations {
  constructor(basePath, keystoreCache) {
    this.basePath = basePath;
    this.keystoreCache = keystoreCache;
  }

  async persist() {
    const data = Object.fromEntries(this.keystoreCache);
    await writeFileAtomicJson(path.join(this.basePath, 'keystore.json'), data);
  }

  async set(key, value) {
    this.keystoreCache.set(key, value);
    await this.persist();
  }

  async get(key) {
    return this.keystoreCache.get(key) || null;
  }

  async delete(key) {
    this.keystoreCache.delete(key);
    await this.persist();
  }
}
