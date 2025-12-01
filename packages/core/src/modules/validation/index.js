import path from 'path';
import fs from 'fs';

export function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }

  const normalizedPath = path.resolve(filePath);
  const cwd = path.resolve(process.cwd());

  let realPath;
  try {
    realPath = fs.realpathSync(normalizedPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      realPath = normalizedPath;
    } else {
      throw new Error('Access denied: cannot access file system');
    }
  }

  const relative = path.relative(cwd, realPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Access denied: path traversal detected');
  }

  return realPath;
}

export function validateTaskName(taskName) {
  if (!taskName || typeof taskName !== 'string') {
    throw new Error('Invalid task name');
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(taskName)) {
    throw new Error('Task name contains invalid characters (allowed: alphanumeric, dot, dash, underscore)');
  }
  if (taskName.length > 100) {
    throw new Error('Task name too long (max 100 characters)');
  }
  return taskName;
}

export function validateFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid file name');
  }
  if (fileName.includes('/') || fileName.includes('\\') || fileName.startsWith('.')) {
    throw new Error('File name contains invalid characters');
  }
  if (fileName.length > 255) {
    throw new Error('File name too long (max 255 characters)');
  }
  return fileName;
}

export function validateParam(value, name, type) {
  if (!value && value !== 0 && value !== false) {
    throw new Error(`${name} is required`);
  }
  if (type && typeof value !== type) {
    throw new Error(`${name} must be a ${type}`);
  }
  return value;
}

export function validateRequired(...params) {
  for (const { name, value } of params) {
    if (!value && value !== 0 && value !== false) {
      throw new Error(`${name} is required`);
    }
  }
}

export function validateType(value, name, expectedType) {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    throw new Error(`${name} must be a ${expectedType}, got ${actualType}`);
  }
  return value;
}

export function validateInputSchema(input, schema) {
  if (!schema || !Array.isArray(schema)) {
    return null;
  }

  const errors = [];

  for (const field of schema) {
    const { name, type, required = false } = field;
    const value = input[name];

    if (value === undefined || value === null) {
      if (required) {
        errors.push(`Field '${name}' is required`);
      }
      continue;
    }

    const actualType = typeof value;
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`Field '${name}' must be an array, got ${actualType}`);
    } else if (type === 'object' && (actualType !== 'object' || Array.isArray(value))) {
      errors.push(`Field '${name}' must be an object, got ${actualType}`);
    } else if (type === 'number' && actualType !== 'number') {
      errors.push(`Field '${name}' must be a number, got ${actualType}`);
    } else if (type === 'string' && actualType !== 'string') {
      errors.push(`Field '${name}' must be a string, got ${actualType}`);
    } else if (type === 'boolean' && actualType !== 'boolean') {
      errors.push(`Field '${name}' must be a boolean, got ${actualType}`);
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateAndSanitizeMetadata(metadata, maxSize = 10 * 1024 * 1024) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata must be a valid object');
  }

  try {
    JSON.stringify(metadata);
  } catch (e) {
    throw new Error(`Metadata is not JSON serializable: ${e.message}`);
  }

  const serialized = JSON.stringify(metadata);
  if (serialized.length > maxSize) {
    throw new Error(`Metadata exceeds maximum size (${serialized.length} > ${maxSize} bytes)`);
  }

  return metadata;
}
