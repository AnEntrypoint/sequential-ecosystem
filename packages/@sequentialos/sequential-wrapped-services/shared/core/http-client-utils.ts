import { logger } from './logging-service.ts';
import { fetchWithRetry, parseResponseSafe, RetryConfig } from 'tasker-http-utils';
import { HttpResponse } from './http-client-types.ts';

export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = [
    'authorization',
    'x-api-key',
    'service_role_key',
    'anon_key',
    'gapi_key'
  ];

  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function executeWithRetry<T>(
  url: string,
  options: {
    method: string;
    headers: Record<string, string>;
    body?: any;
    timeout: number;
    retries: number;
  },
  operationId: string,
  retryDelay: number
): Promise<HttpResponse<T>> {
  const { method, headers, body, timeout, retries } = options;

  const retryConfig = new RetryConfig({
    maxRetries: retries,
    initialDelayMs: retryDelay
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tasker-HttpClient/1.0.0',
        'X-Operation-Id': operationId,
        ...headers
      },
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      if (typeof body === 'object') {
        requestOptions.body = JSON.stringify(body);
      } else {
        requestOptions.body = body;
        if (requestOptions.headers) {
          const hdrs = requestOptions.headers as Record<string, string>;
          delete hdrs['Content-Type'];
        }
      }
    }

    logger.debug(`Executing HTTP request: ${method} ${url}`, {
      operationId,
      headers: sanitizeHeaders(headers),
      hasBody: !!body
    });

    const response = await fetchWithRetry(url, requestOptions, retryConfig);
    clearTimeout(timeoutId);

    const parsedResponse = await parseResponseSafe(response);

    const httpResponse: HttpResponse<T> = {
      success: response.ok,
      status: parsedResponse.status,
      statusText: parsedResponse.statusText,
      data: parsedResponse.data as T,
      error: parsedResponse.error,
      headers: parsedResponse.headers
    };

    logger.debug(`HTTP response received: ${response.status} ${response.statusText}`, {
      operationId,
      success: httpResponse.success,
      hasData: !!parsedResponse.data,
      dataSize: parsedResponse.data ? JSON.stringify(parsedResponse.data).length : 0
    });

    return httpResponse;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
