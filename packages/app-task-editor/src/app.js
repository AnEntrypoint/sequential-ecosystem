import { AppSDK } from '@sequential/app-sdk';

class TaskEditor {
  constructor() {
    this.sdk = AppSDK.init('app-task-editor');
    this.storage = this.createStorageManager();
    this.tasks = [];
    this.currentTask = null;
    this.currentTab = 'code';
    this.executionOutput = [];
  }

  createStorageManager() {
    const appId = 'app-task-editor';
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

  loadTasks() {
    this.tasks = [
      { id: 'task-1', name: 'fetch-data', type: 'implicit', code: 'export async function fetchData(input) {\n  return await fetch(\'/api/data\');\n}' },
      { id: 'task-2', name: 'process-task', type: 'implicit', code: 'export async function processTask(input) {\n  return input.map(x => x * 2);\n}' }
    ];
    if (this.tasks.length > 0) {
      this.currentTask = this.tasks[0];
    }
  }

  selectTask(task) {
    this.currentTask = task;
  }

  deleteTask(task) {
    if (!confirm(`Delete task "${task.name}"?`)) return;
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    if (this.currentTask?.id === task.id) {
      this.currentTask = this.tasks[0] || null;
    }
  }

  updateTaskCode(code) {
    if (this.currentTask) {
      this.currentTask.code = code;
    }
  }

  async runTask() {
    if (!this.currentTask) return;
    this.executionOutput = [
      { type: 'info', message: `Running task: ${this.currentTask.name}` },
      { type: 'success', message: 'Task execution completed' }
    ];
  }

  async saveTask() {
    if (!this.currentTask) return;
    try {
      const res = await fetch(`/api/tasks/${this.currentTask.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentTask)
      });
      if (res.ok) {
        this.executionOutput = [{ type: 'success', message: 'Task saved successfully' }];
      }
    } catch (e) {
      this.executionOutput = [{ type: 'error', message: `Save error: ${e.message}` }];
    }
  }

  buildTaskItem(task, isSelected) {
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
      onClick: () => this.selectTask(task),
      children: [
        {
          type: 'paragraph',
          content: task.name,
          style: { fontWeight: '600', fontSize: '14px', marginBottom: '4px', margin: 0 }
        },
        {
          type: 'paragraph',
          content: task.type.toUpperCase(),
          style: { fontSize: '11px', color: '#999', textTransform: 'uppercase', margin: 0 }
        }
      ]
    };
  }

  buildSidebar() {
    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '260px',
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
              content: 'Tasks',
              level: 3,
              style: { color: '#4ade80', marginBottom: '12px', fontSize: '13px', margin: '0 0 12px 0' }
            },
            ...this.tasks.map(task => this.buildTaskItem(task, task.id === this.currentTask?.id))
          ]
        }
      ]
    };
  }

  buildCodeTab() {
    const code = this.currentTask?.code || '';
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflow: 'hidden' },
      children: [
        {
          type: 'box',
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#1e1e1e',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            overflow: 'hidden'
          },
          children: [
            {
              type: 'textarea',
              value: code,
              placeholder: 'Enter task code...',
              style: {
                flex: 1,
                background: '#1e1e1e',
                color: '#e0e0e0',
                border: 'none',
                padding: '16px',
                fontFamily: "'Courier New', monospace",
                fontSize: '13px',
                lineHeight: '1.6',
                resize: 'none'
              },
              onChange: (e) => this.updateTaskCode(e.target.value)
            }
          ]
        }
      ]
    };
  }

  buildExecutionTab() {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflow: 'hidden' },
      children: [
        {
          type: 'box',
          style: {
            flex: 1,
            background: '#1a1a1a',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            padding: '12px',
            overflowY: 'auto',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px'
          },
          children: [
            ...this.executionOutput.map(line => ({
              type: 'paragraph',
              content: `[${line.type.toUpperCase()}] ${line.message}`,
              style: {
                color: line.type === 'success' ? '#4ade80' : line.type === 'error' ? '#ff5f56' : '#999',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }
            })),
            this.executionOutput.length === 0 ? {
              type: 'paragraph',
              content: 'Run the task to see output here',
              style: { color: '#666', margin: 0 }
            } : null
          ].filter(Boolean)
        }
      ]
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
              label: 'Code',
              style: {
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: this.currentTab === 'code' ? '2px solid #4ade80' : '2px solid transparent',
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
                color: this.currentTab === 'code' ? '#4ade80' : '#999'
              },
              onClick: () => { this.currentTab = 'code'; }
            },
            {
              type: 'button',
              label: 'Execution',
              style: {
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: this.currentTab === 'execution' ? '2px solid #4ade80' : '2px solid transparent',
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
                color: this.currentTab === 'execution' ? '#4ade80' : '#999'
              },
              onClick: () => { this.currentTab = 'execution'; }
            }
          ]
        },
        this.currentTab === 'code' ? this.buildCodeTab() : this.buildExecutionTab()
      ]
    };
  }

  buildUI() {
    if (!this.currentTask) {
      return {
        type: 'flex',
        direction: 'column',
        style: { height: '100vh', background: '#1a1a1a', color: '#666', justifyContent: 'center', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'No tasks available', style: { fontSize: '16px', margin: 0 } }
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
            { type: 'paragraph', content: `📝 ${this.currentTask.name}`, style: { fontWeight: 'bold', color: '#4ade80', fontSize: '16px', margin: 0 } },
            {
              type: 'flex',
              gap: '8px',
              children: [
                { type: 'button', label: '▶ Run', style: { background: '#4ade80', color: '#1a1a1a', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.runTask() },
                { type: 'button', label: 'Save', style: { background: '#3a3a3a', border: 'none', color: '#e0e0e0', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.saveTask() },
                { type: 'button', label: 'Delete', style: { background: '#ff5f56', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }, onClick: () => this.deleteTask(this.currentTask) }
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

const editor = new TaskEditor();
editor.loadTasks();

export { editor };
export default editor;
