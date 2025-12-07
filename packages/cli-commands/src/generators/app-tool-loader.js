import fs from 'fs-extra';
import path from 'path';

export function createAppToolLoader() {
  const loadedTools = new Map();

  return {
    async loadToolsFromDirectory(dir) {
      const tools = [];

      if (!fs.existsSync(dir)) {
        return tools;
      }

      const files = await fs.readdir(dir);
      const toolFiles = files.filter(f => f.endsWith('.tool.js') || f.endsWith('.tool.ts'));

      for (const file of toolFiles) {
        const filePath = path.join(dir, file);
        const toolName = path.basename(file, path.extname(file)).replace('.tool', '');

        try {
          const toolModule = await import(`file://${filePath}`);
          const toolFn = toolModule.default || toolModule.tool;
          const metadata = toolModule.metadata || {};

          if (typeof toolFn === 'function') {
            const tool = {
              name: toolName,
              fn: toolFn,
              description: metadata.description || `Tool: ${toolName}`,
              category: metadata.category || 'general',
              tags: metadata.tags || [],
              version: metadata.version || '1.0.0',
              params: metadata.params || extractParamInfo(toolFn)
            };

            tools.push(tool);
            loadedTools.set(toolName, tool);
          }
        } catch (error) {
          console.warn(`Failed to load tool ${file}:`, error.message);
        }
      }

      return tools;
    },

    async loadToolsFromImports(imports) {
      const tools = [];

      for (const [importPath, toolNames] of Object.entries(imports)) {
        try {
          const module = await import(importPath);

          const names = Array.isArray(toolNames) ? toolNames : [toolNames];

          for (const toolName of names) {
            const toolFn = module[toolName];
            const metadata = module[`${toolName}Metadata`] || {};

            if (typeof toolFn === 'function') {
              const tool = {
                name: toolName,
                fn: toolFn,
                description: metadata.description || `Tool: ${toolName}`,
                category: metadata.category || 'general',
                tags: metadata.tags || [],
                version: metadata.version || '1.0.0',
                params: metadata.params || extractParamInfo(toolFn)
              };

              tools.push(tool);
              loadedTools.set(toolName, tool);
            }
          }
        } catch (error) {
          console.warn(`Failed to load tools from ${importPath}:`, error.message);
        }
      }

      return tools;
    },

    validateToolDefinitions(tools) {
      const errors = [];
      const warnings = [];

      for (const tool of tools) {
        if (!tool.name || typeof tool.name !== 'string') {
          errors.push(`Tool missing or invalid name: ${JSON.stringify(tool)}`);
        }

        if (!tool.fn || typeof tool.fn !== 'function') {
          errors.push(`Tool ${tool.name} has invalid function`);
        }

        if (!tool.description || tool.description.length === 0) {
          warnings.push(`Tool ${tool.name} missing description`);
        }

        if (!tool.params || tool.params.length === 0) {
          warnings.push(`Tool ${tool.name} has no parameters documented`);
        }

        const params = extractParamInfo(tool.fn);
        if (params.length > 0 && (!tool.params || tool.params.length === 0)) {
          warnings.push(`Tool ${tool.name} has ${params.length} parameters but no documentation`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    },

    registerWithAppSDK(appSDK, tools) {
      for (const tool of tools) {
        appSDK.tool(tool.name, tool.fn, tool.description);
      }

      return this;
    },

    async registerFromManifest(appSDK, manifestPath) {
      const manifest = await fs.readJson(manifestPath);
      const appDir = path.dirname(manifestPath);

      if (!manifest.tools || !manifest.tools.autoDiscover) {
        return [];
      }

      const toolsDir = path.join(appDir, manifest.tools.toolsDir || './src/tools');
      const tools = await this.loadToolsFromDirectory(toolsDir);

      const validation = this.validateToolDefinitions(tools);
      if (!validation.valid) {
        throw new Error(`Invalid tools in ${toolsDir}: ${validation.errors.join(', ')}`);
      }

      this.registerWithAppSDK(appSDK, tools);
      return tools;
    },

    getTool(toolName) {
      return loadedTools.get(toolName);
    },

    getAllTools() {
      return Array.from(loadedTools.values());
    },

    getToolsByCategory(category) {
      return Array.from(loadedTools.values())
        .filter(tool => tool.category === category);
    },

    getToolsByTag(tag) {
      return Array.from(loadedTools.values())
        .filter(tool => tool.tags.includes(tag));
    },

    generateToolSummary(tools) {
      const summary = {
        totalTools: tools.length,
        byCategory: {},
        byTag: {},
        tools: []
      };

      for (const tool of tools) {
        summary.tools.push({
          name: tool.name,
          description: tool.description,
          category: tool.category,
          tags: tool.tags,
          params: tool.params.map(p => ({ name: p, inferred: true }))
        });

        if (!summary.byCategory[tool.category]) {
          summary.byCategory[tool.category] = [];
        }
        summary.byCategory[tool.category].push(tool.name);

        for (const tag of tool.tags) {
          if (!summary.byTag[tag]) {
            summary.byTag[tag] = [];
          }
          summary.byTag[tag].push(tool.name);
        }
      }

      return summary;
    }
  };
}

function extractParamInfo(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/\(([^)]*)\)/);

  if (!paramMatch) return [];

  return paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('='))
    .map(p => p.split('=')[0].trim());
}

export function generateAppToolLoaderTemplate() {
  return `/**
 * App Tool Loader
 *
 * Auto-discover and register tools from directory or imports.
 */

import { createAppToolLoader } from '@sequential/app-tool-loader';

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
