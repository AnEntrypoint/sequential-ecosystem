export function parseVersion(versionStr) {
  const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionStr}`);
  }

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    toString: () => versionStr
  };
}

export function compareVersions(v1, v2) {
  const ver1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
  const ver2 = typeof v2 === 'string' ? parseVersion(v2) : v2;

  if (ver1.major !== ver2.major) return ver1.major - ver2.major;
  if (ver1.minor !== ver2.minor) return ver1.minor - ver2.minor;
  if (ver1.patch !== ver2.patch) return ver1.patch - ver2.patch;

  return 0;
}

export function createVersionManager() {
  const versions = new Map();
  const migrations = new Map();

  return {
    register(resourceType, resourceName, version, code, metadata = {}) {
      const versionKey = `${resourceType}:${resourceName}@${version}`;

      versions.set(versionKey, {
        type: resourceType,
        name: resourceName,
        version: parseVersion(version),
        code,
        metadata: {
          author: metadata.author,
          description: metadata.description,
          breaking: metadata.breaking || false,
          deprecated: metadata.deprecated || false,
          releaseDate: new Date().toISOString(),
          ...metadata
        }
      });

      return this;
    },

    registerMigration(resourceType, resourceName, fromVersion, toVersion, migrationFn) {
      const migrationKey = `${resourceType}:${resourceName}@${fromVersion}->${toVersion}`;

      migrations.set(migrationKey, {
        from: parseVersion(fromVersion),
        to: parseVersion(toVersion),
        fn: migrationFn,
        registeredAt: new Date().toISOString()
      });

      return this;
    },

    compareVersions(v1, v2) {
      const ver1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
      const ver2 = typeof v2 === 'string' ? parseVersion(v2) : v2;

      if (ver1.major !== ver2.major) return ver1.major - ver2.major;
      if (ver1.minor !== ver2.minor) return ver1.minor - ver2.minor;
      if (ver1.patch !== ver2.patch) return ver1.patch - ver2.patch;

      return 0;
    },

    isCompatible(v1, v2) {
      const ver1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
      const ver2 = typeof v2 === 'string' ? parseVersion(v2) : v2;

      return ver1.major === ver2.major;
    },

    getVersion(resourceType, resourceName, version) {
      const versionKey = `${resourceType}:${resourceName}@${version}`;
      return versions.get(versionKey);
    },

    getLatestVersion(resourceType, resourceName) {
      const prefix = `${resourceType}:${resourceName}@`;
      let latest = null;

      for (const key of versions.keys()) {
        if (key.startsWith(prefix)) {
          const resource = versions.get(key);
          if (!latest || this.compareVersions(resource.version, latest.version) > 0) {
            latest = resource;
          }
        }
      }

      return latest;
    },

    async migrate(resourceType, resourceName, data, fromVersion, toVersion) {
      const fromVer = parseVersion(fromVersion);
      const toVer = parseVersion(toVersion);

      let current = { ...data, version: fromVersion };
      let currentVer = fromVer;

      while (this.compareVersions(currentVer, toVer) < 0) {
        const nextMinor = currentVer.minor + 1;
        const nextVersionStr = `${currentVer.major}.${nextMinor}.0`;
        const migrationKey = `${resourceType}:${resourceName}@${currentVer.toString()}->${nextVersionStr}`;

        const migration = migrations.get(migrationKey);
        if (!migration) {
          throw new Error(`No migration found: ${migrationKey}`);
        }

        current = await migration.fn(current);
        current.version = nextVersionStr;
        currentVer = parseVersion(nextVersionStr);
      }

      return current;
    },

    getVersionHistory(resourceType, resourceName) {
      const prefix = `${resourceType}:${resourceName}@`;
      const history = [];

      for (const key of versions.keys()) {
        if (key.startsWith(prefix)) {
          const resource = versions.get(key);
          history.push({
            version: resource.version.toString(),
            metadata: resource.metadata
          });
        }
      }

      return history.sort((a, b) => this.compareVersions(a.version, b.version));
    },

    getBreakingChanges(resourceType, resourceName) {
      const history = this.getVersionHistory(resourceType, resourceName);
      return history
        .filter(v => versions.get(`${resourceType}:${resourceName}@${v.version}`).metadata.breaking)
        .map(v => ({
          version: v.version,
          description: v.metadata.description
        }));
    }
  };
}

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

export function validateVersionConfig(version) {
  const errors = [];

  try {
    parseVersion(version);
  } catch (error) {
    errors.push(error.message);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getNextVersion(currentVersion, changeType = 'patch') {
  const ver = parseVersion(currentVersion);

  switch (changeType) {
    case 'major':
      return `${ver.major + 1}.0.0`;
    case 'minor':
      return `${ver.major}.${ver.minor + 1}.0`;
    case 'patch':
      return `${ver.major}.${ver.minor}.${ver.patch + 1}`;
    default:
      throw new Error(`Unknown change type: ${changeType}`);
  }
}
