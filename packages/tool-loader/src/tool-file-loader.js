/**
 * tool-file-loader.js
 *
 * Load tools from filesystem
 */

import fs from 'fs';
import path from 'path';
import logger from '@sequentialos/sequential-logging';

export function createToolFileLoader() {
  return {
    async loadAllTools(toolsDir) {
      const tools = [];

      if (!fs.existsSync(toolsDir)) {
        return tools;
      }

      const files = fs.readdirSync(toolsDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(toolsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const toolDef = JSON.parse(content);

        try {
          yield {
            name: toolDef.name,
            definition: toolDef
          };
        } catch (error) {
          logger.error(`Error loading tool ${file}:`, error.message);
        }
      }

      return tools;
    },

    loadToolDefinitionFromFile(filePath) {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  };
}
