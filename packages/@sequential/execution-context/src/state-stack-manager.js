/**
 * state-stack-manager.js
 *
 * State stack tracking and navigation
 */

export function createStateStackManager() {
  const stateStack = [];

  return {
    pushState(stateName, input = {}, metadata = {}) {
      const stateEntry = {
        state: stateName,
        index: stateStack.length,
        input: input,
        timestamp: new Date().toISOString(),
        metadata: metadata
      };

      stateStack.push(stateEntry);
      return stateEntry;
    },

    popState(output = {}, error = null) {
      if (stateStack.length === 0) {
        return null;
      }

      const stateEntry = stateStack[stateStack.length - 1];
      stateEntry.output = output;
      stateEntry.error = error;
      stateEntry.endTime = new Date().toISOString();

      if (stateEntry.timestamp && stateEntry.endTime) {
        stateEntry.duration = new Date(stateEntry.endTime) - new Date(stateEntry.timestamp);
      }

      stateStack.pop();
      return stateEntry;
    },

    getCurrentState() {
      return stateStack.length > 0 ? stateStack[stateStack.length - 1] : null;
    },

    getAllStates() {
      return stateStack.slice();
    },

    clearStateStack() {
      stateStack.length = 0;
    },

    getStateStackArray() {
      return stateStack;
    }
  };
}
