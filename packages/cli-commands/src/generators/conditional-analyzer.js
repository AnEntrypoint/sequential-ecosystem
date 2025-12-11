/**
 * conditional-analyzer.js
 *
 * Analyze conditional and switch flow structures
 */

export function analyzeConditionalFlow(graph) {
  const conditionals = [];
  const switches = [];
  const branches = new Set();

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.type === 'conditional') {
      conditionals.push({
        state: stateName,
        truePath: state.onTrue,
        falsePath: state.onFalse
      });
      branches.add(state.onTrue);
      branches.add(state.onFalse);
    }

    if (state.type === 'switch') {
      switches.push({
        state: stateName,
        cases: Object.keys(state.cases || {}),
        default: state.default
      });
      for (const path of Object.values(state.cases || {})) {
        branches.add(path);
      }
      if (state.default) {
        branches.add(state.default);
      }
    }
  }

  return {
    totalConditionals: conditionals.length,
    totalSwitches: switches.length,
    conditionals,
    switches,
    branchCount: branches.size
  };
}
