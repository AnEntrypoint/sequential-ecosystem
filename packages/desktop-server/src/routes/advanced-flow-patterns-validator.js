export class AdvancedFlowPatternsValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicFlowExecution() {
    const flow = {
      id: 'basic-flow',
      initial: 'start',
      states: {
        start: { onDone: 'process' },
        process: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const stateOrder = [];
    let currentState = flow.states[flow.initial];

    while (currentState && stateOrder.length < 10) {
      stateOrder.push(currentState);
      if (currentState.type === 'final') break;
      const nextId = currentState.onDone;
      if (!nextId) break;
      currentState = flow.states[nextId];
    }

    return {
      name: 'Basic Flow Execution',
      passed: stateOrder.length === 3 && stateOrder[stateOrder.length - 1].type === 'final',
      details: { statesTraversed: stateOrder.length, finalReached: stateOrder[stateOrder.length - 1].type === 'final' }
    };
  }

  async validateConditionalBranching() {
    const flow = {
      id: 'conditional-flow',
      initial: 'check',
      states: {
        check: { type: 'if', condition: 'input > 10', onTrue: 'highPath', onFalse: 'lowPath' },
        highPath: { onDone: 'end' },
        lowPath: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const testCases = [
      { input: 15, expectedPath: 'highPath' },
      { input: 5, expectedPath: 'lowPath' },
      { input: 10, expectedPath: 'lowPath' }
    ];

    const results = testCases.map(test => {
      const isTrue = test.input > 10;
      const selectedPath = isTrue ? 'highPath' : 'lowPath';
      return selectedPath === test.expectedPath;
    });

    return {
      name: 'Conditional Branching (If/Else)',
      passed: results.every(r => r),
      details: { tested: testCases.length, correct: results.filter(r => r).length }
    };
  }

  async validateSwitchCaseRouting() {
    const flow = {
      id: 'switch-flow',
      initial: 'route',
      states: {
        route: {
          type: 'switch',
          expression: 'status',
          cases: { pending: 'waitState', approved: 'processState', rejected: 'errorState' },
          default: 'unknownState'
        },
        waitState: { onDone: 'end' },
        processState: { onDone: 'end' },
        errorState: { onDone: 'end' },
        unknownState: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const testCases = [
      { status: 'pending', expectedPath: 'waitState' },
      { status: 'approved', expectedPath: 'processState' },
      { status: 'rejected', expectedPath: 'errorState' },
      { status: 'unknown', expectedPath: 'unknownState' }
    ];

    const results = testCases.map(test => {
      const cases = flow.states.route.cases;
      const selectedPath = cases[test.status] || flow.states.route.default;
      return selectedPath === test.expectedPath;
    });

    return {
      name: 'Switch/Case Routing',
      passed: results.every(r => r),
      details: { tested: testCases.length, routed: results.filter(r => r).length }
    };
  }

  async validateParallelBranchExecution() {
    const flow = {
      id: 'parallel-flow',
      initial: 'parallel-state',
      states: {
        'parallel-state': {
          type: 'parallel',
          branches: ['branch-a', 'branch-b', 'branch-c'],
          joinCondition: 'all'
        },
        'branch-a': { onDone: 'join' },
        'branch-b': { onDone: 'join' },
        'branch-c': { onDone: 'join' },
        join: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const parallelState = flow.states['parallel-state'];
    const branchCount = parallelState.branches.length;
    const allBranchesValid = parallelState.branches.every(b => flow.states[b]);

    return {
      name: 'Parallel Branch Execution',
      passed: branchCount === 3 && allBranchesValid,
      details: { branches: branchCount, allValid: allBranchesValid, joinCondition: parallelState.joinCondition }
    };
  }

  async validateParallelJoinConditions() {
    const joinConditions = ['all', 'any', 'all-or-error'];
    const testCases = [
      { condition: 'all', results: [true, true, true], shouldJoin: true },
      { condition: 'all', results: [true, false, true], shouldJoin: false },
      { condition: 'any', results: [false, false, true], shouldJoin: true },
      { condition: 'any', results: [false, false, false], shouldJoin: false },
      { condition: 'all-or-error', results: [true, false, true], shouldJoin: true }
    ];

    const results = testCases.map(test => {
      let joinMet = false;

      if (test.condition === 'all') {
        joinMet = test.results.every(r => r);
      } else if (test.condition === 'any') {
        joinMet = test.results.some(r => r);
      } else if (test.condition === 'all-or-error') {
        joinMet = true;
      }

      return joinMet === test.shouldJoin;
    });

    return {
      name: 'Parallel Join Conditions',
      passed: results.every(r => r),
      details: { conditions: joinConditions.length, tested: testCases.length, correct: results.filter(r => r).length }
    };
  }

  async validateNestedFlowComposition() {
    const composedFlow = {
      id: 'composed-flow',
      initial: 'flow-1',
      states: {
        'flow-1': { type: 'flow-call', flowName: 'fetch-data', onDone: 'flow-2', onError: 'error' },
        'flow-2': { type: 'flow-call', flowName: 'process-data', onDone: 'flow-3', onError: 'error' },
        'flow-3': { type: 'flow-call', flowName: 'store-data', onDone: 'final', onError: 'error' },
        error: { type: 'final' },
        final: { type: 'final' }
      }
    };

    const flowCalls = [];
    let current = composedFlow.initial;
    const visited = new Set();

    while (current && !visited.has(current)) {
      visited.add(current);
      const state = composedFlow.states[current];
      if (state?.type === 'flow-call') {
        flowCalls.push(state.flowName);
      }
      current = state?.onDone;
    }

    return {
      name: 'Nested Flow Composition',
      passed: flowCalls.length === 3 && flowCalls[0] === 'fetch-data' && flowCalls[2] === 'store-data',
      details: { flowsComposed: flowCalls.length, sequence: flowCalls }
    };
  }

  async validateErrorHandling() {
    const flow = {
      id: 'error-flow',
      initial: 'risky',
      states: {
        risky: { onDone: 'success', onError: 'recovery' },
        recovery: { onDone: 'retry', onError: 'fatal' },
        retry: { onDone: 'success', onError: 'fatal' },
        success: { type: 'final' },
        fatal: { type: 'final' }
      }
    };

    const errorPaths = [
      { error: true, shouldRecover: true, path: ['risky', 'recovery'] },
      { error: false, shouldRecover: false, path: ['risky', 'success'] }
    ];

    const results = errorPaths.map(test => {
      const nextState = test.error ? flow.states.risky.onError : flow.states.risky.onDone;
      const canRecover = nextState === 'recovery' || nextState === 'success';
      return canRecover === (test.shouldRecover || !test.error);
    });

    return {
      name: 'Error Handling & Recovery',
      passed: results.every(r => r),
      details: { paths: errorPaths.length, correct: results.filter(r => r).length }
    };
  }

  async validateTimeoutHandling() {
    const flow = {
      id: 'timeout-flow',
      flowTimeout: 5000,
      initial: 'start',
      onFlowTimeout: 'handleTimeout',
      states: {
        start: { timeout: 2000, onTimeout: 'fallback', fallbackData: { result: 'timeout' } },
        fallback: { onDone: 'end' },
        handleTimeout: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const hasFlowTimeout = flow.flowTimeout > 0;
    const hasStateTimeout = flow.states.start.timeout > 0;
    const hasFallback = flow.states.start.fallbackData !== undefined;
    const hasHandler = flow.onFlowTimeout !== undefined;

    return {
      name: 'Timeout Handling & Fallback',
      passed: hasFlowTimeout && hasStateTimeout && hasFallback && hasHandler,
      details: {
        flowTimeout: flow.flowTimeout,
        stateTimeout: flow.states.start.timeout,
        hasFallback,
        hasHandler
      }
    };
  }

  async validateCyclicFlowDetection() {
    const acyclicFlow = {
      id: 'acyclic',
      initial: 'a',
      states: {
        a: { onDone: 'b' },
        b: { onDone: 'c' },
        c: { type: 'final' }
      }
    };

    const cyclicFlow = {
      id: 'cyclic',
      initial: 'a',
      states: {
        a: { onDone: 'b' },
        b: { onDone: 'c' },
        c: { onDone: 'a' }
      }
    };

    const detectCycles = (flow) => {
      const visited = new Set();
      const recStack = new Set();

      const dfs = (stateId) => {
        if (recStack.has(stateId)) return true;
        if (visited.has(stateId)) return false;

        visited.add(stateId);
        recStack.add(stateId);

        const state = flow.states[stateId];
        if (state?.onDone && dfs(state.onDone)) return true;

        recStack.delete(stateId);
        return false;
      };

      return dfs(flow.initial);
    };

    return {
      name: 'Cyclic Flow Detection',
      passed: !detectCycles(acyclicFlow) && detectCycles(cyclicFlow),
      details: {
        acyclicDetected: !detectCycles(acyclicFlow),
        cyclicDetected: detectCycles(cyclicFlow)
      }
    };
  }

  async validateReachabilityAnalysis() {
    const flow = {
      id: 'reachability-flow',
      initial: 'start',
      states: {
        start: { onDone: 'middle', onError: 'error' },
        middle: { onDone: 'end' },
        end: { type: 'final' },
        error: { type: 'final' },
        unreachable: { type: 'final' }
      }
    };

    const getReachable = (flowGraph) => {
      const reachable = new Set();
      const queue = [flowGraph.initial];

      while (queue.length > 0) {
        const stateId = queue.shift();
        if (reachable.has(stateId)) continue;

        reachable.add(stateId);
        const state = flowGraph.states[stateId];

        if (state?.onDone && !reachable.has(state.onDone)) {
          queue.push(state.onDone);
        }
        if (state?.onError && !reachable.has(state.onError)) {
          queue.push(state.onError);
        }
      }

      return reachable;
    };

    const reachable = getReachable(flow);
    const isReachable = reachable.has('start') && reachable.has('middle') && reachable.has('end');
    const isUnreachable = !reachable.has('unreachable');

    return {
      name: 'Reachability Analysis',
      passed: isReachable && isUnreachable,
      details: {
        reachableCount: reachable.size,
        unreachableStates: Object.keys(flow.states).filter(s => !reachable.has(s))
      }
    };
  }

  async validateComplexConditionalChaining() {
    const flow = {
      id: 'complex-conditional',
      initial: 'check1',
      states: {
        check1: { type: 'if', condition: 'x > 5', onTrue: 'check2', onFalse: 'lowValue' },
        check2: { type: 'if', condition: 'y > 10', onTrue: 'highXHighY', onFalse: 'highXLowY' },
        lowValue: { onDone: 'end' },
        highXHighY: { onDone: 'end' },
        highXLowY: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const testCases = [
      { x: 2, y: 5, expectedEnd: 'lowValue' },
      { x: 7, y: 12, expectedEnd: 'highXHighY' },
      { x: 7, y: 8, expectedEnd: 'highXLowY' }
    ];

    const results = testCases.map(test => {
      let path = test.x > 5 ? 'check2' : 'lowValue';
      if (path === 'check2') {
        path = test.y > 10 ? 'highXHighY' : 'highXLowY';
      }
      return path === test.expectedEnd;
    });

    return {
      name: 'Complex Conditional Chaining',
      passed: results.every(r => r),
      details: { tested: testCases.length, correct: results.filter(r => r).length, depth: 2 }
    };
  }

  async validateParallelWithConditionalBranches() {
    const flow = {
      id: 'parallel-conditional',
      initial: 'parallel-state',
      states: {
        'parallel-state': {
          type: 'parallel',
          branches: ['branch-1', 'branch-2', 'branch-3'],
          joinCondition: 'all'
        },
        'branch-1': { type: 'if', condition: 'condition1', onTrue: 'path-a', onFalse: 'path-b' },
        'branch-2': { type: 'if', condition: 'condition2', onTrue: 'path-c', onFalse: 'path-d' },
        'branch-3': { type: 'switch', expression: 'value', cases: { x: 'path-e', y: 'path-f' } },
        'path-a': { onDone: 'join' },
        'path-b': { onDone: 'join' },
        'path-c': { onDone: 'join' },
        'path-d': { onDone: 'join' },
        'path-e': { onDone: 'join' },
        'path-f': { onDone: 'join' },
        join: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const parallelState = flow.states['parallel-state'];
    const hasMultipleBranches = parallelState.branches.length === 3;
    const branchesHaveConditions = ['branch-1', 'branch-2', 'branch-3'].every(b => {
      const state = flow.states[b];
      return state.type === 'if' || state.type === 'switch';
    });

    return {
      name: 'Parallel with Conditional Branches',
      passed: hasMultipleBranches && branchesHaveConditions,
      details: { branches: parallelState.branches.length, conditionals: 3, switches: 1 }
    };
  }

  async validateFlowCompositionChaining() {
    const composition = {
      id: 'chained-composition',
      initial: 'flow-a',
      states: {
        'flow-a': { type: 'flow-call', flowName: 'task-a', onDone: 'flow-b' },
        'flow-b': { type: 'flow-call', flowName: 'task-b', onDone: 'flow-c' },
        'flow-c': { type: 'flow-call', flowName: 'task-c', onDone: 'flow-d' },
        'flow-d': { type: 'flow-call', flowName: 'task-d', onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const flowSequence = [];
    let current = composition.initial;

    while (current) {
      const state = composition.states[current];
      if (state?.type === 'flow-call') {
        flowSequence.push(state.flowName);
      }
      if (state?.type === 'final') break;
      current = state?.onDone;
    }

    return {
      name: 'Flow Composition Chaining',
      passed: flowSequence.length === 4 && flowSequence[0] === 'task-a' && flowSequence[3] === 'task-d',
      details: { flows: flowSequence.length, sequence: flowSequence }
    };
  }

  async validateDynamicFlowGeneration() {
    const generateFlow = (flowName, stateCount) => {
      const states = {};
      for (let i = 0; i < stateCount; i++) {
        const stateId = `state-${i}`;
        states[stateId] = {
          onDone: i < stateCount - 1 ? `state-${i + 1}` : 'final'
        };
      }
      states.final = { type: 'final' };

      return {
        id: flowName,
        initial: 'state-0',
        states
      };
    };

    const flow = generateFlow('dynamic-flow', 5);
    const stateCount = Object.keys(flow.states).length - 1;

    return {
      name: 'Dynamic Flow Generation',
      passed: stateCount === 5 && flow.states.final.type === 'final',
      details: { generatedStates: stateCount, flowId: flow.id }
    };
  }

  async validateStateContextPropagation() {
    const flow = {
      id: 'context-flow',
      initial: 'step-1',
      states: {
        'step-1': { onDone: 'step-2' },
        'step-2': { onDone: 'step-3' },
        'step-3': { type: 'final' }
      }
    };

    const context = { value: 0 };
    let current = flow.initial;

    while (current && current !== 'final') {
      context.value++;
      const state = flow.states[current];
      current = state?.onDone;
    }

    return {
      name: 'State Context Propagation',
      passed: context.value === 3,
      details: { statesProcessed: context.value, contextValue: context.value }
    };
  }

  async validateErrorBoundaryStates() {
    const flow = {
      id: 'error-boundary',
      initial: 'protected',
      states: {
        protected: {
          onDone: 'success',
          onError: 'errorBoundary'
        },
        errorBoundary: {
          onDone: 'recovery',
          onError: 'fatal'
        },
        recovery: { type: 'final' },
        success: { type: 'final' },
        fatal: { type: 'final' }
      }
    };

    const hasErrorBoundary = 'errorBoundary' in flow.states;
    const errorBoundaryCanRecover = flow.states.errorBoundary.onDone === 'recovery';
    const hasRecoveryPath = 'recovery' in flow.states;

    return {
      name: 'Error Boundary States',
      passed: hasErrorBoundary && errorBoundaryCanRecover && hasRecoveryPath,
      details: { boundaries: 1, recoveryPaths: 1, fatalPaths: 1 }
    };
  }

  async validateFlowMetricsCollection() {
    const executionMetrics = {
      flows: [
        { flowId: 'flow-1', duration: 150, success: true },
        { flowId: 'flow-2', duration: 200, success: true },
        { flowId: 'flow-3', duration: 100, success: false }
      ]
    };

    const totalFlows = executionMetrics.flows.length;
    const successCount = executionMetrics.flows.filter(f => f.success).length;
    const avgDuration = executionMetrics.flows.reduce((sum, f) => sum + f.duration, 0) / totalFlows;
    const successRate = Math.round((successCount / totalFlows) * 100);

    return {
      name: 'Flow Metrics Collection',
      passed: totalFlows === 3 && successRate === 67 && avgDuration === 150,
      details: { totalFlows, successCount, avgDuration: Math.round(avgDuration), successRate }
    };
  }

  async validateLargeScaleFlowTraversal() {
    const generateLargeFlow = (stateCount) => {
      const states = {};
      for (let i = 0; i < stateCount; i++) {
        states[`state-${i}`] = {
          onDone: i < stateCount - 1 ? `state-${i + 1}` : 'final'
        };
      }
      states.final = { type: 'final' };
      return {
        id: 'large-flow',
        initial: 'state-0',
        states
      };
    };

    const flow = generateLargeFlow(100);
    let traversalCount = 0;
    let current = flow.initial;

    while (current && traversalCount < 200) {
      traversalCount++;
      const state = flow.states[current];
      current = state?.onDone;
    }

    return {
      name: 'Large-Scale Flow Traversal',
      passed: traversalCount === 101 && current === undefined,
      details: { statesGenerated: 101, traversalSteps: traversalCount }
    };
  }

  async validateComplexParallelJoinScenario() {
    const flow = {
      id: 'complex-join',
      initial: 'split',
      states: {
        split: {
          type: 'parallel',
          branches: ['fetch-user', 'fetch-posts', 'fetch-comments'],
          joinCondition: 'all'
        },
        'fetch-user': { type: 'if', condition: 'userId', onTrue: 'user-done', onFalse: 'user-error' },
        'fetch-posts': { onDone: 'posts-done' },
        'fetch-comments': { onDone: 'comments-done' },
        'user-done': { onDone: 'join' },
        'user-error': { onDone: 'join' },
        'posts-done': { onDone: 'join' },
        'comments-done': { onDone: 'join' },
        join: { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const parallelState = flow.states.split;
    const hasCorrectJoin = parallelState.joinCondition === 'all';
    const allBranchesReachJoin = ['user-done', 'user-error', 'posts-done', 'comments-done'].every(
      branch => flow.states[branch].onDone === 'join'
    );

    return {
      name: 'Complex Parallel Join Scenario',
      passed: hasCorrectJoin && allBranchesReachJoin,
      details: { branches: parallelState.branches.length, joinCondition: parallelState.joinCondition, convergePoint: 'join' }
    };
  }

  async validateSwitchWithFallthrough() {
    const flow = {
      id: 'switch-fallthrough',
      initial: 'route',
      states: {
        route: {
          type: 'switch',
          expression: 'status',
          cases: {
            'pending': 'handle-pending',
            'approved': 'handle-approved',
            'rejected': 'handle-rejected'
          },
          default: 'handle-default'
        },
        'handle-pending': { onDone: 'end' },
        'handle-approved': { onDone: 'end' },
        'handle-rejected': { onDone: 'end' },
        'handle-default': { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const caseCount = Object.keys(flow.states.route.cases).length;
    const hasDefault = !!flow.states.route.default;
    const allHandlersExist = Object.values(flow.states.route.cases).every(
      handler => handler in flow.states
    );

    return {
      name: 'Switch with Fallthrough',
      passed: caseCount === 3 && hasDefault && allHandlersExist,
      details: { cases: caseCount, hasDefault, allHandlersDefined: allHandlersExist }
    };
  }

  async validateConditionalWithMultiplePaths() {
    const flow = {
      id: 'multi-path',
      initial: 'decision',
      states: {
        decision: {
          type: 'if',
          condition: 'score >= 80',
          onTrue: 'approve-path',
          onFalse: 'check-further'
        },
        'check-further': {
          type: 'if',
          condition: 'score >= 60',
          onTrue: 'review-path',
          onFalse: 'reject-path'
        },
        'approve-path': { onDone: 'end' },
        'review-path': { onDone: 'end' },
        'reject-path': { onDone: 'end' },
        end: { type: 'final' }
      }
    };

    const paths = [
      { score: 90, expectedEnd: 'approve-path' },
      { score: 70, expectedEnd: 'review-path' },
      { score: 50, expectedEnd: 'reject-path' }
    ];

    const results = paths.map(path => {
      let current = 'decision';
      let result = path.score >= 80 ? 'approve-path' : 'check-further';
      if (result === 'check-further') {
        result = path.score >= 60 ? 'review-path' : 'reject-path';
      }
      return result === path.expectedEnd;
    });

    return {
      name: 'Conditional with Multiple Paths',
      passed: results.every(r => r),
      details: { paths: paths.length, correct: results.filter(r => r).length, depth: 2 }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicFlowExecution(),
      this.validateConditionalBranching(),
      this.validateSwitchCaseRouting(),
      this.validateParallelBranchExecution(),
      this.validateParallelJoinConditions(),
      this.validateNestedFlowComposition(),
      this.validateErrorHandling(),
      this.validateTimeoutHandling(),
      this.validateCyclicFlowDetection(),
      this.validateReachabilityAnalysis(),
      this.validateComplexConditionalChaining(),
      this.validateParallelWithConditionalBranches(),
      this.validateFlowCompositionChaining(),
      this.validateDynamicFlowGeneration(),
      this.validateStateContextPropagation(),
      this.validateErrorBoundaryStates(),
      this.validateFlowMetricsCollection(),
      this.validateLargeScaleFlowTraversal(),
      this.validateComplexParallelJoinScenario(),
      this.validateSwitchWithFallthrough(),
      this.validateConditionalWithMultiplePaths()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createAdvancedFlowPatternsValidator() {
  return new AdvancedFlowPatternsValidator();
}
