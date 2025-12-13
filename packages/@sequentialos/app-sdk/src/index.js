/**
 * index.js - AppSDK Facade
 *
 * Delegates to focused modules:
 * - storage-operations: get, set, delete storage
 * - realtime-operations: connect, joinRoom
 * - llm-operations: chat completion
 * - tool-operations: register, invoke, list tools
 * - task-operations: run, list tasks
 */

import { ToolRegistry } from './tool-registration.js';
import { getEnvironment } from './environment-detector.js';
import { createResponseUnwrapper } from './response-unwrapper.js';
import { createStorageOperations } from './storage-operations.js';
import { createRealtimeOperations } from './realtime-operations.js';
import { createLlmOperations } from './llm-operations.js';
import { createToolOperations } from './tool-operations.js';
import { createTaskOperations } from './task-operations.js';

export class AppSDK {
  constructor(options = {}) {
    const env = options.detectEnv !== false ? getEnvironment() : {};
    this.baseUrl = options.baseUrl || env.baseUrl || 'http://localhost:8003';
    this.appId = options.appId;
    this.userId = options.userId;
    this.sessionToken = options.sessionToken;
    this.wsUrl = options.wsUrl || env.wsUrl || 'ws://localhost:8003';
    this.tools = new ToolRegistry(this.baseUrl);
    this.autoRegister = options.autoRegister !== false;
    this.unwrapper = options.autoUnwrap !== false ? createResponseUnwrapper() : null;
    if (this.unwrapper && options.installGlobalFetch !== false) {
      this.unwrapper.install();
    }

    // Initialize operation modules
    this.storageOps = createStorageOperations(this.baseUrl, this.appId);
    this.realtimeOps = createRealtimeOperations(this.wsUrl, this.userId, this.appId);
    this.llmOps = createLlmOperations(this.baseUrl, this.appId, this.userId);
    this.toolOps = createToolOperations(this.tools, this.baseUrl, this.appId, this.userId, this.autoRegister);
    this.taskOps = createTaskOperations(this.baseUrl, this.appId);
  }

  // Storage delegation
  async storage(action, ...args) {
    const [key, value, scope] = args;
    return this.storageOps[action](key, value, scope);
  }

  // Realtime delegation
  realtime(action, ...args) {
    const [roomId, options] = args;
    return this.realtimeOps[action](roomId, options);
  }

  // LLM delegation
  async llm(prompt, options = {}) {
    return this.llmOps.chat(prompt, options);
  }

  // Tool delegation
  tool(name, fn, description = '', options = {}) {
    this.toolOps.register(name, fn, description, options);
    return this;
  }

  async initTools() {
    return this.toolOps.initAll();
  }

  async tools(action, ...args) {
    const [toolName, input] = args;
    return this.toolOps[action](toolName, input);
  }

  // User info
  async user() {
    if (!this.sessionToken) return null;
    const res = await fetch(`${this.baseUrl}/api/user`, {
      headers: { 'Authorization': `Bearer ${this.sessionToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || data;
  }

  // Task delegation
  async tasks(action, ...args) {
    const [taskName, input] = args;
    return this.taskOps[action](taskName, input);
  }

  static initialize(config = {}) {
    return new AppSDK({
      baseUrl: config.baseUrl || window.location.origin,
      appId: config.appId || window.__appId,
      userId: config.userId || window.__userId,
      sessionToken: config.sessionToken || window.__sessionToken,
      wsUrl: config.wsUrl || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host
    });
  }
}

// Re-exports of support modules
export { RealtimeConnection } from './realtime-connection.js';
export { detectEnvironment, getEnvironment, initializeGlobalEnv } from './environment-detector.js';
export { createResponseUnwrapper } from './response-unwrapper.js';
export { createToolOrchestrator } from './tool-orchestrator.js';
export { createToolStateBroadcaster } from './tool-state-broadcast.js';
export { createFlowContractTester } from './flow-contract-tester.js';
export { createRealtimeSubscription } from './realtime-subscription.js';
export { createExecutionContext, setExecutionContext, getExecutionContext, withContext, createChildContext, injectContext, getCorrelationId } from './execution-context.js';
export { createToolParameterIntrospection } from './tool-parameter-introspection.js';
export { createErrorClarity } from './error-clarity.js';
export { createFeatureDetection } from './feature-detection.js';
export { createConfigManager } from './config-manager.js';
export { createTaskValidationMiddleware } from './task-validation-middleware.js';
export { createFlowHandlerGenerator } from './flow-handler-generator.js';
export { createAppSDKFactory } from './app-sdk-factory.js';
export { createExecutionBreadcrumbs } from './execution-breadcrumbs.js';
export { createValidationErrorSuggestions } from './validation-error-suggestions.js';
export { createStateContextBreadcrumbs } from './state-context-breadcrumbs.js';
export { createToolInvocationValidator } from './tool-invocation-validator.js';
export { createExecutionCheckpointer } from './execution-checkpointer.js';
export { createEntityRelationshipMapper } from './entity-relationship-mapper.js';
export { createExecutionTrail } from './execution-trail.js';
export { createToolInvocationComposer } from './tool-invocation-composer.js';
export { createSchemaInvalidationTracker } from './schema-invalidation-tracker.js';
export { createBroadcastSequenceController } from './broadcast-sequence-controller.js';
export { createAtomicWriteController } from './atomic-write-controller.js';
export default AppSDK;
