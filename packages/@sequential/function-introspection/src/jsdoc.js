export function extractJSDoc(fnString) {
  const jsdocMatch = fnString.match(/\/\*\*[\s\S]*?\*\//);
  if (!jsdocMatch) return { params: {}, returns: null, description: '' };

  const jsdocText = jsdocMatch[0];
  const lines = jsdocText.split('\n').map(line => line.replace(/^\s*\*\s?/, '').trim()).filter(l => l);

  const params = {};
  let currentParam = null;
  let description = '';
  let returns = null;

  for (const line of lines) {
    if (line.startsWith('@param')) {
      const match = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s*(.*)/);
      if (match) {
        const [, type, name, desc] = match;
        currentParam = name;
        params[name] = { type: type.trim(), description: desc || '' };
      }
    } else if (line.startsWith('@returns')) {
      const match = line.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
      if (match) {
        const [, type, desc] = match;
        returns = { type: type.trim(), description: desc || '' };
      }
    } else if (line.startsWith('@') || line === '') {
      currentParam = null;
    } else if (currentParam) {
      params[currentParam].description += ' ' + line;
    } else if (description.length === 0 && !line.startsWith('@')) {
      description = line;
    }
  }

  return { params, returns, description };
}

export function parseJSDocParam(paramText) {
  const match = paramText.match(/\{([^}]+)\}\s+(\w+)\s*(.*)/);
  if (!match) return null;

  const [, type, name, description] = match;
  return {
    name: name.trim(),
    type: type.trim(),
    description: description.trim(),
    isOptional: type.includes('?') || type.includes('=')
  };
}

export function extractReturnType(fnString) {
  const jsdocMatch = fnString.match(/\/\*\*[\s\S]*?\*\//);
  if (!jsdocMatch) return null;

  const returnsMatch = jsdocMatch[0].match(/@returns?\s+\{([^}]+)\}/);
  if (!returnsMatch) return null;

  return returnsMatch[1].trim();
}

export function extractDescription(fnString) {
  const jsdocMatch = fnString.match(/\/\*\*[\s\S]*?\*\//);
  if (!jsdocMatch) return '';

  const lines = jsdocMatch[0]
    .split('\n')
    .map(line => line.replace(/^\s*\/?\*\s?/, '').trim())
    .filter(line => line && !line.startsWith('@'));

  return lines.join(' ').trim();
}

export function mergeParameterWithJSDoc(parameter, jsdocParams = {}) {
  const jsdocInfo = jsdocParams[parameter.name];

  return {
    ...parameter,
    type: jsdocInfo?.type || 'any',
    description: jsdocInfo?.description || '',
    isOptional: jsdocInfo?.isOptional || !parameter.required
  };
}
