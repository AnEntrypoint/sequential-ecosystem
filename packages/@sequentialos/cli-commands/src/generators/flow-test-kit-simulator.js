export function createFlowSimulator(graph) {
  return {
    handlers: {},
    breakpoints: new Set(),
    executionPath: [],
    stateSnapshots: new Map(),

    onState(stateName, handler) {
      this.handlers[stateName] = handler;
      return this;
    },

    setBreakpoint(stateName) {
      this.breakpoints.add(stateName);
      return this;
    },

    removeBreakpoint(stateName) {
      this.breakpoints.delete(stateName);
      return this;
    },

    async execute(input) {
      let currentState = graph.initial;
      let context = input;
      const results = [];

      while (currentState && graph.states[currentState].type !== 'final') {
        this.executionPath.push(currentState);
        this.stateSnapshots.set(currentState, JSON.parse(JSON.stringify(context)));

        if (this.breakpoints.has(currentState)) {
          return {
            paused: true,
            currentState,
            context,
            executionPath: this.executionPath,
            snapshot: this.stateSnapshots.get(currentState)
          };
        }

        const handler = this.handlers[currentState];
        if (!handler) {
          throw new Error(`No handler for state: ${currentState}`);
        }

        const result = await Promise.resolve(handler(context));
        results.push({ state: currentState, result });

        if (result && result.nextState) {
          currentState = result.nextState;
          context = result.context || context;
        } else if (result && typeof result === 'object' && !Array.isArray(result)) {
          context = result;

          const state = graph.states[currentState];
          if (result.error && state.onError) {
            currentState = state.onError;
          } else if (state.onDone) {
            currentState = state.onDone;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return {
        paused: false,
        completed: true,
        finalState: currentState,
        context,
        results,
        executionPath: this.executionPath,
        snapshots: Array.from(this.stateSnapshots.entries())
      };
    },

    resume() {
      const lastState = this.executionPath[this.executionPath.length - 1];
      const snapshot = this.stateSnapshots.get(lastState);
      return this.execute(snapshot);
    },

    getExecutionPath() {
      return this.executionPath;
    },

    getSnapshot(stateName) {
      return this.stateSnapshots.get(stateName);
    }
  };
}
