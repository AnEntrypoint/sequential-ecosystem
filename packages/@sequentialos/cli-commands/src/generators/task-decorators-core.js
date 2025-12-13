/**
 * task-decorators-core.js - Task Decorator Facade
 *
 * Delegates to focused modules:
 * - recovery-decorator: Error recovery and retry logic
 * - performance-decorator: Performance tracking and timeouts
 * - utility-decorators: Logging and caching
 * - validation-decorator: Input validation
 */

import { createRecoveryDecorator } from './recovery-decorator.js';
import { createPerformanceDecorator } from './performance-decorator.js';
import { createUtilityDecorators } from './utility-decorators.js';
import { createValidationDecorator } from './validation-decorator.js';

export function createTaskDecorator() {
  const recovery = createRecoveryDecorator();
  const performance = createPerformanceDecorator();
  const utility = createUtilityDecorators();
  const validation = createValidationDecorator();

  return {
    withErrorRecovery(options) {
      return recovery.withErrorRecovery.call(this, options);
    },

    withPerformanceTracking(options) {
      return performance.withPerformanceTracking.call(this, options);
    },

    withTimeout(ms) {
      return performance.withTimeout.call(this, ms);
    },

    withLogging(options) {
      return utility.withLogging.call(this, options);
    },

    withInputValidation(schema) {
      return validation.withInputValidation.call(this, schema);
    },

    withCaching(options) {
      return utility.withCaching.call(this, options);
    },

    compose(...decorators) {
      return (taskFn) => {
        return decorators.reduce((fn, decorator) => decorator(fn), taskFn);
      };
    }
  };
}
