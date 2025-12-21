/**
 * FlowService - Handles flow execution for GXE webhook dispatch
 *
 * Extends ExecutionService with flow-specific execution logic including step orchestration.
 */

import { ExecutionService } from '@sequentialos/execution-service-base';
import logger from '@sequentialos/sequential-logging';

export class FlowService extends ExecutionService {
  /**
   * Create a new FlowService instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug logging (defaults to false)
   * @param {boolean} options.exitOnError - Exit process on flow errors (defaults to false)
   * @param {number} options.timeout - Default timeout in milliseconds (defaults to 60000 for flows)
   */
  constructor(options = {}) {
    // Flows typically need longer timeout than tasks, so default to 60000ms
    const flowOptions = {
      timeout: 60000,
      ...options
    };
    super('flow', flowOptions);
  }

  /**
   * Register a flow handler
   * @param {string} flowName - The name of the flow
   * @param {Function} handler - Async function to execute the flow
   */
  registerFlow(flowName, handler) {
    this.registerHandler(flowName, handler);
  }

  /**
   * Get registered flows
   * @returns {Array<string>} List of registered flow names
   */
  getRegisteredFlows() {
    return this.getRegisteredHandlers();
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
      flowId = this.generateId(),
      broadcast = false,
      timeout = this.timeout
    } = options;

    const startTime = new Date().toISOString();

    try {
      const flowHandler = this.handlers.get(flowName);

      if (!flowHandler) {
        // Flow not registered - return mock success for testing
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

      // Exit on error if configured
      if (this.exitOnError) {
        logger.error(`[FlowService] Flow failed: ${flowName}`, error);
        process.exit(1);
      }

      throw error;
    }
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
