// Handler validation and discovery
export class HandlerValidator {
  static getRequiredHandlers(graph) {
    const requiredHandlers = new Set();
    const states = graph.states || {};
    for (const [stateName, state] of Object.entries(states)) {
      if (state.type !== 'final' && stateName !== 'error') {
        requiredHandlers.add(stateName);
      }
    }
    return requiredHandlers;
  }

  static validateFlowHandlers(graph, exports) {
    const errors = [];
    const exportedFns = Object.keys(exports).filter(k => typeof exports[k] === 'function');
    const requiredHandlers = this.getRequiredHandlers(graph);

    for (const handler of requiredHandlers) {
      if (!exportedFns.includes(handler)) {
        errors.push({
          type: 'missing_handler',
          state: handler,
          message: `Handler function not found for state "${handler}". Add: export async function ${handler}(input) { }`
        });
      }
    }

    for (const fn of exportedFns) {
      if (fn === 'graph' || fn.startsWith('_')) continue;
      if (!requiredHandlers.has(fn)) {
        errors.push({
          type: 'unused_handler',
          handler: fn,
          message: `Handler "${fn}" defined but not used in graph states`,
          severity: 'warning'
        });
      }
    }

    return {
      valid: errors.filter(e => e.type === 'error' || !e.severity).length === 0,
      errors,
      missing: errors.filter(e => e.type === 'missing_handler'),
      unused: errors.filter(e => e.type === 'unused_handler')
    };
  }
}
