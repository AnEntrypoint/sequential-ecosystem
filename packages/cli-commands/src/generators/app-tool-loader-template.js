export function generateAppToolLoaderTemplate() {
  return `/**
 * App Tool Loader
 *
 * Auto-discover and register tools from directory or imports.
 */

import { createAppToolLoader } from '@sequentialos/app-tool-loader';

const toolLoader = createAppToolLoader();

// Tool 1: Database operations
export async function queryDatabase(query, params) {
  return await __callHostTool__('database', 'query', { query, params });
}

export const queryDatabaseMetadata = {
  description: 'Execute SQL query',
  category: 'database',
  tags: ['query', 'read'],
  params: ['query', 'params']
};

// Tool 2: API calls
export async function callExternalAPI(endpoint, method = 'GET', data = null) {
  return await __callHostTool__('api', 'call', { endpoint, method, data });
}

export const callExternalAPIMetadata = {
  description: 'Call external API',
  category: 'api',
  tags: ['http', 'external'],
  params: ['endpoint', 'method', 'data']
};

// Tool 3: File operations
export async function readFile(path) {
  return await __callHostTool__('file', 'read', { path });
}

export const readFileMetadata = {
  description: 'Read file contents',
  category: 'file',
  tags: ['read', 'filesystem'],
  params: ['path']
};

// Load from directory (tools/*.tool.js)
export async function loadToolsFromDirectory() {
  const tools = await toolLoader.loadToolsFromDirectory('./src/tools');
  return tools;
}

// Load from imports
export async function loadToolsFromImports() {
  const tools = await toolLoader.loadToolsFromImports({
    './src/tools/database': 'queryDatabase',
    './src/tools/api': 'callExternalAPI',
    './src/tools/file': 'readFile'
  });
  return tools;
}

// Register with AppSDK
export async function initializeAppTools(appSDK) {
  const tools = await toolLoader.loadToolsFromDirectory('./src/tools');

  const validation = toolLoader.validateToolDefinitions(tools);
  if (!validation.valid) {
    console.error('Tool validation errors:', validation.errors);
    throw new Error('Invalid tools');
  }

  if (validation.warnings.length > 0) {
    console.warn('Tool warnings:', validation.warnings);
  }

  toolLoader.registerWithAppSDK(appSDK, tools);

  const summary = toolLoader.generateToolSummary(tools);
  console.log('Registered tools:', summary);

  return tools;
}

// Load from manifest.json
export async function loadFromManifest(appSDK) {
  const tools = await toolLoader.registerFromManifest(appSDK, './manifest.json');
  return tools;
}

// Get tools by category
export function getToolsByCategory(category) {
  return toolLoader.getToolsByCategory(category);
}

// Get tools by tag
export function getToolsByTag(tag) {
  return toolLoader.getToolsByTag(tag);
}
`;
}
