import fs from 'fs-extra';
import path from 'path';

/**
 * tool-loader-manifests.js
 *
 * Manifest-based tool loading and app SDK registration
 */

export function createToolLoaderManifestService(toolLoaderService, toolValidatorService) {
  return {
    async registerFromManifest(appSDK, manifestPath) {
      const manifest = await fs.readJson(manifestPath);
      const appDir = path.dirname(manifestPath);

      if (!manifest.tools || !manifest.tools.autoDiscover) {
        return [];
      }

      const toolsDir = path.join(appDir, manifest.tools.toolsDir || './src/tools');
      const tools = await toolLoaderService.loadToolsFromDirectory(toolsDir);

      const validation = toolValidatorService.validateToolDefinitions(tools);
      if (!validation.valid) {
        throw new Error(`Invalid tools in ${toolsDir}: ${validation.errors.join(', ')}`);
      }

      this.registerWithAppSDK(appSDK, tools);
      return tools;
    },

    registerWithAppSDK(appSDK, tools) {
      for (const tool of tools) {
        appSDK.tool(tool.name, tool.fn, tool.description);
      }

      return this;
    }
  };
}
