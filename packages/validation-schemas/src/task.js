import { z } from 'zod';

export const taskNameSchema = z.string()
  .min(1, 'Task name is required')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Task name must be kebab-case (lowercase letters, numbers, and hyphens)')
  .refine(s => !s.startsWith('-'), 'Task name cannot start with hyphen')
  .refine(s => !s.endsWith('-'), 'Task name cannot end with hyphen');

export const taskConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  inputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
    description: z.string().optional()
  })).optional(),
  timeout: z.number().optional(),
  retries: z.number().optional()
});

export const validateTaskName = (name) => {
  try {
    return { valid: true, data: taskNameSchema.parse(name) };
  } catch (err) {
    return { valid: false, error: err.errors[0]?.message || 'Invalid task name' };
  }
};
