import { extractParamInfo } from './tool-param-extractor.js';

/**
 * tool-loader-validator.js
 *
 * Tool definition validation and querying
 */

export function createToolLoaderValidator(loadedTools) {
  return {
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
    }
  };
}
