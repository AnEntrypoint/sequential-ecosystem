export type ServiceHealth = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ServiceDefinition {
  name: string;
  baseUrl: string;
  version: string;
  description: string;
  methods: ServiceMethod[];
  healthCheck?: HealthCheckConfig;
  fallback?: FallbackConfig;
}

export interface ServiceMethod {
  name: string;
  description: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters?: MethodParameter[];
  returnType?: string;
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
}

export interface MethodParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface HealthCheckConfig {
  path: string;
  method?: 'GET' | 'POST';
  interval?: number;
  timeout?: number;
  expectedStatus?: number;
  expectedResponse?: any;
}

export interface FallbackConfig {
  enabled: boolean;
  fallbackServices?: string[];
  cacheResults?: boolean;
  cacheTTL?: number;
}

export interface ServiceCallContext {
  serviceName: string;
  methodName: string;
  taskRunId?: string;
  stackRunId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    serviceName: string;
    methodName: string;
    duration: number;
    retries: number;
    cached?: boolean;
    flowStatePaused?: boolean;
  };
}
