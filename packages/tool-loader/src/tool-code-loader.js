/**
 * tool-code-loader.js
 *
 * Load tool handler and metadata from code
 */

import fs from 'fs';
import path from 'path';

export function createToolCodeLoader() {
  return {
    async loadToolCode(toolDef) {
      const toolModule = {
        name: toolDef.name,
        description: toolDef.description || '',
        handler: null,
        parameters: toolDef.parameters || {},
        metadata: toolDef.metadata || {},
        validation: {}
      };

      if (toolDef.code) {
        try {
          let handler = null;
          let metadata = {};

          if (toolDef.code.includes('export async function')) {
            const fnMatch = toolDef.code.match(/export async function\s+(\w+)/);
            const fnName = fnMatch ? fnMatch[1] : 'handler';
            const metadataMatch = toolDef.code.match(/export const metadata = ({[\s\S]*?});/);

            handler = new Function('return async function ' + fnName + '(args) { ' + toolDef.code.split('{')[1].split('}')[0] + ' }')();
            if (metadataMatch) {
              try {
                metadata = JSON.parse(metadataMatch[1]);
              } catch (e) {
                // metadata parsing error, use default
              }
            }
          } else {
            const moduleCode = toolDef.code;
            const tempFile = path.join('/tmp', `tool-${toolDef.name}-${Date.now()}.mjs`);
            fs.writeFileSync(tempFile, moduleCode);

            try {
              const module = await import(`file://${tempFile}`);
              handler = module.handler || module.default;
              metadata = module.metadata || {};
            } finally {
              try {
                fs.unlinkSync(tempFile);
              } catch (e) {
                // ignore cleanup errors
              }
            }
          }

          toolModule.handler = handler || (async (args) => ({ success: false, error: 'No handler found' }));
          toolModule.metadata = { ...toolModule.metadata, ...metadata };
        } catch (error) {
          throw new Error(`Failed to load tool ${toolDef.name}: ${error.message}`);
        }
      }

      return toolModule;
    }
  };
}
