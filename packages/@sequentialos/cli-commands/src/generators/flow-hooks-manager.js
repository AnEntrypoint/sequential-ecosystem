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
