// Migration application and rollback operations
export class MigrationApplicator {
  constructor(registry, versionEngine) {
    this.registry = registry;
    this.versionEngine = versionEngine;
  }

  applyMigration(patternId, pattern, targetVersion) {
    const migration = this.registry.getMigration(targetVersion);
    if (!migration) {
      return { success: false, error: `Migration ${targetVersion} not found` };
    }

    try {
      const migratedPattern = migration.migrate(pattern);

      this.registry.recordApplied(patternId, targetVersion, pattern, migratedPattern);
      this.registry.recordHistory('apply', patternId, targetVersion, true);

      return { success: true, pattern: migratedPattern };
    } catch (error) {
      this.registry.recordHistory('apply', patternId, targetVersion, false, error.message);
      return { success: false, error: error.message };
    }
  }

  rollbackMigration(patternId, fromVersion) {
    const migration = this.registry.getMigration(fromVersion);
    if (!migration || !migration.rollback) {
      return { success: false, error: `Rollback not available for version ${fromVersion}` };
    }

    const applied = this.registry.getApplied(patternId, fromVersion);

    if (!applied) {
      return { success: false, error: `No migration found for ${patternId}@${fromVersion}` };
    }

    try {
      const originalPattern = migration.rollback(applied.migratedPattern);

      this.registry.recordHistory('rollback', patternId, fromVersion, true);

      return { success: true, pattern: originalPattern };
    } catch (error) {
      this.registry.recordHistory('rollback', patternId, fromVersion, false, error.message);
      return { success: false, error: error.message };
    }
  }

  migratePattern(pattern, fromVersion, toVersion) {
    let current = pattern;
    const versions = this.versionEngine.getVersionSequence(fromVersion, toVersion);

    for (const version of versions) {
      const migration = this.registry.getMigration(version);
      if (!migration) {
        return { success: false, error: `Missing migration for version ${version}` };
      }

      try {
        current = migration.migrate(current);
      } catch (error) {
        return { success: false, error: error.message, stoppedAt: version };
      }
    }

    return { success: true, pattern: current };
  }
}
