/**
 * state-formatter.js
 *
 * State chain formatting and analysis
 */

export function createStateFormatter(stateStackManager) {
  return {
    getStatePath() {
      const states = stateStackManager.getAllStates();
      return states.map((s) => s.state);
    },

    getStateChain() {
      const states = stateStackManager.getAllStates();
      return states.map((s) => {
        const status = s.error ? 'error' : (s.output ? 'done' : 'active');
        return `${s.state} [${status}]`;
      }).join(' → ');
    },

    getExecutionTrace() {
      const currentState = stateStackManager.getCurrentState();
      const states = stateStackManager.getAllStates();
      return {
        totalStates: states.length,
        path: this.getStatePath(),
        chain: this.getStateChain(),
        currentState: currentState
      };
    }
  };
}
