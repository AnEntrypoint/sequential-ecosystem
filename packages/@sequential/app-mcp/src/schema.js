import { extractParameters, normalizeType } from '@sequential/function-introspection';

export function extractParameterSchema(fn) {
  const parameters = extractParameters(fn);

  const properties = {};
  const required = [];

  for (const param of parameters) {
    if (param.isDestructured) {
      const fieldProps = {};
      for (const field of param.fields) {
        fieldProps[field.name] = {
          type: normalizeType(field.type),
          description: field.name
        };
      }
      properties[param.name] = {
        type: 'object',
        properties: fieldProps
      };
      if (param.required) required.push(param.name);
    } else {
      properties[param.name] = { type: 'string' };
      if (param.required) required.push(param.name);
    }
  }

  return {
    type: 'object',
    properties,
    required
  };
}

export function generateMCPTool(name, fn, description = '') {
  return {
    name,
    description: description || fn.name || 'Sequential app tool',
    inputSchema: extractParameterSchema(fn)
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
