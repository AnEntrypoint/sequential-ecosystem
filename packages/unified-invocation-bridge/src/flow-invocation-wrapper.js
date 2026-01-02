import logger from 'sequential-logging';
import { unifiedInvocationBridge } from './index.js';

export class FlowInvocationWrapper {
  static createFlowActions() {
    return {
      callTask: (name, input) => unifiedInvocationBridge.callTask(name, input),
      callFlow: (name, input) => unifiedInvocationBridge.callFlow(name, input),
      callTool: (category, toolName, input) => unifiedInvocationBridge.callTool(category, toolName, input),
      callService: (service, method, params) => unifiedInvocationBridge.callService(service, method, params),
      log: (message, data) => logger.info('[FlowAction]', message, data),
      error: (message, err) => logger.error('[FlowAction]', message, err)
    };
  }

  static wrapFlowMachine(machine) {
    if (!machine || typeof machine !== 'object') {
      throw new Error('Flow machine must be a valid object');
    }

    const actions = this.createFlowActions();

    return {
      ...machine,
      context: {
        ...machine.context,
        ...actions
      },
      states: this._wrapStates(machine.states, actions)
    };
  }

  static _wrapStates(states, actions) {
    const wrappedStates = {};

    for (const [stateName, stateConfig] of Object.entries(states || {})) {
      wrappedStates[stateName] = {
        ...stateConfig,
        entry: this._wrapTransitions(stateConfig.entry, actions),
        exit: this._wrapTransitions(stateConfig.exit, actions),
        on: this._wrapEventHandlers(stateConfig.on, actions)
      };
    }

    return wrappedStates;
  }

  static _wrapEventHandlers(handlers, actions) {
    if (!handlers) return handlers;

    const wrapped = {};
    for (const [event, handler] of Object.entries(handlers)) {
      if (typeof handler === 'string') {
        wrapped[event] = { target: handler };
      } else if (typeof handler === 'object') {
        wrapped[event] = {
          ...handler,
          actions: this._wrapTransitions(handler.actions, actions)
        };
      }
    }

    return wrapped;
  }

  static _wrapTransitions(transitions, actions) {
    if (!transitions) return transitions;
    if (typeof transitions === 'string') return transitions;

    if (Array.isArray(transitions)) {
      return transitions.map(t => {
        if (typeof t === 'string') return t;
        if (typeof t === 'function') return t;
        return { ...t, ...actions };
      });
    }

    return { ...transitions, ...actions };
  }

  static createFlowContext(initialInput = {}) {
    return {
      ...initialInput,
      actions: this.createFlowActions(),
      callTask: (name, input) => unifiedInvocationBridge.callTask(name, input),
      callFlow: (name, input) => unifiedInvocationBridge.callFlow(name, input),
      callTool: (category, toolName, input) => unifiedInvocationBridge.callTool(category, toolName, input),
      callService: (service, method, params) => unifiedInvocationBridge.callService(service, method, params)
    };
  }

  static async executeFlow(machine, input = {}) {
    try {
      const wrappedMachine = this.wrapFlowMachine(machine);
      const context = this.createFlowContext(input);
      return {
        machine: wrappedMachine,
        context,
        input
      };
    } catch (error) {
      logger.error('[FlowInvocationWrapper] Flow execution failed', error);
      throw error;
    }
  }
}

export default FlowInvocationWrapper;
