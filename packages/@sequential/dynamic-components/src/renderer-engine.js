// Core rendering engine with caching
export class RenderingEngine {
  constructor(core) {
    this.core = core;
  }

  render(componentDef, rootElement, executeHooks, renderers, escapeHtml) {
    const startTime = performance.now();

    if (rootElement) {
      this.core.rootElement = rootElement;
    }

    if (!this.core.rootElement) {
      throw new Error('Root element not specified. Call render(def, element) or set root element first.');
    }

    try {
      executeHooks('beforeRender', { component: componentDef });

      const element = this.renderComponent(componentDef, renderers);

      this.core.rootElement.innerHTML = '';
      this.core.rootElement.appendChild(element);

      this.core.metrics.renders++;
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      this.core.metrics.renderTimes.push(renderTime);
      this.core.metrics.totalTime += renderTime;

      if (this.core.performanceTracking) {
        console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      }

      executeHooks('afterRender', { component: componentDef, element });

      return element;
    } catch (e) {
      if (this.core.errorBoundary) {
        return this.renderError(e, escapeHtml);
      }
      throw e;
    }
  }

  renderComponent(def, renderers) {
    if (!def) return document.createTextNode('');

    if (typeof def === 'string') {
      return document.createTextNode(def);
    }

    const cacheKey = this.getCacheKey(def);
    if (this.core.cache.has(cacheKey)) {
      this.core.metrics.cacheHits++;
      return this.core.cache.get(cacheKey).cloneNode(true);
    }

    const renderer = renderers.get(def.type) || renderers.get('box');
    if (!renderer) {
      return this.renderError(new Error(`Unknown type: ${def.type}`));
    }

    const children = this.renderChildren(def.children, renderers);
    const element = renderer(def, children);

    this.core.metrics.cacheMisses++;
    this.core.cache.set(cacheKey, element.cloneNode(true));

    return element;
  }

  renderChildren(children, renderers) {
    if (!children) return null;

    if (typeof children === 'string') {
      return [document.createTextNode(children)];
    }

    if (Array.isArray(children)) {
      return children.map(child => this.renderComponent(child, renderers)).filter(Boolean);
    }

    return [this.renderComponent(children, renderers)];
  }

  renderError(error, escapeHtml) {
    const el = document.createElement('div');
    el.style.padding = '16px';
    el.style.backgroundColor = '#fee';
    el.style.borderRadius = '4px';
    el.style.color = '#c00';
    const escapeFunc = escapeHtml || ((text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    });
    el.innerHTML = `<strong>Render Error:</strong> ${escapeFunc(error.message || String(error))}`;
    return el;
  }

  getCacheKey(def) {
    return `${def.type}:${JSON.stringify(def.style || {})}:${JSON.stringify(def.attributes || {})}`;
  }
}
