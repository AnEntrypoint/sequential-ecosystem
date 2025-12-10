import {  EventEmitter  } from 'events';
import {  randomUUID  } from 'crypto';

class StateTransitionLogger extends EventEmitter {
  constructor(maxTransitions = 10000) {
    super();
    this.maxTransitions = maxTransitions;
    this.transitions = [];
    this.byResource = new Map();
  }

  recordTransition(resourceId, resourceType, fromState, toState, trigger, metadata = {}) {
    const transition = {
      id: randomUUID(),
      resourceId,
      resourceType,
      fromState,
      toState,
      trigger,
      timestamp: Date.now(),
      duration: metadata.duration || 0,
      metadata
    };

    this.transitions.push(transition);

    if (!this.byResource.has(resourceId)) {
      this.byResource.set(resourceId, []);
    }
    this.byResource.get(resourceId).push(transition.id);

    if (this.transitions.length > this.maxTransitions) {
      const removed = this.transitions.shift();
      const list = this.byResource.get(removed.resourceId);
      if (list) {
        const idx = list.indexOf(removed.id);
        if (idx > -1) list.splice(idx, 1);
      }
    }

    this.emit('transition', {
      resourceId,
      resourceType,
      fromState,
      toState,
      trigger
    });

    return transition;
  }

  getTransitionsForResource(resourceId, limit = 100) {
    const ids = this.byResource.get(resourceId) || [];
    return ids.map(id => this.transitions.find(t => t.id === id)).filter(Boolean).slice(-limit);
  }

  getTransitionPath(resourceId) {
    return this.getTransitionsForResource(resourceId, 1000).map(t => ({
      state: t.toState,
      trigger: t.trigger,
      timestamp: t.timestamp
    }));
  }

  getStateDurations(resourceId) {
    const transitions = this.getTransitionsForResource(resourceId, 1000);
    const durations = {};

    for (let i = 0; i < transitions.length - 1; i++) {
      const current = transitions[i];
      const next = transitions[i + 1];
      const state = current.toState;
      const duration = next.timestamp - current.timestamp;

      if (!durations[state]) {
        durations[state] = { total: 0, count: 0, min: duration, max: duration };
      }
      durations[state].total += duration;
      durations[state].count++;
      durations[state].min = Math.min(durations[state].min, duration);
      durations[state].max = Math.max(durations[state].max, duration);
    }

    return Object.entries(durations).map(([state, stats]) => ({
      state,
      avgDuration: Math.round(stats.total / stats.count),
      minDuration: stats.min,
      maxDuration: stats.max,
      count: stats.count
    }));
  }

  getStats(resourceType = null) {
    let filtered = this.transitions;
    if (resourceType) filtered = filtered.filter(t => t.resourceType === resourceType);

    const byTrigger = {};
    filtered.forEach(t => {
      byTrigger[t.trigger] = (byTrigger[t.trigger] || 0) + 1;
    });

    const byState = {};
    filtered.forEach(t => {
      byState[t.toState] = (byState[t.toState] || 0) + 1;
    });

    return {
      totalTransitions: filtered.length,
      uniqueResources: new Set(filtered.map(t => t.resourceId)).size,
      byTrigger,
      byState
    };
  }

  getRecent(limit = 100) {
    return this.transitions.slice(-limit).map(t => ({
      resourceId: t.resourceId,
      resourceType: t.resourceType,
      transition: `${t.fromState} → ${t.toState}`,
      trigger: t.trigger,
      timestamp: t.timestamp
    }));
  }

  clear() {
    this.transitions = [];
    this.byResource.clear();
  }
}

export {
  StateTransitionLogger
};
export const createStateTransitionLogger = (maxTransitions) => new StateTransitionLogger(maxTransitions);;
