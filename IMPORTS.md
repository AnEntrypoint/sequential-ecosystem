# Sequential Ecosystem Import Reference

Quick reference for all public exports across the Sequential Ecosystem. Updated for Iteration 20.

## Core SDK

### `@sequential/app-sdk`
```javascript
import AppSDK, {
  // Main class
  AppSDK,

  // Environment & Config
  createConfigManager,
  detectEnvironment,
  getEnvironment,
  initializeGlobalEnv,

  // Tool Orchestration
  createToolOrchestrator,
  createToolStateBroadcaster,
  createToolParameterIntrospection,

  // Testing
  createFlowContractTester,

  // Real-time
  createRealtimeSubscription,

  // Execution Context
  createExecutionContext,
  setExecutionContext,
  getExecutionContext,
  withContext,
  createChildContext,
  injectContext,
  getCorrelationId,

  // Error Handling
  createErrorClarity,
  createFeatureDetection,

  // Validation
  createTaskValidationMiddleware,

  // Flow Generation
  createFlowHandlerGenerator,

  // Response Handling
  createResponseUnwrapper
} from '@sequential/app-sdk';\n```\n\n## Tool Registry & Management\n\n### `@sequential/tool-registry`\n```javascript\nimport {\n  ToolRegistry,\n  createToolRegistry,\n  registerTool,\n  invokeTool,\n  searchTools,\n  getToolSchema,\n  generateMCPTool\n} from '@sequential/tool-registry';\n```\n\n## Storage & Persistence\n\n### `@sequential/sequential-adaptor`\n```javascript\nimport {\n  createStorageAdapter,\n  createFileAdapter,\n  createSQLiteAdapter,\n  createPostgresAdapter,\n  createSupabaseAdapter\n} from '@sequential/sequential-adaptor';\n```\n\n### `@sequential/persistent-state`\n```javascript\nimport {\n  createStateManager,\n  createStateGuards,\n  createStateDiffing,\n  createStateVersioning\n} from '@sequential/persistent-state';\n```\n\n## Real-time Communication\n\n### `@sequential/realtime-sync`\n```javascript\nimport {\n  createRealtimeClient,\n  RealtimeConnection,\n  createRealtimeBroadcaster,\n  createChannelSubscriber\n} from '@sequential/realtime-sync';\n```\n\n### `@sequential/websocket-broadcaster`\n```javascript\nimport {\n  RealtimeBroadcaster,\n  createBroadcaster,\n  broadcastToChannel,\n  subscribeToChannel\n} from '@sequential/websocket-broadcaster';\n```\n\n## Validation & Parameters\n\n### `@sequential/param-validation`\n```javascript\nimport {\n  ValidationChain,\n  createValidationChain,\n  isRequired,\n  isEmail,\n  isURL,\n  isNumber,\n  isString,\n  minLength,\n  maxLength,\n  matches\n} from '@sequential/param-validation';\n```\n\n## Error Handling & Recovery\n\n### `@sequential/error-handling`\n```javascript\nimport {\n  createErrorHandler,\n  createRetryStrategy,\n  createCircuitBreaker,\n  createFallbackHandler,\n  withErrorRecovery,\n  withRetry,\n  withCircuitBreaker\n} from '@sequential/error-handling';\n```\n\n## Logging & Observability\n\n### `@sequential/execution-tracer`\n```javascript\nimport {\n  createExecutionTracer,\n  recordSpan,\n  recordAsyncSpan,\n  recordEvent,\n  recordMetric\n} from '@sequential/execution-tracer';\n```\n\n### `@sequential/custom-metrics`\n```javascript\nimport {\n  createMetricsCollector,\n  recordCounter,\n  recordGauge,\n  recordHistogram,\n  recordEvent\n} from '@sequential/custom-metrics';\n```\n\n### `@sequential/alert-engine`\n```javascript\nimport {\n  createAlertEngine,\n  createAlertRule,\n  defineCondition,\n  registerCallback\n} from '@sequential/alert-engine';\n```\n\n## Utilities\n\n### `@sequential/server-utilities`\n```javascript\nimport {\n  asyncHandler,\n  validateInput,\n  formatResponse,\n  parseJSON,\n  withTimeout\n} from '@sequential/server-utilities';\n```\n\n### `@sequential/file-operations`\n```javascript\nimport {\n  readFile,\n  writeFile,\n  deleteFile,\n  listFiles,\n  ensureDir,\n  validatePath\n} from '@sequential/file-operations';\n```\n\n## Dynamic Components\n\n### `@sequential/dynamic-components`\n```javascript\nimport {\n  createDynamicComponentRegistry,\n  useDynamicComponent,\n  renderJSX,\n  parseJSX,\n  validateJSX\n} from '@sequential/dynamic-components';\n```\n\n## MCP Integration\n\n### `@sequential/app-mcp`\n```javascript\nimport {\n  createAppMCPServer,\n  generateMCPTools,\n  createMCPResource,\n  registerMCPTool\n} from '@sequential/app-mcp';\n```\n\n## Quick Import Patterns\n\n### For App Development\n```javascript\nimport AppSDK, {\n  createConfigManager,\n  createRealtimeSubscription,\n  createErrorClarity,\n  createFeatureDetection,\n  createExecutionContext\n} from '@sequential/app-sdk';\n```\n\n### For Tool Development\n```javascript\nimport {\n  createToolParameterIntrospection,\n  createTaskValidationMiddleware,\n  createErrorClarity\n} from '@sequential/app-sdk';\n```\n\n### For Flow Development\n```javascript\nimport {\n  createFlowHandlerGenerator,\n  createFlowContractTester,\n  createToolOrchestrator\n} from '@sequential/app-sdk';\n```\n\n### For Task Development\n```javascript\nimport {\n  createTaskValidationMiddleware,\n  createExecutionContext,\n  createErrorClarity\n} from '@sequential/app-sdk';\n```\n\n## Module Organization\n\n**Core (App Development)**: `@sequential/app-sdk`\n- Contains 15+ utilities for AppSDK-based apps\n- Browser and Node-compatible\n- Auto-loaded with AppSDK initialization\n\n**Storage Layer**: `@sequential/sequential-adaptor`, `@sequential/persistent-state`\n- Abstracts storage backend (files, SQLite, Postgres, Supabase)\n- State management with versioning and guards\n\n**Real-time**: `@sequential/realtime-sync`, `@sequential/websocket-broadcaster`\n- WebSocket client/server coordination\n- Channel-based pub/sub with auto-broadcast\n\n**Tools & Registry**: `@sequential/tool-registry`, `@sequential/app-mcp`\n- Tool discovery, execution, and MCP generation\n\n**Validation**: `@sequential/param-validation`, validation modules in AppSDK\n- Type checking, constraints, schema validation\n\n**Observability**: `@sequential/execution-tracer`, `@sequential/custom-metrics`, `@sequential/alert-engine`\n- Full tracing, metrics collection, alerting\n\n**Utilities**: Various `@sequential/*-utilities` packages\n- Server utilities, file operations, dynamic components\n\n## CommonJS vs ES Modules\n\nAll `@sequential/*` packages export both formats:\n- **Browser/Modern**: `import { ... } from '@sequential/...`\n- **Node.js CommonJS**: `const { ... } = require('@sequential/...')`\n\n## Workspace Paths (Internal)\n\nIf using relative imports for development:\n```javascript\n// From packages/app-debugger/src/components/Timeline.tsx\nimport { AppSDK } from '../../../../app-sdk/src';\nimport { RealtimeConnection } from '../../../../realtime-sync/src';\nimport { formatResponse } from '../../../../server-utilities/src';\n```\n\n**Prefer namespace imports** (`@sequential/*`) - they're more stable across refactoring.\n