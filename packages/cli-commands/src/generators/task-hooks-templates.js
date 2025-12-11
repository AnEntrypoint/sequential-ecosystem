export function generateTaskHooksTemplate() {
  return `/**
 * Task Hooks
 *
 * Register custom behavior at task lifecycle points.
 * Hooks: before, after, error, success
 */

import { createTaskHookSystem } from '@sequentialos/task-hooks';

const hooks = createTaskHookSystem();

// Logging hook
hooks.registerBeforeHook(async (taskName, context) => {
  console.log(\`[BEFORE] \${taskName}\`);
  return context;
});

hooks.registerAfterHook(async (taskName, output, duration) => {
  console.log(\`[AFTER] \${taskName} took \${duration}ms\`);
});

// Error tracking
hooks.registerErrorHook(async (taskName, error, duration) => {
  console.error(\`[ERROR] \${taskName}: \${error.message}\`);
});

// Success tracking
hooks.registerSuccessHook(async (taskName, output, duration) => {
  if (duration > 1000) {
    console.warn(\`[SLOW] \${taskName} took \${duration}ms\`);
  }
});

// Task implementation
export async function myTask(input) {
  return await hooks.wrapTaskExecution('myTask', async (data) => {
    return { result: data, processed: true };
  }, input);
}
`;
}

export function generateFlowHooksTemplate() {
  return `/**
 * Flow Hooks
 *
 * Register custom behavior at flow lifecycle points.
 * Hooks: stateEnter, stateExit, transition, error
 */

import { createFlowHookSystem } from '@sequentialos/flow-hooks';

const hooks = createFlowHookSystem();

// Log state entries
hooks.registerStateEnterHook(async (stateName, context) => {
  console.log(\`[ENTER] \${stateName}\`);
});

// Log state exits
hooks.registerStateExitHook(async (stateName, context) => {
  console.log(\`[EXIT] \${stateName}\`);
});

// Log transitions
hooks.registerTransitionHook(async (fromState, toState, context) => {
  console.log(\`[TRANSITION] \${fromState} -> \${toState}\`);
});

// Error handling
hooks.registerErrorHook(async (stateName, error, context) => {
  console.error(\`[ERROR] in \${stateName}: \${error.message}\`);
});

export async function myFlow() {
  // Flow implementation with hooks integrated
}
`;
}
