/**
 * Semantic Versioning Manager
 * Creates version managers for resource versioning and migration
 *
 * Delegates to:
 * - version-manager-service: Version registration, comparison, migration, history
 */

import { createVersionManager } from './version-manager-service.js';

export { createVersionManager };
