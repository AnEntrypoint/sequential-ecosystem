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

export function generateTaskHooksTemplate() {
  return `/**
 * Task Hooks
 *
 * Register custom behavior at task lifecycle points.
 * Hooks: before, after, error, success
 */

import { createTaskHookSystem } from '@sequential/task-hooks';

const hooks = createTaskHookSystem();

// Logging hook
hooks.registerBeforeHook(async (taskName, context) => {
  console.log(\`[BEFORE] \${taskName}\`);
  return context;
});

hooks.registerAfterHook(async (taskName, output, duration) => {
  console.log(\`[AFTER] \${taskName} took \${duration}ms\`);
});

// Error tracking
hooks.registerErrorHook(async (taskName, error, duration) => {
  console.error(\`[ERROR] \${taskName}: \${error.message}\`);
});

// Success tracking
hooks.registerSuccessHook(async (taskName, output, duration) => {
  if (duration > 1000) {
    console.warn(\`[SLOW] \${taskName} took \${duration}ms\`);
  }
});

// Task implementation
export async function myTask(input) {
  return await hooks.wrapTaskExecution('myTask', async (data) => {
    return { result: data, processed: true };
  }, input);
}
`;
}

export function createFlowHookSystem() {
  const hooks = {
    stateEnter: [],
    stateExit: [],
    transition: [],
    error: []
  };

  return {
    registerStateEnterHook(handler) {
      hooks.stateEnter.push(handler);
      return () => {
        hooks.stateEnter.splice(hooks.stateEnter.indexOf(handler), 1);
      };
    },

    registerStateExitHook(handler) {
      hooks.stateExit.push(handler);
      return () => {
        hooks.stateExit.splice(hooks.stateExit.indexOf(handler), 1);
      };
    },

    registerTransitionHook(handler) {
      hooks.transition.push(handler);
      return () => {
        hooks.transition.splice(hooks.transition.indexOf(handler), 1);
      };
    },

    registerErrorHook(handler) {
      hooks.error.push(handler);
      return () => {
        hooks.error.splice(hooks.error.indexOf(handler), 1);
      };
    },

    async executeStateEnterHooks(stateName, context) {
      for (const hook of hooks.stateEnter) {
        await hook(stateName, context);
      }
    },

    async executeStateExitHooks(stateName, context) {
      for (const hook of hooks.stateExit) {
        await hook(stateName, context);
      }
    },

    async executeTransitionHooks(fromState, toState, context) {
      for (const hook of hooks.transition) {
        await hook(fromState, toState, context);
      }
    },

    async executeErrorHooks(stateName, error, context) {
      for (const hook of hooks.error) {
        await hook(stateName, error, context);
      }
    },

    clearAllHooks() {
      hooks.stateEnter = [];
      hooks.stateExit = [];
      hooks.transition = [];
      hooks.error = [];
    }
  };
}

export function generateFlowHooksTemplate() {
  return `/**
 * Flow Hooks
 *
 * Register custom behavior at flow lifecycle points.
 * Hooks: stateEnter, stateExit, transition, error
 */

import { createFlowHookSystem } from '@sequential/flow-hooks';

const hooks = createFlowHookSystem();

// Log state entries
hooks.registerStateEnterHook(async (stateName, context) => {
  console.log(\`[ENTER] \${stateName}\`);
});

// Log state exits
hooks.registerStateExitHook(async (stateName, context) => {
  console.log(\`[EXIT] \${stateName}\`);
});

// Log transitions
hooks.registerTransitionHook(async (fromState, toState, context) => {
  console.log(\`[TRANSITION] \${fromState} -> \${toState}\`);
});

// Error handling
hooks.registerErrorHook(async (stateName, error, context) => {
  console.error(\`[ERROR] in \${stateName}: \${error.message}\`);
});

export const graph = {
  initial: 'start',
  states: {
    start: { onDone: 'process' },
    process: { onDone: 'end', onError: 'handleError' },
    handleError: { type: 'final' },
    end: { type: 'final' }
  }
};
`;
}
