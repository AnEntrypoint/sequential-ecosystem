export interface HttpClientConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  enableFlowStateIntegration: boolean;
  flowStateTimeout?: number;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  enableFlowState?: boolean;
  serviceContext?: {
    serviceName: string;
    methodPath: string[];
    taskRunId?: string;
    stackRunId?: string;
  };
}

export interface HttpResponse<T = any> {
  success: boolean;
  status: number;
  statusText: string;
  data?: T;
  error?: string;
  headers?: Record<string, string>;
  metadata?: {
    duration: number;
    retries: number;
    serviceCall?: {
      serviceName: string;
      methodPath: string;
    };
  };
}

export interface FlowStateContext {
  serviceName: string;
  methodPath: string[];
  args: any[];
  taskRunId: string;
  stackRunId: string;
  fetchUrl: string;
}
