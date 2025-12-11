import { createToolLoaderService } from './tool-loader-loader.js';
import { createToolLoaderValidator } from './tool-loader-validator.js';
import { createToolLoaderManifestService } from './tool-loader-manifests.js';
import { createToolLoaderSummaryService } from './tool-loader-summary.js';

/**
 * app-tool-loader-core.js - Facade for app tool loading and registration
 *
 * Delegates to focused modules:
 * - tool-loader-loader: Directory and import-based loading
 * - tool-loader-validator: Validation and querying
 * - tool-loader-manifests: Manifest-based loading and registration
 * - tool-loader-summary: Summary generation
 */

export function createAppToolLoader() {
  const loadedTools = new Map();

  const loaderService = createToolLoaderService(loadedTools);
  const validatorService = createToolLoaderValidator(loadedTools);
  const manifestService = createToolLoaderManifestService(loaderService, validatorService);
  const summaryService = createToolLoaderSummaryService();

  return {
    // Loading
    async loadToolsFromDirectory(dir) {
      return loaderService.loadToolsFromDirectory(dir);
    },

    async loadToolsFromImports(imports) {
      return loaderService.loadToolsFromImports(imports);
    },

    // Validation
    validateToolDefinitions(tools) {
      return validatorService.validateToolDefinitions(tools);
    },

    getTool(toolName) {
      return validatorService.getTool(toolName);
    },

    getAllTools() {
      return validatorService.getAllTools();
    },

    getToolsByCategory(category) {
      return validatorService.getToolsByCategory(category);
    },

    getToolsByTag(tag) {
      return validatorService.getToolsByTag(tag);
    },

    // Registration
    registerWithAppSDK(appSDK, tools) {
      return manifestService.registerWithAppSDK(appSDK, tools);
    },

    async registerFromManifest(appSDK, manifestPath) {
      return manifestService.registerFromManifest(appSDK, manifestPath);
    },

    // Summary
    generateToolSummary(tools) {
      return summaryService.generateToolSummary(tools);
    }
  };
}
