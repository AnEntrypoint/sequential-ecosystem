/**
 * conditional-validator.js
 *
 * Validate conditional and switch flow configurations
 */

export function validateConditionalFlow(graph) {
  const issues = [];

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.type === 'conditional') {
      if (!state.condition) {
        issues.push(`State ${stateName}: conditional missing condition`);
      }
      if (!state.onTrue) {
        issues.push(`State ${stateName}: conditional missing onTrue path`);
      }
      if (!state.onFalse) {
        issues.push(`State ${stateName}: conditional missing onFalse path`);
      }
      if (state.onTrue && !graph.states[state.onTrue]) {
        issues.push(`State ${stateName}: onTrue references non-existent state ${state.onTrue}`);
      }
      if (state.onFalse && !graph.states[state.onFalse]) {
        issues.push(`State ${stateName}: onFalse references non-existent state ${state.onFalse}`);
      }
    }

    if (state.type === 'switch') {
      if (!state.selector) {
        issues.push(`State ${stateName}: switch missing selector`);
      }
      if (!state.cases || Object.keys(state.cases).length === 0) {
        issues.push(`State ${stateName}: switch missing cases`);
      }
      for (const [caseKey, casePath] of Object.entries(state.cases || {})) {
        if (!graph.states[casePath]) {
          issues.push(`State ${stateName}: case '${caseKey}' references non-existent state ${casePath}`);
        }
      }
      if (state.default && !graph.states[state.default]) {
        issues.push(`State ${stateName}: default references non-existent state ${state.default}`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
