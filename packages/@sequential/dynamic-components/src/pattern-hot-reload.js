import { escapeHtml as escape } from '@sequential/text-encoding';

class PatternHotReload {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.previewContainer = null;
    this.currentComponent = null;
    this.watchers = new Map();
    this.changeQueue = [];
    this.isProcessing = false;
    this.debounceDelay = options.debounceDelay || 300;
    this.autoRefresh = options.autoRefresh !== false;
    this.debugMode = options.debug || false;
    this.changeHistory = [];
    this.maxHistory = options.maxHistory || 50;
    this.listeners = [];
    this.performanceMetrics = {
      reloads: 0,
      totalTime: 0,
      averageTime: 0,
      lastReloadTime: 0
    };
  }

  init(previewContainer) {
    if (typeof previewContainer === 'string') {
      this.previewContainer = document.querySelector(previewContainer);
    } else {
      this.previewContainer = previewContainer;
    }

    if (!this.previewContainer) {
      throw new Error('Preview container not found');
    }

    return this;
  }

  watchPath(path, callback) {
    const watcher = {
      path,
      callback,
      lastValue: null,
      debounceTimer: null
    };

    this.watchers.set(path, watcher);

    return () => {
      this.watchers.delete(path);
    };
  }

  setComponent(componentDef) {
    this.currentComponent = JSON.parse(JSON.stringify(componentDef));
    this.render();
    return this;
  }

  updateComponent(updates) {
    if (!this.currentComponent) return this;

    this.changeQueue.push({
      timestamp: Date.now(),
      updates,
      before: JSON.parse(JSON.stringify(this.currentComponent))
    });

    this.debounceRender();
    return this;
  }

  debounceRender() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges();
    }, this.debounceDelay);
  }

  processChanges() {
    if (this.isProcessing || this.changeQueue.length === 0) return;

    this.isProcessing = true;
    const startTime = performance.now();

    try {
      const changes = this.changeQueue.splice(0);

      changes.forEach(change => {
        this.applyChanges(this.currentComponent, change.updates);
      });

      this.recordChange(changes);
      this.render();
      this.executeListeners('change', { changes, component: this.currentComponent });

      const endTime = performance.now();
      const duration = endTime - startTime;

      this.performanceMetrics.reloads++;
      this.performanceMetrics.totalTime += duration;
      this.performanceMetrics.averageTime = this.performanceMetrics.totalTime / this.performanceMetrics.reloads;
      this.performanceMetrics.lastReloadTime = duration;

      if (this.debugMode) {
        console.log(`[Hot Reload] Processed ${changes.length} change(s) in ${duration.toFixed(2)}ms`);
      }
    } finally {
      this.isProcessing = false;

      if (this.changeQueue.length > 0) {
        this.debounceRender();
      }
    }
  }

  applyChanges(component, updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.setNestedValue(component, path, value);
    });

    this.checkWatchers(component);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }

    return current;
  }

  checkWatchers(component) {
    this.watchers.forEach((watcher) => {
      const newValue = this.getNestedValue(component, watcher.path);

      if (JSON.stringify(newValue) !== JSON.stringify(watcher.lastValue)) {
        watcher.lastValue = newValue;

        try {
          watcher.callback(newValue);
        } catch (e) {
          console.error(`Watcher error for path ${watcher.path}:`, e);
        }
      }
    });
  }

  render() {
    if (!this.currentComponent || !this.previewContainer) return;

    try {
      this.renderer.render(this.currentComponent, this.previewContainer);
    } catch (e) {
      console.error('Render error:', e);
      this.renderError(e);
    }
  }

  renderError(error) {
    if (!this.previewContainer) return;

    this.previewContainer.innerHTML = `
      <div style="padding: 20px; background: #fee; border-radius: 4px; color: #c00;">
        <strong>Render Error:</strong> ${this.escapeHtml(error.message || String(error))}
        <pre style="margin-top: 10px; font-size: 12px; overflow-x: auto;">${this.escapeHtml(error.stack || '')}</pre>
      </div>
    `;
  }

  escapeHtml(text) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    return escape(text);
  }

  recordChange(changes) {
    const record = {
      timestamp: Date.now(),
      changes,
      snapshot: JSON.parse(JSON.stringify(this.currentComponent))
    };

    this.changeHistory.push(record);

    if (this.changeHistory.length > this.maxHistory) {
      this.changeHistory.shift();
    }
  }

  undo(steps = 1) {
    if (this.changeHistory.length < steps) return false;

    const targetIndex = this.changeHistory.length - steps - 1;
    if (targetIndex < 0) return false;

    const targetRecord = this.changeHistory[targetIndex];
    this.currentComponent = JSON.parse(JSON.stringify(targetRecord.snapshot));

    this.changeHistory.splice(targetIndex + 1);

    this.render();
    this.executeListeners('undo', { steps, component: this.currentComponent });

    return true;
  }

  redo(steps = 1) {
    const lastRecord = this.changeHistory[this.changeHistory.length - 1];
    if (!lastRecord) return false;

    const nextRecord = this.changeHistory[this.changeHistory.length + steps];
    if (!nextRecord) return false;

    this.currentComponent = JSON.parse(JSON.stringify(nextRecord.snapshot));

    this.render();
    this.executeListeners('redo', { steps, component: this.currentComponent });

    return true;
  }

  canUndo() {
    return this.changeHistory.length > 0;
  }

  canRedo() {
    return false;
  }

  getHistory() {
    return this.changeHistory.map((record, idx) => ({
      index: idx,
      timestamp: record.timestamp,
      changeCount: record.changes.length,
      summary: this.summarizeChanges(record.changes)
    }));
  }

  summarizeChanges(changes) {
    const pathSet = new Set();

    changes.forEach(change => {
      Object.keys(change.updates).forEach(path => {
        pathSet.add(path.split('.')[0]);
      });
    });

    return Array.from(pathSet);
  }

  jumpToHistory(index) {
    if (index < 0 || index >= this.changeHistory.length) return false;

    const record = this.changeHistory[index];
    this.currentComponent = JSON.parse(JSON.stringify(record.snapshot));

    this.render();
    this.executeListeners('jump', { index, component: this.currentComponent });

    return true;
  }

  buildPreviewUI() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: '6px',
        overflow: 'hidden'
      },
      children: [
        this.buildPreviewHeader(),
        {
          type: 'box',
          style: {
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            backgroundColor: '#0d1117'
          },
          children: [this.currentComponent || { type: 'paragraph', content: 'No component loaded' }]
        },
        this.buildPreviewFooter()
      ]
    };
  }

  buildPreviewHeader() {
    const metrics = this.performanceMetrics;

    return {
      type: 'box',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d'
      },
      children: [
        {
          type: 'paragraph',
          content: '🔄 Live Preview',
          style: { margin: 0, fontWeight: 600, color: '#e6edf3' }
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '12px', fontSize: '11px', color: '#8b949e' },
          children: [
            { type: 'text', content: `Reloads: ${metrics.reloads}` },
            { type: 'text', content: `Avg: ${metrics.averageTime.toFixed(1)}ms` },
            { type: 'text', content: `Last: ${metrics.lastReloadTime.toFixed(1)}ms` }
          ]
        }
      ]
    };
  }

  buildPreviewFooter() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d',
        justifyContent: 'flex-end'
      },
      children: [
        {
          type: 'button',
          content: '↶ Undo',
          style: {
            padding: '6px 12px',
            backgroundColor: this.canUndo() ? '#58a6ff' : '#30363d',
            color: '#e6edf3',
            border: 'none',
            borderRadius: '4px',
            cursor: this.canUndo() ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            opacity: this.canUndo() ? 1 : 0.5
          },
          onClick: this.canUndo() ? () => this.undo() : null
        },
        {
          type: 'button',
          content: '↷ Redo',
          style: {
            padding: '6px 12px',
            backgroundColor: this.canRedo() ? '#58a6ff' : '#30363d',
            color: '#e6edf3',
            border: 'none',
            borderRadius: '4px',
            cursor: this.canRedo() ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            opacity: this.canRedo() ? 1 : 0.5
          },
          onClick: this.canRedo() ? () => this.redo() : null
        },
        {
          type: 'button',
          content: '🔄 Refresh',
          style: {
            padding: '6px 12px',
            backgroundColor: '#238636',
            color: '#e6edf3',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          },
          onClick: () => this.render()
        }
      ]
    };
  }

  buildHistoryPanel() {
    const history = this.getHistory();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#1e1e1e',
        borderRadius: '6px',
        maxHeight: '300px',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: '📜 Change History',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e6edf3' }
        },
        ...history.map((record, idx) => ({
          type: 'box',
          style: {
            padding: '8px',
            backgroundColor: '#161b22',
            borderRadius: '4px',
            border: '1px solid #30363d',
            cursor: 'pointer',
            transition: 'all 0.2s'
          },
          children: [
            {
              type: 'paragraph',
              content: `#${idx + 1} • ${new Date(record.timestamp).toLocaleTimeString()}`,
              style: { margin: 0, fontSize: '11px', fontWeight: 500, color: '#58a6ff' }
            },
            {
              type: 'paragraph',
              content: `${record.changeCount} change(s): ${record.summary.join(', ')}`,
              style: { margin: '4px 0 0 0', fontSize: '10px', color: '#8b949e' }
            }
          ]
        }))
      ]
    };
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  executeListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Listener error for event ${event}:`, e);
        }
      });
  }

  getMetrics() {
    return { ...this.performanceMetrics };
  }

  clearHistory() {
    this.changeHistory = [];
    return this;
  }

  exportState() {
    return {
      component: JSON.parse(JSON.stringify(this.currentComponent)),
      history: this.changeHistory.map(r => ({
        timestamp: r.timestamp,
        changeCount: r.changes.length,
        summary: this.summarizeChanges(r.changes)
      })),
      metrics: this.getMetrics(),
      exportedAt: new Date().toISOString()
    };
  }

  importState(state) {
    if (state.component) {
      this.currentComponent = JSON.parse(JSON.stringify(state.component));
      this.render();
    }
    return this;
  }

  dispose() {
    this.watchers.clear();
    this.changeQueue = [];
    this.changeHistory = [];
    this.listeners = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

function createPatternHotReload(renderer, options = {}) {
  return new PatternHotReload(renderer, options);
}

export { PatternHotReload, createPatternHotReload };
