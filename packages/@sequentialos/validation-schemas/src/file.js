import { z } from 'zod';

export const fileNameSchema = z.string()
  .min(1, 'File name is required')
  .regex(/^[a-zA-Z0-9._-]+$/, 'File name can only contain letters, numbers, dots, hyphens, and underscores')
  .refine(s => !s.startsWith('.'), 'File name cannot start with dot')
  .refine(s => s.length <= 255, 'File name cannot exceed 255 characters');

export const fileExtensionSchema = z.string()
  .regex(/^\.[a-z0-9]+$/i, 'Invalid file extension');

export const fileSizeSchema = z.number()
  .min(0, 'File size cannot be negative')
  .max(104857600, 'File size cannot exceed 100MB');

export const validateFileName = (name) => {
  try {
    return { valid: true, data: fileNameSchema.parse(name) };
  } catch (err) {
    return { valid: false, error: err.errors[0]?.message || 'Invalid file name' };
  }
};
