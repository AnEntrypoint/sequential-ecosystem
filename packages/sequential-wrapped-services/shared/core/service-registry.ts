/**
 * Unified Service Registry for HTTP-Wrapped External Services
 *
 * Provides a single source of truth for ALL external service calls,
 * wrapping every external dependency as HTTP services that FlowState
 * can automatically pause/resume.
 */

import { ServiceRegistry } from './service-registry-core.ts';
import { createCallHandler } from './service-registry-calls.ts';
import { createHealthHandlers } from './service-registry-health.ts';
import type { ServiceCallContext, ServiceResponse } from './service-registry-types.ts';

const registry = ServiceRegistry.getInstance();
const callHandler = createCallHandler(registry);
const healthHandlers = createHealthHandlers(registry);

healthHandlers.startHealthChecks();

export const serviceRegistry = {
  call: <T = any>(serviceName: string, methodName: string, args?: any[], context?: Partial<ServiceCallContext>) =>
    callHandler(serviceName, methodName, args || [], context),
  getService: (serviceName: string) => registry.getService(serviceName),
  getAllServices: () => registry.getAllServices(),
  hasService: (serviceName: string) => registry.hasService(serviceName),
  registerService: (service: any) => registry.registerService(service),
  performHealthCheck: (serviceName: string) => healthHandlers.performHealthCheck(serviceName),
  getServiceHealth: (serviceName: string) => healthHandlers.getServiceHealth(serviceName),
  getAllServiceHealth: () => healthHandlers.getAllServiceHealth(),
  clearCache: (serviceName?: string) => healthHandlers.clearCache(serviceName),
  getStats: () => healthHandlers.getStats()
};

export const services = {
  call: <T = any>(serviceName: string, methodName: string, args?: any[], context?: Partial<ServiceCallContext>) =>
    callHandler(serviceName, methodName, args || [], context),

  database: {
    select: (table: string, query?: any, context?: Partial<ServiceCallContext>) =>
      callHandler('database', 'select', [table, query], context),
    insert: (table: string, records: any[], context?: Partial<ServiceCallContext>) =>
      callHandler('database', 'insert', [table, records], context),
    update: (table: string, query: any, update: any, context?: Partial<ServiceCallContext>) =>
      callHandler('database', 'update', [table, query, update], context),
    delete: (table: string, query?: any, context?: Partial<ServiceCallContext>) =>
      callHandler('database', 'delete', [table, query], context),
    rpc: (functionName: string, params?: any[], context?: Partial<ServiceCallContext>) =>
      callHandler('database', 'rpc', [functionName, params || []], context)
  },

  keystore: {
    get: (key: string, context?: Partial<ServiceCallContext>) =>
      callHandler('keystore', 'getKey', [key], context),
    set: (key: string, value: string, context?: Partial<ServiceCallContext>) =>
      callHandler('keystore', 'setKey', [key, value], context),
    list: (prefix?: string, context?: Partial<ServiceCallContext>) =>
      callHandler('keystore', 'listKeys', [prefix], context)
  },

  gapi: {
    domains: {
      list: (customer?: string, maxResults?: number, context?: Partial<ServiceCallContext>) =>
        callHandler('gapi', 'domains.list', [customer, maxResults], context)
    },
    users: {
      list: (domain?: string, customer?: string, maxResults?: number, query?: string, context?: Partial<ServiceCallContext>) =>
        callHandler('gapi', 'users.list', [domain, customer, maxResults, query], context)
    },
    gmail: {
      messages: {
        list: (userId?: string, query?: string, maxResults?: number, context?: Partial<ServiceCallContext>) =>
          callHandler('gapi', 'gmail.messages.list', [userId, query, maxResults], context),
        get: (userId: string, messageId: string, format?: string, context?: Partial<ServiceCallContext>) =>
          callHandler('gapi', 'gmail.messages.get', [userId, messageId, format], context)
      }
    }
  },

  openai: {
    chat: {
      completions: {
        create: (model: string, messages: any[], temperature?: number, maxTokens?: number, context?: Partial<ServiceCallContext>) =>
          callHandler('openai', 'chat.completions.create', [model, messages, temperature, maxTokens], context)
      }
    }
  },

  websearch: {
    search: (query: string, maxResults?: number, safeSearch?: string, context?: Partial<ServiceCallContext>) =>
      callHandler('websearch', 'search', [query, maxResults, safeSearch], context)
  }
};

export type { ServiceHealth, ServiceDefinition, ServiceMethod, MethodParameter, HealthCheckConfig, FallbackConfig, ServiceCallContext, ServiceResponse } from './service-registry-types.ts';
