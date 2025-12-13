/**
 * config-parser.js - SDK configuration parsing
 *
 * Parses shorthand and object config formats
 */

export function parseConfig(config, extraConfig = {}) {
  // Handle shorthand string format: "module:factory" or "module"
  if (typeof config === 'string') {
    if (config.includes('/')) {
      // Handle service endpoint format: 'service/supabase'
      const parts = config.split('/');
      if (parts.length === 2 && parts[0] === 'service') {
        config = { service: parts[1] };
      } else {
        throw new Error(`Invalid service format. Expected 'service/NAME', got '${config}'`);
      }
    } else {
      // Handle module:factory format
      const parts = config.split(':');
      const module = parts[0];
      const factory = parts.length > 1 ? parts[1] : undefined;
      config = { module, factory };
    }
  }

  // Merge with extra config
  return { ...config, ...extraConfig };
}

export function getEndpoint(config) {
  if (config.endpoint) return config.endpoint;

  const baseUrl = config.baseUrl || 'http://localhost:3000';

  if (config.service) {
    return `${baseUrl}/api/proxy/${config.service}`;
  }

  return `${baseUrl}/api/sdk-proxy`;
}
