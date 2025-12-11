export function generateVersionManagementTemplate() {
  return `/**
 * Semantic Versioning
 *
 * Manage versions and migrations for tasks, flows, and tools.
 */

import { createVersionManager } from '@sequentialos/semantic-versioning';

const versionManager = createVersionManager();

// Register versions
versionManager
  .register('task', 'processUser', '1.0.0', 'task code here', {
    description: 'Process user data',
    author: 'dev-team'
  })
  .register('task', 'processUser', '1.1.0', 'updated task code', {
    description: 'Process user data with validation',
    author: 'dev-team'
  })
  .register('task', 'processUser', '2.0.0', 'breaking change code', {
    description: 'Process user data with new schema',
    author: 'dev-team',
    breaking: true
  });

// Register migrations
versionManager
  .registerMigration('task', 'processUser', '1.0.0', '1.1.0', async (data) => {
    return { ...data, validated: true };
  })
  .registerMigration('task', 'processUser', '1.1.0', '2.0.0', async (data) => {
    return { ...data, schema: 'v2', validated: true };
  });

// Get version history
export function getVersionHistory() {
  return versionManager.getVersionHistory('task', 'processUser');
}

// Check compatibility
export function isCompatible(v1, v2) {
  return versionManager.isCompatible(v1, v2);
}

// Migrate data
export async function migrateData(data, fromVersion, toVersion) {
  return await versionManager.migrate('task', 'processUser', data, fromVersion, toVersion);
}

// Get breaking changes
export function getBreakingChanges() {
  return versionManager.getBreakingChanges('task', 'processUser');
}
`;
}
