export function createStateContextBreadcrumbs() {
  const stateStack = [];
  const stateSnapshots = new Map();

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

    getStatePath() {
      return stateStack.map(function(s) { return s.state; });
    },

    getStateChain() {
      return stateStack.map(function(s) {
        const status = s.error ? 'error' : (s.output ? 'done' : 'active');
        return s.state + ' [' + status + ']';
      }).join(' → ');
    },

    getAllStates() {
      return stateStack.slice();
    },

    clearStateStack() {
      stateStack.length = 0;
      stateSnapshots.clear();
    },

    attachStateContextToError(error) {
      if (!error) return null;

      error.stateContext = {
        path: this.getStatePath(),
        chain: this.getStateChain(),
        currentState: this.getCurrentState(),
        allStates: this.getAllStates(),
        stateCount: stateStack.length
      };

      if (this.getCurrentState()) {
        error.failingState = this.getCurrentState().state;
        error.stateIndex = this.getCurrentState().index;
        error.stateInput = this.getCurrentState().input;
      }

      return error;
    },

    wrapStateHandler(stateName, handlerFn) {
      const self = this;
      return async function wrappedHandler(input) {
        self.pushState(stateName, input, { role: 'handler' });

        try {
          const result = await handlerFn(input);
          const stateExit = self.popState(result, null);
          self.stateSnapshots.set(stateName, stateExit);
          return result;
        } catch (err) {
          const enhanced = self.attachStateContextToError(err);
          self.popState(null, err);
          throw enhanced;
        }
      };
    },

    getStateSnapshot(stateName) {
      return stateSnapshots.get(stateName) || null;
    },

    getExecutionTrace() {
      const trace = {
        totalStates: stateStack.length,
        path: this.getStatePath(),
        chain: this.getStateChain(),
        snapshots: Array.from(stateSnapshots.entries()).map(function(entry) {
          return {
            state: entry[0],
            snapshot: entry[1]
          };
        })
      };

      return trace;
    },

    getSummary() {
      const completedStates = Array.from(stateSnapshots.values());
      const totalDuration = completedStates.reduce(function(sum, s) {
        return sum + (s.duration || 0);
      }, 0);

      const summary = {
        statesVisited: stateStack.length,
        statesCompleted: completedStates.length,
        currentPath: this.getStatePath(),
        executionTrace: this.getStateChain(),
        totalDuration: totalDuration,
        averageStateDuration: completedStates.length > 0 ? totalDuration / completedStates.length : 0
      };

      return summary;
    }
  };
}
