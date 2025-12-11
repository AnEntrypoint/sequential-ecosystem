// JSX rendering and React hook helpers
import React from 'react';
import { babelTransform } from './babel-transformer.js';

const componentCache = new Map();
const MAX_CACHE_SIZE = 256;

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

export function getCachedComponent(registry, name, props) {
  const cacheKey = name + JSON.stringify(props);
  const cached = componentCache.get(cacheKey);
  if (cached) return cached;

  return null;
}

export function setCachedComponent(name, props, component) {
  const cacheKey = name + JSON.stringify(props);
  if (componentCache.size >= MAX_CACHE_SIZE) {
    const firstKey = componentCache.keys().next().value;
    componentCache.delete(firstKey);
  }
  componentCache.set(cacheKey, component);
}

export function clearComponentCache() {
  componentCache.clear();
}
