export class InstrumentationMiddleware {
  constructor(debugger) {
    this.debugger = debugger;
  }

  wrapTask(taskFn, taskName, sessionId) {
    return async (input) => {
      const pop = this.debugger.pushStack(sessionId, `task:${taskName}`, { input });
      try {
        const result = await taskFn(input);
        pop();
        return result;
      } catch (error) {
        pop();
        throw error;
      }
    };
  }

  wrapTool(toolFn, toolName, sessionId) {
    return async (args) => {
      const pop = this.debugger.pushStack(sessionId, `tool:${toolName}`, { args });
      try {
        const result = await toolFn(args);
        pop();
        return result;
      } catch (error) {
        pop();
        throw error;
      }
    };
  }

  wrapFlow(flowFn, flowName, sessionId) {
    return async (context) => {
      const pop = this.debugger.pushStack(sessionId, `flow:${flowName}`, { context });
      try {
        const result = await flowFn(context);
        pop();
        return result;
      } catch (error) {
        pop();
        throw error;
      }
    };
  }

  wrapAgent(agentFn, agentName, sessionId) {
    return async (input) => {
      const pop = this.debugger.pushStack(sessionId, `agent:${agentName}`, { input });
      try {
        const result = await agentFn(input);
        pop();
        return result;
      } catch (error) {
        pop();
        throw error;
      }
    };
  }
}

export function createInstrumentation(debugger) {
  return new InstrumentationMiddleware(debugger);
}
