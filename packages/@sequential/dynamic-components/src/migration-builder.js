// Migration definition builder with fluent API
import { MigrationPropertyHelper } from './migration-property-helper.js';

export class MigrationBuilder {
  createMigration(version, description) {
    const helper = new MigrationPropertyHelper();

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
            helper.setNestedProperty(migrated, change.path, change.newValue);
          } else if (change.type === 'rename') {
            const value = helper.getNestedProperty(migrated, change.oldPath);
            if (value !== undefined) {
              helper.setNestedProperty(migrated, change.newPath, value);
              helper.deleteNestedProperty(migrated, change.oldPath);
            }
          } else if (change.type === 'remove') {
            helper.deleteNestedProperty(migrated, change.path);
          }
        });

        return migrated;
      },
      setNestedProperty: function(obj, path, value) {
        helper.setNestedProperty(obj, path, value);
      },
      getNestedProperty: function(obj, path) {
        return helper.getNestedProperty(obj, path);
      },
      deleteNestedProperty: function(obj, path) {
        helper.deleteNestedProperty(obj, path);
      }
    };
  }
}
