import { logger } from './logging-service.ts';
import { config } from './config-service.ts';
import { HttpClientConfig, RequestOptions, HttpResponse } from './http-client-types.ts';
import { isFlowStateCall, handleFlowStateCall, getFlowStateContext, clearFlowStateContext } from './http-client-flowstate.ts';
import { executeWithRetry } from './http-client-utils.ts';

export class HttpClient {
  private static instance: HttpClient;
  private config: HttpClientConfig;

  private constructor() {
    this.config = {
      timeout: config.http.timeout,
      retries: config.http.retries,
      retryDelay: config.http.retryDelay,
      enableFlowStateIntegration: true,
      flowStateTimeout: 2 * 60 * 60 * 1000
    };
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const startTime = performance.now();
    const { method = 'GET', headers = {}, body, timeout = this.config.timeout, retries = this.config.retries, enableFlowState = this.config.enableFlowStateIntegration, serviceContext } = options;

    const operationId = `http-${method}-${Date.now()}-${Math.random()}`;
    const timerId = logger.startTimer(`HTTP ${method} ${url}`, { operationId, serviceContext });

    try {
      if (enableFlowState && serviceContext && isFlowStateCall(url)) {
        const flowStateResponse = await handleFlowStateCall(url, options, operationId);
        logger.endTimer(timerId, { success: true, flowStateHandled: true });
        return flowStateResponse as HttpResponse<T>;
      }

      const response = await executeWithRetry<T>(url, { method, headers, body, timeout, retries }, operationId, this.config.retryDelay);

      const duration = performance.now() - startTime;
      logger.endTimer(timerId, { success: true, duration: Math.round(duration * 100) / 100, status: response.status });

      return response;

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.endTimer(timerId, { success: false, duration: Math.round(duration * 100) / 100, error: errorMessage });
      logger.error(`HTTP request failed: ${method} ${url}`, error as Error, { operationId, serviceContext, attempts: retries + 1 });

      return {
        success: false,
        status: 0,
        statusText: 'Request Failed',
        error: errorMessage,
        metadata: {
          duration: Math.round(duration * 100) / 100,
          retries: retries + 1,
          serviceCall: serviceContext ? { serviceName: serviceContext.serviceName, methodPath: serviceContext.methodPath.join('.') } : undefined
        }
      };
    }
  }

  public updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): HttpClientConfig {
    return { ...this.config };
  }

  public async get<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public async post<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body: data });
  }

  public async put<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body: data });
  }

  public async delete<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Export FlowState context methods via HttpClient
export const getFlowStateContextFromClient = getFlowStateContext;
export const clearFlowStateContextFromClient = clearFlowStateContext;
