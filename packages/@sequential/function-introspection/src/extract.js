const parameterCache = new Map();

export function extractParameters(fn) {
  if (!fn || typeof fn !== 'function') return [];

  const fnString = fn.toString();
  const cacheKey = fnString.length + '-' + fnString.charCodeAt(0);
  if (parameterCache.has(cacheKey)) {
    return parameterCache.get(cacheKey);
  }

  const arrowMatch = fnString.match(/^\s*(?:async\s+)?\(\s*([^)]*)\)/);
  const regularMatch = fnString.match(/^\s*(?:async\s+)?function\s*\w*\s*\(\s*([^)]*)\)/);
  const paramString = (arrowMatch || regularMatch)?.[1] || '';

  const parameters = paramString
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      const destructMatch = p.match(/^\{\s*([^}]+)\s*\}/);
      if (destructMatch) {
        return {
          name: 'params',
          required: true,
          isDestructured: true,
          fields: destructMatch[1]
            .split(',')
            .map(f => {
              const [name, type] = f.trim().split(':').map(s => s.trim());
              return { name, type: type || 'any' };
            })
        };
      }

      const parts = p.split('=');
      const name = parts[0].trim();
      const defaultValue = parts[1] ? parts[1].trim() : undefined;
      return { name, required: !defaultValue, default: defaultValue };
    });

  parameterCache.set(cacheKey, parameters);
  return parameters;
}

export function extractFunctionMetadata(fn, name) {
  if (!fn || typeof fn !== 'function') return null;

  const fnString = fn.toString();
  const isAsync = fnString.includes('async');
  const isArrow = fnString.includes('=>');
  const parameters = extractParameters(fn);
  const arity = fn.length;

  return {
    name: name || fn.name || 'anonymous',
    isAsync,
    isArrow,
    arity,
    parameters,
    fnString: fnString.substring(0, 500)
  };
}

export function createParameterValidator(parameters) {
  return function validate(input) {
    const errors = [];
    const warnings = [];

    for (const param of parameters) {
      if (param.required && !(param.name in input)) {
        errors.push(`Missing required parameter: ${param.name}`);
      }
    }

    const inputKeys = new Set(Object.keys(input));
    const paramNames = new Set(parameters.map(p => p.name));
    for (const key of inputKeys) {
      if (!paramNames.has(key)) {
        warnings.push(`Unexpected parameter: ${key}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  };
}
