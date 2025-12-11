import path from 'path';

/**
 * Path resolution and validation with traversal protection
 */
export function resolvePath(filepath, scopes, scope = 'run') {
  if (!scopes[scope]) {
    const validScopes = Object.keys(scopes).join(', ');
    throw new Error(`Invalid scope: ${scope}. Valid scopes: ${validScopes}`);
  }

  if (!filepath || filepath.trim() === '') {
    throw new Error('Filepath cannot be empty');
  }

  const normalized = filepath.startsWith('/') ? filepath.slice(1) : filepath;
  const resolved = path.join(scopes[scope], normalized);

  if (!resolved.startsWith(scopes[scope])) {
    throw new Error(`Path traversal detected: ${filepath}`);
  }

  return resolved;
}

/**
 * Get scope-based path for a given scope name
 */
export function getScopePath(scopes, scope = 'run') {
  if (!scopes[scope]) {
    throw new Error(`Invalid scope: ${scope}`);
  }
  return scopes[scope];
}

/**
 * Validate scope exists
 */
export function isValidScope(scopes, scope) {
  return scope in scopes;
}
