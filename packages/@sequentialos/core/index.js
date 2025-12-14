/**
 * @sequentialos/core
 * Core validation and utility functions
 */

import path from 'path';
import { promises as fs } from 'fs';

/**
 * Validate a task/flow name
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export function validateTaskName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Task name must be a non-empty string');
  }

  // Must be kebab-case: lowercase alphanumeric with hyphens
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    throw new Error('Task name must be kebab-case (lowercase alphanumeric with hyphens)');
  }

  // Cannot start or end with hyphen
  if (name.startsWith('-') || name.endsWith('-')) {
    throw new Error('Task name cannot start or end with a hyphen');
  }

  // Reasonable length limits
  if (name.length < 2) {
    throw new Error('Task name must be at least 2 characters');
  }

  if (name.length > 100) {
    throw new Error('Task name must be at most 100 characters');
  }

  return true;
}

/**
 * Validate a file name (no path separators, no special chars)
 * @param {string} fileName - File name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export function validateFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('File name must be a non-empty string');
  }

  // No path separators
  if (fileName.includes('/') || fileName.includes('\\')) {
    throw new Error('File name cannot contain path separators');
  }

  // No null bytes
  if (fileName.includes('\0')) {
    throw new Error('File name cannot contain null bytes');
  }

  // No current/parent directory references
  if (fileName === '.' || fileName === '..') {
    throw new Error('File name cannot be . or ..');
  }

  // No leading/trailing whitespace
  if (fileName.trim() !== fileName) {
    throw new Error('File name cannot have leading or trailing whitespace');
  }

  // Reasonable length
  if (fileName.length > 255) {
    throw new Error('File name must be at most 255 characters');
  }

  return true;
}

/**
 * Validate a file path (prevent path traversal)
 * @param {string} filePath - Path to validate
 * @param {string} [baseDir] - Base directory to validate against
 * @returns {string} Resolved real path
 * @throws {Error} If path is invalid or outside base directory
 */
export async function validatePath(filePath, baseDir = null) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Resolve to absolute path
  const absolutePath = path.resolve(filePath);

  // Check for null bytes
  if (absolutePath.includes('\0')) {
    throw new Error('Path cannot contain null bytes');
  }

  // Get real path (follows symlinks)
  let realPath;
  try {
    realPath = await fs.realpath(absolutePath);
  } catch (error) {
    // If file doesn't exist, validate the parent directory instead
    const parentDir = path.dirname(absolutePath);
    try {
      const parentRealPath = await fs.realpath(parentDir);
      realPath = path.join(parentRealPath, path.basename(absolutePath));
    } catch {
      // Parent doesn't exist either - just use absolute path
      realPath = absolutePath;
    }
  }

  // If base directory provided, ensure path is within it
  if (baseDir) {
    const resolvedBase = path.resolve(baseDir);
    const baseRealPath = await fs.realpath(resolvedBase).catch(() => resolvedBase);

    if (!realPath.startsWith(baseRealPath + path.sep) && realPath !== baseRealPath) {
      throw new Error('Path is outside the allowed directory');
    }
  }

  return realPath;
}

/**
 * Synchronous version of validatePath (without symlink resolution)
 * @param {string} filePath - Path to validate
 * @param {string} [baseDir] - Base directory to validate against
 * @returns {string} Resolved absolute path
 * @throws {Error} If path is invalid or outside base directory
 */
export function validatePathSync(filePath, baseDir = null) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Resolve to absolute path
  const absolutePath = path.resolve(filePath);

  // Check for null bytes
  if (absolutePath.includes('\0')) {
    throw new Error('Path cannot contain null bytes');
  }

  // If base directory provided, ensure path is within it
  if (baseDir) {
    const resolvedBase = path.resolve(baseDir);

    if (!absolutePath.startsWith(resolvedBase + path.sep) && absolutePath !== resolvedBase) {
      throw new Error('Path is outside the allowed directory');
    }
  }

  return absolutePath;
}

/**
 * Validate an identifier (variable name, function name, etc.)
 * @param {string} identifier - Identifier to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export function validateIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Identifier must be a non-empty string');
  }

  // Must be valid JavaScript identifier
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
    throw new Error('Identifier must be a valid JavaScript identifier');
  }

  // Cannot be a reserved word
  const reservedWords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'static', 'await', 'async'
  ];

  if (reservedWords.includes(identifier)) {
    throw new Error(`Identifier cannot be a reserved word: ${identifier}`);
  }

  return true;
}

/**
 * Sanitize a string for safe use in file names
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeForFileName(str) {
  if (!str || typeof str !== 'string') {
    return 'unnamed';
  }

  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  try {
    new URL(url);
    return true;
  } catch {
    throw new Error('Invalid URL format');
  }
}

export default {
  validateTaskName,
  validateFileName,
  validatePath,
  validatePathSync,
  validateIdentifier,
  sanitizeForFileName,
  validateUrl
};
