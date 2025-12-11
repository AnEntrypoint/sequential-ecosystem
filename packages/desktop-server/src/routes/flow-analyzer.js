export class FlowAnalyzer {
  constructor(statesArray, initial) {
    this.states = statesArray;
    this.initial = initial;
    this.visited = new Set();
    this.recStack = new Set();
    this.loops = [];
    this.reachable = new Set();
  }

  analyze() {
    const topology = this.detectTopology();
    const loops = this.detectLoops();
    const reachable = this.detectReachability();
    const states = this.mapStates();
    const validity = this.validateConsistency(loops);
    const suggestions = this.generateSuggestions(topology, loops, reachable);

    return { states, topology, analysis: { validity, loops, reachable, unreachable: this.getUnreachable(reachable), suggestions } };
  }

  detectTopology() {
    const chains = [];
    const branches = [];
    const parallel = [];

    this.states.forEach(s => {
      if (s.type === 'parallel') {
        parallel.push({ state: s.id, branches: s.branches || [] });
      } else if (s.type === 'if' || s.type === 'switch') {
        const routes = [];
        if (s.type === 'if') routes.push(s.onTrue, s.onFalse);
        else if (s.cases) routes.push(...Object.values(s.cases), s.default);
        branches.push({ state: s.id, routes: routes.filter(Boolean) });
      } else if (s.onDone) {
        chains.push({ from: s.id, to: s.onDone });
      }
    });

    return { chains, branches, parallel };
  }

  detectLoops() {
    const loops = [];
    this.states.forEach(s => {
      this.visited.clear();
      this.recStack.clear();
      if (this._hasCycle(s.id)) {
        loops.push(this._traceLoop(s.id));
      }
    });
    return loops;
  }

  _hasCycle(stateId) {
    this.visited.add(stateId);
    this.recStack.add(stateId);
    const state = this.states.find(s => s.id === stateId);

    const getNextStates = (s) => {
      const next = [];
      if (s.onDone) next.push(s.onDone);
      if (s.onTrue) next.push(s.onTrue);
      if (s.onFalse) next.push(s.onFalse);
      if (s.cases) next.push(...Object.values(s.cases));
      if (s.default) next.push(s.default);
      if (s.branches) next.push(...s.branches);
      return next;
    };

    for (const nextId of getNextStates(state || {})) {
      if (!this.visited.has(nextId)) {
        if (this._hasCycle(nextId)) return true;
      } else if (this.recStack.has(nextId)) {
        return true;
      }
    }

    this.recStack.delete(stateId);
    return false;
  }

  _traceLoop(startId) {
    const path = [];
    let current = startId;
    const visited = new Set();

    while (current && !visited.has(current)) {
      path.push(current);
      visited.add(current);
      const state = this.states.find(s => s.id === current);
      current = state?.onDone || (state?.onTrue === current ? state?.onFalse : state?.onTrue) || null;
    }

    return current ? path.slice(path.indexOf(current)) : [];
  }

  detectReachability() {
    const reachable = new Set();
    const queue = [this.initial];

    while (queue.length) {
      const stateId = queue.shift();
      if (reachable.has(stateId)) continue;
      reachable.add(stateId);

      const state = this.states.find(s => s.id === stateId);
      if (!state) continue;

      const next = [];
      if (state.onDone) next.push(state.onDone);
      if (state.onTrue) next.push(state.onTrue);
      if (state.onFalse) next.push(state.onFalse);
      if (state.cases) next.push(...Object.values(state.cases));
      if (state.default) next.push(state.default);
      if (state.branches) next.push(...state.branches);

      next.filter(Boolean).forEach(s => !reachable.has(s) && queue.push(s));
    }

    this.reachable = reachable;
    return reachable;
  }

  getUnreachable(reachable) {
    return this.states.filter(s => !reachable.has(s.id) && s.type !== 'final').map(s => s.id);
  }

  mapStates() {
    return this.states.reduce((acc, s) => {
      const inbound = this.states.filter(st => {
        const nexts = [];
        if (st.onDone) nexts.push(st.onDone);
        if (st.onTrue) nexts.push(st.onTrue);
        if (st.onFalse) nexts.push(st.onFalse);
        if (st.cases) nexts.push(...Object.values(st.cases));
        if (st.default) nexts.push(st.default);
        if (st.branches) nexts.push(...st.branches);
        return nexts.includes(s.id);
      }).map(st => st.id);

      const outbound = [];
      if (s.onDone) outbound.push(s.onDone);
      if (s.onTrue) outbound.push(s.onTrue);
      if (s.onFalse) outbound.push(s.onFalse);
      if (s.cases) outbound.push(...Object.values(s.cases));
      if (s.default) outbound.push(s.default);
      if (s.branches) outbound.push(...s.branches);

      acc[s.id] = {
        type: s.type || 'task',
        inbound: inbound.filter(Boolean),
        outbound: outbound.filter(Boolean),
        complexity: s.type === 'parallel' ? s.branches?.length || 0 : (s.cases ? Object.keys(s.cases).length : 1)
      };
      return acc;
    }, {});
  }

  validateConsistency(loops) {
    const issues = [];

    this.states.forEach(s => {
      if ((s.type === 'if' || s.type === 'switch') && !s.onDone && !s.onTrue && !s.onFalse) {
        issues.push(`State ${s.id} has no routing defined`);
      }
      if (s.type === 'parallel' && !s.branches?.length) {
        issues.push(`Parallel state ${s.id} has no branches`);
      }
    });

    if (loops.length > 0) {
      issues.push(`Detected ${loops.length} loop(s): ${loops.map(l => l.join('→')).join('; ')}`);
    }

    return { valid: issues.length === 0, issues };
  }

  generateSuggestions(topology, loops, reachable) {
    const suggestions = [];

    if (loops.length > 0) {
      suggestions.push(`Add loop termination conditions or break states`);
    }

    const unreachable = this.getUnreachable(reachable);
    if (unreachable.length > 0) {
      suggestions.push(`Remove or reconnect unreachable states: ${unreachable.join(', ')}`);
    }

    const branches = topology.branches || [];
    if (branches.length > 3) {
      suggestions.push(`Consider consolidating ${branches.length} branching states`);
    }

    return suggestions;
  }
}
