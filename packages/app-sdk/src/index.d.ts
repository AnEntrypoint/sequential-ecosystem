/**
 * Sequential Ecosystem App SDK - TypeScript Type Definitions
 * Complete type coverage for AppSDK and related classes
 */

/**
 * Options for AppSDK initialization
 */
export interface AppSDKOptions {
  /** App ID (required for most operations) */
  appId?: string;
  /** Base URL for API calls */
  baseUrl?: string;
  /** WebSocket URL for real-time connections */
  wsUrl?: string;
  /** User ID for session tracking */
  userId?: string;
  /** Session token for authentication */
  sessionToken?: string;
  /** Auto-register tools to server */
  autoRegister?: boolean;
}

/**
 * Tool function signature
 */
export type ToolFunction = (input: any) => Promise<any>;

/**
 * Tool registration options
 */
export interface ToolOptions {
  category?: string;
  parameters?: Record<string, ParameterDefinition>;
  description?: string;
}

/**
 * Parameter definition for tools
 */
export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description?: string;
  default?: any;
  required?: boolean;
  enum?: any[];
  pattern?: string;
}

/**
 * Storage operation types
 */
export type StorageAction = 'get' | 'set' | 'delete';

/**
 * Storage scope levels
 */
export type StorageScope = 'app' | 'user' | 'global';

/**
 * Real-time connection options
 */
export interface RealtimeOptions {
  userId?: string;
  appId?: string;
  autoConnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

/**
 * Real-time message structure
 */
export interface RealtimeMessage {
  type: string;
  data: any;
  timestamp?: number;
}

/**
 * Real-time event handler
 */
export type RealtimeHandler = (message: RealtimeMessage) => void;

/**
 * Tool action types
 */
export type ToolAction = 'invoke' | 'list' | 'get';

/**
 * Task action types
 */
export type TaskAction = 'run' | 'list';

/**
 * LLM options
 */
export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
  tools?: any[];
  toolChoice?: string;
}

/**
 * LLM response
 */
export interface LLMResponse {
  content: string;
  stopReason?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * User information
 */
export interface User {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

/**
 * Task definition
 */
export interface Task {
  name: string;
  description?: string;
  id?: string;
  created?: string;
}

/**
 * Tool definition
 */
export interface Tool {
  name: string;
  description?: string;
  id?: string;
  category?: string;
  parameters?: Record<string, ParameterDefinition>;
}

/**
 * Realtime connection class for WebSocket communication
 */
export class RealtimeConnection {
  constructor(wsUrl: string, roomId: string, options?: RealtimeOptions);

  /**
   * Connect to room
   */
  connect(): Promise<void>;

  /**
   * Close connection
   */
  close(): void;

  /**
   * Send message to room
   */
  send(type: string, data: any): void;

  /**
   * Subscribe to messages of specific type
   */
  subscribe(type: string, handler: RealtimeHandler): () => void;

  /**
   * Emit local event
   */
  emit(event: string, data: any): void;

  /**
   * Listen to local events
   */
  on(event: string, handler: (...args: any[]) => void): () => void;

  /**
   * Get connection status
   */
  isConnected(): boolean;
}

/**
 * Tool registry class for managing tools
 */
export class ToolRegistry {
  constructor(baseUrl?: string);

  /**
   * Register tool locally
   */
  register(name: string, fn: ToolFunction, description?: string, options?: ToolOptions): void;

  /**
   * Register tool remotely
   */
  remote(name: string, fn: ToolFunction, description?: string, options?: ToolOptions): Promise<void>;

  /**
   * Initialize/register all tools
   */
  initAll(): Promise<void>;

  /**
   * Get registered tool
   */
  get(name: string): ToolFunction | undefined;

  /**
   * List all tools
   */
  list(): Tool[];
}

/**
 * Main Sequential Ecosystem App SDK
 */
export class AppSDK {
  appId?: string;
  userId?: string;
  baseUrl: string;
  wsUrl: string;
  tools: ToolRegistry;
  autoRegister: boolean;

  constructor(options?: AppSDKOptions);

  /**
   * Storage operations (get/set/delete)
   * @param action - Operation to perform
   * @param key - Storage key
   * @param value - Value for set operation
   * @param scope - Storage scope (app, user, global)
   */
  storage<T = any>(
    action: 'get',
    key: string,
    value?: any,
    scope?: StorageScope
  ): Promise<T | null>;
  storage<T = any>(
    action: 'set',
    key: string,
    value: T,
    scope?: StorageScope
  ): Promise<boolean>;
  storage(action: 'delete', key: string, value?: any, scope?: StorageScope): Promise<boolean>;

  /**
   * Real-time communication operations
   * @param action - Real-time action
   * @param roomId - Room to connect to
   * @param options - Real-time options
   */
  realtime(
    action: 'connect' | 'joinRoom',
    roomId: string,
    options?: RealtimeOptions
  ): RealtimeConnection;

  /**
   * Register a tool
   * @param name - Tool name
   * @param fn - Tool function
   * @param description - Tool description
   * @param options - Tool options
   */
  tool(
    name: string,
    fn: ToolFunction,
    description?: string,
    options?: ToolOptions
  ): this;

  /**
   * Initialize all registered tools
   */
  initTools(): Promise<void>;

  /**
   * Tool operations (invoke/list/get)
   */
  tools(action: 'invoke', toolName: string, input?: any): Promise<any>;
  tools(action: 'list'): Promise<Tool[]>;
  tools(action: 'get', toolName: string): Promise<Tool | null>;

  /**
   * Task operations (run/list)
   */
  tasks(action: 'run', taskName: string, input?: any): Promise<any>;
  tasks(action: 'list'): Promise<Task[]>;

  /**
   * Call LLM with prompt
   */
  llm(prompt: string, options?: LLMOptions): Promise<LLMResponse>;

  /**
   * Get current user information
   */
  user(): Promise<User | null>;
}

/**
 * Create or get AppSDK instance
 */
export function createAppSDK(options?: AppSDKOptions): AppSDK;

/**
 * Get singleton AppSDK instance
 */
export function getInstance(options?: AppSDKOptions): AppSDK;
