/**
 * storage-manager-code.js
 *
 * localStorage storage manager code template for persistence injection
 */

export const STORAGE_MANAGER_CODE = `
function createStorageManager(appId) {
  const stateKey = \`app-state:\${appId}\`;
  const expiryKey = \`app-state-expiry:\${appId}\`;
  return {
    save(state, ttlMs = null) {
      try {
        localStorage.setItem(stateKey, JSON.stringify(state));
        if (ttlMs) {
          const expiryTime = Date.now() + ttlMs;
          localStorage.setItem(expiryKey, expiryTime.toString());
        }
      } catch (error) {
        logger.error(\`[Storage] Failed to save state for \${appId}:\`, error);
      }
    },
    load() {
      try {
        const expiryTime = localStorage.getItem(expiryKey);
        if (expiryTime && Date.now() > parseInt(expiryTime)) {
          this.clear();
          return null;
        }
        const stateStr = localStorage.getItem(stateKey);
        return stateStr ? JSON.parse(stateStr) : null;
      } catch (error) {
        logger.error(\`[Storage] Failed to load state for \${appId}:\`, error);
        return null;
      }
    },
    clear() {
      try {
        localStorage.removeItem(stateKey);
        localStorage.removeItem(expiryKey);
      } catch (error) {
        logger.error(\`[Storage] Failed to clear state for \${appId}:\`, error);
      }
    }
  };
}`;
