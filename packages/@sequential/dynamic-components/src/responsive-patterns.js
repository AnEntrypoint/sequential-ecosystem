// Responsive pattern system facade - maintains 100% backward compatibility
import { ResponsiveBreakpoints } from './responsive-breakpoints.js';
import { ResponsivePatternRegistry } from './responsive-pattern-registry.js';
import { ResponsiveBuilders } from './responsive-builders.js';

class ResponsivePatternSystem {
  constructor(breakpoints = {}) {
    this.bp = new ResponsiveBreakpoints(breakpoints);
    this.registry = new ResponsivePatternRegistry(this.bp.breakpoints);
    this.builders = new ResponsiveBuilders(this.bp.breakpoints, this.bp.mediaQueryLists);
    this.breakpoints = this.bp.breakpoints;
  }

  detectBreakpoint() {
    return this.bp.detectBreakpoint();
  }

  registerPattern(name, definition) {
    return this.registry.registerPattern(name, definition);
  }

  addVariant(patternName, breakpoint, variantDef) {
    return this.registry.addVariant(patternName, breakpoint, variantDef);
  }

  createResponsivePattern(name, baseDefinition, variantsByBreakpoint) {
    return this.registry.createResponsivePattern(name, baseDefinition, variantsByBreakpoint);
  }

  getPatternForBreakpoint(patternName, breakpoint) {
    return this.registry.getPatternForBreakpoint(patternName, breakpoint || this.bp.currentBreakpoint);
  }

  resolveResponsiveValue(value, breakpoint) {
    return this.registry.resolveResponsiveValue(value, breakpoint || this.bp.currentBreakpoint);
  }

  applyResponsiveStyles(element, responsiveStylesMap) {
    return this.builders.applyResponsiveStyles(element, responsiveStylesMap);
  }

  buildResponsiveComponent(name, baseDefinition, variantsByBreakpoint) {
    return this.builders.buildResponsiveComponent(baseDefinition, variantsByBreakpoint, this.bp.currentBreakpoint);
  }

  createLayoutPattern(name, layouts) {
    return this.builders.createLayoutPattern(name, layouts);
  }

  createGridPattern(name, gridConfigs) {
    return this.builders.createGridPattern(name, gridConfigs);
  }

  createFlexPattern(name, flexConfigs) {
    return this.builders.createFlexPattern(name, flexConfigs);
  }

  createResponsiveValue(valuesByBreakpoint) {
    return this.builders.createResponsiveValue(valuesByBreakpoint);
  }

  buildResponsiveUI(componentDef, variantsByBreakpoint) {
    return this.builders.buildResponsiveComponent(componentDef, variantsByBreakpoint, this.bp.currentBreakpoint);
  }

  listPatterns() {
    return this.registry.listPatterns();
  }

  on(event, callback) {
    return this.bp.on(event, callback);
  }

  off(event, callback) {
    return this.bp.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.bp.notifyListeners(event, data);
  }

  getBreakpoints() {
    return this.bp.getBreakpoints();
  }

  getCurrentBreakpoint() {
    return this.bp.getCurrentBreakpoint();
  }

  destroy() {
    this.bp.destroy();
    this.registry.destroy();
  }
}

function createResponsivePatternSystem(breakpoints = {}) {
  return new ResponsivePatternSystem(breakpoints);
}

export { ResponsivePatternSystem, createResponsivePatternSystem };
