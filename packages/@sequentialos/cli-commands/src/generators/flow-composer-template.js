export function generateFlowChainAPI(flows = []) {
  return `/**
 * Flow Chain API - Helper utilities for composed flows
 */

export class FlowChain {
  constructor(flows) {
    this.flows = flows;
    this.history = [];
    this.errors = [];
  }

  async execute(input) {
    let current = input;

    for (let i = 0; i < this.flows.length; i++) {
      const flow = this.flows[i];
      try {
        const result = await this.runFlow(flow, current);
        this.history.push({
          index: i,
          flow: flow.name,
          success: true,
          output: result
        });
        current = result;
      } catch (error) {
        this.errors.push({
          index: i,
          flow: flow.name,
          error: error.message
        });
        throw error;
      }
    }

    return {
      success: true,
      output: current,
      history: this.history
    };
  }

  async runFlow(flow, input) {
    // TODO: Call flow via Sequential framework
    // return await __callHostFlow__(flow.name, input);
    return input;
  }

  getHistory() {
    return this.history;
  }

  getErrors() {
    return this.errors;
  }
}

// Usage:
// const chain = new FlowChain([
//   { name: 'validate-input', timeout: 5000 },
//   { name: 'process-data', timeout: 10000 },
//   { name: 'persist-results', timeout: 3000 }
// ]);
//
// const result = await chain.execute(input);
`;
}
