// App API client for CRUD operations
export class AppAPI {
  async refreshApps() {
    try {
      const resp = await fetch('/api/apps');
      if (resp.ok) {
        const json = await resp.json();
        const allApps = Array.isArray(json.data) ? json.data : (json.data?.apps || json.apps || []);
        return {
          userApps: allApps.filter(a => !a.builtin),
          builtinApps: allApps.filter(a => a.builtin)
        };
      }
    } catch (e) {
      console.error('Failed to load apps:', e);
    }
    return { userApps: [], builtinApps: [] };
  }

  async createApp(id, name, description, icon, template) {
    try {
      const resp = await fetch('/api/user-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, icon, template })
      });
      if (resp.ok) {
        return { success: true, message: `App "${name}" created successfully!` };
      } else {
        const err = await resp.json();
        return { success: false, error: err.error?.message || 'Failed to create app' };
      }
    } catch (e) {
      return { success: false, error: 'Failed to create app: ' + e.message };
    }
  }

  async deleteApp(appId, appName) {
    try {
      const resp = await fetch(`/api/user-apps/${appId}`, { method: 'DELETE' });
      if (resp.ok) {
        return { success: true, message: 'App deleted' };
      }
    } catch (e) {
      return { success: false, error: 'Delete failed: ' + e.message };
    }
  }
}
