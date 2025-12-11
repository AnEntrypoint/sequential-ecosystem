// DOM-based application renderer with error handling
import React from 'react';
import { renderJSX } from './jsx-helpers.js';

export class AppRenderer {
  constructor(registry, rootElement) {
    this.registry = registry;
    this.rootElement = typeof rootElement === 'string' ? document.querySelector(rootElement) : rootElement;
    this.currentComponent = null;
    this.context = {};
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  renderComponent(name, props = {}) {
    try {
      const jsxCode = this.registry.components.get(name);
      if (!jsxCode) {
        throw new Error(`Component ${name} not found`);
      }

      if (!this.registry.validate(name, props)) {
        throw new Error(`Invalid props for component ${name}`);
      }

      const result = renderJSX(jsxCode, props, this.context);
      this.currentComponent = result;
      return result;
    } catch (err) {
      console.error(`Error rendering ${name}:`, err);
      const errorElement = React.createElement('div', {
        style: { color: '#ef4444', padding: '12px', fontFamily: 'monospace', fontSize: '12px' }
      }, `Error rendering ${name}: ${err.message}`);
      this.currentComponent = errorElement;
      return errorElement;
    }
  }

  render(name, props = {}) {
    if (!this.rootElement) {
      throw new Error('Root element not found');
    }
    const component = this.renderComponent(name, props);
    if (component && typeof component.$$typeof === 'symbol') {
      const root = ReactDOM.createRoot(this.rootElement);
      root.render(component);
    }
  }

  clear() {
    if (this.rootElement && typeof ReactDOM !== 'undefined') {
      const root = ReactDOM.createRoot(this.rootElement);
      root.unmount();
    }
    this.currentComponent = null;
  }
}
