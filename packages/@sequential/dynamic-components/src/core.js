import React from 'react';
import * as BabelStandalone from '@babel/standalone';

const transformCache = new Map();
const componentCache = new Map();
const MAX_CACHE_SIZE = 256;

const babelTransform = (code) => {
  const cached = transformCache.get(code);
  if (cached) return cached;

  try {
    const transformed = BabelStandalone.transform(code, {
      presets: ['react'],
      filename: 'dynamic-component.js'
    });

    if (transformCache.size >= MAX_CACHE_SIZE) {
      const firstKey = transformCache.keys().next().value;
      transformCache.delete(firstKey);
    }

    transformCache.set(code, transformed.code);
    return transformed.code;
  } catch (err) {
    console.error('Babel transform error:', err);
    throw new Error(`Failed to transform JSX: ${err.message}`);
  }
};

const memoizeFunction = (fn, context = {}) => {
  return React.useMemo(() => fn, Object.values(context));
};

export class DynamicComponentRegistry {
  constructor(options = {}) {
    this.components = new Map();
    this.validators = new Map();
    this.metadata = new Map();
    this.categories = new Map();
    this.maxCacheSize = options.maxCacheSize || MAX_CACHE_SIZE;
  }

  register(name, jsxCode, options = {}) {
    if (typeof jsxCode !== 'string') {
      throw new Error(`Component ${name} JSX must be a string`);
    }

    const { validator = null, category = 'default', description = '', tags = [] } =
      typeof options === 'function' ? { validator: options } : options;

    this.components.set(name, jsxCode);
    if (validator) {
      this.validators.set(name, validator);
    }

    this.metadata.set(name, { category, description, tags });
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);
  }

  validate(name, props = {}) {
    const validator = this.validators.get(name);
    if (!validator) return true;
    return validator(props);
  }

  getByCategory(category) {
    return (this.categories.get(category) || []).map(name => ({
      name,
      code: this.components.get(name),
      meta: this.metadata.get(name)
    }));
  }

  search(query) {
    const q = query.toLowerCase();
    return Array.from(this.components.keys())
      .filter(name => {
        const meta = this.metadata.get(name) || {};
        const matches = name.toLowerCase().includes(q) ||
          meta.description?.toLowerCase().includes(q) ||
          meta.tags?.some(tag => tag.toLowerCase().includes(q));
        return matches;
      })
      .map(name => ({
        name,
        code: this.components.get(name),
        meta: this.metadata.get(name)
      }));
  }

  listCategories() {
    return Array.from(this.categories.keys());
  }

  async render(name, props = {}) {
    const jsxCode = this.components.get(name);
    if (!jsxCode) {
      throw new Error(`Component ${name} not found`);
    }

    if (!this.validate(name, props)) {
      throw new Error(`Invalid props for component ${name}`);
    }

    const cacheKey = name + JSON.stringify(props);
    const cached = componentCache.get(cacheKey);
    if (cached) return cached;

    const transformed = babelTransform(jsxCode);
    const fn = new Function('React', 'props', `return ${transformed}`);
    const result = fn(React, props);

    if (componentCache.size >= this.maxCacheSize) {
      const firstKey = componentCache.keys().next().value;
      componentCache.delete(firstKey);
    }
    componentCache.set(cacheKey, result);

    return result;
  }

  getComponent(name) {
    const jsxCode = this.components.get(name);
    if (!jsxCode) {
      throw new Error(`Component ${name} not found`);
    }

    return (props) => {
      const [element, setElement] = React.useState(null);
      const [error, setError] = React.useState(null);

      React.useEffect(() => {
        try {
          if (!this.validate(name, props)) {
            throw new Error(`Invalid props for component ${name}`);
          }
          const transformed = babelTransform(jsxCode);
          const fn = new Function('React', 'props', `return ${transformed}`);
          const result = fn(React, props);
          setElement(result);
          setError(null);
        } catch (err) {
          setError(err);
          console.error(`Error rendering ${name}:`, err);
        }
      }, [props]);

      if (error) {
        return React.createElement('div', { style: { color: 'red', padding: '10px' } },
          `Error rendering ${name}: ${error.message}`
        );
      }

      return element || React.createElement('div', null, `Loading ${name}...`);
    };
  }

  list() {
    return Array.from(this.components.keys());
  }

  remove(name) {
    this.components.delete(name);
    this.validators.delete(name);
  }
}

export function useDynamicComponent(registry, name, props = {}) {
  const [component, setComponent] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      setLoading(true);
      if (!registry.validate(name, props)) {
        throw new Error(`Invalid props for component ${name}`);
      }
      const jsxCode = registry.components.get(name);
      if (!jsxCode) {
        throw new Error(`Component ${name} not found`);
      }
      const transformed = babelTransform(jsxCode);
      const fn = new Function('React', 'props', `return ${transformed}`);
      const result = fn(React, props);
      setComponent(result);
      setError(null);
    } catch (err) {
      setError(err);
      setComponent(null);
    } finally {
      setLoading(false);
    }
  }, [registry, name, JSON.stringify(props)]);

  return { component, error, loading };
}

export function renderJSX(jsxCode, props = {}, context = {}) {
  try {
    const transformed = babelTransform(jsxCode);
    const { React: ContextReact = React, ...contextVars } = context;
    const allVars = { React: ContextReact, props, ...contextVars };
    const varNames = Object.keys(allVars);
    const varValues = Object.values(allVars);
    const fn = new Function(...varNames, `return ${transformed}`);
    return fn(...varValues);
  } catch (err) {
    console.error('Error rendering JSX:', err);
    throw new Error(`Failed to render JSX: ${err.message}`);
  }
}

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

export class ComponentBuilder {
  constructor(registry) {
    this.registry = registry;
  }

  createLayout(type, props = {}, children = []) {
    const layouts = {
      flex: (p, c) => `<div style={{display: 'flex', flexDirection: '${p.direction || 'row'}', gap: '${p.gap || '12px'}', alignItems: '${p.align || 'stretch'}'}}>${c.join('')}</div>`,
      grid: (p, c) => `<div style={{display: 'grid', gridTemplateColumns: '${p.cols || '1fr'}', gap: '${p.gap || '16px'}'}}>${c.join('')}</div>`,
      stack: (p, c) => `<div style={{display: 'flex', flexDirection: 'column', gap: '${p.gap || '12px'}'}}>${c.join('')}</div>`,
      section: (p, c) => `<section style={{padding: '${p.padding || '16px'}', borderRadius: '${p.radius || '8px'}', border: '1px solid #e0e0e0'}}>${c.join('')}</section>`,
    };

    const layout = layouts[type];
    if (!layout) {
      throw new Error(`Unknown layout type: ${type}`);
    }

    return layout(props, children);
  }

  createComponent(type, props = {}) {
    const components = {
      heading: (p) => `<h${p.level || 1} style={{margin: 0}}>${p.content}</h${p.level || 1}>`,
      paragraph: (p) => `<p style={{margin: 0}}>${p.content}</p>`,
      button: (p) => `<button style={{padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}>${p.label || 'Button'}</button>`,
      input: (p) => `<input type="${p.type || 'text'}" placeholder="${p.placeholder || ''}" style={{padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px'}}/>`,
      card: (p) => `<div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '16px'}}>${p.content || ''}</div>`,
      text: (p) => `<span>${p.content || ''}</span>`,
    };

    const component = components[type];
    if (!component) {
      throw new Error(`Unknown component type: ${type}`);
    }

    return component(props);
  }

  registerBuiltins() {
    const builtins = {
      'layout-flex': '<div style={{display: "flex", gap: "12px"}}>...</div>',
      'layout-grid': '<div style={{display: "grid", gap: "16px"}}>...</div>',
      'text-heading': '<h2>Heading</h2>',
      'text-paragraph': '<p>Paragraph text</p>',
      'form-button': '<button style={{padding: "8px 16px"}}>Button</button>',
      'form-input': '<input type="text" placeholder="Enter text" style={{padding: "8px 12px"}}/>',
      'card-basic': '<div style={{border: "1px solid #ddd", borderRadius: "8px", padding: "16px"}}>Card content</div>',
    };

    Object.entries(builtins).forEach(([name, code]) => {
      this.registry.register(name, code, {
        category: 'builtins',
        description: `Built-in ${name} component`
      });
    });
  }
}
