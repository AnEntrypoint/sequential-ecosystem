// Facade maintaining 100% backward compatibility with pattern registrations
import {
  PatternAuthRegistrations,
  PatternSearchRegistrations,
  PatternListRegistrations,
  PatternFormRegistrations,
  PatternCardRegistrations,
  PatternModalRegistrations,
  PatternAdvancedRegistrations
} from './pattern-registrations.js';

export class ComponentPatternLibrary {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
  }

  registerCommonPatterns() {
    this.registerAuthPatterns();
    this.registerSearchPatterns();
    this.registerListPatterns();
    this.registerFormPatterns();
    this.registerCardPatterns();
    this.registerModalPatterns();
  }

  registerAuthPatterns() {
    PatternAuthRegistrations.register(this.registry);
  }

  registerSearchPatterns() {
    PatternSearchRegistrations.register(this.registry);
  }

  registerListPatterns() {
    PatternListRegistrations.register(this.registry);
  }

  registerFormPatterns() {
    PatternFormRegistrations.register(this.registry);
  }

  registerCardPatterns() {
    PatternCardRegistrations.register(this.registry);
  }

  registerModalPatterns() {
    PatternModalRegistrations.register(this.registry);
  }

  registerAdvancedPatterns() {
    PatternAdvancedRegistrations.register(this.registry);
  }
}

export const createComponentPatternLibrary = (registry, themeEngine) =>
  new ComponentPatternLibrary(registry, themeEngine);
