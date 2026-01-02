import { z } from 'zod';

export const validateInputSchema = (input, schema) => {
  try {
    const zodSchema = convertSchemaToZod(schema);
    const result = zodSchema.parse(input);
    return { valid: true, data: result };
  } catch (err) {
    return { valid: false, error: err.errors?.[0]?.message || 'Validation failed' };
  }
};

const convertSchemaToZod = (schema) => {
  const shape = {};

  for (const [key, fieldSchema] of Object.entries(schema)) {
    let fieldZod = getZodType(fieldSchema.type);

    if (fieldSchema.required === false) {
      fieldZod = fieldZod.optional();
    } else if (fieldSchema.required) {
      fieldZod = fieldZod;
    }

    if (fieldSchema.description) {
      fieldZod = fieldZod.describe(fieldSchema.description);
    }

    shape[key] = fieldZod;
  }

  return z.object(shape);
};

const getZodType = (type) => {
  switch (type) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'array':
      return z.array(z.any());
    case 'object':
      return z.object({}).catchall(z.any());
    default:
      return z.any();
  }
};

export const sanitizeInput = (input) => {
  return input;
};
