import { AppSDK } from '@sequential/app-sdk';

class AppManager {
  constructor() {
    this.sdk = AppSDK.init('app-app-manager');
    this.storage = this.createStorageManager();
    this.userApps = [];
    this.builtinApps = [];
    this.currentTab = 'user';
    this.showCreateModal = false;
    this.createForm = { id: '', name: '', description: '', icon: '📦', template: 'blank' };
    this.refreshApps();
  }

  createStorageManager() {
    const appId = 'app-app-manager';
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
            this.clear();
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

  async refreshApps() {
    try {
      const resp = await fetch('/api/apps');
      if (resp.ok) {
        const json = await resp.json();
        const allApps = Array.isArray(json.data) ? json.data : (json.data?.apps || json.apps || []);
        this.userApps = allApps.filter(a => !a.builtin);
        this.builtinApps = allApps.filter(a => a.builtin);
      }
    } catch (e) {
      console.error('Failed to load apps:', e);
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createForm = { id: '', name: '', description: '', icon: '📦', template: 'blank' };
  }

  updateFormField(field, value) {
    this.createForm[field] = value;
  }

  async submitCreate() {
    const { id, name, description, icon, template } = this.createForm;
    if (!id || !name) {
      alert('App ID and name are required');
      return;
    }

    try {
      const resp = await fetch('/api/user-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, icon, template })
      });
      if (resp.ok) {
        this.closeCreateModal();
        await this.refreshApps();
        alert(`App "${name}" created successfully!`);
      } else {
        const err = await resp.json();
        alert('Error: ' + (err.error?.message || 'Failed to create app'));
      }
    } catch (e) {
      alert('Failed to create app: ' + e.message);
    }
  }

  async deleteApp(appId, appName) {
    if (!confirm(`Delete app "${appName}"? This cannot be undone.`)) return;
    try {
      const resp = await fetch(`/api/user-apps/${appId}`, { method: 'DELETE' });
      if (resp.ok) {
        await this.refreshApps();
        alert('App deleted');
      }
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  buildAppCard(app) {
    return {
      type: 'box',
      style: {
        background: '#252526',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'flex',
          style: {
            padding: '16px',
            borderBottom: '1px solid #3e3e42',
            alignItems: 'center',
            gap: '12px'
          },
          children: [
            { type: 'paragraph', content: app.icon || '📦', style: { fontSize: '32px', margin: 0 } },
            {
              type: 'flex',
              direction: 'column',
              style: { flex: 1, gap: '4px' },
              children: [
                { type: 'paragraph', content: app.name, style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                { type: 'paragraph', content: app.id, style: { margin: 0, fontSize: '11px', color: '#858585' } }
              ]
            },
            app.builtin ? {
              type: 'box',
              style: { background: '#0e639c', color: 'white', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' },
              children: [{ type: 'paragraph', content: 'Built-in', style: { margin: 0 } }]
            } : null
          ].filter(Boolean)
        },
        {
          type: 'box',
          style: { padding: '12px 16px', flex: 1 },
          children: [
            { type: 'paragraph', content: app.description || 'No description', style: { margin: '0 0 12px 0', fontSize: '12px', color: '#858585' } },
            {
              type: 'flex',
              gap: '12px',
              style: { fontSize: '11px', color: '#858585' },
              children: [
                { type: 'paragraph', content: `v${app.version || '1.0.0'}`, style: { margin: 0 } },
                !app.builtin ? { type: 'paragraph', content: '👤 User', style: { margin: 0 } } : null
              ].filter(Boolean)
            }
          ]
        },
        {
          type: 'flex',
          style: { padding: '12px 16px', borderTop: '1px solid #3e3e42', gap: '6px', flexWrap: 'wrap' },
          children: [
            { type: 'button', label: '▶️ Run', style: { background: '#0e639c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => window.open(`/apps/${app.id}/dist/index.html`, '_blank') },
            { type: 'button', label: '✏️ Edit', style: { background: '#0e639c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => alert('Edit app coming soon') },
            !app.builtin ? { type: 'button', label: '🗑️ Delete', style: { background: '#3e3e42', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => this.deleteApp(app.id, app.name) } : null
          ].filter(Boolean)
        }
      ]
    };
  }

  buildAppsGrid() {
    const apps = this.currentTab === 'user' ? this.userApps : this.builtinApps;

    if (apps.length === 0) {
      return {
        type: 'box',
        style: { textAlign: 'center', padding: '40px', color: '#858585' },
        children: [
          { type: 'paragraph', content: '📭', style: { fontSize: '48px', marginBottom: '12px', margin: 0 } },
          { type: 'paragraph', content: this.currentTab === 'user' ? 'No apps yet. Create one!' : 'No built-in apps', style: { fontSize: '14px', margin: 0 } }
        ]
      };
    }

    return {
      type: 'flex',
      direction: 'row',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      },
      children: apps.map(app => this.buildAppCard(app))
    };
  }

  buildCreateModal() {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: this.showCreateModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: this.showCreateModal ? 'auto' : 'none'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#252526',
            border: '1px solid #3e3e42',
            borderRadius: '6px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            opacity: this.showCreateModal ? 1 : 0
          },
          children: [
            { type: 'heading', content: 'Create New App', level: 2, style: { margin: '0 0 16px 0', fontSize: '16px' } },
            {
              type: 'flex',
              direction: 'column',
              gap: '16px',
              children: [
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '6px',
                  children: [
                    { type: 'paragraph', content: 'App ID *', style: { margin: 0, fontSize: '12px', color: '#858585' } },
                    { type: 'input', value: this.createForm.id, placeholder: 'app-my-app', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => this.updateFormField('id', e.target.value) }
                  ]
                },
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '6px',
                  children: [
                    { type: 'paragraph', content: 'App Name *', style: { margin: 0, fontSize: '12px', color: '#858585' } },
                    { type: 'input', value: this.createForm.name, placeholder: 'My App', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => this.updateFormField('name', e.target.value) }
                  ]
                },
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '6px',
                  children: [
                    { type: 'paragraph', content: 'Description', style: { margin: 0, fontSize: '12px', color: '#858585' } },
                    { type: 'input', value: this.createForm.description, placeholder: 'What does your app do?', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => this.updateFormField('description', e.target.value) }
                  ]
                },
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '6px',
                  children: [
                    { type: 'paragraph', content: 'Icon', style: { margin: 0, fontSize: '12px', color: '#858585' } },
                    { type: 'input', value: this.createForm.icon, placeholder: '🚀', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => this.updateFormField('icon', e.target.value) }
                  ]
                },
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '6px',
                  children: [
                    { type: 'paragraph', content: 'Template', style: { margin: 0, fontSize: '12px', color: '#858585' } },
                    { type: 'select', value: this.createForm.template, style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => this.updateFormField('template', e.target.value), children: [
                      { label: 'Blank', value: 'blank' },
                      { label: 'Dashboard', value: 'dashboard' },
                      { label: 'Task Explorer', value: 'task-explorer' },
                      { label: 'Flow Visualizer', value: 'flow-viz' }
                    ] }
                  ]
                }
              ]
            },
            {
              type: 'flex',
              gap: '8px',
              style: { marginTop: '16px', justifyContent: 'flex-end' },
              children: [
                { type: 'button', label: 'Cancel', style: { background: '#3e3e42', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: () => this.closeCreateModal() },
                { type: 'button', label: 'Create', style: { background: '#0e639c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: () => this.submitCreate() }
              ]
            }
          ]
        }
      ]
    };
  }

  buildUI() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        height: '100vh',
        background: '#1e1e1e',
        color: '#e0e0e0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'flex',
          style: {
            background: '#252526',
            padding: '12px 16px',
            borderBottom: '1px solid #3e3e42',
            gap: '12px',
            alignItems: 'center'
          },
          children: [
            { type: 'heading', content: '📦 App Manager', level: 1, style: { margin: 0, fontSize: '16px', fontWeight: '600', flex: 1 } },
            { type: 'button', label: '+ Create App', style: { background: '#0e639c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: () => this.openCreateModal() },
            { type: 'button', label: '🔄 Refresh', style: { background: '#0e639c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: () => this.refreshApps() }
          ]
        },
        {
          type: 'flex',
          style: {
            background: '#252526',
            borderBottom: '1px solid #3e3e42',
            padding: '0 16px'
          },
          children: [
            { type: 'button', label: '👤 My Apps', style: { padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: this.currentTab === 'user' ? '#e0e0e0' : '#858585', background: 'transparent', border: 'none', borderBottom: this.currentTab === 'user' ? '2px solid #0e639c' : '2px solid transparent' }, onClick: () => this.switchTab('user') },
            { type: 'button', label: '🏗️ Built-in Apps', style: { padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: this.currentTab === 'builtin' ? '#e0e0e0' : '#858585', background: 'transparent', border: 'none', borderBottom: this.currentTab === 'builtin' ? '2px solid #0e639c' : '2px solid transparent' }, onClick: () => this.switchTab('builtin') }
          ]
        },
        {
          type: 'box',
          style: { flex: 1, overflowY: 'auto', padding: '16px' },
          children: [this.buildAppsGrid()]
        },
        this.buildCreateModal()
      ]
    };
  }

  render() {
    return this.buildUI();
  }
}

const manager = new AppManager();

export { manager };
export default manager;
