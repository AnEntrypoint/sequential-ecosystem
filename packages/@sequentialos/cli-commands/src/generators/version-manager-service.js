/**
 * Version Manager Service
 * Manages version registration, compatibility, and migrations
 */

import { parseVersion, compareVersions as cmpVersions } from './semantic-versioning-parser.js';

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
      return cmpVersions(v1, v2);
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
