/**
 * Storage adapter factory wrappers
 * Convenient helpers for storage backend creation
 */

import {
  createAdapter,
  createRunner
} from '@sequentialos/sequential-adaptor';

/**
 * Create folder-based storage adapter (default, zero-config)
 * @param {string} basePath - Base directory path (default: ./tasks)
 * @returns {Promise<Object>} Initialized folder adapter
 */
export async function createFolderAdapter(basePath = './tasks') {
  return createAdapter('folder', { basePath });
}

/**
 * Create SQLite storage adapter
 * @param {string} dbPath - Database file path (default: ./tasks.db)
 * @returns {Promise<Object>} Initialized SQLite adapter
 */
export async function createSQLiteAdapter(dbPath = './tasks.db') {
  return createAdapter('sqlite', { dbPath });
}

/**
 * Create Supabase storage adapter
 * @param {Object} config - Supabase configuration (url, key, etc.)
 * @returns {Promise<Object>} Initialized Supabase adapter
 */
export async function createSupabaseAdapter(config = {}) {
  return createAdapter('supabase', config);
}

/**
 * Create default runner (sequential-js with implicit xstate)
 * @param {Object} config - Runner configuration
 * @returns {Promise<Object>} Initialized sequential-js runner
 */
export async function createDefaultRunner(config = {}) {
  return createRunner('sequential-js', config);
}

/**
 * Create flow runner (explicit xstate with state graphs)
 * @param {Object} config - Runner configuration
 * @returns {Promise<Object>} Initialized flow runner
 */
export async function createFlowRunner(config = {}) {
  return createRunner('flow', config);
}

/**
 * Create sequential-os runner (shell command execution with layers)
 * @param {string} stateDir - State directory path
 * @returns {Promise<Object>} Initialized sequential-os runner
 */
export async function createSequentialOSRunner(stateDir = '.statekit') {
  return createRunner('sequential-os', { stateDir });
}

export default {
  createFolderAdapter,
  createSQLiteAdapter,
  createSupabaseAdapter,
  createDefaultRunner,
  createFlowRunner,
  createSequentialOSRunner
};
