import { AppSDK } from '@sequential/app-sdk';

class FlowEditor {
  constructor() {
    this.sdk = AppSDK.init('app-flow-editor');
    this.storage = this.createStorageManager();

    this.currentFlow = null;
    this.selectedState = null;
    this.flowHistory = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    this.flows = [
      {
        id: 'example-workflow',
        name: 'example-workflow',
        description: 'User authentication flow',
        states: [
          { id: 'start', name: 'start', type: 'initial', x: 100, y: 100, onDone: 'fetchData' },
          { id: 'fetchData', name: 'fetchData', type: 'normal', x: 100, y: 220, onDone: 'process', onError: 'handleError' },
          { id: 'process', name: 'process', type: 'normal', x: 100, y: 340, onDone: 'complete' },
          { id: 'handleError', name: 'handleError', type: 'normal', x: 320, y: 220, onDone: 'complete' },
          { id: 'complete', name: 'complete', type: 'final', x: 100, y: 460 }
        ]
      }
    ];

    this.currentFlow = this.flows[0];
  }

  createStorageManager() {
    const appId = 'app-flow-editor';
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

  saveToHistory() {
    this.flowHistory = this.flowHistory.slice(0, this.historyIndex + 1);
    this.flowHistory.push(JSON.parse(JSON.stringify(this.currentFlow)));
    if (this.flowHistory.length > this.maxHistory) {
      this.flowHistory.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentFlow = JSON.parse(JSON.stringify(this.flowHistory[this.historyIndex]));
      this.selectedState = null;
    }
  }

  redo() {
    if (this.historyIndex < this.flowHistory.length - 1) {
      this.historyIndex++;
      this.currentFlow = JSON.parse(JSON.stringify(this.flowHistory[this.historyIndex]));
      this.selectedState = null;
    }
  }

  addState(type) {
    const newState = {
      id: `state${this.currentFlow.states.length + 1}`,
      name: `state${this.currentFlow.states.length + 1}`,
      type: type,
      x: 100 + (this.currentFlow.states.length % 3) * 220,
      y: 100 + Math.floor(this.currentFlow.states.length / 3) * 120
    };
    this.currentFlow.states.push(newState);
    this.saveToHistory();
  }

  selectState(id) {
    this.selectedState = id;
  }

  deleteState(id) {
    if (!id) return;
    const state = this.currentFlow.states.find(s => s.id === id);
    if (!state || !confirm(`Delete state "${state.name}"?`)) return;

    this.currentFlow.states = this.currentFlow.states.filter(s => s.id !== id);
    this.currentFlow.states.forEach(s => {
      if (s.onDone === id) delete s.onDone;
      if (s.onError === id) delete s.onError;
    });

    if (this.currentFlow.states.length === 0) {
      this.selectedState = null;
    } else {
      if (!this.currentFlow.states.find(s => s.type === 'initial') && this.currentFlow.states.length > 0) {
        this.currentFlow.states[0].type = 'initial';
      }
      if (!this.currentFlow.states.find(s => s.type === 'final') && this.currentFlow.states.length > 0) {
        this.currentFlow.states[this.currentFlow.states.length - 1].type = 'final';
      }
    }

    this.selectedState = null;
    this.saveToHistory();
  }

  updateState(field, value) {
    const state = this.currentFlow.states.find(s => s.id === this.selectedState);
    if (state) {
      state[field] = value;
    }
  }

  buildStateNode(state, isSelected) {
    const borderColors = {
      initial: '#64b5f6',
      final: '#ff5f56',
      normal: '#4ade80',
      error: '#ff9800',
      processing: '#4a9eff'
    };

    return {
      type: 'box',
      style: {
        position: 'absolute',
        left: `${state.x}px`,
        top: `${state.y}px`,
        width: `${state.width || 140}px`,
        minHeight: `${state.height || 80}px`,
        background: '#2a2a2a',
        border: `2px solid ${isSelected ? '#ffbd2e' : borderColors[state.type]}`,
        borderRadius: '12px',
        padding: '16px 20px',
        cursor: 'move',
        boxShadow: isSelected ? '0 6px 20px rgba(255,189,46,0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
        userSelect: 'none'
      },
      children: [
        {
          type: 'paragraph',
          content: state.name,
          style: {
            fontWeight: '700',
            fontSize: '15px',
            marginBottom: '8px',
            color: '#e0e0e0',
            margin: 0
          }
        },
        {
          type: 'paragraph',
          content: state.type.toUpperCase(),
          style: {
            fontSize: '11px',
            textTransform: 'uppercase',
            color: '#999',
            letterSpacing: '0.5px',
            margin: 0
          }
        }
      ],
      onClick: () => this.selectState(state.id)
    };
  }

  buildCanvasGrid() {
    return {
      type: 'box',
      style: {
        position: 'relative',
        flex: 1,
        background: '#1e1e1e',
        backgroundImage: `
          linear-gradient(rgba(78, 222, 128, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(78, 222, 128, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        overflow: 'auto',
        minHeight: '400px',
        borderRight: '1px solid #3a3a3a'
      },
      children: [
        ...this.currentFlow.states.map(state =>
          this.buildStateNode(state, state.id === this.selectedState)
        ),
        !this.currentFlow.states.length ? {
          type: 'flex',
          direction: 'column',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666'
          },
          children: [
            { type: 'heading', content: 'No states yet', level: 3, style: { margin: 0, fontSize: '20px' } },
            { type: 'paragraph', content: 'Click the + button to add your first state', style: { margin: '12px 0 0 0' } }
          ]
        } : null
      ].filter(Boolean)
    };
  }

  buildPropertiesPanel() {
    if (!this.selectedState) {
      return {
        type: 'flex',
        direction: 'column',
        style: { padding: '20px', color: '#666', fontSize: '13px' },
        children: [{ type: 'paragraph', content: 'Select a state to edit its properties', style: { margin: 0 } }]
      };
    }

    const state = this.currentFlow.states.find(s => s.id === this.selectedState);
    if (!state) return { type: 'box', children: [] };

    return {
      type: 'flex',
      direction: 'column',
      style: { padding: '20px', gap: '16px' },
      children: [
        { type: 'heading', content: 'Properties', level: 3, style: { margin: 0, color: '#4ade80' } },
        {
          type: 'flex',
          direction: 'column',
          gap: '16px',
          children: [
            this.buildFormInput('State ID', state.id, (v) => this.updateState('id', v)),
            this.buildFormInput('State Name', state.name, (v) => this.updateState('name', v)),
            this.buildFormSelect('Type', state.type, ['normal', 'initial', 'final'], (v) => this.updateState('type', v)),
            state.type !== 'final' ? {
              type: 'flex',
              direction: 'column',
              gap: '16px',
              children: [
                this.buildFormInput('On Done', state.onDone || '', (v) => this.updateState('onDone', v || null)),
                this.buildFormInput('On Error', state.onError || '', (v) => this.updateState('onError', v || null))
              ]
            } : null
          ].filter(Boolean)
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '10px',
          style: { marginTop: '20px' },
          children: [
            {
              type: 'button',
              label: 'Delete State',
              variant: 'primary',
              style: {
                flex: 1,
                background: '#ff5f56',
                color: 'white',
                border: 'none',
                padding: '8px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              },
              onClick: () => this.deleteState(this.selectedState)
            }
          ]
        }
      ]
    };
  }

  buildFormInput(label, value, onChange) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '6px',
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '13px', color: '#ccc', fontWeight: '600' }
        },
        {
          type: 'input',
          placeholder: label,
          value: value,
          style: {
            width: '100%',
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            color: '#e0e0e0',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px'
          },
          onChange: (e) => onChange(e.target.value)
        }
      ]
    };
  }

  buildFormSelect(label, value, options, onChange) {
    return {
      type: 'flex',
      direction: 'column',
      gap: '6px',
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '13px', color: '#ccc', fontWeight: '600' }
        },
        {
          type: 'select',
          value: value,
          options: options.map(opt => ({ label: opt, value: opt })),
          style: {
            width: '100%',
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            color: '#e0e0e0',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px'
          },
          onChange: (e) => onChange(e.target.value)
        }
      ]
    };
  }

  buildSidebar() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '280px',
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
              content: 'Flows',
              level: 3,
              style: { color: '#4ade80', marginBottom: '12px', fontSize: '13px', margin: '0 0 12px 0' }
            },
            ...this.flows.map(flow => ({
              type: 'box',
              style: {
                background: '#2a2a2a',
                padding: '10px 12px',
                marginBottom: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                borderLeft: `3px solid ${flow.id === this.currentFlow.id ? '#4ade80' : 'transparent'}`,
                transition: 'all 0.2s'
              },
              children: [
                {
                  type: 'paragraph',
                  content: flow.name,
                  style: { fontWeight: '600', fontSize: '14px', marginBottom: '4px', margin: 0 }
                },
                {
                  type: 'paragraph',
                  content: flow.description,
                  style: { fontSize: '12px', color: '#999', margin: 0 }
                }
              ],
              onClick: () => {
                this.currentFlow = flow;
                this.selectedState = null;
              }
            }))
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          style: { padding: '16px' },
          children: [
            {
              type: 'heading',
              content: 'State Templates',
              level: 3,
              style: { color: '#4ade80', marginBottom: '12px', fontSize: '13px', margin: '0 0 12px 0' }
            },
            ...['normal', 'initial', 'final'].map(type => ({
              type: 'button',
              label: `+ ${type.charAt(0).toUpperCase() + type.slice(1)} State`,
              variant: 'secondary',
              style: {
                width: '100%',
                margin: '4px 0',
                background: '#3a3a3a',
                border: 'none',
                color: '#e0e0e0',
                padding: '6px 14px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              },
              onClick: () => this.addState(type)
            }))
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
            { type: 'paragraph', content: '🔄 Flow Editor', style: { fontWeight: 'bold', color: '#4ade80', fontSize: '16px', margin: 0 } },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'button', label: '← Undo', style: { background: '#3a3a3a', border: 'none', color: '#e0e0e0', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.undo() },
                { type: 'button', label: 'Redo →', style: { background: '#3a3a3a', border: 'none', color: '#e0e0e0', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.redo() },
                { type: 'button', label: 'Save', style: { background: '#4ade80', color: '#1a1a1a', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.saveFlow() }
              ]
            }
          ]
        },
        {
          type: 'flex',
          style: { flex: 1, overflow: 'hidden' },
          children: [
            this.buildSidebar(),
            this.buildCanvasGrid(),
            {
              type: 'box',
              style: {
                width: '320px',
                background: '#242424',
                borderLeft: '1px solid #3a3a3a',
                overflowY: 'auto',
                padding: '20px'
              },
              children: [this.buildPropertiesPanel()]
            }
          ]
        }
      ]
    };
  }

  async saveFlow() {
    try {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentFlow)
      });
      const result = await res.json();
      if (result.success || result.id) {
        this.currentFlow.id = result.id || this.currentFlow.id;
        console.log('Flow saved:', this.currentFlow.name);
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  render() {
    return this.buildUI();
  }
}

const editor = new FlowEditor();
editor.saveToHistory();

export { editor };
export default editor;
