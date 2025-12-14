import path from 'path';
export function resolvePath(basePath, relativePath) {
  const resolved = path.resolve(basePath, relativePath);
  if (!resolved.startsWith(basePath)) throw new Error('Invalid path');
  return resolved;
}
export function getAppPath(appId) {
  return path.join(process.cwd(), `apps/${appId}`);
}
export default { resolvePath, getAppPath };
