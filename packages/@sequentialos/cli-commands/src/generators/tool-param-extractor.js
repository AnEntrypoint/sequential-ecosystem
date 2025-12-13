/**
 * tool-param-extractor.js
 *
 * Extract parameter information from function signatures
 */

export function extractParamInfo(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/\(([^)]*)\)/);

  if (!paramMatch) return [];

  return paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('='))
    .map(p => p.split('=')[0].trim());
}
