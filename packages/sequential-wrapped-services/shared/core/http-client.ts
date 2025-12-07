export { HttpClient, getFlowStateContextFromClient, clearFlowStateContextFromClient } from './http-client-core.ts';
export type { HttpClientConfig, RequestOptions, HttpResponse, FlowStateContext } from './http-client-types.ts';
export { isFlowStateCall, handleFlowStateCall, getFlowStateContext, clearFlowStateContext } from './http-client-flowstate.ts';
export { sanitizeHeaders, executeWithRetry } from './http-client-utils.ts';
export { fetchWithRetry, parseResponse, parseResponseSafe, buildRequest, RetryConfig } from 'tasker-http-utils';

import { HttpClient } from './http-client-core.ts';
import { RequestOptions, HttpResponse } from './http-client-types.ts';

const httpClient = HttpClient.getInstance();

export const http = {
  request: <T = any>(url: string, options?: RequestOptions) => httpClient.request<T>(url, options),
  get: <T = any>(url: string, options?: Omit<RequestOptions, 'method'>) => httpClient.get<T>(url, options),
  post: <T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => httpClient.post<T>(url, data, options),
  put: <T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => httpClient.put<T>(url, data, options),
  delete: <T = any>(url: string, options?: Omit<RequestOptions, 'method'>) => httpClient.delete<T>(url, options)
};
