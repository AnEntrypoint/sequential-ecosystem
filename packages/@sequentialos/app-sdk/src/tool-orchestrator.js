export function createToolOrchestrator(toolkit) {
  return {
    graph() {
      return new ToolGraph(toolkit);
    }
  };
}

class ToolGraph {
  constructor(toolkit) {
    this.toolkit = toolkit;
    this.dependencies = new Map();
    this.parallelGroups = [];
    this.timeout = 30000;
    this.tools = new Set();
  }

  require(depName) {
    return new DependencyBuilder(this, depName);
  }

  parallel(...toolNames) {
    this.parallelGroups.push(new Set(toolNames));
    return this;
  }

  timeout(ms) {
    this.timeout = ms;
    return this;
  }

  async invoke(context = {}) {
    const executionOrder = this.computeExecutionOrder();
    const results = {};
    const initialized = new Set();

    for (const group of executionOrder) {
      if (group.type === 'sequential') {
        for (const tool of group.tools) {
          const deps = this.dependencies.get(tool) || [];
          for (const dep of deps) {
            if (!initialized.has(dep)) {
              await this.toolkit.initializeTool(dep, context);
              initialized.add(dep);
            }
          }
          results[tool] = await this.invokeTool(tool, context);
          initialized.add(tool);
        }
      } else if (group.type === 'parallel') {
        const promises = [];
        for (const tool of group.tools) {
          const deps = this.dependencies.get(tool) || [];
          for (const dep of deps) {
            if (!initialized.has(dep)) {
              await this.toolkit.initializeTool(dep, context);
              initialized.add(dep);
            }
          }
          promises.push(
            this.invokeTool(tool, context).then(result => ({ tool, result }))
          );
        }
        const parallelResults = await Promise.all(promises);
        for (const { tool, result } of parallelResults) {
          results[tool] = result;
          initialized.add(tool);
        }
      }
    }

    return results;
  }

  async invokeTool(toolName, context) {
    const toolFn = this.toolkit.tools.get(toolName);
    if (!toolFn) throw new Error(`Tool not found: ${toolName}`);

    return await Promise.race([
      this.toolkit.invokeWithLifecycle(toolName, toolFn, context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool timeout: ${toolName}`)), this.timeout)
      )
    ]);
  }

  computeExecutionOrder() {
    const groups = [];
    const visited = new Set();

    for (const group of this.parallelGroups) {
      const parallelTools = Array.from(group).filter(t => !visited.has(t));
      if (parallelTools.length > 0) {
        groups.push({ type: 'parallel', tools: parallelTools });
        parallelTools.forEach(t => visited.add(t));
      }
    }

    for (const tool of this.tools) {
      if (!visited.has(tool)) {
        groups.push({ type: 'sequential', tools: [tool] });
        visited.add(tool);
      }
    }

    return groups;
  }
}

class DependencyBuilder {
  constructor(graph, depName) {
    this.graph = graph;
    this.depName = depName;
  }

  to(toolNames) {
    const tools = Array.isArray(toolNames) ? toolNames : [toolNames];
    for (const tool of tools) {
      if (!this.graph.dependencies.has(tool)) {
        this.graph.dependencies.set(tool, []);
      }
      this.graph.dependencies.get(tool).push(this.depName);
      this.graph.tools.add(tool);
    }
    return this.graph;
  }
}
