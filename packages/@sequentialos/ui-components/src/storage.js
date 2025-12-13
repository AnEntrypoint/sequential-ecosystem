export function createStorageManager(appId, options = {}) {
  const { ttlMs = 10 * 60 * 1000 } = options;
  const prefix = `sequential:${appId}:`;

  return {
    save(key, state) {
      try {
        const data = {
          state,
          timestamp: Date.now(),
          ttlMs
        };
        localStorage.setItem(prefix + key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error(`Storage save failed for ${key}:`, e);
        return false;
      }
    },

    load(key) {
      try {
        const item = localStorage.getItem(prefix + key);
        if (!item) return null;

        const data = JSON.parse(item);
        const age = Date.now() - data.timestamp;

        if (age > data.ttlMs) {
          localStorage.removeItem(prefix + key);
          return null;
        }

        return data.state;
      } catch (e) {
        console.error(`Storage load failed for ${key}:`, e);
        return null;
      }
    },

    clear(key) {
      localStorage.removeItem(prefix + key);
    },

    clearAll() {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(prefix)) {
          localStorage.removeItem(k);
        }
      });
    }
  };
}
