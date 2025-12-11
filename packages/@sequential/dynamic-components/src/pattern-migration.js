// Pattern migration facade - maintains 100% backward compatibility
import { MigrationRegistry } from './migration-registry.js';
import { MigrationVersionEngine } from './migration-version-engine.js';
import { MigrationApplicator } from './migration-applicator.js';
import { MigrationBuilder } from './migration-builder.js';
import { MigrationReporting } from './migration-reporting.js';

class PatternMigration {
  constructor() {
    this.registry = new MigrationRegistry();
    this.versionEngine = new MigrationVersionEngine(this.registry);
    this.applicator = new MigrationApplicator(this.registry, this.versionEngine);
    this.builder = new MigrationBuilder();
    this.reporting = new MigrationReporting(this.registry, this.versionEngine);

    // Expose for backward compatibility
    this.migrations = this.registry.migrations;
    this.appliedMigrations = this.registry.appliedMigrations;
    this.migrationHistory = this.registry.migrationHistory;
    this.currentVersion = this.registry.currentVersion;
  }

  registerMigration(version, description, migrate, rollback = null) {
    return this.registry.registerMigration(version, description, migrate, rollback);
  }

  applyMigration(patternId, pattern, targetVersion) {
    return this.applicator.applyMigration(patternId, pattern, targetVersion);
  }

  rollbackMigration(patternId, fromVersion) {
    return this.applicator.rollbackMigration(patternId, fromVersion);
  }

  migratePattern(pattern, fromVersion, toVersion) {
    return this.applicator.migratePattern(pattern, fromVersion, toVersion);
  }

  getVersionSequence(fromVersion, toVersion) {
    return this.versionEngine.getVersionSequence(fromVersion, toVersion);
  }

  compareVersions(v1, v2) {
    return this.versionEngine.compareVersions(v1, v2);
  }

  createMigration(version, description) {
    return this.builder.createMigration(version, description);
  }

  getMigrationReport() {
    return this.reporting.getMigrationReport();
  }

  buildMigrationUI() {
    return this.reporting.buildMigrationUI();
  }

  exportMigrations() {
    return this.reporting.exportMigrations();
  }
}

function createPatternMigration() {
  return new PatternMigration();
}

export { PatternMigration, createPatternMigration };
