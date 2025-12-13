/**
 * storage-operations.js
 *
 * Storage API operations (get, set, delete)
 */

export function createStorageOperations(baseUrl, appId) {
  return {
    async get(key, scope = 'app') {
      if (!appId) throw new Error('appId required for storage operations');
      const path = `${scope}/${appId}/${key}`;
      const res = await fetch(`${baseUrl}/api/storage/${path}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.value;
    },

    async set(key, value, scope = 'app') {
      if (!appId) throw new Error('appId required for storage operations');
      const path = `${scope}/${appId}/${key}`;
      const res = await fetch(`${baseUrl}/api/storage/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      return res.ok;
    },

    async delete(key, scope = 'app') {
      if (!appId) throw new Error('appId required for storage operations');
      const path = `${scope}/${appId}/${key}`;
      const res = await fetch(`${baseUrl}/api/storage/${path}`, { method: 'DELETE' });
      return res.ok;
    }
  };
}
