/**
 * flow-reachability.js
 *
 * Reachability analysis for flow states
 */

export function createFlowReachability(states, initial) {
  return {
    detect() {
      const reachable = new Set();
      const queue = [initial];

      while (queue.length) {
        const stateId = queue.shift();
        if (reachable.has(stateId)) continue;
        reachable.add(stateId);

        const state = states.find(s => s.id === stateId);
        if (!state) continue;

        const next = [];
        if (state.onDone) next.push(state.onDone);
        if (state.onTrue) next.push(state.onTrue);
        if (state.onFalse) next.push(state.onFalse);
        if (state.cases) next.push(...Object.values(state.cases));
        if (state.default) next.push(state.default);
        if (state.branches) next.push(...state.branches);

        next.filter(Boolean).forEach(s => !reachable.has(s) && queue.push(s));
      }

      return reachable;
    },

    getUnreachable(reachable) {
      return states.filter(s => !reachable.has(s.id) && s.type !== 'final').map(s => s.id);
    }
  };
}
