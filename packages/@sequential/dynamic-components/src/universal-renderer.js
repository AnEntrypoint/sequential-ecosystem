import { escapeHtml as escape } from '@sequential/text-encoding';

class UniversalRenderer {
  constructor(options = {}) {
    this.rootElement = null;
    this.components = new Map();
    this.renderers = new Map();
    this.cache = new Map();
    this.hooks = new Map();
    this.state = new Map();
    this.errorBoundary = options.errorBoundary || true;
    this.debug = options.debug || false;
    this.performanceTracking = options.performanceTracking || false;
    this.metrics = {
      renders: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTime: 0,
      renderTimes: []
    };
    this.initializeDefaultRenderers();
  }

  initializeDefaultRenderers() {
    const renderers = {
      box: (def, children) => this.createBox(def, children),
      div: (def, children) => this.createBox(def, children),
      container: (def, children) => this.createBox(def, children),
      button: (def, children) => this.createButton(def, children),
      input: (def, children) => this.createInput(def, children),
      textarea: (def, children) => this.createTextarea(def, children),
      select: (def, children) => this.createSelect(def, children),
      heading: (def, children) => this.createHeading(def, children),
      h1: (def, children) => this.createHeading(def, children, 1),
      h2: (def, children) => this.createHeading(def, children, 2),
      h3: (def, children) => this.createHeading(def, children, 3),
      h4: (def, children) => this.createHeading(def, children, 4),
      h5: (def, children) => this.createHeading(def, children, 5),
      h6: (def, children) => this.createHeading(def, children, 6),
      paragraph: (def, children) => this.createParagraph(def, children),
      p: (def, children) => this.createParagraph(def, children),
      text: (def, children) => this.createText(def),
      image: (def, children) => this.createImage(def, children),
      img: (def, children) => this.createImage(def, children),
      link: (def, children) => this.createLink(def, children),
      a: (def, children) => this.createLink(def, children),
      grid: (def, children) => this.createGrid(def, children),
      flex: (def, children) => this.createFlex(def, children),
      card: (def, children) => this.createCard(def, children),
      section: (def, children) => this.createSection(def, children),
      header: (def, children) => this.createHeader(def, children),
      footer: (def, children) => this.createFooter(def, children),
      nav: (def, children) => this.createNav(def, children),
      list: (def, children) => this.createList(def, children),
      ul: (def, children) => this.createList(def, children),
      ol: (def, children) => this.createList(def, children, true),
      li: (def, children) => this.createListItem(def, children),
      table: (def, children) => this.createTable(def, children),
      form: (def, children) => this.createForm(def, children)
    };

    Object.entries(renderers).forEach(([type, renderer]) => {
      this.renderers.set(type, renderer);
    });
  }

  registerRenderer(type, renderer) {
    this.renderers.set(type, renderer);
    this.clearCache();
    return this;
  }

  registerHook(event, callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(callback);
    return this;
  }

  executeHooks(event, data) {
    const callbacks = this.hooks.get(event) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error(`Hook error (${event}):`, e);
      }
    });
  }

  render(componentDef, rootElement = null) {
    const startTime = performance.now();

    if (rootElement) {
      this.rootElement = rootElement;
    }

    if (!this.rootElement) {
      throw new Error('Root element not specified. Call render(def, element) or set root element first.');
    }

    try {
      this.executeHooks('beforeRender', { component: componentDef });

      const element = this.renderComponent(componentDef);

      this.rootElement.innerHTML = '';
      this.rootElement.appendChild(element);

      this.metrics.renders++;
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      this.metrics.renderTimes.push(renderTime);
      this.metrics.totalTime += renderTime;

      if (this.performanceTracking) {
        console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      }

      this.executeHooks('afterRender', { component: componentDef, element });

      return element;
    } catch (e) {
      if (this.errorBoundary) {
        return this.renderError(e);
      }
      throw e;
    }
  }

  renderComponent(def) {
    if (!def) return document.createTextNode('');

    if (typeof def === 'string') {
      return document.createTextNode(def);
    }

    const cacheKey = this.getCacheKey(def);
    if (this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey).cloneNode(true);
    }

    const renderer = this.renderers.get(def.type) || this.renderers.get('box');
    if (!renderer) {
      return this.renderError(new Error(`Unknown type: ${def.type}`));
    }

    const children = this.renderChildren(def.children);
    const element = renderer(def, children);

    this.metrics.cacheMisses++;
    this.cache.set(cacheKey, element.cloneNode(true));

    return element;
  }

  renderChildren(children) {
    if (!children) return null;

    if (typeof children === 'string') {
      return [document.createTextNode(children)];
    }

    if (Array.isArray(children)) {
      return children.map(child => this.renderComponent(child)).filter(Boolean);
    }

    return [this.renderComponent(children)];
  }

  createBox(def, children) {
    const el = document.createElement(def.type === 'div' || def.type === 'box' ? 'div' : def.type);
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createButton(def, children) {
    const el = document.createElement('button');
    el.textContent = def.content || def.label || 'Button';
    this.applyCommonProps(el, def);
    this.applyEventListeners(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createInput(def, children) {
    const el = document.createElement('input');
    el.type = def.type || 'text';
    el.placeholder = def.placeholder || '';
    el.value = def.value || '';
    if (def.disabled) el.disabled = true;
    if (def.required) el.required = true;
    this.applyCommonProps(el, def);
    this.applyEventListeners(el, def);
    return el;
  }

  createTextarea(def, children) {
    const el = document.createElement('textarea');
    el.placeholder = def.placeholder || '';
    el.value = def.value || '';
    el.rows = def.rows || 4;
    el.cols = def.cols || 50;
    this.applyCommonProps(el, def);
    this.applyEventListeners(el, def);
    return el;
  }

  createSelect(def, children) {
    const el = document.createElement('select');
    if (def.options) {
      def.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value || opt;
        option.textContent = opt.label || opt;
        el.appendChild(option);
      });
    }
    this.applyCommonProps(el, def);
    this.applyEventListeners(el, def);
    return el;
  }

  createHeading(def, children, level = null) {
    const h = level || def.level || 2;
    const el = document.createElement(`h${Math.min(Math.max(h, 1), 6)}`);
    el.textContent = def.content || def.label || 'Heading';
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createParagraph(def, children) {
    const el = document.createElement('p');
    el.textContent = def.content || def.text || '';
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createText(def) {
    return document.createTextNode(def.content || def.text || '');
  }

  createImage(def, children) {
    const el = document.createElement('img');
    el.src = def.src || '';
    el.alt = def.alt || '';
    el.title = def.title || '';
    this.applyCommonProps(el, def);
    return el;
  }

  createLink(def, children) {
    const el = document.createElement('a');
    el.href = def.href || '#';
    el.textContent = def.content || def.label || 'Link';
    el.target = def.target || '';
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createGrid(def, children) {
    const el = document.createElement('div');
    this.applyStyles(el, {
      display: 'grid',
      gridTemplateColumns: def.columns || 'repeat(2, 1fr)',
      gap: def.gap || '16px',
      ...def.style
    });
    el.className = 'pattern-grid ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createFlex(def, children) {
    const el = document.createElement('div');
    this.applyStyles(el, {
      display: 'flex',
      flexDirection: def.direction || 'row',
      gap: def.gap || '12px',
      alignItems: def.alignItems || 'flex-start',
      justifyContent: def.justifyContent || 'flex-start',
      ...def.style
    });
    el.className = 'pattern-flex ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createCard(def, children) {
    const el = document.createElement('div');
    this.applyStyles(el, {
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      ...def.style
    });
    el.className = 'pattern-card ' + (def.className || '');
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createSection(def, children) {
    const el = document.createElement('section');
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createHeader(def, children) {
    const el = document.createElement('header');
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createFooter(def, children) {
    const el = document.createElement('footer');
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createNav(def, children) {
    const el = document.createElement('nav');
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createList(def, children, ordered = false) {
    const el = document.createElement(ordered ? 'ol' : 'ul');
    if (def.items) {
      def.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.text || item;
        el.appendChild(li);
      });
    }
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createListItem(def, children) {
    const el = document.createElement('li');
    el.textContent = def.content || def.text || '';
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createTable(def, children) {
    const el = document.createElement('table');
    this.applyCommonProps(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  createForm(def, children) {
    const el = document.createElement('form');
    el.method = def.method || 'POST';
    el.action = def.action || '';
    this.applyCommonProps(el, def);
    this.applyEventListeners(el, def);
    if (children) children.forEach(child => el.appendChild(child));
    return el;
  }

  applyCommonProps(el, def) {
    if (def.id) el.id = def.id;
    if (def.className) el.className = def.className;
    if (def.dataAttributes) {
      Object.entries(def.dataAttributes).forEach(([key, value]) => {
        el.setAttribute(`data-${key}`, String(value));
      });
    }
    this.applyStyles(el, def.style);
    this.applyAttributes(el, def.attributes);
  }

  applyStyles(el, styles) {
    if (!styles || typeof styles !== 'object') return;

    Object.entries(styles).forEach(([key, value]) => {
      const cssKey = this.toCSSProperty(key);
      try {
        el.style.setProperty(cssKey, String(value));
      } catch (e) {
        if (this.debug) console.warn(`Style error ${cssKey}:`, value);
      }
    });
  }

  applyAttributes(el, attrs) {
    if (!attrs || typeof attrs !== 'object') return;

    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('aria-') || key.startsWith('data-')) {
        el.setAttribute(key, String(value));
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    });
  }

  applyEventListeners(el, def) {
    const events = ['click', 'change', 'input', 'blur', 'focus', 'submit'];
    events.forEach(event => {
      const handler = def[`on${event.charAt(0).toUpperCase() + event.slice(1)}`];
      if (handler && typeof handler === 'function') {
        el.addEventListener(event, handler);
      }
    });
  }

  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  renderError(error) {
    const el = document.createElement('div');
    el.style.padding = '16px';
    el.style.backgroundColor = '#fee';
    el.style.borderRadius = '4px';
    el.style.color = '#c00';
    el.innerHTML = `<strong>Render Error:</strong> ${this.escapeHtml(error.message || String(error))}`;
    return el;
  }

  escapeHtml(text) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    return escape(text);
  }

  getCacheKey(def) {
    return `${def.type}:${JSON.stringify(def.style || {})}:${JSON.stringify(def.attributes || {})}`;
  }

  setState(key, value) {
    this.state.set(key, value);
    return this;
  }

  getState(key) {
    return this.state.get(key);
  }

  clearCache() {
    this.cache.clear();
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageRenderTime: this.metrics.renders > 0 ? this.metrics.totalTime / this.metrics.renders : 0,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  dispose() {
    this.clearCache();
    this.hooks.clear();
    this.renderers.clear();
    this.state.clear();
  }
}

function createUniversalRenderer(options = {}) {
  return new UniversalRenderer(options);
}

export { UniversalRenderer, createUniversalRenderer };
