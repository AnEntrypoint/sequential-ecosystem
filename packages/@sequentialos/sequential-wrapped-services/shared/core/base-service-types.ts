export type ServiceHealthStatus = 'healthy' | 'unhealthy' | 'degraded';

export interface IHealthCheckResult {
  status: ServiceHealthStatus;
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
  error?: string;
  performance?: number;
}

export interface IServiceConfig {
  name: string;
  version: string;
  description?: string;
  enableHealthCheck: boolean;
  enablePerformanceLogging: boolean;
  timeout: number;
  retries: number;
}

export interface IServiceContext {
  requestId?: string;
  userId?: string;
  correlationId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    duration: number;
    requestId?: string;
    version?: string;
  };
}
