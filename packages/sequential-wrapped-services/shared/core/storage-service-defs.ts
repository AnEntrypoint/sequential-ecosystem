import { config } from './config-service.ts';
import type { ServiceDefinition } from './service-registry-types.ts';

function getServiceUrl(serviceName: string): string {
  const serviceConfig = config.getService(serviceName);
  if (serviceConfig) return serviceConfig.baseUrl;
  const supabaseUrl = config.supabase?.url || 'http://127.0.0.1:54321';
  return `${supabaseUrl}/functions/v1/${serviceName}`;
}

export function createStorageServiceDefs(): ServiceDefinition[] {
  return [
    {
      name: 'database',
      baseUrl: getServiceUrl('wrappedsupabase'),
      version: '1.0.0',
      description: 'Supabase database operations',
      methods: [
        {
          name: 'select',
          description: 'Select records from a table',
          path: '/select',
          method: 'POST',
          parameters: [
            { name: 'table', type: 'string', required: true, description: 'Table name' },
            { name: 'query', type: 'object', required: false, description: 'Query parameters' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'insert',
          description: 'Insert records into a table',
          path: '/insert',
          method: 'POST',
          parameters: [
            { name: 'table', type: 'string', required: true, description: 'Table name' },
            { name: 'records', type: 'any[]', required: true, description: 'Records to insert' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'update',
          description: 'Update records in a table',
          path: '/update',
          method: 'POST',
          parameters: [
            { name: 'table', type: 'string', required: true, description: 'Table name' },
            { name: 'query', type: 'object', required: false, description: 'Query conditions' },
            { name: 'update', type: 'object', required: true, description: 'Update data' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'delete',
          description: 'Delete records from a table',
          path: '/delete',
          method: 'POST',
          parameters: [
            { name: 'table', type: 'string', required: true, description: 'Table name' },
            { name: 'query', type: 'object', required: false, description: 'Query conditions' }
          ],
          returnType: '{ count: number }'
        },
        {
          name: 'rpc',
          description: 'Execute a database function',
          path: '/rpc',
          method: 'POST',
          parameters: [
            { name: 'functionName', type: 'string', required: true, description: 'Function name' },
            { name: 'params', type: 'any[]', required: false, description: 'Function parameters' }
          ],
          returnType: 'any'
        }
      ],
      healthCheck: { path: '/health', method: 'GET', interval: 30000, timeout: 5000 }
    },
    {
      name: 'keystore',
      baseUrl: getServiceUrl('wrappedkeystore'),
      version: '1.0.0',
      description: 'Key-value storage for credentials and configuration',
      methods: [
        {
          name: 'getKey',
          description: 'Get a value by key',
          path: '/getKey',
          method: 'POST',
          parameters: [
            { name: 'namespace', type: 'string', required: true, description: 'Namespace' },
            { name: 'key', type: 'string', required: true, description: 'Key to retrieve' }
          ],
          returnType: 'string'
        },
        {
          name: 'setKey',
          description: 'Set a value by key',
          path: '/setKey',
          method: 'POST',
          parameters: [
            { name: 'namespace', type: 'string', required: true, description: 'Namespace' },
            { name: 'key', type: 'string', required: true, description: 'Key to set' },
            { name: 'value', type: 'string', required: true, description: 'Value to set' }
          ],
          returnType: 'boolean'
        },
        {
          name: 'listKeys',
          description: 'List all keys',
          path: '/listKeys',
          method: 'POST',
          parameters: [
            { name: 'namespace', type: 'string', required: false, description: 'Namespace filter' }
          ],
          returnType: 'string[]'
        }
      ],
      healthCheck: { path: '/health', method: 'GET', interval: 30000, timeout: 5000 }
    }
  ];
}
