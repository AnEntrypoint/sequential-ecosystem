export function createToolLifecycleManager() {
  const lifecycles = new Map();
  const initialized = new Set();

  return {
    registerLifecycle(toolName, lifecycle) {
      lifecycles.set(toolName, {
        beforeInit: lifecycle.beforeInit || (() => ({ success: true })),
        afterInit: lifecycle.afterInit || (() => ({})),
        beforeInvoke: lifecycle.beforeInvoke || ((input) => input),
        afterInvoke: lifecycle.afterInvoke || ((result) => result),
        onError: lifecycle.onError || ((error) => { throw error; }),
        cleanup: lifecycle.cleanup || (() => ({})),
        dependencies: lifecycle.dependencies || [],
        maxConcurrent: lifecycle.maxConcurrent || null
      });
      return this;
    },

    async initializeTool(toolName, context = {}) {
      if (initialized.has(toolName)) {
        return { initialized: true };
      }

      const lifecycle = lifecycles.get(toolName);
      if (!lifecycle) {
        return { initialized: true, noLifecycle: true };
      }

      const validation = await this.validateDependencies(toolName, context);
      if (!validation.valid) {
        const error = new Error(`Tool "${toolName}" dependency validation failed`);
        error.dependencies = validation.missing;
        throw error;
      }

      const before = await lifecycle.beforeInit(context);
      if (!before.success) {
        const error = new Error(`Tool "${toolName}" initialization failed: ${before.error || 'unknown'}`);
        throw error;
      }

      const after = await lifecycle.afterInit(context);
      initialized.add(toolName);

      return { initialized: true, context: after };
    },

    async validateDependencies(toolName, context = {}) {
      const lifecycle = lifecycles.get(toolName);
      if (!lifecycle || !lifecycle.dependencies.length) {
        return { valid: true };
      }

      const missing = [];
      for (const dep of lifecycle.dependencies) {
        if (!initialized.has(dep)) {
          missing.push(dep);
        }
      }

      if (missing.length > 0) {
        return { valid: false, missing };
      }

      return { valid: true };
    },

    async invokeWithLifecycle(toolName, toolFn, input) {
      const lifecycle = lifecycles.get(toolName);
      if (!lifecycle) {
        return await toolFn(input);
      }

      try {
        const validated = await lifecycle.beforeInvoke(input);
        const result = await toolFn(validated);
        return await lifecycle.afterInvoke(result);
      } catch (error) {
        return await lifecycle.onError(error);
      }
    },

    async cleanupTool(toolName, context = {}) {
      const lifecycle = lifecycles.get(toolName);
      if (lifecycle && initialized.has(toolName)) {
        await lifecycle.cleanup(context);
        initialized.delete(toolName);
      }
    },

    async cleanupAll(context = {}) {
      const tools = Array.from(initialized);
      for (const tool of tools) {
        await this.cleanupTool(tool, context);
      }
    }
  };
}
