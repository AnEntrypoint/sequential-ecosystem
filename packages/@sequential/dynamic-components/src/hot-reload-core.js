// Core hot reload functionality (rendering, watchers, change processing)
export class HotReloadCore {
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
    this.debounceTimer = null;
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

    const { escapeHtml } = require('@sequentialos/text-encoding');
    this.previewContainer.innerHTML = `
      <div style="padding: 20px; background: #fee; border-radius: 4px; color: #c00;">
        <strong>Render Error:</strong> ${escapeHtml(error.message || String(error))}
        <pre style="margin-top: 10px; font-size: 12px; overflow-x: auto;">${escapeHtml(error.stack || '')}</pre>
      </div>
    `;
  }

  dispose() {
    this.watchers.clear();
    this.changeQueue = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
