import path from 'path';
import fs from 'fs';

/**
 * Scope initialization and management
 */
export function createScopes(ecosystemPath, taskId, runId) {
  return {
    run: path.join(ecosystemPath, 'tasks', taskId, 'runs', runId, 'fs'),
    task: path.join(ecosystemPath, 'tasks', taskId, 'fs'),
    global: path.join(ecosystemPath, 'vfs', 'global')
  };
}

/**
 * Ensure all scope directories exist
 */
export async function ensureScopeDirectories(scopes) {
  const fsPromises = require('fs').promises;

  for (const [scopeName, dir] of Object.entries(scopes)) {
    if (!fs.existsSync(dir)) {
      await fsPromises.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Get all scope names
 */
export function getScopeNames(scopes) {
  return Object.keys(scopes);
}

/**
 * Get specific scope path
 */
export function getScopePath(scopes, scope) {
  return scopes[scope] || null;
}
