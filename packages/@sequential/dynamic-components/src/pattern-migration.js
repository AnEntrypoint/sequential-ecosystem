class PatternMigration {
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

  applyMigration(patternId, pattern, targetVersion) {
    const migration = this.migrations.get(targetVersion);
    if (!migration) {
      return { success: false, error: `Migration ${targetVersion} not found` };
    }

    try {
      const migratedPattern = migration.migrate(pattern);

      this.appliedMigrations.set(`${patternId}-${targetVersion}`, {
        patternId,
        version: targetVersion,
        appliedAt: Date.now(),
        originalPattern: JSON.parse(JSON.stringify(pattern)),
        migratedPattern
      });

      this.migrationHistory.push({
        type: 'apply',
        patternId,
        version: targetVersion,
        timestamp: Date.now(),
        success: true
      });

      return { success: true, pattern: migratedPattern };
    } catch (error) {
      this.migrationHistory.push({
        type: 'apply',
        patternId,
        version: targetVersion,
        timestamp: Date.now(),
        success: false,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  rollbackMigration(patternId, fromVersion) {
    const migration = this.migrations.get(fromVersion);
    if (!migration || !migration.rollback) {
      return { success: false, error: `Rollback not available for version ${fromVersion}` };
    }

    const key = `${patternId}-${fromVersion}`;
    const applied = this.appliedMigrations.get(key);

    if (!applied) {
      return { success: false, error: `No migration found for ${patternId}@${fromVersion}` };
    }

    try {
      const originalPattern = migration.rollback(applied.migratedPattern);

      this.migrationHistory.push({
        type: 'rollback',
        patternId,
        version: fromVersion,
        timestamp: Date.now(),
        success: true
      });

      return { success: true, pattern: originalPattern };
    } catch (error) {
      this.migrationHistory.push({
        type: 'rollback',
        patternId,
        version: fromVersion,
        timestamp: Date.now(),
        success: false,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  migratePattern(pattern, fromVersion, toVersion) {
    let current = pattern;
    const versions = this.getVersionSequence(fromVersion, toVersion);

    for (const version of versions) {
      const migration = this.migrations.get(version);
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

  getVersionSequence(fromVersion, toVersion) {
    const versions = Array.from(this.migrations.keys())
      .sort((a, b) => this.compareVersions(a, b));

    const fromIndex = versions.indexOf(fromVersion);
    const toIndex = versions.indexOf(toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    return versions.slice(fromIndex + 1, toIndex + 1);
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 !== p2) return p1 - p2;
    }

    return 0;
  }

  createMigration(version, description) {
    return {
      version,
      description,
      changes: [],
      addPropertyChange: function(path, oldValue, newValue) {
        this.changes.push({ type: 'property', path, oldValue, newValue });
        return this;
      },
      addRenameProperty: function(oldPath, newPath) {
        this.changes.push({ type: 'rename', oldPath, newPath });
        return this;
      },
      addRemoveProperty: function(path) {
        this.changes.push({ type: 'remove', path });
        return this;
      },
      generateMigrate: function(pattern) {
        let migrated = JSON.parse(JSON.stringify(pattern));

        this.changes.forEach(change => {
          if (change.type === 'property') {
            this.setNestedProperty(migrated, change.path, change.newValue);
          } else if (change.type === 'rename') {
            const value = this.getNestedProperty(migrated, change.oldPath);
            if (value !== undefined) {
              this.setNestedProperty(migrated, change.newPath, value);
              this.deleteNestedProperty(migrated, change.oldPath);
            }
          } else if (change.type === 'remove') {
            this.deleteNestedProperty(migrated, change.path);
          }
        });

        return migrated;
      },
      setNestedProperty: function(obj, path, value) {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
      },
      getNestedProperty: function(obj, path) {
        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = current[part];
          } else {
            return undefined;
          }
        }

        return current;
      },
      deleteNestedProperty: function(obj, path) {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]]) {
            current = current[parts[i]];
          } else {
            return;
          }
        }

        delete current[parts[parts.length - 1]];
      }
    };
  }

  getMigrationReport() {
    const versions = Array.from(this.migrations.keys()).sort((a, b) => this.compareVersions(a, b));

    return {
      currentVersion: this.currentVersion,
      availableVersions: versions,
      totalMigrations: this.migrations.size,
      appliedMigrations: this.appliedMigrations.size,
      history: this.migrationHistory,
      migrations: versions.map(version => {
        const migration = this.migrations.get(version);
        return {
          version,
          description: migration.description,
          hasRollback: !!migration.rollback,
          created: new Date(migration.created).toISOString()
        };
      })
    };
  }

  buildMigrationUI() {
    const versions = Array.from(this.migrations.keys()).sort((a, b) => this.compareVersions(a, b));

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📦 Pattern Migrations',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px'
          },
          children: [
            {
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: 'Current Version',
                  style: { margin: 0, fontSize: '9px', color: '#858585' }
                },
                {
                  type: 'heading',
                  content: this.currentVersion,
                  level: 4,
                  style: { margin: '4px 0 0 0', fontSize: '12px', color: '#667eea' }
                }
              ]
            },
            {
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: 'Available Migrations',
                  style: { margin: 0, fontSize: '9px', color: '#858585' }
                },
                {
                  type: 'heading',
                  content: this.migrations.size.toString(),
                  level: 4,
                  style: { margin: '4px 0 0 0', fontSize: '12px', color: '#4ade80' }
                }
              ]
            }
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: versions.slice(0, 5).map(version => {
            const migration = this.migrations.get(version);
            return {
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px',
                borderLeft: '3px solid #667eea'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `v${version}${migration.rollback ? ' (reversible)' : ''}`,
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#d4d4d4'
                  }
                },
                {
                  type: 'paragraph',
                  content: migration.description,
                  style: {
                    margin: '2px 0 0 0',
                    fontSize: '9px',
                    color: '#858585'
                  }
                }
              ]
            };
          })
        }
      ]
    };
  }

  exportMigrations() {
    return {
      generated: new Date().toISOString(),
      currentVersion: this.currentVersion,
      migrationCount: this.migrations.size,
      migrations: Array.from(this.migrations.entries()).map(([version, migration]) => ({
        version,
        description: migration.description,
        hasRollback: !!migration.rollback,
        created: new Date(migration.created).toISOString()
      })),
      history: this.migrationHistory
    };
  }
}

function createPatternMigration() {
  return new PatternMigration();
}

export { PatternMigration, createPatternMigration };
