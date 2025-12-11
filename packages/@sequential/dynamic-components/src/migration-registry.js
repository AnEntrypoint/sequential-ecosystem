// Migration registry and state management
export class MigrationRegistry {
  constructor() {
    this.migrations = new Map();
    this.appliedMigrations = new Map();
    this.migrationHistory = [];
    this.currentVersion = '1.0.0';
  }

  registerMigration(version, description, migrate, rollback = null) {
    const migration = {
      version,
      description,
      migrate,
      rollback,
      created: Date.now(),
      applied: false
    };

    this.migrations.set(version, migration);
  }

  getMigration(version) {
    return this.migrations.get(version);
  }

  recordApplied(patternId, version, originalPattern, migratedPattern) {
    this.appliedMigrations.set(`${patternId}-${version}`, {
      patternId,
      version,
      appliedAt: Date.now(),
      originalPattern: JSON.parse(JSON.stringify(originalPattern)),
      migratedPattern
    });
  }

  getApplied(patternId, version) {
    return this.appliedMigrations.get(`${patternId}-${version}`);
  }

  recordHistory(type, patternId, version, success, error = null) {
    this.migrationHistory.push({
      type,
      patternId,
      version,
      timestamp: Date.now(),
      success,
      ...(error && { error })
    });
  }

  getHistory() {
    return this.migrationHistory;
  }

  getAllMigrations() {
    return this.migrations;
  }

  getAllApplied() {
    return this.appliedMigrations;
  }
}
