import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class ToolLoader {
  constructor(config = {}) {
    this.toolsDir = config.toolsDir || './tools';
    this.cache = new Map();
    this.dependencyCache = new Map();
  }

  parseDependencies(code) {
    const imports = new Set();
    const importRegex = /import\s+(?:(?:{[^}]*})|(?:\*\s+as\s+\w+)|(?:\w+(?:\s*,\s*{[^}]*})?)|(?:(?:\w+\s+from\s+)?))?\s*['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const moduleName = match[1];
      if (!moduleName.startsWith('.')) {
        imports.add(moduleName);
      }
    }

    return Array.from(imports);
  }

  validateDependencies(toolDef) {
    const required = toolDef.metadata?.imports || [];
    const code = toolDef.code || '';
    const found = this.parseDependencies(code);

    const missing = required.filter(dep => !found.includes(dep));
    const unused = found.filter(dep => !required.includes(dep));

    return {
      valid: missing.length === 0,
      missing,
      unused,
      found,
      required
    };
  }

  installDependencies(dependencies) {
    if (dependencies.length === 0) return;

    const cacheKey = dependencies.sort().join(',');
    if (this.dependencyCache.has(cacheKey)) {
      return;
    }

    try {
      const installed = dependencies.join(' ');
      execSync(`npm install ${installed}`, {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      this.dependencyCache.set(cacheKey, true);
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
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

    const toolModule = {
      name: toolDef.name,
      description: toolDef.description || '',
      handler: null,
      parameters: toolDef.parameters || {},
      metadata: toolDef.metadata || {},
      validation
    };

    if (toolDef.code) {
      try {
        const moduleCode = `
          ${toolDef.code}
          export { handler, metadata };
        `;

        const tempFile = path.join('/tmp', `tool-${toolDef.name}-${Date.now()}.mjs`);
        fs.writeFileSync(tempFile, moduleCode);

        const module = await import(`file://${tempFile}`);
        toolModule.handler = module.handler || module.default;
        toolModule.metadata = { ...toolModule.metadata, ...module.metadata };

        fs.unlinkSync(tempFile);
      } catch (error) {
        throw new Error(`Failed to load tool ${toolDef.name}: ${error.message}`);
      }
    }

    this.cache.set(toolDef.name, toolModule);
    return toolModule;
  }

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
        const tool = await this.loadTool(toolDef);
        tools.push(tool);
      } catch (error) {
        console.error(`Error loading tool ${file}:`, error.message);
      }
    }

    return tools;
  }

  createToolDefinition(name, description, handler, imports = []) {
    return {
      name,
      description,
      code: handler.toString(),
      metadata: { imports },
      parameters: {},
      required: []
    };
  }

  saveToolDefinition(toolDef, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${toolDef.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(toolDef, null, 2));

    return filePath;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      cachedTools: this.cache.size,
      cachedDependencies: this.dependencyCache.size
    };
  }
}

export function createToolLoader(config) {
  return new ToolLoader(config);
}
