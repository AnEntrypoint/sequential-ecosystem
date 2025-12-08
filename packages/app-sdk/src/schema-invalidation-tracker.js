export function createSchemaInvalidationTracker() {
  const schemaVersions = new Map();
  const subscribers = new Map();

  return {
    registerToolSchema(toolName, schemaVersion = 1) {
      const previous = schemaVersions.get(toolName);
      schemaVersions.set(toolName, {
        version: schemaVersion,
        registeredAt: new Date().toISOString(),
        previousVersion: previous ? previous.version : null
      });

      if (previous && previous.version !== schemaVersion) {
        this.broadcastInvalidation(toolName, previous.version, schemaVersion);
      }

      return {
        toolName: toolName,
        version: schemaVersion,
        isUpdate: !!previous,
        previousVersion: previous ? previous.version : null
      };
    },

    broadcastInvalidation(toolName, fromVersion, toVersion) {
      const event = {
        type: 'schema:invalidated',
        toolName: toolName,
        fromVersion: fromVersion,
        toVersion: toVersion,
        timestamp: new Date().toISOString()
      };

      if (subscribers.has(toolName)) {
        const callbacks = subscribers.get(toolName);
        for (const callback of callbacks) {
          try {
            callback(event);
          } catch (err) {
          }
        }
      }

      const globalCallbacks = subscribers.get('*') || [];
      for (const callback of globalCallbacks) {
        try {
          callback(event);
        } catch (err) {
        }
      }

      return event;
    },

    onSchemaInvalidation(toolName, callback) {
      if (!subscribers.has(toolName)) {
        subscribers.set(toolName, []);
      }

      const callbacks = subscribers.get(toolName);
      callbacks.push(callback);

      return function unsubscribe() {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    },

    onAnySchemaInvalidation(callback) {
      if (!subscribers.has('*')) {
        subscribers.set('*', []);
      }
      const callbacks = subscribers.get('*');
      callbacks.push(callback);

      return function unsubscribe() {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    },

    getSchemaVersion(toolName) {
      const entry = schemaVersions.get(toolName);
      return entry ? entry.version : null;
    },

    hasSchemaChanged(toolName, previousVersion) {
      const currentVersion = this.getSchemaVersion(toolName);
      return currentVersion !== null && currentVersion !== previousVersion;
    },

    getAllSchemaVersions() {
      const versions = {};
      for (const entry of schemaVersions.entries()) {
        versions[entry[0]] = entry[1].version;
      }
      return versions;
    },

    getSchemaHistory(toolName) {
      const entry = schemaVersions.get(toolName);
      if (!entry) return null;

      return {
        toolName: toolName,
        currentVersion: entry.version,
        previousVersion: entry.previousVersion,
        registeredAt: entry.registeredAt
      };
    }
  };
}
