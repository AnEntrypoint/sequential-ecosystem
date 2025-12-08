import { AppRenderer, DynamicComponentRegistry } from './core.js';
import { AppComponentLibrary } from './app-components.js';

export class AppRenderingBridge {
  constructor(appId, rootElement) {
    this.appId = appId;
    this.rootElement = typeof rootElement === 'string' ? document.querySelector(rootElement) : rootElement;
    this.componentLibrary = new AppComponentLibrary();
    this.renderer = new AppRenderer(this.componentLibrary.getRegistry(), this.rootElement);
    this.state = {};
    this.observers = new Map();
    this.initialized = false;
  }

  async init() {
    try {
      if (this.initialized) return;
      this.initialized = true;
      console.log(`[${this.appId}] AppRenderingBridge initialized`);
    } catch (err) {
      console.error(`[${this.appId}] Bridge initialization error:`, err);
      this.renderError('Initialization failed', err.message);
    }
  }

  setState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;

    if (this.observers.has(key)) {
      this.observers.get(key).forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (err) {
          console.error(`[${this.appId}] Observer error for ${key}:`, err);
        }
      });
    }
  }

  getState(key) {
    return this.state[key];
  }

  subscribe(key, callback) {
    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }
    this.observers.get(key).add(callback);
    return () => this.observers.get(key).delete(callback);
  }

  renderComponent(name, props = {}) {
    try {
      return this.renderer.renderComponent(name, props);
    } catch (err) {
      console.error(`[${this.appId}] Component render error:`, err);
      return this.createErrorElement(err.message);
    }
  }

  render(componentName, props = {}) {
    try {
      this.renderer.render(componentName, props);
    } catch (err) {
      console.error(`[${this.appId}] Render error:`, err);
      this.renderError('Render error', err.message);
    }
  }

  renderError(title, message) {
    if (!this.rootElement) return;
    this.rootElement.innerHTML = `
      <div style="background: #fee2e2; border: 1px solid #fecaca; borderRadius: 6px; padding: 12px; color: #dc2626;">
        <div style="fontWeight: 600; marginBottom: 4px; fontSize: 12px;">${title}</div>
        <div style="fontSize: 12px; fontFamily: monospace; whiteSpace: pre-wrap; overflowX: auto;">${message}</div>
      </div>
    `;
  }

  renderLoading(message = 'Loading...') {
    if (!this.rootElement) return;
    this.rootElement.innerHTML = `
      <div style="display: flex; flexDirection: column; alignItems: center; gap: 12px; padding: 20px;">
        <div style="width: 32px; height: 32px; border: 3px solid #e0e0e0; borderTop: 3px solid #667eea; borderRadius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="fontSize: 12px; color: #666;">${message}</div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
  }

  createErrorElement(message) {
    const React = window.React;
    if (!React) return null;
    return React.createElement('div', {
      style: { background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px' }
    }, `Error: ${message}`);
  }

  registerComponent(name, code, options = {}) {
    this.componentLibrary.register(name, code, options);
  }

  getComponentLibrary() {
    return this.componentLibrary;
  }

  getRegistry() {
    return this.componentLibrary.getRegistry();
  }

  setContext(context) {
    this.renderer.setContext(context);
  }

  clear() {
    this.renderer.clear();
    this.state = {};
    this.observers.clear();
  }
}

export const createAppBridge = (appId, rootElement) => {
  return new AppRenderingBridge(appId, rootElement);
};

export const initializeAppRendering = async (appId, rootElement = '#app') => {
  const bridge = new AppRenderingBridge(appId, rootElement);
  await bridge.init();
  return bridge;
};
