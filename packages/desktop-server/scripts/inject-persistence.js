/**
 * inject-persistence.js - Persistence Injection Facade
 *
 * Delegates to focused modules:
 * - storage-manager-code: localStorage manager code template
 * - app-init-hooks: App-specific initialization hooks
 * - persistence-injector: Core injection logic
 */

import path from 'path';
import { STORAGE_MANAGER_CODE } from './storage-manager-code.js';
import { INIT_HOOKS } from './app-init-hooks.js';
import { injectPersistence as performInjection } from './persistence-injector.js';

const APPS_DIR = '../';

async function injectPersistence() {
  return await performInjection.call(this, APPS_DIR, STORAGE_MANAGER_CODE, INIT_HOOKS);
}

injectPersistence().catch(console.error);
