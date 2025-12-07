export function createConditionalState(name, condition, truePath, falsePath, options = {}) {
  return {
    name,
    type: 'conditional',
    condition,
    onTrue: truePath,
    onFalse: falsePath,
    metadata: {
      createdAt: new Date().toISOString(),
      ...options
    }
  };
}

export function createSwitchState(name, selector, cases, defaultPath) {
  return {
    name,
    type: 'switch',
    selector,
    cases,
    default: defaultPath,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}

export function executeConditional(condition, context) {
  if (typeof condition === 'function') {
    return condition(context);
  }
  if (typeof condition === 'string') {
    try {
      const fn = new Function('context', `return ${condition}`);
      return fn(context);
    } catch (error) {
      throw new Error(`Invalid condition: ${condition} - ${error.message}`);
    }
  }
  return !!condition;
}

export function executeSwitch(selector, context) {
  if (typeof selector === 'function') {
    return selector(context);
  }
  if (typeof selector === 'string') {
    try {
      const fn = new Function('context', `return ${selector}`);
      return fn(context);
    } catch (error) {
      throw new Error(`Invalid selector: ${selector} - ${error.message}`);
    }
  }
  return selector;
}

export function generateConditionalFlowTemplate() {
  return `/**
 * Conditional Flow
 *
 * Implement if/switch logic within flows.
 */

export const graph = {
  initial: 'checkStatus',
  states: {
    checkStatus: {
      type: 'conditional',
      condition: (context) => context.status === 'pending',
      onTrue: 'processPending',
      onFalse: 'skipProcessing'
    },
    processPending: {
      onDone: 'final'
    },
    skipProcessing: {
      onDone: 'final'
    },
    final: {
      type: 'final'
    }
  }
};

export async function checkStatus(input) {
  return {
    status: input.status || 'pending',
    message: 'Status checked'
  };
}

export async function processPending(data) {
  return { ...data, processed: true };
}

export async function skipProcessing(data) {
  return { ...data, skipped: true };
}

// Usage with switch:
// export const switchGraph = {
//   initial: 'routeByType',
//   states: {
//     routeByType: {
//       type: 'switch',
//       selector: (context) => context.type,
//       cases: {
//         'user': 'handleUser',
//         'admin': 'handleAdmin',
//         'guest': 'handleGuest'
//       },
//       default: 'handleUnknown'
//     },
//     handleUser: { onDone: 'final' },
//     handleAdmin: { onDone: 'final' },
//     handleGuest: { onDone: 'final' },
//     handleUnknown: { onDone: 'final' },
//     final: { type: 'final' }
//   }
// };
`;
}

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

export function createConditionalFlowRunner() {
  return {
    async executeConditionalFlow(graph, handlers, input) {
      let currentState = graph.initial;
      let context = input;
      const history = [{ state: currentState, input, timestamp: new Date().toISOString() }];

      while (currentState && graph.states[currentState]) {
        const state = graph.states[currentState];

        if (state.type === 'final') {
          history.push({ state: currentState, context, final: true });
          break;
        }

        if (state.type === 'conditional') {
          const conditionResult = executeConditional(state.condition, context);
          currentState = conditionResult ? state.onTrue : state.onFalse;
          history.push({
            state,
            conditionResult,
            nextState: currentState,
            timestamp: new Date().toISOString()
          });
        } else if (state.type === 'switch') {
          const selectorResult = executeSwitch(state.selector, context);
          currentState = state.cases[selectorResult] || state.default;
          history.push({
            state,
            selected: selectorResult,
            nextState: currentState,
            timestamp: new Date().toISOString()
          });
        } else if (state.onDone) {
          const handler = handlers[currentState];
          if (handler) {
            context = await handler(context);
          }
          currentState = state.onDone;
          history.push({
            state: currentState,
            context,
            timestamp: new Date().toISOString()
          });
        } else {
          break;
        }
      }

      return {
        finalState: currentState,
        context,
        history,
        success: currentState === 'final'
      };
    }
  };
}
