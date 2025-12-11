import { renderBox, renderContainer, renderButton, renderInput, renderHeading, renderParagraph, renderImage, renderGrid, renderFlex, renderCard, renderSection } from './element-renderers.js';

export class DynamicRenderer {
  constructor() {
    this.renderers = new Map();
    this.renderCache = new Map();
    this.renderHooks = [];
    this.initializeDefaultRenderers();
  }

  initializeDefaultRenderers() {
    const defaultRenderers = {
      box: renderBox,
      container: renderContainer,
      button: renderButton,
      input: renderInput,
      heading: renderHeading,
      paragraph: renderParagraph,
      image: renderImage,
      grid: renderGrid,
      flex: renderFlex,
      card: renderCard,
      section: renderSection
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
    const result = renderer.call(this, component, component.children);

    this.renderCache.set(cacheKey, result);

    this.executeHooks('after', component);

    return result;
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
