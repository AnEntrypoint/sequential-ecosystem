import { z } from 'zod';

export const pathSchema = z.string()
  .min(1, 'Path is required')
  .regex(/^[a-zA-Z0-9._\/\-]+$/, 'Path contains invalid characters');

export const relativePathSchema = z.string()
  .min(1, 'Path is required')
  .refine(p => !p.includes('..'), 'Path traversal not allowed')
  .refine(p => !p.startsWith('/'), 'Path must be relative (not absolute)');

export const validatePathRelative = (path) => {
  try {
    return { valid: true, data: relativePathSchema.parse(path) };
  } catch (err) {
    return { valid: false, error: err.errors[0]?.message || 'Invalid path' };
  }
};

export const validatePath = (path) => {
  try {
    return { valid: true, data: pathSchema.parse(path) };
  } catch (err) {
    return { valid: false, error: err.errors[0]?.message || 'Invalid path' };
  }
};
