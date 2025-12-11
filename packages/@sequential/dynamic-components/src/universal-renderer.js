// Universal renderer facade - maintains 100% backward compatibility
import { escapeHtml as escape } from '@sequentialos/text-encoding';
import { RendererCore } from './renderer-core.js';
import { RendererElementCreators } from './renderer-element-creators.js';
import { RendererPropApplier } from './renderer-prop-applier.js';
import { RenderingEngine } from './renderer-engine.js';
import { RendererHooks } from './renderer-hooks.js';

class UniversalRenderer {
  constructor(options = {}) {
    this.core = new RendererCore(options);
    this.elementCreators = new RendererElementCreators();
    this.propApplier = new RendererPropApplier();
    this.engine = new RenderingEngine(this.core);
    this.hooksManager = new RendererHooks(this.core);

    // Expose for backward compatibility
    this.rootElement = null;
    this.components = this.core.components;
    this.renderers = this.core.renderers;
    this.cache = this.core.cache;
    this.hooks = this.core.hooks;
    this.state = this.core.state;
    this.errorBoundary = this.core.errorBoundary;
    this.debug = this.core.debug;
    this.performanceTracking = this.core.performanceTracking;
    this.metrics = this.core.metrics;

    this.hooksManager.initializeDefaultRenderers(this.elementCreators, this.propApplier);
  }

  registerRenderer(type, renderer) {
    return this.hooksManager.registerRenderer(type, renderer);
  }

  registerHook(event, callback) {
    return this.hooksManager.registerHook(event, callback);
  }

  render(componentDef, rootElement = null) {
    if (rootElement) {
      this.rootElement = rootElement;
      this.core.rootElement = rootElement;
    }
    return this.engine.render(
      componentDef,
      rootElement,
      (event, data) => this.hooksManager.executeHooks(event, data),
      this.core.renderers,
      (text) => this.escapeHtml(text)
    );
  }

  renderComponent(def) {
    return this.engine.renderComponent(def, this.core.renderers);
  }

  renderChildren(children) {
    return this.engine.renderChildren(children, this.core.renderers);
  }

  setState(key, value) {
    this.core.setState(key, value);
    return this;
  }

  getState(key) {
    return this.core.getState(key);
  }

  clearCache() {
    this.core.clearCache();
  }

  getMetrics() {
    return this.core.getMetrics();
  }

  escapeHtml(text) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    return escape(text);
  }

  dispose() {
    this.core.dispose();
  }
}

function createUniversalRenderer(options = {}) {
  return new UniversalRenderer(options);
}

export { UniversalRenderer, createUniversalRenderer };
