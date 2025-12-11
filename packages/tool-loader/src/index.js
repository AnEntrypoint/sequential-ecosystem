/**
 * index.js - Facade for tool loading
 *
 * Delegates to focused modules:
 * - dependency-parser: Parse and validate dependencies
 * - dependency-installer: Install and cache dependencies
 * - tool-code-loader: Load tool handler and metadata from code
 * - tool-file-loader: Load tools from filesystem
 * - tool-definition-manager: Create and persist tool definitions
 * - tool-cache: Cache management
 */

import logger from '@sequentialos/sequential-logging';
import { createDependencyParser } from './dependency-parser.js';
import { createDependencyInstaller } from './dependency-installer.js';
import { createToolCodeLoader } from './tool-code-loader.js';
import { createToolFileLoader } from './tool-file-loader.js';
import { createToolDefinitionManager } from './tool-definition-manager.js';
import { createToolCache } from './tool-cache.js';

export class ToolLoader {
  constructor(config = {}) {
    this.toolsDir = config.toolsDir || './tools';
    this.cache = createToolCache();
    this.dependencyParser = createDependencyParser();
    this.dependencyInstaller = createDependencyInstaller();
    this.codeLoader = createToolCodeLoader();
    this.fileLoader = createToolFileLoader();
    this.defManager = createToolDefinitionManager();
  }

  parseDependencies(code) {
    return this.dependencyParser.parseDependencies(code);
  }

  validateDependencies(toolDef) {
    return this.dependencyParser.validateDependencies(toolDef);
  }

  installDependencies(dependencies) {
    return this.dependencyInstaller.installDependencies(dependencies);
  }

  async loadTool(toolDef) {
    if (this.cache.has(toolDef.name)) {
      return this.cache.get(toolDef.name);
    }

    const validation = this.validateDependencies(toolDef);
    if (!validation.valid) {
      throw new Error(`Missing dependencies for ${toolDef.name}: ${validation.missing.join(', ')}`);
    }

    if (validation.found.length > 0) {
      this.installDependencies(validation.found);
    }

    const toolModule = await this.codeLoader.loadToolCode(toolDef);
    toolModule.validation = validation;

    this.cache.set(toolDef.name, toolModule);
    return toolModule;
  }

  async loadAllTools(toolsDir) {
    const tools = [];

    const fileLoader = this.fileLoader;
    const iterator = fileLoader.loadAllTools(toolsDir);

    for await (const { name, definition } of iterator) {
      try {
        const tool = await this.loadTool(definition);
        tools.push(tool);
      } catch (error) {
        logger.error(`Error loading tool ${name}:`, error.message);
      }
    }

    return tools;
  }

  createToolDefinition(name, description, handler, imports = []) {
    return this.defManager.createToolDefinition(name, description, handler, imports);
  }

  saveToolDefinition(toolDef, outputDir) {
    return this.defManager.saveToolDefinition(toolDef, outputDir);
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    const stats = this.cache.getStats();
    return {
      ...stats,
      cachedDependencies: this.dependencyInstaller.getCacheSize()
    };
  }
}

export function createToolLoader(config) {
  return new ToolLoader(config);
}
