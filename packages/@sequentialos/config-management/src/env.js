export const EnvType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  URL: 'url',
  PORT: 'port',
  ENUM: 'enum',
  OPTIONAL: 'optional'
};

export function coerceValue(value, type) {
  if (value === undefined || value === null) return undefined;

  switch (type) {
    case EnvType.NUMBER:
      return Number(value);
    case EnvType.BOOLEAN:
      return value === 'true' || value === '1' || value === true;
    case EnvType.PORT:
      return Math.max(0, Math.min(65535, Number(value)));
    case EnvType.URL:
      try {
        new URL(value);
        return value;
      } catch {
        throw new Error(`Invalid URL: ${value}`);
      }
    case EnvType.STRING:
    default:
      return String(value);
  }
}

export function validateEnvValue(name, value, schema) {
  if (value === undefined || value === null) {
    if (schema.required) {
      throw new Error(`Missing required env var: ${name}`);
    }
    return schema.default;
  }

  try {
    const coerced = coerceValue(value, schema.type);

    if (schema.enum && !schema.enum.includes(coerced)) {
      throw new Error(`Must be one of: ${schema.enum.join(', ')}`);
    }

    if (schema.minValue !== undefined && coerced < schema.minValue) {
      throw new Error(`Must be >= ${schema.minValue}`);
    }

    if (schema.maxValue !== undefined && coerced > schema.maxValue) {
      throw new Error(`Must be <= ${schema.maxValue}`);
    }

    return coerced;
  } catch (e) {
    throw new Error(`Invalid ${name}: ${e.message}`);
  }
}

export function loadEnv(envObj, schemas) {
  const result = {};
  const errors = [];

  for (const [name, schema] of Object.entries(schemas)) {
    try {
      result[name] = validateEnvValue(name, envObj[name], schema);
    } catch (e) {
      errors.push(e.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return result;
}

export function getEnvSchema(name, allSchemas) {
  return allSchemas[name] || null;
}

export function listEnvVariables(allSchemas, filter = {}) {
  return Object.entries(allSchemas)
    .filter(([name, schema]) => {
      if (filter.type && schema.type !== filter.type) return false;
      if (filter.required !== undefined && schema.required !== filter.required) return false;
      return true;
    })
    .map(([name, schema]) => ({ name, ...schema }));
}

export function generateEnvDocs(allSchemas, format = 'markdown') {
  if (format === 'markdown') {
    let md = '# Environment Variables\n\n';
    for (const [name, schema] of Object.entries(allSchemas)) {
      md += `## ${name}\n`;
      md += `- **Type**: ${schema.type}\n`;
      md += `- **Required**: ${schema.required ? 'Yes' : 'No'}\n`;
      if (schema.default !== undefined) {
        md += `- **Default**: ${JSON.stringify(schema.default)}\n`;
      }
      if (schema.description) {
        md += `- **Description**: ${schema.description}\n`;
      }
      md += '\n';
    }
    return md;
  }

  return allSchemas;
}
