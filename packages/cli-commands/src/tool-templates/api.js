import logger from '@sequentialos/sequential-logging';

export function generateApiToolTemplate(name, toolId, timestamp, description, category) {
  const funcName = name.replace(/-/g, '_');

  return `/**
 * Tool: ${name}
 * @description ${description || `HTTP API tool: ${name}`}
 * @category ${category}
 * @id ${toolId}
 * @created ${timestamp}
 * @template api
 */

export const config = {
  id: '${toolId}',
  name: '${name}',
  description: '${description || `HTTP API tool: ${name}`}',
  category: '${category}',
  created: '${timestamp}',
  parameters: {
    method: {
      type: 'string',
      description: 'HTTP method (GET, POST, PUT, DELETE)',
      default: 'GET'
    },
    url: {
      type: 'string',
      description: 'Target URL'
    },
    headers: {
      type: 'object',
      description: 'Request headers',
      default: {}
    },
    body: {
      type: 'object',
      description: 'Request body for POST/PUT',
      default: null
    },
    timeout: {
      type: 'number',
      description: 'Timeout in milliseconds',
      default: 30000
    }
  }
};

/**
 * Make HTTP request to external API
 * @param {Object} input
 * @param {string} input.method - HTTP method
 * @param {string} input.url - Target URL
 * @param {Object} input.headers - Request headers
 * @param {*} input.body - Request body
 * @param {number} input.timeout - Request timeout
 * @returns {Promise<Object>} API response
 */
export async function ${funcName}(input) {
  const {
    method = 'GET',
    url,
    headers = {},
    body = null,
    timeout = 30000
  } = input;

  try {
    if (!url) {
      throw new Error('URL is required');
    }

    logger.info(\`Making \${method} request to: \${url}\`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: controller.signal
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      data,
      url,
      method
    };

    if (!response.ok) {
      logger.warn(\`API returned status \${response.status}\`);
    } else {
      logger.info('API request successful');
    }

    return result;

  } catch (error) {
    logger.error(\`API request failed: \${error.message}\`);
    throw {
      success: false,
      error: error.message,
      url,
      method
    };
  }
}
`;
}
