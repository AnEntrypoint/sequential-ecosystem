export function normalizeType(typeString) {
  if (!typeString || typeof typeString !== 'string') return 'string';

  const lower = typeString.toLowerCase().trim();

  if (lower.includes('string')) return 'string';
  if (lower.includes('number')) return 'number';
  if (lower.includes('int')) return 'integer';
  if (lower.includes('bool')) return 'boolean';
  if (lower.includes('array') || lower.includes('[]')) return 'array';
  if (lower.includes('object') || lower.includes('dict')) return 'object';
  if (lower.includes('date') || lower.includes('timestamp')) return 'string';
  if (lower.includes('null') || lower === 'any' || lower === 'unknown') return 'null';

  return 'string';
}

export function inferType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'null';

  const type = typeof value;
  if (type === 'string') return 'string';
  if (type === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  if (type === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (type === 'object') return 'object';

  return 'string';
}

export function generateJsonSchema(parameters, jsdoc = {}) {
  const properties = {};
  const required = [];

  for (const param of parameters) {
    if (param.isDestructured) {
      const fieldProps = {};
      for (const field of param.fields) {
        fieldProps[field.name] = {
          type: normalizeType(field.type),
          description: jsdoc[field.name] || ''
        };
      }
      properties[param.name] = {
        type: 'object',
        properties: fieldProps,
        description: jsdoc[param.name] || ''
      };
      if (param.required) required.push(param.name);
    } else {
      const schema = {
        type: normalizeType(jsdoc[param.name]?.type || 'string'),
        description: jsdoc[param.name]?.description || ''
      };

      if (param.default) {
        schema.default = param.default;
      }

      properties[param.name] = schema;

      if (param.required) required.push(param.name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

export function createTypeValidator(paramName, typeString) {
  const normalizedType = normalizeType(typeString);

  return function validateType(value) {
    const valueType = inferType(value);

    if (normalizedType === 'string' && valueType !== 'string') {
      return `Parameter ${paramName} expects string, got ${valueType}`;
    }
    if (normalizedType === 'number' && (valueType !== 'number' && valueType !== 'integer')) {
      return `Parameter ${paramName} expects number, got ${valueType}`;
    }
    if (normalizedType === 'integer' && valueType !== 'integer') {
      return `Parameter ${paramName} expects integer, got ${valueType}`;
    }
    if (normalizedType === 'boolean' && valueType !== 'boolean') {
      return `Parameter ${paramName} expects boolean, got ${valueType}`;
    }
    if (normalizedType === 'array' && valueType !== 'array') {
      return `Parameter ${paramName} expects array, got ${valueType}`;
    }
    if (normalizedType === 'object' && valueType !== 'object') {
      return `Parameter ${paramName} expects object, got ${valueType}`;
    }

    return null;
  };
}
