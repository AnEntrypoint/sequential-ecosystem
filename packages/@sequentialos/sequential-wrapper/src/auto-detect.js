export { detectInitializationPattern } from './auto-detect-patterns.js';
export { detectCredentials } from './auto-detect-credentials.js';
export { resolveConfig } from './auto-detect-config.js';
export { validateConfig } from './auto-detect-validator.js';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectInitializationPattern: require('./auto-detect-patterns.js').detectInitializationPattern,
    detectCredentials: require('./auto-detect-credentials.js').detectCredentials,
    resolveConfig: require('./auto-detect-config.js').resolveConfig,
    validateConfig: require('./auto-detect-validator.js').validateConfig
  };
}
