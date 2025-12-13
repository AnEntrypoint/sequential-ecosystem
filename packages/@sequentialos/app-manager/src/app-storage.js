// App state storage manager with TTL support
export function createStorageManager(appId) {
  const stateKey = `app-state:${appId}`;
  const expiryKey = `app-state-expiry:${appId}`;

  return {
    save: (state, ttlMs = null) => {
      try {
        localStorage.setItem(stateKey, JSON.stringify(state));
        if (ttlMs) {
          const expiryTime = Date.now() + ttlMs;
          localStorage.setItem(expiryKey, expiryTime.toString());
        }
      } catch (e) {
        console.error('[Storage] Failed to save:', e);
      }
    },
    load: () => {
      try {
        const expiryTime = localStorage.getItem(expiryKey);
        if (expiryTime && Date.now() > parseInt(expiryTime)) {
          clear();
          return null;
        }
        const stateStr = localStorage.getItem(stateKey);
        return stateStr ? JSON.parse(stateStr) : null;
      } catch (e) {
        console.error('[Storage] Failed to load:', e);
        return null;
      }
    },
    clear: () => {
      try {
        localStorage.removeItem(stateKey);
        localStorage.removeItem(expiryKey);
      } catch (e) {
        console.error('[Storage] Failed to clear:', e);
      }
    }
  };
}
