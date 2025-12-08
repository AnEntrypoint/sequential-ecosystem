import { AppSDK } from '@sequential/app-sdk';

class ToolEditor {
  constructor() {
    this.sdk = AppSDK.init('app-tool-editor');
    this.storage = this.createStorageManager();
    this.tools = [];
    this.currentTool = null;
    this.currentTab = 'config';
  }

  createStorageManager() {
    const appId = 'app-tool-editor';
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

  loadTools() {
    this.tools = [
      {
        id: 'tool-1',
        name: 'fetch-api',
        description: 'Fetch data from external API',
        parameters: [
          { name: 'url', type: 'string', required: true },
          { name: 'method', type: 'string', default: 'GET' }
        ]
      },
      {
        id: 'tool-2',
        name: 'process-json',
        description: 'Process JSON data',
        parameters: [
          { name: 'data', type: 'object', required: true },
          { name: 'path', type: 'string', default: '' }
        ]
      }
    ];
    if (this.tools.length > 0) {
      this.currentTool = this.tools[0];
    }
  }

  selectTool(tool) {
    this.currentTool = tool;
  }

  deleteTool(tool) {
    if (!confirm(`Delete tool "${tool.name}"?`)) return;
    this.tools = this.tools.filter(t => t.id !== tool.id);
    if (this.currentTool?.id === tool.id) {
      this.currentTool = this.tools[0] || null;
    }
  }

  updateToolField(field, value) {
    if (this.currentTool) {
      this.currentTool[field] = value;
    }
  }

  async saveTool() {
    if (!this.currentTool) return;
    try {
      const res = await fetch(`/api/tools/${this.currentTool.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentTool)
      });
      if (res.ok) {
        console.log('Tool saved');
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  buildToolItem(tool, isSelected) {
    return {
      type: 'box',
      style: {
        background: isSelected ? '#3a3a3a' : '#2a2a2a',
        padding: '10px 12px',
        margin: '6px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isSelected ? '#4ade80' : 'transparent'}`,
        transition: 'all 0.2s'
      },
      onClick: () => this.selectTool(tool),
      children: [
        {
          type: 'paragraph',
          content: tool.name,
          style: { fontWeight: '600', fontSize: '14px', marginBottom: '4px', margin: 0 }
        },
        {
          type: 'paragraph',
          content: tool.description || 'No description',
          style: { fontSize: '11px', color: '#999', margin: 0, maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }
      ]
    };
  }

  buildSidebar() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '270px',
        background: '#242424',
        borderRight: '1px solid #3a3a3a',
        overflowY: 'auto'
      },
      children: [
        {
          type: 'flex',
          direction: 'column',
          style: { padding: '16px', borderBottom: '1px solid #3a3a3a' },
          children: [
            {
              type: 'heading',
              content: 'Tools',
              level: 3,
              style: { color: '#4ade80', marginBottom: '12px', fontSize: '13px', margin: '0 0 12px 0' }
            },
            ...this.tools.map(tool => this.buildToolItem(tool, tool.id === this.currentTool?.id))
          ]
        }
      ]
    };
  }

  buildConfigTab() {
    if (!this.currentTool) return { type: 'box', children: [] };

    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', gap: '16px', overflowY: 'auto' },
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: '6px',
          children: [
            { type: 'paragraph', content: 'Tool Name', style: { margin: 0, fontSize: '13px', color: '#ccc', fontWeight: '600' } },
            {
              type: 'input',
              value: this.currentTool.name,
              placeholder: 'Tool name',
              style: {
                width: '100%',
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                color: '#e0e0e0',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px'
              },
              onChange: (e) => this.updateToolField('name', e.target.value)
            }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '6px',
          children: [
            { type: 'paragraph', content: 'Description', style: { margin: 0, fontSize: '13px', color: '#ccc', fontWeight: '600' } },
            {
              type: 'textarea',
              value: this.currentTool.description || '',
              placeholder: 'Tool description',
              style: {
                width: '100%',
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                color: '#e0e0e0',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                minHeight: '80px',
                resize: 'vertical'
              },
              onChange: (e) => this.updateToolField('description', e.target.value)
            }
          ]
        }
      ]
    };
  }

  buildParametersTab() {
    if (!this.currentTool) return { type: 'box', children: [] };

    const params = this.currentTool.parameters || [];

    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', gap: '16px', overflowY: 'auto' },
      children: [
        {
          type: 'heading',
          content: 'Parameters',
          level: 4,
          style: { margin: 0, color: '#4ade80', fontSize: '14px' }
        },
        ...params.map((param, idx) => ({
          type: 'box',
          style: {
            background: '#2a2a2a',
            padding: '12px',
            borderRadius: '6px',
            borderLeft: '2px solid #4ade80'
          },
          children: [
            {
              type: 'flex',
              direction: 'row',
              gap: '8px',
              children: [
                {
                  type: 'flex',
                  direction: 'column',
                  gap: '4px',
                  style: { flex: 1 },
                  children: [
                    { type: 'paragraph', content: param.name, style: { margin: 0, fontWeight: '600', fontSize: '13px' } },
                    { type: 'paragraph', content: param.type, style: { margin: 0, fontSize: '11px', color: '#999' } }
                  ]
                },
                {
                  type: 'box',
                  style: {
                    padding: '4px 8px',
                    background: param.required ? '#ff5f56' : '#3a3a3a',
                    color: param.required ? 'white' : '#999',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600'
                  },
                  children: [{ type: 'paragraph', content: param.required ? 'REQUIRED' : 'OPTIONAL', style: { margin: 0 } }]
                }
              ]
            }
          ]
        })),
        params.length === 0 ? {
          type: 'paragraph',
          content: 'No parameters defined',
          style: { color: '#666', margin: 0 }
        } : null
      ].filter(Boolean)
    };
  }

  buildEditorArea() {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, background: '#1e1e1e', overflow: 'hidden' },
      children: [
        {
          type: 'flex',
          style: {
            background: '#252525',
            borderBottom: '1px solid #3a3a3a',
            padding: '0 12px'
          },
          children: [
            {
              type: 'button',
              label: 'Configuration',
              style: {
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: this.currentTab === 'config' ? '2px solid #4ade80' : '2px solid transparent',
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
                color: this.currentTab === 'config' ? '#4ade80' : '#999'
              },
              onClick: () => { this.currentTab = 'config'; }
            },
            {
              type: 'button',
              label: 'Parameters',
              style: {
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: this.currentTab === 'parameters' ? '2px solid #4ade80' : '2px solid transparent',
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
                color: this.currentTab === 'parameters' ? '#4ade80' : '#999'
              },
              onClick: () => { this.currentTab = 'parameters'; }
            }
          ]
        },
        this.currentTab === 'config' ? this.buildConfigTab() : this.buildParametersTab()
      ]
    };
  }

  buildUI() {
    if (!this.currentTool) {
      return {
        type: 'flex',
        direction: 'column',
        style: { height: '100vh', background: '#1a1a1a', color: '#666', justifyContent: 'center', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'No tools available', style: { fontSize: '16px', margin: 0 } }
        ]
      };
    }

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
            padding: '12px 16px',
            borderBottom: '1px solid #3a3a3a',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [
            { type: 'paragraph', content: `🔧 ${this.currentTool.name}`, style: { fontWeight: 'bold', color: '#4ade80', fontSize: '16px', margin: 0 } },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'button', label: 'Save', style: { background: '#4ade80', color: '#1a1a1a', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.saveTool() },
                { type: 'button', label: 'Delete', style: { background: '#ff5f56', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.deleteTool(this.currentTool) }
              ]
            }
          ]
        },
        {
          type: 'flex',
          style: { flex: 1, overflow: 'hidden' },
          children: [
            this.buildSidebar(),
            this.buildEditorArea()
          ]
        }
      ]
    };
  }

  render() {
    return this.buildUI();
  }
}

const editor = new ToolEditor();
editor.loadTools();

export { editor };
export default editor;
