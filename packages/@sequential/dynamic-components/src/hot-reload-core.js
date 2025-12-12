/**
 * hot-reload-core.js - Hot Reload Core Facade
 *
 * Delegates to watchers, nested values, and change processor modules
 */

import { HotReloadWatchers } from './hot-reload-watchers.js';
import { HotReloadNestedValues } from './hot-reload-nested-values.js';
import { HotReloadChangeProcessor } from './hot-reload-change-processor.js';

export class HotReloadCore {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.previewContainer = null;
    this.currentComponent = null;
    this.autoRefresh = options.autoRefresh !== false;
    this.debugMode = options.debug || false;

    this.watchers = new HotReloadWatchers();
    this.nestedValues = new HotReloadNestedValues();
    this.changeProcessor = new HotReloadChangeProcessor(options.debounceDelay || 300);
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
    return this.watchers.watchPath(path, callback);
  }

  setComponent(componentDef) {
    this.currentComponent = JSON.parse(JSON.stringify(componentDef));
    this.render();
    return this;
  }

  updateComponent(updates) {
    if (!this.currentComponent) return this;

    this.changeProcessor.queueChange(updates);
    this.changeProcessor.debounceRender(() => this.processChanges());
    return this;
  }

  processChanges() {
    const changeQueue = this.changeProcessor.changeQueue;
    if (changeQueue.length === 0) return;

    for (const change of changeQueue) {
      this.nestedValues.applyChanges(this.currentComponent, change.updates);
    }

    this.watchers.checkWatchers(this.currentComponent, (obj, path) => this.nestedValues.getNestedValue(obj, path));
    this.render();
  }

  applyChanges(component, updates) {
    this.nestedValues.applyChanges(component, updates);
    this.watchers.checkWatchers(component, (obj, path) => this.nestedValues.getNestedValue(obj, path));
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
    this.changeProcessor.clear();
  }
}
