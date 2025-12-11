/**
 * breadcrumb-tracker.js - Facade for breadcrumb and state tracking
 *
 * Delegates to focused modules:
 * - breadcrumb-manager: Breadcrumb push/pop/clear operations
 * - breadcrumb-formatter: Breadcrumb formatting and summaries
 * - state-stack-manager: State push/pop/navigation
 * - state-formatter: State chain and execution trace formatting
 * - state-snapshot-manager: State snapshot recording and history
 * - error-context-enhancer: Error enhancement with context
 */

import { createBreadcrumbManager } from './breadcrumb-manager.js';
import { createBreadcrumbFormatter } from './breadcrumb-formatter.js';
import { createStateStackManager } from './state-stack-manager.js';
import { createStateFormatter } from './state-formatter.js';
import { createStateSnapshotManager } from './state-snapshot-manager.js';
import { createErrorContextEnhancer } from './error-context-enhancer.js';

export function createBreadcrumbTracker(maxBreadcrumbs = 50) {
  const breadcrumbManager = createBreadcrumbManager(maxBreadcrumbs);
  const breadcrumbFormatter = createBreadcrumbFormatter(breadcrumbManager);
  const stateStackManager = createStateStackManager();
  const stateFormatter = createStateFormatter(stateStackManager);
  const snapshotManager = createStateSnapshotManager();
  const errorEnhancer = createErrorContextEnhancer(
    breadcrumbManager,
    breadcrumbFormatter,
    stateStackManager,
    stateFormatter
  );

  return {
    // Breadcrumb operations
    pushBreadcrumb(toolName, action = 'invoke', metadata = {}) {
      return breadcrumbManager.pushBreadcrumb(toolName, action, metadata);
    },

    popBreadcrumb() {
      return breadcrumbManager.popBreadcrumb();
    },

    getCurrentBreadcrumb() {
      return breadcrumbManager.getCurrentBreadcrumb();
    },

    getAllBreadcrumbs() {
      return breadcrumbManager.getAllBreadcrumbs();
    },

    getBreadcrumbTrail() {
      return breadcrumbFormatter.getBreadcrumbTrail();
    },

    getBreadcrumbChain() {
      return breadcrumbFormatter.getBreadcrumbChain();
    },

    getLastNBreadcrumbs(n) {
      return breadcrumbFormatter.getLastNBreadcrumbs(n);
    },

    clearBreadcrumbs() {
      return breadcrumbManager.clearBreadcrumbs();
    },

    enhanceErrorWithBreadcrumbs(error) {
      return errorEnhancer.enhanceErrorWithBreadcrumbs(error);
    },

    getSummary() {
      return breadcrumbFormatter.getSummary();
    },

    // State stack operations
    pushState(stateName, input = {}, metadata = {}) {
      return stateStackManager.pushState(stateName, input, metadata);
    },

    popState(output = {}, error = null) {
      const stateExit = stateStackManager.popState(output, error);
      if (stateExit && stateExit.state) {
        snapshotManager.recordSnapshot(stateExit.state, stateExit);
      }
      return stateExit;
    },

    getCurrentState() {
      return stateStackManager.getCurrentState();
    },

    getStatePath() {
      return stateFormatter.getStatePath();
    },

    getStateChain() {
      return stateFormatter.getStateChain();
    },

    getAllStates() {
      return stateStackManager.getAllStates();
    },

    clearStateStack() {
      stateStackManager.clearStateStack();
      snapshotManager.clearSnapshots();
    },

    // Error enhancement
    attachStateContextToError(error) {
      return errorEnhancer.attachStateContextToError(error);
    },

    wrapStateHandler(stateName, handlerFn) {
      return async function wrappedHandler(input) {
        stateStackManager.pushState(stateName, input, { role: 'handler' });

        try {
          const result = await handlerFn(input);
          const stateExit = stateStackManager.popState(result, null);
          if (stateExit && stateExit.state) {
            snapshotManager.recordSnapshot(stateName, stateExit);
          }
          return result;
        } catch (err) {
          const enhanced = errorEnhancer.enhanceWithFullContext(err);
          stateStackManager.popState(null, err);
          throw enhanced;
        }
      };
    },

    getStateSnapshot(stateName) {
      return snapshotManager.getSnapshot(stateName);
    },

    getExecutionTrace() {
      return {
        ...stateFormatter.getExecutionTrace(),
        snapshots: snapshotManager.getAllSnapshots()
      };
    },

    getStateSummary() {
      return snapshotManager.getSummary(stateStackManager);
    }
  };
}
