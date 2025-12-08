export function createBreadcrumbTracker(maxBreadcrumbs = 50) {
  const breadcrumbs = [];
  const stateStack = [];
  const stateSnapshots = new Map();

  return {
    pushBreadcrumb(toolName, action = 'invoke', metadata = {}) {
      const breadcrumb = {
        tool: toolName,
        action: action,
        timestamp: new Date().toISOString(),
        metadata: metadata
      };

      breadcrumbs.push(breadcrumb);
      if (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift();
      }

      return breadcrumb;
    },

    popBreadcrumb() {
      return breadcrumbs.pop();
    },

    getCurrentBreadcrumb() {
      return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
    },

    getAllBreadcrumbs() {
      return breadcrumbs.slice();
    },

    getBreadcrumbTrail() {
      return breadcrumbs.map((b) => b.tool);
    },

    getBreadcrumbChain() {
      return breadcrumbs.map((b) => `${b.tool} (${b.action})`).join(' → ');
    },

    getLastNBreadcrumbs(n) {
      return breadcrumbs.slice(-n);
    },

    clearBreadcrumbs() {
      breadcrumbs.length = 0;
    },

    enhanceErrorWithBreadcrumbs(error) {
      if (!error) return null;

      error.breadcrumbs = breadcrumbs.slice();
      error.breadcrumbTrail = this.getBreadcrumbTrail();
      error.breadcrumbChain = this.getBreadcrumbChain();

      return error;
    },

    getSummary() {
      return {
        totalCalls: breadcrumbs.length,
        uniqueTools: new Set(breadcrumbs.map((b) => b.tool)).size,
        successCount: breadcrumbs.filter((b) => b.action === 'success').length,
        errorCount: breadcrumbs.filter((b) => b.action === 'error').length,
        executionChain: this.getBreadcrumbChain()
      };
    },

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
      return stateStack.map((s) => s.state);
    },

    getStateChain() {
      return stateStack.map((s) => {
        const status = s.error ? 'error' : (s.output ? 'done' : 'active');
        return `${s.state} [${status}]`;
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
          stateSnapshots.set(stateName, stateExit);
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
      return {
        totalStates: stateStack.length,
        path: this.getStatePath(),
        chain: this.getStateChain(),
        snapshots: Array.from(stateSnapshots.entries()).map(([state, snapshot]) => ({
          state,
          snapshot
        }))
      };
    },

    getStateSummary() {
      const completedStates = Array.from(stateSnapshots.values());
      const totalDuration = completedStates.reduce((sum, s) => sum + (s.duration || 0), 0);

      return {
        statesVisited: stateStack.length,
        statesCompleted: completedStates.length,
        currentPath: this.getStatePath(),
        executionTrace: this.getStateChain(),
        totalDuration: totalDuration,
        averageStateDuration: completedStates.length > 0 ? totalDuration / completedStates.length : 0
      };
    }
  };
}
