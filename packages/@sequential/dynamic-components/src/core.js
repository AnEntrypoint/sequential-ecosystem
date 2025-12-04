import React from 'react';
import * as BabelStandalone from '@babel/standalone';

const babelTransform = (code) => {
  try {
    const transformed = BabelStandalone.transform(code, {
      presets: ['react'],
      filename: 'dynamic-component.js'
    });
    return transformed.code;
  } catch (err) {
    console.error('Babel transform error:', err);
    throw new Error(`Failed to transform JSX: ${err.message}`);
  }
};

export class DynamicComponentRegistry {
  constructor() {
    this.components = new Map();
    this.validators = new Map();
  }

  register(name, jsxCode, validator = null) {
    if (typeof jsxCode !== 'string') {
      throw new Error(`Component ${name} JSX must be a string`);
    }
    this.components.set(name, jsxCode);
    if (validator) {
      this.validators.set(name, validator);
    }
  }

  validate(name, props = {}) {
    const validator = this.validators.get(name);
    if (!validator) return true;
    return validator(props);
  }

  async render(name, props = {}) {
    const jsxCode = this.components.get(name);
    if (!jsxCode) {
      throw new Error(`Component ${name} not found`);
    }

    if (!this.validate(name, props)) {
      throw new Error(`Invalid props for component ${name}`);
    }

    const transformed = babelTransform(jsxCode);
    const fn = new Function('React', 'props', `return ${transformed}`);
    return fn(React, props);
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
