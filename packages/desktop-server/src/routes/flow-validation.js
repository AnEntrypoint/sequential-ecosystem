/**
 * flow-validation.js
 *
 * Flow validation and suggestion generation
 */

export function createFlowValidator(states) {
  return {
    validateConsistency(loops) {
      const issues = [];

      states.forEach(s => {
        if ((s.type === 'if' || s.type === 'switch') && !s.onDone && !s.onTrue && !s.onFalse) {
          issues.push(`State ${s.id} has no routing defined`);
        }
        if (s.type === 'parallel' && !s.branches?.length) {
          issues.push(`Parallel state ${s.id} has no branches`);
        }
      });

      if (loops.length > 0) {
        issues.push(`Detected ${loops.length} loop(s): ${loops.map(l => l.join('→')).join('; ')}`);
      }

      return { valid: issues.length === 0, issues };
    },

    generateSuggestions(topology, loops, unreachable) {
      const suggestions = [];

      if (loops.length > 0) {
        suggestions.push(`Add loop termination conditions or break states`);
      }

      if (unreachable.length > 0) {
        suggestions.push(`Remove or reconnect unreachable states: ${unreachable.join(', ')}`);
      }

      const branches = topology.branches || [];
      if (branches.length > 3) {
        suggestions.push(`Consider consolidating ${branches.length} branching states`);
      }

      return suggestions;
    }
  };
}
