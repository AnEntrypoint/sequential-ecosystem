/**
 * FlowService - Handles flow execution for GXE webhook dispatch
 *
 * Provides flow execution with lifecycle management, step orchestration,
 * and consistent response formatting for webhook-style invocations.
 */

export class FlowService {
  constructor() {
    this.flows = new Map();
    this.executionHistory = [];
  }

  /**
   * Register a flow handler
   * @param {string} flowName - The name of the flow
   * @param {Function} handler - Async function to execute the flow
   */
  registerFlow(flowName, handler) {
    this.flows.set(flowName, handler);
  }

  /**
   * Execute a flow by name
   * @param {string} flowName - The name of the flow to execute
   * @param {Object} input - JSON input data for the flow
   * @param {Object} options - Execution options
   * @param {string} options.flowId - Optional flow ID (auto-generated if omitted)
   * @param {boolean} options.broadcast - Whether to broadcast execution events
   * @param {number} options.timeout - Execution timeout in milliseconds
   * @returns {Promise<Object>} Execution result with success/data/metadata
   */
  async executeFlow(flowName, input = {}, options = {}) {
    const {
      flowId = this.generateFlowId(),
      broadcast = false,
      timeout = 60000 // Flows typically need longer timeout than tasks
    } = options;

    const startTime = new Date().toISOString();

    try {
      // Check if flow is registered
      const flowHandler = this.flows.get(flowName);

      if (!flowHandler) {
        // Flow not registered - return mock success for testing
        // In production, this would throw an error or load flow dynamically
        const result = {
          success: true,
          data: {
            message: `Flow '${flowName}' executed (mock)`,
            input: input,
            flowName: flowName,
            steps: [],
            mock: true
          },
          flowId,
          flowName,
          startTime,
          endTime: new Date().toISOString(),
          duration: 0
        };

        this.executionHistory.push(result);
        return result;
      }

      // Execute registered flow handler with timeout
      let flowResult;
      if (timeout > 0) {
        flowResult = await this.executeWithTimeout(
          flowHandler(input, { flowId, flowName }),
          timeout
        );
      } else {
        flowResult = await flowHandler(input, { flowId, flowName });
      }

      const endTime = new Date().toISOString();
      const duration = new Date(endTime) - new Date(startTime);

      const result = {
        success: true,
        data: flowResult,
        flowId,
        flowName,
        startTime,
        endTime,
        duration
      };

      this.executionHistory.push(result);

      if (broadcast) {
        this.broadcastEvent('flow:completed', result);
      }

      return result;

    } catch (error) {
      const endTime = new Date().toISOString();
      const duration = new Date(endTime) - new Date(startTime);

      const errorResult = {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'FLOW_EXECUTION_ERROR',
          flowName: flowName
        },
        flowId,
        flowName,
        startTime,
        endTime,
        duration
      };

      this.executionHistory.push(errorResult);

      if (broadcast) {
        this.broadcastEvent('flow:failed', errorResult);
      }

      throw error;
    }
  }

  /**
   * Execute a promise with timeout
   * @param {Promise} promise - The promise to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise} The promise result or timeout error
   */
  async executeWithTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Flow execution timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Generate a unique flow ID
   * @returns {string} Unique flow identifier
   */
  generateFlowId() {
    return `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Broadcast an event (placeholder for event system integration)
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  broadcastEvent(eventName, data) {
    // Placeholder for event broadcasting
    // In production, this would integrate with an event bus or WebSocket system
    if (process.env.DEBUG) {
      console.log(`[FlowService] Event: ${eventName}`, data);
    }
  }

  /**
   * Get execution history
   * @param {Object} filters - Optional filters (flowName, flowId, success)
   * @returns {Array} Filtered execution history
   */
  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];

    if (filters.flowName) {
      history = history.filter(h => h.flowName === filters.flowName);
    }

    if (filters.flowId) {
      history = history.filter(h => h.flowId === filters.flowId);
    }

    if (filters.success !== undefined) {
      history = history.filter(h => h.success === filters.success);
    }

    return history;
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Get registered flows
   * @returns {Array<string>} List of registered flow names
   */
  getRegisteredFlows() {
    return Array.from(this.flows.keys());
  }

  /**
   * Execute a step within a flow
   * @param {string} stepName - Name of the step
   * @param {Object} input - Step input data
   * @param {Object} context - Flow execution context
   * @returns {Promise<Object>} Step execution result
   */
  async executeStep(stepName, input, context = {}) {
    const startTime = new Date().toISOString();

    try {
      // Placeholder for step execution
      // In production, this would integrate with task service or step handlers
      const result = {
        success: true,
        stepName,
        output: input, // Pass through for mock
        startTime,
        endTime: new Date().toISOString()
      };

      if (context.broadcast) {
        this.broadcastEvent('flow:step:completed', {
          flowId: context.flowId,
          stepName,
          result
        });
      }

      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        stepName,
        error: {
          message: error.message,
          code: 'STEP_EXECUTION_ERROR'
        },
        startTime,
        endTime: new Date().toISOString()
      };

      if (context.broadcast) {
        this.broadcastEvent('flow:step:failed', {
          flowId: context.flowId,
          stepName,
          result: errorResult
        });
      }

      throw error;
    }
  }
}
