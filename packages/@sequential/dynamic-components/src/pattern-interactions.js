// Pattern interaction states facade - maintains 100% backward compatibility
import { InteractionStateDefinitions } from './interactions-state-definitions.js';
import { InteractionEventHandler } from './interactions-event-handler.js';
import { InteractionTransitionEngine } from './interactions-transition-engine.js';
import { InteractionUI } from './interactions-ui.js';
import { InteractionBuilder } from './interactions-builder.js';

class PatternInteractionStates {
  constructor() {
    this.definitions = new InteractionStateDefinitions();
    this.eventHandler = new InteractionEventHandler();
    this.engine = new InteractionTransitionEngine();
    this.ui = new InteractionUI();
    this.builder = new InteractionBuilder();

    // Expose for backward compatibility
    this.states = this.definitions.states;
    this.transitions = this.definitions.transitions;
    this.eventHandlers = this.eventHandler.eventHandlers;
  }

  get currentState() {
    return this.engine.getCurrentState();
  }

  get history() {
    return this.engine.history;
  }

  defineState(stateName, config) {
    return this.definitions.defineState(stateName, config);
  }

  defineTransition(fromState, toState, trigger, config = {}) {
    return this.definitions.defineTransition(fromState, toState, trigger, config);
  }

  addEventHandler(stateName, eventType, handler) {
    return this.eventHandler.addEventHandler(stateName, eventType, handler);
  }

  transitionTo(stateName, context = {}) {
    return this.engine.transitionTo(stateName, this.definitions, context);
  }

  handleEvent(eventType, context = {}) {
    const stateObj = this.definitions.getState(this.currentState);
    if (!stateObj) return false;

    return this.eventHandler.handleEvent(this.currentState, eventType, context);
  }

  getCurrentStateStyle() {
    return this.builder.getCurrentStateStyle(this.definitions, this.currentState);
  }

  getCurrentStateAnimations() {
    return this.builder.getCurrentStateAnimations(this.definitions, this.currentState);
  }

  getTransitionStyle(targetState) {
    return this.ui.getTransitionStyle(this.definitions, this.currentState, targetState);
  }

  buildStateMachine(patternDef) {
    return this.builder.buildStateMachine(patternDef, this.definitions, this.currentState);
  }

  getStateHistory(limit = 10) {
    return this.engine.getStateHistory(limit);
  }

  buildStateVisualization() {
    return this.ui.buildStateVisualization(this.definitions, this.currentState);
  }

  applyStateToComponent(component) {
    const state = this.definitions.getState(this.currentState);
    return this.ui.applyStateToComponent(component, state);
  }

  createPreset(name, states) {
    return this.builder.createPreset(name, states);
  }

  exportStateConfig() {
    return this.engine.exportConfig(this.definitions);
  }
}

function createPatternInteractionStates() {
  return new PatternInteractionStates();
}

export { PatternInteractionStates, createPatternInteractionStates };
