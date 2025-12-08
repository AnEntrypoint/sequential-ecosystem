import { AppSDK } from '@sequential/app-sdk';

class FileSystemDebugger {
  constructor() {
    this.sdk = AppSDK.init('app-debugger');
    this.storage = this.createStorageManager();
    this.currentLayers = [];
    this.selectedLayer = null;
    this.comparisonMode = false;
    this.selectedLayers = [];
    this.debugLogs = [];
  }

  createStorageManager() {
    const appId = 'app-debugger';
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

  addDebugLog(message, type = 'info') {
    this.debugLogs.push({ message, type, time: Date.now() });
    if (this.debugLogs.length > 10) {
      this.debugLogs.shift();
    }
  }

  toggleCompareMode() {
    this.comparisonMode = !this.comparisonMode;
    this.selectedLayers = [];
    this.selectedLayer = null;
    this.addDebugLog(
      this.comparisonMode
        ? 'Compare mode enabled. Select two layers to compare.'
        : 'Compare mode disabled.',
      this.comparisonMode ? 'info' : 'info'
    );
  }

  async refreshData() {
    await Promise.all([this.loadLayers(), this.loadStatus()]);
  }

  async loadLayers() {
    try {
      const res = await fetch('/api/sequential-os/history');
      if (!res.ok) {
        this.currentLayers = [];
        this.addDebugLog('Sequential-OS unavailable', 'warning');
        return;
      }
      const layers = await res.json();
      this.currentLayers = layers;
    } catch (e) {
      console.error('Failed to load layers:', e);
      this.addDebugLog('Failed to load layers', 'error');
    }
  }

  async loadStatus() {
    try {
      const res = await fetch('/api/sequential-os/status');
      if (!res.ok) {
        this.addDebugLog('Sequential-OS unavailable', 'warning');
        return;
      }
      const status = await res.json();
      this.currentStatus = status;
    } catch (e) {
      console.error('Failed to load status:', e);
    }
  }

  selectLayer(idx) {
    if (this.comparisonMode) {
      if (this.selectedLayers.includes(idx)) {
        this.selectedLayers = this.selectedLayers.filter(i => i !== idx);
      } else if (this.selectedLayers.length < 2) {
        this.selectedLayers.push(idx);
      }
    } else {
      this.selectedLayer = this.selectedLayer === idx ? null : idx;
    }
  }

  async checkoutLayer(hash) {
    try {
      this.addDebugLog('Checking out layer...', 'info');
      const res = await fetch('/api/sequential-os/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: hash })
      });
      const result = await res.json();
      if (result.success || result.ref) {
        this.addDebugLog(`Checked out layer ${hash.substring(0, 8)}`, 'success');
        await this.refreshData();
      } else {
        this.addDebugLog(`Checkout failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (e) {
      this.addDebugLog(`Checkout error: ${e.message}`, 'error');
    }
  }

  buildLayerItem(layer, idx) {
    const isSelected = this.selectedLayer === idx;
    const isCompareSelected = this.selectedLayers.includes(idx);

    return {
      type: 'box',
      style: {
        background: isSelected ? '#3a3a3a' : (isCompareSelected ? '#3a4a5a' : '#2a2a2a'),
        padding: '10px 12px',
        margin: '6px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isCompareSelected ? '#64b5f6' : (isSelected ? '#4ade80' : 'transparent')}`,
        transition: 'all 0.2s',
        border: isCompareSelected ? '1px dashed #64b5f6' : 'none'
      },
      onClick: () => this.selectLayer(idx),
      children: [
        {
          type: 'paragraph',
          content: layer.short || 'unknown',
          style: {
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            color: '#64b5f6',
            marginBottom: '4px',
            margin: 0
          }
        },
        {
          type: 'paragraph',
          content: new Date(layer.time).toLocaleString(),
          style: {
            fontSize: '11px',
            color: '#999',
            margin: 0
          }
        },
        !this.comparisonMode ? {
          type: 'button',
          label: 'Checkout',
          style: {
            background: '#4ade80',
            color: '#1a1a1a',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
            width: '100%',
            transition: 'background 0.2s'
          },
          onClick: (e) => {
            e.stopPropagation();
            this.checkoutLayer(layer.hash);
          }
        } : null
      ].filter(Boolean)
    };
  }

  buildStatusCards(status) {
    const added = status?.added || [];
    const modified = status?.modified || [];
    const deleted = status?.deleted || [];
    const total = added.length + modified.length + deleted.length;

    return {
      type: 'flex',
      direction: 'column',
      gap: '15px',
      children: [
        {
          type: 'flex',
          direction: 'row',
          gap: '15px',
          style: { flexWrap: 'wrap' },
          children: [
            {
              type: 'box',
              style: {
                background: '#242424',
                padding: '18px',
                borderRadius: '10px',
                borderLeft: '4px solid #4ade80',
                flex: '1',
                minWidth: '150px'
              },
              children: [
                { type: 'paragraph', content: 'TOTAL CHANGES', style: { fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', margin: 0 } },
                { type: 'paragraph', content: total.toString(), style: { fontSize: '24px', fontWeight: 'bold', color: '#4ade80', margin: 0 } }
              ]
            },
            {
              type: 'box',
              style: {
                background: '#242424',
                padding: '18px',
                borderRadius: '10px',
                borderLeft: `4px solid ${added.length > 0 ? '#4ade80' : '#ffbd2e'}`,
                flex: '1',
                minWidth: '150px'
              },
              children: [
                { type: 'paragraph', content: 'ADDED FILES', style: { fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', margin: 0 } },
                { type: 'paragraph', content: added.length.toString(), style: { fontSize: '24px', fontWeight: 'bold', color: '#4ade80', margin: 0 } }
              ]
            },
            {
              type: 'box',
              style: {
                background: '#242424',
                padding: '18px',
                borderRadius: '10px',
                borderLeft: `4px solid ${modified.length > 0 ? '#ffbd2e' : '#4ade80'}`,
                flex: '1',
                minWidth: '150px'
              },
              children: [
                { type: 'paragraph', content: 'MODIFIED FILES', style: { fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', margin: 0 } },
                { type: 'paragraph', content: modified.length.toString(), style: { fontSize: '24px', fontWeight: 'bold', color: '#ffbd2e', margin: 0 } }
              ]
            },
            {
              type: 'box',
              style: {
                background: '#242424',
                padding: '18px',
                borderRadius: '10px',
                borderLeft: `4px solid ${deleted.length > 0 ? '#ff5f56' : '#4ade80'}`,
                flex: '1',
                minWidth: '150px'
              },
              children: [
                { type: 'paragraph', content: 'DELETED FILES', style: { fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', margin: 0 } },
                { type: 'paragraph', content: deleted.length.toString(), style: { fontSize: '24px', fontWeight: 'bold', color: '#ff5f56', margin: 0 } }
              ]
            }
          ]
        },
        added.length > 0 ? this.buildFileList('Added Files', added, 'added') : null,
        modified.length > 0 ? this.buildFileList('Modified Files', modified, 'modified') : null,
        deleted.length > 0 ? this.buildFileList('Deleted Files', deleted, 'deleted') : null,
        total === 0 ? {
          type: 'box',
          style: { textAlign: 'center', padding: '60px 20px', color: '#666' },
          children: [
            { type: 'heading', content: '✓ Working directory clean', level: 3, style: { fontSize: '18px', margin: '0 0 10px 0' } },
            { type: 'paragraph', content: 'No uncommitted changes', style: { margin: 0 } }
          ]
        } : null
      ].filter(Boolean)
    };
  }

  buildFileList(title, files, status) {
    const borderColors = { added: '#4ade80', modified: '#ffbd2e', deleted: '#ff5f56' };
    const badgeColors = { added: '#4ade80', modified: '#ffbd2e', deleted: '#ff5f56' };

    return {
      type: 'box',
      style: { background: '#242424', borderRadius: '10px', padding: '15px', marginBottom: '20px' },
      children: [
        { type: 'heading', content: title, level: 3, style: { color: '#4ade80', marginBottom: '12px', fontSize: '14px', margin: '0 0 12px 0' } },
        ...files.map(f => ({
          type: 'flex',
          style: {
            fontFamily: "'Courier New', monospace",
            fontSize: '13px',
            padding: '8px 10px',
            margin: '4px 0',
            background: '#2a2a2a',
            borderRadius: '4px',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `3px solid ${borderColors[status]}`
          },
          children: [
            { type: 'paragraph', content: f, style: { margin: 0, flex: 1 } },
            {
              type: 'box',
              style: {
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                background: `rgba(${status === 'added' ? '74, 222, 128' : status === 'modified' ? '255, 189, 46' : '255, 95, 86'}, 0.2)`,
                color: badgeColors[status],
                margin: 0
              },
              children: [{ type: 'paragraph', content: status.charAt(0).toUpperCase() + status.slice(1), style: { margin: 0 } }]
            }
          ]
        }))
      ]
    };
  }

  buildSidebar() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '300px',
        background: '#242424',
        borderRight: '1px solid #3a3a3a',
        overflowY: 'auto'
      },
      children: [
        {
          type: 'flex',
          direction: 'column',
          style: { padding: '15px', flexGrow: 1 },
          children: [
            { type: 'heading', content: 'Layer History', level: 3, style: { color: '#4ade80', marginBottom: '12px', fontSize: '14px', margin: '0 0 12px 0' } },
            ...this.currentLayers.map((layer, idx) => this.buildLayerItem(layer, idx))
          ]
        }
      ]
    };
  }

  buildUI() {
    const status = this.currentStatus || {};
    const isEmpty = (this.currentLayers.length === 0);

    return {
      type: 'flex',
      direction: 'column',
      style: {
        height: '100vh',
        background: '#1a1a1a',
        color: '#e0e0e0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'flex',
          style: {
            background: '#2a2a2a',
            padding: '15px',
            borderBottom: '1px solid #3a3a3a',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [
            { type: 'paragraph', content: '🔍 Filesystem Debugger', style: { fontWeight: 'bold', color: '#4ade80', fontSize: '16px', margin: 0 } },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'button', label: this.comparisonMode ? 'Exit Compare' : 'Compare Layers', style: { background: this.comparisonMode ? '#64b5f6' : '#3a3a3a', color: this.comparisonMode ? '#1a1a1a' : '#e0e0e0', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.toggleCompareMode() },
                { type: 'button', label: 'Refresh', style: { background: '#3a3a3a', border: 'none', color: '#e0e0e0', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.refreshData() }
              ]
            }
          ]
        },
        {
          type: 'flex',
          style: { flex: 1, overflow: 'hidden' },
          children: [
            this.buildSidebar(),
            {
              type: 'box',
              style: {
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                background: '#1a1a1a'
              },
              children: [
                isEmpty ? {
                  type: 'box',
                  style: { textAlign: 'center', padding: '60px 20px', color: '#666' },
                  children: [
                    { type: 'heading', content: 'Select a layer to view details', level: 3, style: { fontSize: '18px', margin: '0 0 10px 0' } },
                    { type: 'paragraph', content: 'or view current status below', style: { margin: 0 } }
                  ]
                } : this.buildStatusCards(status)
              ]
            }
          ]
        }
      ]
    };
  }

  render() {
    return this.buildUI();
  }
}

const debugger_ = new FileSystemDebugger();
debugger_.loadLayers();
debugger_.loadStatus();

export { debugger_ };
export default debugger_;
