/**
 * @sequentialos/factory-wrappers - Factory wrapper utilities
 * Convenient helpers with sensible defaults for creating common objects
 */

// DI wrappers
export {
  createSequentialContainer,
  createContainerWithServices,
  registerService
} from './di-wrappers.js';

// Middleware wrappers
export {
  createDefaultRateLimiter,
  createStrictRateLimiter,
  createPermissiveRateLimiter,
  createDefaultWebSocketRateLimiter
} from './middleware-wrappers.js';

// HTTP wrappers
export {
  createDefaultFetchClient,
  createAggressiveRetryFetch,
  createConservativeRetryFetch,
  createCustomRetryFetch
} from './http-wrappers.js';

// WebSocket wrappers
export {
  createDefaultSubscriptionHandler,
  createRealtimeHandler,
  createBroadcastHandler
} from './websocket-wrappers.js';

// Storage wrappers
export {
  createFolderAdapter,
  createSQLiteAdapter,
  createSupabaseAdapter,
  createDefaultRunner,
  createFlowRunner,
  createSequentialOSRunner
} from './storage-wrappers.js';

// Re-export for convenience
export * from './di-wrappers.js';
export * from './middleware-wrappers.js';
export * from './http-wrappers.js';
export * from './websocket-wrappers.js';
export * from './storage-wrappers.js';
