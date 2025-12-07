import { config } from './config-service.ts';
import type { ServiceDefinition } from './service-registry-types.ts';

function getServiceUrl(serviceName: string): string {
  const serviceConfig = config.getService(serviceName);
  if (serviceConfig) return serviceConfig.baseUrl;
  const supabaseUrl = config.supabase?.url || 'http://127.0.0.1:54321';
  return `${supabaseUrl}/functions/v1/${serviceName}`;
}

export function createApiServiceDefs(): ServiceDefinition[] {
  return [
    {
      name: 'gapi',
      baseUrl: getServiceUrl('wrappedgapi'),
      version: '1.0.0',
      description: 'Google API integration service',
      methods: [
        {
          name: 'domains.list',
          description: 'List domains',
          path: '/domains/list',
          method: 'POST',
          parameters: [
            { name: 'customer', type: 'string', required: false, description: 'Customer ID' },
            { name: 'maxResults', type: 'number', required: false, description: 'Maximum results' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'users.list',
          description: 'List users',
          path: '/users/list',
          method: 'POST',
          parameters: [
            { name: 'domain', type: 'string', required: false, description: 'Domain name' },
            { name: 'customer', type: 'string', required: false, description: 'Customer ID' },
            { name: 'maxResults', type: 'number', required: false, description: 'Maximum results' },
            { name: 'query', type: 'string', required: false, description: 'Search query' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'gmail.messages.list',
          description: 'List Gmail messages',
          path: '/gmail/messages/list',
          method: 'POST',
          parameters: [
            { name: 'userId', type: 'string', required: false, defaultValue: 'me', description: 'User ID' },
            { name: 'query', type: 'string', required: false, description: 'Search query' },
            { name: 'maxResults', type: 'number', required: false, description: 'Maximum results' }
          ],
          returnType: 'any[]'
        },
        {
          name: 'gmail.messages.get',
          description: 'Get Gmail message details',
          path: '/gmail/messages/get',
          method: 'POST',
          parameters: [
            { name: 'userId', type: 'string', required: false, defaultValue: 'me', description: 'User ID' },
            { name: 'messageId', type: 'string', required: true, description: 'Message ID' },
            { name: 'format', type: 'string', required: false, description: 'Message format' }
          ],
          returnType: 'any'
        }
      ],
      healthCheck: { path: '/health', method: 'GET', interval: 30000, timeout: 10000 }
    },
    {
      name: 'openai',
      baseUrl: getServiceUrl('wrappedopenai'),
      version: '1.0.0',
      description: 'OpenAI API integration service',
      methods: [
        {
          name: 'chat.completions.create',
          description: 'Create chat completion',
          path: '/chat/completions/create',
          method: 'POST',
          parameters: [
            { name: 'model', type: 'string', required: true, description: 'Model name' },
            { name: 'messages', type: 'any[]', required: true, description: 'Chat messages' },
            { name: 'temperature', type: 'number', required: false, description: 'Sampling temperature' },
            { name: 'maxTokens', type: 'number', required: false, description: 'Maximum tokens' }
          ],
          returnType: 'any'
        }
      ],
      healthCheck: { path: '/health', method: 'GET', interval: 60000, timeout: 10000 }
    },
    {
      name: 'websearch',
      baseUrl: getServiceUrl('wrappedwebsearch'),
      version: '1.0.0',
      description: 'Web search API integration service',
      methods: [
        {
          name: 'search',
          description: 'Perform web search',
          path: '/search',
          method: 'POST',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'maxResults', type: 'number', required: false, description: 'Maximum results' },
            { name: 'safeSearch', type: 'string', required: false, description: 'Safe search level' }
          ],
          returnType: 'any[]'
        }
      ],
      healthCheck: { path: '/health', method: 'GET', interval: 60000, timeout: 10000 }
    }
  ];
}
