export function createTaskHookSystem() {
  const hooks = {
    before: [],
    after: [],
    error: [],
    success: []
  };

  return {
    registerBeforeHook(handler) {
      hooks.before.push(handler);
      return () => {
        hooks.before.splice(hooks.before.indexOf(handler), 1);
      };
    },

    registerAfterHook(handler) {
      hooks.after.push(handler);
      return () => {
        hooks.after.splice(hooks.after.indexOf(handler), 1);
      };
    },

    registerErrorHook(handler) {
      hooks.error.push(handler);
      return () => {
        hooks.error.splice(hooks.error.indexOf(handler), 1);
      };
    },

    registerSuccessHook(handler) {
      hooks.success.push(handler);
      return () => {
        hooks.success.splice(hooks.success.indexOf(handler), 1);
      };
    },

    async executeBeforeHooks(taskName, input) {
      let context = { input };
      for (const hook of hooks.before) {
        context = await hook(taskName, context);
      }
      return context.input;
    },

    async executeAfterHooks(taskName, output, duration) {
      for (const hook of hooks.after) {
        await hook(taskName, output, duration);
      }
    },

    async executeErrorHooks(taskName, error, duration) {
      for (const hook of hooks.error) {
        await hook(taskName, error, duration);
      }
    },

    async executeSuccessHooks(taskName, output, duration) {
      for (const hook of hooks.success) {
        await hook(taskName, output, duration);
      }
    },

    async wrapTaskExecution(taskName, taskFn, input) {
      const start = Date.now();
      let modifiedInput = input;

      try {
        modifiedInput = await this.executeBeforeHooks(taskName, input);
        const result = await taskFn(modifiedInput);
        const duration = Date.now() - start;

        await this.executeAfterHooks(taskName, result, duration);
        await this.executeSuccessHooks(taskName, result, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        await this.executeErrorHooks(taskName, error, duration);
        throw error;
      }
    },

    clearAllHooks() {
      hooks.before = [];
      hooks.after = [];
      hooks.error = [];
      hooks.success = [];
    }
  };
}
