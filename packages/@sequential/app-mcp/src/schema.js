export function extractParameterSchema(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/async\s+\(\s*({[^}]+}|[^)]+)\s*\)|function\s+\w+\s*\(\s*({[^}]+}|[^)]+)\s*\)/);

  if (!paramMatch) {
    return { type: 'object', properties: {} };
  }

  const paramStr = paramMatch[1];
  if (paramStr.startsWith('{')) {
    return parseObjectDestructure(paramStr);
  }

  return {
    type: 'object',
    properties: {
      [paramStr.trim()]: { type: 'string' }
    }
  };
}

function parseObjectDestructure(str) {
  const props = {};
  const fields = str
    .slice(1, -1)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  fields.forEach(field => {
    const [name, type] = field.split(':').map(s => s.trim());
    props[name] = {
      type: inferType(type) || 'string',
      description: name
    };
  });

  return {
    type: 'object',
    properties: props,
    required: Object.keys(props)
  };
}

function inferType(typeStr) {
  if (!typeStr) return 'string';
  if (typeStr.includes('number') || typeStr.includes('int')) return 'number';
  if (typeStr.includes('boolean')) return 'boolean';
  if (typeStr.includes('array') || typeStr.includes('[]')) return 'array';
  if (typeStr.includes('object') || typeStr.includes('{}')) return 'object';
  return 'string';
}

export function generateMCPTool(name, fn, description = '') {
  return {
    name,
    description: description || fn.name || 'Sequential app tool',
    inputSchema: {
      type: 'object',
      properties: extractParameterSchema(fn).properties,
      required: Object.keys(extractParameterSchema(fn).properties)
    }
  };
}

export function generateMCPResource(appId, toolName, metadata = {}) {
  return {
    uri: `sequential://${appId}/tool/${toolName}`,
    name: toolName,
    description: metadata.description || `Tool: ${toolName}`,
    mimeType: 'application/json'
  };
}
