/**
 * @sequential/sequential-wrapper
 *
 * Zero-code SDK wrapping. Turn any JavaScript SDK into HTTP services
 * with auto-detection, pause/resume for long operations, and declarative configuration.
 *
 * Usage:
 *   import { createServiceProxy } from '@sequential/sequential-wrapper';
 *   import { processSdkRequest } from '@sequential/sequential-wrapper/server';
 *   import { detectInitializationPattern } from '@sequential/sequential-wrapper/auto-detect';
 */

// Re-export client API (most common use case)
export { createServiceProxy } from './src/client.js';

// Re-export server API
export { processSdkRequest, initializeModule, executeMethodChain, formatResponse, addCorsHeaders, createDenoHandler } from './src/server.js';

// Re-export auto-detection utilities
export { detectInitializationPattern, detectCredentials, resolveConfig, validateConfig } from './src/auto-detect.js';

// Re-export environment utilities
export { detectEnvironment, getFetch } from './src/env.js';
