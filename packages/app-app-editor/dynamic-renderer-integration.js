class DynamicRendererIntegration {
  constructor(patternBridge) {
    this.patternBridge = patternBridge;
    this.renderers = new Map();
    this.renderCache = new Map();
    this.renderHooks = [];
    this.initializeDefaultRenderers();
  }

  initializeDefaultRenderers() {
    const defaultRenderers = {
      box: (props, children) => this.renderBox(props, children),
      container: (props, children) => this.renderContainer(props, children),
      button: (props, children) => this.renderButton(props, children),
      input: (props, children) => this.renderInput(props, children),
      heading: (props, children) => this.renderHeading(props, children),
      paragraph: (props, children) => this.renderParagraph(props, children),
      image: (props, children) => this.renderImage(props, children),
      grid: (props, children) => this.renderGrid(props, children),
      flex: (props, children) => this.renderFlex(props, children),
      card: (props, children) => this.renderCard(props, children),
      section: (props, children) => this.renderSection(props, children)
    };

    Object.entries(defaultRenderers).forEach(([type, renderer]) => {
      this.registerRenderer(type, renderer);
    });
  }

  registerRenderer(type, renderer) {
    this.renderers.set(type, renderer);
  }

  onBeforeRender(callback) {
    this.renderHooks.push({ phase: 'before', callback });
  }

  onAfterRender(callback) {
    this.renderHooks.push({ phase: 'after', callback });
  }

  executeHooks(phase, component) {
    this.renderHooks
      .filter(h => h.phase === phase)
      .forEach(h => {
        try {
          h.callback(component);
        } catch (e) {
          console.error(`Render hook error (${phase}):`, e);
        }
      });
  }

  render(component, context = {}) {
    const cacheKey = `${component.id}_${JSON.stringify(component.style)}_${JSON.stringify(component.props)}`;

    if (this.renderCache.has(cacheKey)) {
      return this.renderCache.get(cacheKey);
    }

    this.executeHooks('before', component);

    const renderer = this.renderers.get(component.type) || this.renderers.get('box');
    const result = renderer(component, component.children);

    this.renderCache.set(cacheKey, result);

    this.executeHooks('after', component);

    return result;
  }

  renderBox(component, children) {
    const element = document.createElement('div');
    element.className = `pattern-box pattern-${component.id}`;
    element.setAttribute('data-pattern-id', component.id);
    element.setAttribute('data-pattern-type', component.type);

    this.applyStyles(element, component.style);
    this.applyAttributes(element, component.props);

    if (children) {
      const childContent = this.renderChildren(children);
      element.appendChild(childContent);
    }

    return element;
  }

  renderContainer(component, children) {
    return this.renderBox(component, children);
  }

  renderButton(component, children) {
    const element = document.createElement('button');
    element.className = 'pattern-button';
    element.setAttribute('data-pattern-id', component.id);

    element.textContent = component.props?.content || 'Button';

    this.applyStyles(element, {
      ...this.defaultButtonStyles(),
      ...component.style
    });

    this.applyAttributes(element, component.props);

    if (component.props?.onclick) {
      element.addEventListener('click', () => {
        try {
          eval(component.props.onclick);
        } catch (e) {
          console.error('Button click handler error:', e);
        }
      });
    }

    return element;
  }

  renderInput(component, children) {
    const element = document.createElement('input');
    element.className = 'pattern-input';
    element.setAttribute('data-pattern-id', component.id);
    element.type = component.props?.type || 'text';
    element.placeholder = component.props?.placeholder || '';

    this.applyStyles(element, {
      ...this.defaultInputStyles(),
      ...component.style
    });

    this.applyAttributes(element, component.props);

    if (component.props?.onChange) {
      element.addEventListener('change', (e) => {
        try {
          eval(component.props.onChange);
        } catch (e) {
          console.error('Input change handler error:', e);
        }
      });
    }

    return element;
  }

  renderHeading(component, children) {
    const level = component.props?.level || 2;
    const element = document.createElement(`h${Math.min(Math.max(level, 1), 6)}`);
    element.className = 'pattern-heading';
    element.setAttribute('data-pattern-id', component.id);

    element.textContent = component.props?.content || component.content || 'Heading';

    this.applyStyles(element, {
      ...this.defaultHeadingStyles(),
      ...component.style
    });

    this.applyAttributes(element, component.props);

    return element;
  }

  renderParagraph(component, children) {
    const element = document.createElement('p');
    element.className = 'pattern-paragraph';
    element.setAttribute('data-pattern-id', component.id);

    element.textContent = component.props?.content || component.content || '';

    this.applyStyles(element, {
      ...this.defaultParagraphStyles(),
      ...component.style
    });

    this.applyAttributes(element, component.props);

    return element;
  }

  renderImage(component, children) {
    const element = document.createElement('img');
    element.className = 'pattern-image';
    element.setAttribute('data-pattern-id', component.id);
    element.src = component.props?.src || '';
    element.alt = component.props?.alt || '';

    this.applyStyles(element, {
      ...this.defaultImageStyles(),
      ...component.style
    });

    this.applyAttributes(element, component.props);

    return element;
  }

  renderGrid(component, children) {
    const element = document.createElement('div');
    element.className = 'pattern-grid';
    element.setAttribute('data-pattern-id', component.id);

    this.applyStyles(element, {
      display: 'grid',
      gridTemplateColumns: component.props?.columns || 'repeat(2, 1fr)',
      gap: component.props?.gap || '16px',
      ...component.style
    });

    if (children) {
      const childContent = this.renderChildren(children);
      element.appendChild(childContent);
    }

    return element;
  }

  renderFlex(component, children) {
    const element = document.createElement('div');
    element.className = 'pattern-flex';
    element.setAttribute('data-pattern-id', component.id);

    this.applyStyles(element, {
      display: 'flex',
      flexDirection: component.props?.direction || 'row',
      gap: component.props?.gap || '12px',
      alignItems: component.props?.alignItems || 'flex-start',
      justifyContent: component.props?.justifyContent || 'flex-start',
      ...component.style
    });

    if (children) {
      const childContent = this.renderChildren(children);
      element.appendChild(childContent);
    }

    return element;
  }

  renderCard(component, children) {
    const element = document.createElement('div');
    element.className = 'pattern-card';
    element.setAttribute('data-pattern-id', component.id);

    this.applyStyles(element, {
      ...this.defaultCardStyles(),
      ...component.style
    });

    if (children) {
      const childContent = this.renderChildren(children);
      element.appendChild(childContent);
    }

    return element;
  }

  renderSection(component, children) {
    const element = document.createElement('section');
    element.className = 'pattern-section';
    element.setAttribute('data-pattern-id', component.id);

    this.applyStyles(element, component.style);

    if (children) {
      const childContent = this.renderChildren(children);
      element.appendChild(childContent);
    }

    return element;
  }

  renderChildren(children) {
    const container = document.createDocumentFragment();

    if (!children) return container;

    if (typeof children === 'string') {
      container.appendChild(document.createTextNode(children));
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          container.appendChild(document.createTextNode(child));
        } else if (typeof child === 'object') {
          container.appendChild(this.render(child));
        }
      });
    } else if (typeof children === 'object') {
      container.appendChild(this.render(children));
    }

    return container;
  }

  applyStyles(element, styles) {
    if (!styles || typeof styles !== 'object') return;

    Object.entries(styles).forEach(([key, value]) => {
      const cssKey = this.toCSSProperty(key);
      try {
        element.style.setProperty(cssKey, String(value));
      } catch (e) {
        console.warn(`Failed to set style ${cssKey}:`, value);
      }
    });
  }

  applyAttributes(element, props) {
    if (!props || typeof props !== 'object') return;

    const skipProps = ['content', 'onclick', 'onChange', 'type', 'placeholder', 'level', 'src', 'alt', 'columns', 'gap', 'direction', 'alignItems', 'justifyContent'];

    Object.entries(props).forEach(([key, value]) => {
      if (skipProps.includes(key)) return;

      if (key.startsWith('aria-') || key.startsWith('data-')) {
        element.setAttribute(key, String(value));
      } else if (key === 'className') {
        element.className += ` ${value}`;
      } else if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else if (value != null) {
        element.setAttribute(key, String(value));
      }
    });
  }

  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  clearCache() {
    this.renderCache.clear();
  }

  defaultButtonStyles() {
    return {
      padding: '8px 16px',
      backgroundColor: '#667eea',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    };
  }

  defaultInputStyles() {
    return {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'inherit'
    };
  }

  defaultHeadingStyles() {
    return {
      margin: '0 0 16px 0',
      fontWeight: '600',
      lineHeight: '1.2'
    };
  }

  defaultParagraphStyles() {
    return {
      margin: '0 0 12px 0',
      lineHeight: '1.6',
      color: '#374151'
    };
  }

  defaultImageStyles() {
    return {
      maxWidth: '100%',
      height: 'auto',
      display: 'block'
    };
  }

  defaultCardStyles() {
    return {
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    };
  }

  getRendererList() {
    return Array.from(this.renderers.keys());
  }

  isRendererRegistered(type) {
    return this.renderers.has(type);
  }

  getRenderStats() {
    return {
      cacheSize: this.renderCache.size,
      registeredTypes: this.renderers.size,
      hooks: this.renderHooks.length
    };
  }
}

export { DynamicRendererIntegration };
