/**
 * migration-report-generator.js - Migration report generation
 *
 * Generate detailed migration reports and exports
 */

export class MigrationReportGenerator {
  constructor(registry, versionEngine) {
    this.registry = registry;
    this.versionEngine = versionEngine;
  }

  getMigrationReport() {
    const versions = this.versionEngine.getSortedVersions();
    return {
      currentVersion: this.registry.currentVersion,
      availableVersions: versions,
      totalMigrations: this.registry.migrations.size,
      appliedMigrations: this.registry.appliedMigrations.size,
      history: this.registry.migrationHistory,
      migrations: versions.map(version => {
        const migration = this.registry.getMigration(version);
        return {
          version,
          description: migration.description,
          hasRollback: !!migration.rollback,
          created: new Date(migration.created).toISOString()
        };
      })
    };
  }

  exportMigrations() {
    return {
      generated: new Date().toISOString(),
      currentVersion: this.registry.currentVersion,
      migrationCount: this.registry.migrations.size,
      migrations: Array.from(this.registry.migrations.entries()).map(([version, migration]) => ({
        version,
        description: migration.description,
        hasRollback: !!migration.rollback,
        created: new Date(migration.created).toISOString()
      })),
      history: this.registry.migrationHistory
    };
  }
}
