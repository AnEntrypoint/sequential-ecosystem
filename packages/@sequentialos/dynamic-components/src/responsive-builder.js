// Responsive builder facade - maintains 100% backward compatibility
import { ResponsivePresets } from './responsive-presets.js';
import { ResponsiveComponentRegistry } from './responsive-component-registry.js';
import { ResponsiveUIBuilders } from './responsive-ui-builders.js';

class ResponsiveBuilder {
  constructor(responsivePatternSystem) {
    this.rps = responsivePatternSystem;
    this.registry = new ResponsiveComponentRegistry();
    this.uiBuilders = new ResponsiveUIBuilders(responsivePatternSystem, this.registry);
    this.presets = ResponsivePresets.getPresets();
  }

  registerComponent(name, baseDefinition) {
    return this.registry.registerComponent(name, baseDefinition);
  }

  setBreakpointOverride(componentName, breakpoint, overrideDef) {
    return this.registry.setBreakpointOverride(componentName, breakpoint, overrideDef);
  }

  applyPreset(componentName, presetName, breakpoint = null) {
    return this.registry.applyPreset(componentName, presetName, breakpoint);
  }

  buildComponentForBreakpoint(componentName, breakpoint) {
    return this.registry.buildComponentForBreakpoint(componentName, breakpoint);
  }

  buildResponsiveStack(componentName, stackConfig = {}) {
    return this.uiBuilders.buildResponsiveStack(componentName, stackConfig);
  }

  buildBreakpointPreview() {
    return this.uiBuilders.buildBreakpointPreview();
  }

  buildBreakpointEditor(componentName) {
    return this.uiBuilders.buildBreakpointEditor(componentName);
  }

  buildResponsivePreview(componentName) {
    return this.uiBuilders.buildResponsivePreview(componentName);
  }

  createResponsiveComponent(name, definition, breakpointVariants = {}) {
    return this.registry.createResponsiveComponent(name, definition, breakpointVariants);
  }

  exportResponsiveCSS(componentName) {
    return this.registry.exportResponsiveCSS(componentName, this.rps.getBreakpoints());
  }

  listComponents() {
    return this.registry.listComponents();
  }

  getComponentDefinition(componentName) {
    return this.registry.getComponentDefinition(componentName);
  }
}

function createResponsiveBuilder(responsivePatternSystem) {
  return new ResponsiveBuilder(responsivePatternSystem);
}

export { ResponsiveBuilder, createResponsiveBuilder };
