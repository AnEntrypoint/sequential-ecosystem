import fs from 'fs-extra';
import path from 'path';
import { extractParamInfo } from './tool-param-extractor.js';

/**
 * tool-loader-loader.js
 *
 * Load tool definitions from files and modules
 */

export function createToolLoaderService(loadedTools) {
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
    }
  };
}
