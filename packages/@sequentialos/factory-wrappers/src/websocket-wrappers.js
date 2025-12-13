import { delay, withRetry } from '@sequentialos/async-patterns';
/**
 * WebSocket factory wrappers
 * Convenient helpers for WebSocket handler creation
 */

import { createSubscriptionHandler } from '@sequentialos/websocket-factory';
import { createDefaultWebSocketRateLimiter } from './middleware-wrappers.js';

/**
 * Create WebSocket subscription handler with sensible defaults
 * @param {Object} options - Configuration options
 * @returns {Object} WebSocket subscription handler
 */
export function createDefaultSubscriptionHandler(options = {}) {
  const config = {
    maxConnections: options.maxConnections ?? 100,
    messageTimeout: options.messageTimeout ?? 30000,
    reconnectDelay: options.reconnectDelay ?? 3000,
    enableCompression: options.enableCompression ?? true,
    rateLimit: options.rateLimit ?? createDefaultWebSocketRateLimiter(),
    ...options
  };

  return createSubscriptionHandler(config);
}

/**
 * Create WebSocket handler for real-time updates
 * @returns {Object} WebSocket subscription handler
 */
export function createRealtimeHandler() {
  return createDefaultSubscriptionHandler({
    maxConnections: 1000,
    messageTimeout: 5000,
    reconnectDelay: 1000
  });
}

/**
 * Create WebSocket handler for broadcast scenarios
 * @returns {Object} WebSocket subscription handler
 */
export function createBroadcastHandler() {
  return createDefaultSubscriptionHandler({
    maxConnections: 10000,
    messageTimeout: 10000,
    reconnectDelay: 5000
  });
}

export default {
  createDefaultSubscriptionHandler,
  createRealtimeHandler,
  createBroadcastHandler
};
