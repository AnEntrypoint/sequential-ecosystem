/**
 * tool-definition-manager.js
 *
 * Create and persist tool definitions
 */

import fs from 'fs';
import path from 'path';

export function createToolDefinitionManager() {
  return {
    createToolDefinition(name, description, handler, imports = []) {
      return {
        name,
        description,
        code: handler.toString(),
        metadata: { imports },
        parameters: {},
        required: []
      };
    },

    saveToolDefinition(toolDef, outputDir) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filePath = path.join(outputDir, `${toolDef.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(toolDef, null, 2));

      return filePath;
    }
  };
}
