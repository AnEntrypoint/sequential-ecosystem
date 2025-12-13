// Facade maintaining 100% backward compatibility with app manager
import { AppSDK } from '@sequentialos/app-sdk';
import { createStorageManager } from './app-storage.js';
import { AppAPI } from './app-api.js';
import { AppUIBuilders } from './app-ui-builders.js';

class AppManager {
  constructor() {
    this.sdk = AppSDK.init('@sequentialos/app-manager');
    this.storage = createStorageManager('@sequentialos/app-manager');
    this.api = new AppAPI();
    this.uiBuilders = new AppUIBuilders();

    this.userApps = [];
    this.builtinApps = [];
    this.currentTab = 'user';
    this.showCreateModal = false;
    this.createForm = { id: '', name: '', description: '', icon: '📦', template: 'blank' };
    this.refreshApps();
  }

  async refreshApps() {
    const { userApps, builtinApps } = await this.api.refreshApps();
    this.userApps = userApps;
    this.builtinApps = builtinApps;
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

    const result = await this.api.createApp(id, name, description, icon, template);
    if (result.success) {
      this.closeCreateModal();
      await this.refreshApps();
      alert(result.message);
    } else {
      alert('Error: ' + result.error);
    }
  }

  async deleteApp(appId, appName) {
    if (!confirm(`Delete app "${appName}"? This cannot be undone.`)) return;
    const result = await this.api.deleteApp(appId, appName);
    if (result.success) {
      await this.refreshApps();
      alert(result.message);
    } else {
      alert(result.error);
    }
  }

  buildAppCard(app) {
    return this.uiBuilders.buildAppCard(app, this.deleteApp.bind(this));
  }

  buildAppsGrid() {
    const apps = this.currentTab === 'user' ? this.userApps : this.builtinApps;
    const cards = apps.length > 0 ? apps.map(app => this.buildAppCard(app)) : [];
    return this.uiBuilders.buildAppsGrid(cards);
  }

  buildCreateModal() {
    return this.uiBuilders.buildCreateModal(
      this.showCreateModal,
      this.createForm,
      this.updateFormField.bind(this),
      this.submitCreate.bind(this),
      this.closeCreateModal.bind(this)
    );
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
