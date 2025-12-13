/**
 * flow-topology.js
 *
 * Detect and analyze flow topology patterns
 */

export function createFlowTopology(states) {
  return {
    detect() {
      const chains = [];
      const branches = [];
      const parallel = [];

      states.forEach(s => {
        if (s.type === 'parallel') {
          parallel.push({ state: s.id, branches: s.branches || [] });
        } else if (s.type === 'if' || s.type === 'switch') {
          const routes = [];
          if (s.type === 'if') routes.push(s.onTrue, s.onFalse);
          else if (s.cases) routes.push(...Object.values(s.cases), s.default);
          branches.push({ state: s.id, routes: routes.filter(Boolean) });
        } else if (s.onDone) {
          chains.push({ from: s.id, to: s.onDone });
        }
      });

      return { chains, branches, parallel };
    }
  };
}
