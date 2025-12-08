export function generateTaskDocumentation(taskName, taskFn, metadata = {}) {
  const params = extractFunctionParams(taskFn);
  const returnType = inferReturnType(taskFn);

  return {
    name: taskName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    inputs: params.map(p => ({
      name: p,
      type: 'unknown',
      required: true,
      description: `Parameter ${p}`
    })),
    output: {
      type: returnType,
      description: metadata.returnDescription || 'Task result'
    },
    examples: metadata.examples || [],
    errors: metadata.errors || [],
    tags: metadata.tags || [],
    author: metadata.author,
    createdAt: new Date().toISOString()
  };
}

export function generateToolDocumentation(toolName, toolFn, metadata = {}) {
  const params = extractFunctionParams(toolFn);

  return {
    name: toolName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    category: metadata.category || 'general',
    inputs: params.map(p => ({
      name: p,
      type: metadata.paramTypes?.[p] || 'unknown',
      required: metadata.required?.includes(p) || true,
      description: metadata.paramDescriptions?.[p] || `Parameter ${p}`
    })),
    output: {
      type: metadata.returnType || 'unknown',
      description: metadata.returnDescription || 'Tool result'
    },
    examples: metadata.examples || [],
    rateLimit: metadata.rateLimit,
    timeout: metadata.timeout,
    retryable: metadata.retryable !== false,
    tags: metadata.tags || [],
    createdAt: new Date().toISOString()
  };
}

export function generateFlowDocumentation(flowName, graph, metadata = {}) {
  const states = Object.keys(graph.states || {});
  const handlers = extractFlowHandlers(graph);

  return {
    name: flowName,
    description: metadata.description || 'No description provided',
    version: metadata.version || '1.0.0',
    initialState: graph.initial,
    states: states.map(state => ({
      name: state,
      type: graph.states[state].type || 'normal',
      transitions: getStateTransitions(graph, state),
      description: metadata.stateDescriptions?.[state] || `State: ${state}`
    })),
    handlers: handlers.map(h => ({
      name: h,
      description: metadata.handlerDescriptions?.[h] || `Handler for ${h}`
    })),
    examples: metadata.examples || [],
    tags: metadata.tags || [],
    createdAt: new Date().toISOString()
  };
}

export function createDocumentationGenerator() {
  const docs = new Map();

  return {
    register(resourceType, resourceName, documentation) {
      const key = `${resourceType}:${resourceName}`;
      docs.set(key, documentation);
      return this;
    },

    getDocumentation(resourceType, resourceName) {
      return docs.get(`${resourceType}:${resourceName}`);
    },

    generateMarkdown(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      if (!doc) return null;

      let markdown = `# ${doc.name}\n\n`;
      markdown += `**Version:** ${doc.version}\n\n`;

      if (doc.description) {
        markdown += `## Description\n${doc.description}\n\n`;
      }

      if (doc.inputs && doc.inputs.length > 0) {
        markdown += `## Parameters\n\n`;
        markdown += `| Name | Type | Required | Description |\n`;
        markdown += `|------|------|----------|-------------|\n`;
        for (const input of doc.inputs) {
          markdown += `| ${input.name} | ${input.type} | ${input.required ? 'Yes' : 'No'} | ${input.description} |\n`;
        }
        markdown += `\n`;
      }

      if (doc.output) {
        markdown += `## Returns\n\n`;
        markdown += `**Type:** ${doc.output.type}\n\n`;
        markdown += `${doc.output.description}\n\n`;
      }

      if (doc.examples && doc.examples.length > 0) {
        markdown += `## Examples\n\n`;
        for (const example of doc.examples) {
          markdown += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
        }
      }

      if (doc.errors && doc.errors.length > 0) {
        markdown += `## Errors\n\n`;
        for (const error of doc.errors) {
          markdown += `- **${error.code}**: ${error.description}\n`;
        }
        markdown += `\n`;
      }

      return markdown;
    },

    generateOpenAPI(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      if (!doc) return null;

      const properties = {};
      for (const input of doc.inputs || []) {
        properties[input.name] = {
          type: input.type,
          description: input.description
        };
      }

      return {
        name: doc.name,
        description: doc.description,
        requestBody: {
          type: 'object',
          properties
        },
        responses: {
          '200': {
            description: 'Success',
            schema: {
              type: doc.output?.type || 'object'
            }
          }
        }
      };
    },

    listAll() {
      const all = [];
      for (const [key, doc] of docs.entries()) {
        all.push({ key, ...doc });
      }
      return all;
    },

    search(query) {
      const results = [];
      for (const [key, doc] of docs.entries()) {
        if (doc.name.includes(query) ||
            doc.description.includes(query) ||
            (doc.tags && doc.tags.join(',').includes(query))) {
          results.push({ key, ...doc });
        }
      }
      return results;
    }
  };
}

function extractFunctionParams(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];

  return paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('='))
    .map(p => p.split('=')[0].trim());
}

function inferReturnType(fn) {
  const fnStr = fn.toString();
  if (fnStr.includes('async')) return 'Promise';
  if (fnStr.includes('return')) return 'unknown';
  return 'void';
}

function getStateTransitions(graph, stateName) {
  const state = graph.states[stateName];
  const transitions = [];

  if (state.onDone) transitions.push({ event: 'done', to: state.onDone });
  if (state.onError) transitions.push({ event: 'error', to: state.onError });
  if (state.onTrue) transitions.push({ event: 'true', to: state.onTrue });
  if (state.onFalse) transitions.push({ event: 'false', to: state.onFalse });

  return transitions;
}

function extractFlowHandlers(graph) {
  const handlers = new Set();

  for (const state of Object.keys(graph.states || {})) {
    if (graph.states[state].type !== 'final' && state !== graph.initial) {
      handlers.add(state);
    }
  }

  return Array.from(handlers);
}

export function generateDocumentationTemplate() {
  return `/**
 * API Documentation
 *
 * Auto-generate documentation for tasks, tools, and flows.
 */

import { generateTaskDocumentation, createDocumentationGenerator } from '@sequential/api-documentation';

const docGen = createDocumentationGenerator();

// Register task documentation
docGen.register('task', 'fetchUser', {
  name: 'Fetch User',
  description: 'Retrieve user data from the API',
  version: '1.0.0',
  inputs: [
    { name: 'userId', type: 'number', required: true, description: 'The user ID to fetch' },
    { name: 'includeOrders', type: 'boolean', required: false, description: 'Include order history' }
  ],
  output: {
    type: 'object',
    description: 'User object with profile information'
  },
  examples: [
    {
      name: 'Fetch user by ID',
      code: 'const user = await fetchUser({ userId: 123 });'
    }
  ],
  errors: [
    { code: 'NOT_FOUND', description: 'User not found' },
    { code: 'UNAUTHORIZED', description: 'Invalid credentials' }
  ],
  tags: ['api', 'users', 'data']
});

// Get documentation
export function getTaskDocs(taskName) {
  return docGen.getDocumentation('task', taskName);
}

// Generate markdown
export function getTaskMarkdown(taskName) {
  return docGen.generateMarkdown('task', taskName);
}

// Generate OpenAPI spec
export function getTaskOpenAPI(taskName) {
  return docGen.generateOpenAPI('task', taskName);
}

// List all documented resources
export function listAllDocumentation() {
  return docGen.listAll();
}

// Search documentation